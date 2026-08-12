/**
 * Federation service — domain service for agent identity and authentication.
 *
 * Implements JWT (EdDSA / Ed25519) validation and role-based access control
 * per ADR-006. Extracted from the legacy `modules/federation-auth.ts` during
 * Phase 2. The legacy `KVNamespace = any` and `kv: {} as any` are NOT carried
 * forward — a real KeyValueStoreAdapter must be injected.
 */

import { Buffer } from 'node:buffer';
import { decodeJwt, decodeProtectedHeader, importJWK, jwtVerify, type JWTPayload } from 'jose';
import type { KeyValueStoreAdapter } from '../../shared/index.js';
import { ROLE_CAPABILITIES, type AgentRole, type FederationIdentity, type FederationSession } from './types.js';

type CryptoKeyLike = Awaited<ReturnType<typeof importJWK>>;

export interface FederationServiceConfig {
    keyPrefix?: string;
    ttl?: number;
    defaultClusterId?: string;
}

const DEFAULT_KEY_PREFIX = 'identity:v1:';
const DEFAULT_CLUSTER_ID = 'default-cluster';
const DEV_TOKEN_PREFIX = 'dev-token-';
const DEV_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SESSION_TTL_MS = 60 * 60 * 1000;

export class FederationService {
    private readonly kv: KeyValueStoreAdapter;
    private readonly keyPrefix: string;
    private readonly ttl?: number;
    private readonly defaultClusterId: string;
    private readonly sessions = new Map<string, FederationSession>();
    private readonly keyCache = new Map<string, CryptoKeyLike>();

    constructor(kv: KeyValueStoreAdapter, config?: FederationServiceConfig) {
        this.kv = kv;
        this.keyPrefix = config?.keyPrefix ?? DEFAULT_KEY_PREFIX;
        this.ttl = config?.ttl;
        this.defaultClusterId = config?.defaultClusterId ?? DEFAULT_CLUSTER_ID;
    }

    async validateToken(token: string): Promise<FederationSession | null> {
        if (this.isDevelopmentToken(token)) return this.validateDevelopmentToken(token);
        try {
            const header = decodeProtectedHeader(token);
            if (header.alg !== 'EdDSA') throw new Error(`Unsupported JWT algorithm: ${header.alg}`);
            const decodedPayload = decodeJwt(token);
            const agentId = this.extractAgentId(decodedPayload);
            const identity = await this.getIdentity(agentId);
            if (!identity || !identity.isActive) return null;
            const verificationKey = await this.getVerificationKey(identity);
            const verification = await jwtVerify(token, verificationKey, { algorithms: ['EdDSA'], subject: agentId });
            this.assertClaims(verification.payload, identity);
            const sessionId = this.resolveSessionId(verification.payload, identity);
            return this.upsertSession(sessionId, identity, token, verification.payload);
        } catch (error) {
            console.error('Token validation failed:', error);
            return null;
        }
    }

    hasCapability(identity: FederationIdentity, capability: string): boolean {
        const roleCapabilities = ROLE_CAPABILITIES[identity.clusterRole] ?? [];
        return identity.capabilities.includes(capability) || roleCapabilities.includes(capability);
    }

    async registerIdentity(identity: FederationIdentity, performedBy: string): Promise<void> {
        const key = `${this.keyPrefix}${identity.agentId}`;
        const existing = await this.kv.get<FederationIdentity>(key);
        if (existing) throw new Error(`Identity already registered: ${identity.agentId}`);
        const value: FederationIdentity = { ...identity, lastSeen: new Date().toISOString() };
        await this.kv.put(key, value, this.ttl ? { ttl: this.ttl } : undefined);
        this.keyCache.delete(identity.agentId);
        const auditKey = `${this.keyPrefix}audit:${Date.now()}:${identity.agentId}`;
        await this.kv.put(auditKey, { action: 'register', did: identity.agentId, performedBy, timestamp: new Date().toISOString(), newState: value }, this.ttl ? { ttl: this.ttl } : undefined);
    }

    async createDevSession(role: AgentRole, clusterId: string = 'dev-cluster'): Promise<FederationSession> {
        const agentId = `did:key:dev-${role.toLowerCase()}-${Date.now()}`;
        // Use a cryptographically secure random ID for the session token —
        // it is used as an authentication credential (validated via
        // validateDevelopmentToken). Math.random() is not a secure PRNG.
        const sessionId = `session-${Date.now()}-${crypto.randomUUID()}`;
        const identity: FederationIdentity = { agentId, clusterRole: role, clusterId, publicKey: 'dev-public-key', capabilities: ROLE_CAPABILITIES[role], reputation: 0.8, isActive: true, lastSeen: new Date().toISOString() };
        const now = Date.now();
        const session: FederationSession = { sessionId, identity, sessionToken: `${DEV_TOKEN_PREFIX}${sessionId}`, issuedAt: now, expiresAt: now + DEV_SESSION_TTL_MS, lastActivity: now };
        await this.registerIdentity(identity, 'development');
        this.sessions.set(sessionId, session);
        return session;
    }

    async createSession(identity: FederationIdentity): Promise<FederationSession> {
        const stored = await this.getIdentity(identity.agentId);
        if (!stored) throw new Error(`Identity not registered: ${identity.agentId}`);
        if (!stored.isActive) throw new Error(`Identity is not active: ${identity.agentId}`);
        const now = Date.now();
        const sessionId = `session-${identity.agentId}-${now}`;
        const session: FederationSession = { sessionId, identity: { ...stored, lastSeen: new Date().toISOString() }, sessionToken: '', issuedAt: now, expiresAt: now + DEFAULT_SESSION_TTL_MS, lastActivity: now };
        this.sessions.set(sessionId, session);
        return session;
    }

    async validateSession(session: FederationSession): Promise<boolean> {
        const stored = this.sessions.get(session.sessionId);
        if (!stored || stored.expiresAt < Date.now()) return false;
        stored.lastActivity = Date.now();
        return true;
    }

    getSessionStats(): { totalSessions: number; activeAgents: number; roleCounts: Record<string, number>; averageReputation: number } {
        const activeAgents = Array.from(this.sessions.values()).filter((s) => s.identity.isActive);
        const roleCounts: Record<string, number> = {};
        for (const agent of activeAgents) { const role = agent.identity.clusterRole; roleCounts[role] = (roleCounts[role] ?? 0) + 1; }
        const totalReputation = activeAgents.reduce((sum, id) => sum + id.identity.reputation, 0);
        return { totalSessions: this.sessions.size, activeAgents: activeAgents.length, roleCounts, averageReputation: activeAgents.length > 0 ? totalReputation / activeAgents.length : 0 };
    }

    private async getIdentity(agentId: string): Promise<FederationIdentity | null> {
        return this.kv.get<FederationIdentity>(`${this.keyPrefix}${agentId}`);
    }

    private isDevelopmentToken(token: string): boolean { return token.startsWith(DEV_TOKEN_PREFIX); }

    private validateDevelopmentToken(token: string): FederationSession | null {
        const sessionId = token.slice(DEV_TOKEN_PREFIX.length);
        const session = this.sessions.get(sessionId);
        if (!session || session.expiresAt < Date.now()) return null;
        session.lastActivity = Date.now();
        return session;
    }

    private extractAgentId(payload: JWTPayload): string {
        const record = payload as Record<string, unknown>;
        const agentId = payload.sub ?? record['agent_id'] ?? record['agentId'];
        if (typeof agentId !== 'string' || agentId.length === 0) throw new Error('JWT payload missing subject or agent identifier');
        return agentId;
    }

    private async getVerificationKey(identity: FederationIdentity): Promise<CryptoKeyLike> {
        const cached = this.keyCache.get(identity.agentId);
        if (cached) return cached;
        const normalizedKey = this.normalizePublicKey(identity.publicKey);
        const importedKey = await importJWK({ kty: 'OKP', crv: 'Ed25519', x: normalizedKey }, 'EdDSA');
        this.keyCache.set(identity.agentId, importedKey);
        return importedKey;
    }

    private normalizePublicKey(key: string): string {
        const trimmed = key.trim();
        if (/^[A-Za-z0-9_-]{43,44}$/.test(trimmed)) return trimmed.replace(/=+$/, '');
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) return this.uint8ArrayToBase64Url(this.base64ToUint8Array(trimmed));
        if (/^[a-fA-F0-9]{64}$/.test(trimmed)) return this.uint8ArrayToBase64Url(this.hexToUint8Array(trimmed));
        throw new Error('Unsupported Ed25519 public key format');
    }

    private base64ToUint8Array(value: string): Uint8Array { return new Uint8Array(Buffer.from(value, 'base64')); }
    private hexToUint8Array(value: string): Uint8Array { const bytes = new Uint8Array(value.length / 2); for (let i = 0; i < value.length; i += 2) bytes[i / 2] = parseInt(value.slice(i, i + 2), 16); return bytes; }
    private uint8ArrayToBase64Url(bytes: Uint8Array): string { return Buffer.from(bytes).toString('base64url'); }

    private assertClaims(payload: JWTPayload, identity: FederationIdentity): void {
        const record = payload as Record<string, unknown>;
        const roleClaim = this.asString(record['role']);
        if (roleClaim && roleClaim !== identity.clusterRole) throw new Error('JWT role claim does not match registered identity role');
        const clusterClaim = this.asString(record['cluster_id'] ?? record['clusterId']);
        if (clusterClaim && clusterClaim !== identity.clusterId) throw new Error('JWT cluster claim does not match registered identity cluster');
        const capabilityClaim = this.asStringArray(record['capabilities']);
        if (capabilityClaim) {
            const allowed = new Set([...identity.capabilities, ...ROLE_CAPABILITIES[identity.clusterRole]]);
            const unauthorized = capabilityClaim.filter((cap) => !allowed.has(cap));
            if (unauthorized.length > 0) throw new Error(`JWT requested unauthorized capabilities: ${unauthorized.join(', ')}`);
        }
    }

    private asString(value: unknown): string | undefined { return typeof value === 'string' ? value : undefined; }
    private asStringArray(value: unknown): string[] | undefined {
        if (!Array.isArray(value)) return undefined;
        const result: string[] = [];
        for (const item of value) { if (typeof item !== 'string') throw new Error('JWT capabilities claim must be an array of strings'); result.push(item); }
        return result;
    }

    private resolveSessionId(payload: JWTPayload, identity: FederationIdentity): string {
        const explicitId = this.asString(payload.sid) ?? this.asString(payload.jti);
        if (explicitId) return explicitId;
        const issued = typeof payload.iat === 'number' ? payload.iat : Date.now() / 1000;
        return `session-${identity.agentId}-${Math.trunc(issued * 1000)}`;
    }

    private upsertSession(sessionId: string, identity: FederationIdentity, token: string, payload: JWTPayload): FederationSession {
        const issuedAt = typeof payload.iat === 'number' ? payload.iat * 1000 : Date.now();
        const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : issuedAt + DEFAULT_SESSION_TTL_MS;
        const refreshedIdentity: FederationIdentity = { ...identity, isActive: true, lastSeen: new Date().toISOString() };
        const existing = this.sessions.get(sessionId);
        const session: FederationSession = existing ? { ...existing, identity: refreshedIdentity } : { sessionId, identity: refreshedIdentity, sessionToken: token, issuedAt, expiresAt, lastActivity: Date.now() };
        session.sessionToken = token; session.issuedAt = issuedAt; session.expiresAt = expiresAt; session.lastActivity = Date.now();
        this.sessions.set(sessionId, session);
        return session;
    }
}
