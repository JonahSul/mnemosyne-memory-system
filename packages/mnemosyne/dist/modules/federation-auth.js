/**
 * Federation Authentication and Role-Based Access Control
 * Implements ADR-006 distributed architecture security model
 */
import { decodeJwt, decodeProtectedHeader, importJWK, jwtVerify } from 'jose';
export var AgentRole;
(function (AgentRole) {
    AgentRole["AGENT"] = "AGENT";
    AgentRole["ARBITER"] = "ARBITER";
    AgentRole["ARCHIVIST"] = "ARCHIVIST";
    AgentRole["CURATOR"] = "CURATOR";
    AgentRole["CUSTODIAN"] = "CUSTODIAN"; // Security and health monitoring
})(AgentRole || (AgentRole = {}));
/**
 * Role-based capability definitions per ADR-006
 */
export const ROLE_CAPABILITIES = {
    [AgentRole.AGENT]: [
        'memory:search',
        'memory:store',
        'reputation:view-own',
        'cluster:participate'
    ],
    [AgentRole.ARBITER]: [
        'truth:resolve-dispute',
        'truth:validate-claim',
        'truth:final-decision',
        'governance:tie-break',
        'memory:arbitrate',
        'cluster:democratic-vote'
    ],
    [AgentRole.ARCHIVIST]: [
        'knowledge:bulk-ingest',
        'knowledge:validate-submission',
        'knowledge:route-flow',
        'knowledge:policy-enforce',
        'memory:bulk-operations',
        'cluster:traffic-control'
    ],
    [AgentRole.CURATOR]: [
        'content:analyze',
        'content:detect-duplicates',
        'content:enrich-metadata',
        'content:classify',
        'memory:enhancement',
        'cluster:quality-assurance'
    ],
    [AgentRole.CUSTODIAN]: [
        'security:threat-analysis',
        'security:scan-system',
        'security:isolate-threat',
        'health:monitor-system',
        'memory:security-audit',
        'cluster:defense'
    ]
};
/**
 * Federation Authentication Service
 */
export class FederationAuth {
    sessions = new Map();
    identities = new Map();
    keyCache = new Map();
    /**
     * Validate JWT token and extract federation claims
     */
    async validateToken(token) {
        if (this.isDevelopmentToken(token)) {
            return this.validateDevelopmentToken(token);
        }
        try {
            const header = decodeProtectedHeader(token);
            if (header.alg !== 'EdDSA') {
                throw new Error(`Unsupported JWT algorithm: ${header.alg}`);
            }
            const decodedPayload = decodeJwt(token);
            const agentId = this.extractAgentId(decodedPayload);
            const identity = this.identities.get(agentId);
            if (!identity || !identity.isActive) {
                console.warn(`Rejected token for unknown or inactive identity: ${agentId}`);
                return null;
            }
            const verificationKey = await this.getVerificationKey(identity);
            const verification = await jwtVerify(token, verificationKey, {
                algorithms: ['EdDSA'],
                subject: agentId
            });
            this.assertClaims(verification.payload, identity);
            const sessionId = this.resolveSessionId(verification.payload, identity);
            return this.upsertSession(sessionId, identity, token, verification.payload);
        }
        catch (error) {
            console.error('Token validation failed:', error);
            return null;
        }
    }
    /**
     * Check if identity has required capability
     */
    hasCapability(identity, capability) {
        const roleCapabilities = ROLE_CAPABILITIES[identity.clusterRole] || [];
        return identity.capabilities.includes(capability) ||
            roleCapabilities.includes(capability);
    }
    registerIdentity(identity) {
        this.identities.set(identity.agentId, identity);
        this.keyCache.delete(identity.agentId);
    }
    /**
     * Create development session for testing
     */
    createDevSession(role, clusterId = 'dev-cluster') {
        const agentId = `did:key:dev-${role.toLowerCase()}-${Date.now()}`;
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const identity = {
            agentId,
            clusterRole: role,
            clusterId,
            publicKey: 'dev-public-key',
            capabilities: ROLE_CAPABILITIES[role],
            reputation: 0.8,
            isActive: true,
            lastSeen: new Date().toISOString()
        };
        const session = {
            sessionId,
            identity,
            sessionToken: `dev-token-${sessionId}`,
            issuedAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            lastActivity: Date.now()
        };
        this.registerIdentity(identity);
        this.sessions.set(sessionId, session);
        return session;
    }
    isDevelopmentToken(token) {
        return token.startsWith('dev-token-');
    }
    validateDevelopmentToken(token) {
        const sessionId = this.extractDevSessionId(token);
        const session = this.sessions.get(sessionId);
        if (!session || session.expiresAt < Date.now()) {
            return null;
        }
        session.lastActivity = Date.now();
        return session;
    }
    extractDevSessionId(token) {
        return token.replace(/^dev-token-/, '');
    }
    extractAgentId(payload) {
        const agentId = (payload.sub ?? payload['agent_id'] ?? payload['agentId']);
        if (typeof agentId !== 'string' || agentId.length === 0) {
            throw new Error('JWT payload missing subject or agent identifier');
        }
        return agentId;
    }
    async getVerificationKey(identity) {
        const cacheKey = identity.agentId;
        const cached = this.keyCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const normalizedKey = this.normalizePublicKey(identity.publicKey);
        const jwk = {
            kty: 'OKP',
            crv: 'Ed25519',
            x: normalizedKey
        };
        const importedKey = await importJWK(jwk, 'EdDSA');
        this.keyCache.set(cacheKey, importedKey);
        return importedKey;
    }
    normalizePublicKey(key) {
        const trimmed = key.trim();
        if (/^[A-Za-z0-9_-]{43,44}$/.test(trimmed)) {
            return trimmed.replace(/=+$/, '');
        }
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
            const bytes = this.base64ToUint8Array(trimmed);
            return this.uint8ArrayToBase64Url(bytes);
        }
        if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
            const bytes = this.hexToUint8Array(trimmed);
            return this.uint8ArrayToBase64Url(bytes);
        }
        throw new Error('Unsupported Ed25519 public key format');
    }
    getNodeBuffer() {
        const globalBuffer = typeof globalThis !== 'undefined' ? globalThis.Buffer : undefined;
        return typeof globalBuffer === 'function' ? globalBuffer : undefined;
    }
    base64ToUint8Array(value) {
        const bufferCtor = this.getNodeBuffer();
        if (bufferCtor) {
            return new Uint8Array(bufferCtor.from(value, 'base64'));
        }
        if (typeof globalThis.atob === 'function') {
            const binary = globalThis.atob(value);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        }
        throw new Error('Base64 decoding not available in current runtime');
    }
    hexToUint8Array(value) {
        const bytes = new Uint8Array(value.length / 2);
        for (let i = 0; i < value.length; i += 2) {
            bytes[i / 2] = parseInt(value.slice(i, i + 2), 16);
        }
        return bytes;
    }
    uint8ArrayToBase64Url(bytes) {
        const bufferCtor = this.getNodeBuffer();
        if (bufferCtor) {
            return bufferCtor.from(bytes).toString('base64url');
        }
        if (typeof globalThis.btoa === 'function') {
            let binary = '';
            for (const byte of bytes) {
                binary += String.fromCharCode(byte);
            }
            return globalThis.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        throw new Error('Base64 encoding not available in current runtime');
    }
    assertClaims(payload, identity) {
        const roleClaim = this.asString(payload['role']);
        if (roleClaim && roleClaim !== identity.clusterRole) {
            throw new Error('JWT role claim does not match registered identity role');
        }
        const clusterClaim = this.asString(payload['cluster_id'] ?? payload['clusterId']);
        if (clusterClaim && clusterClaim !== identity.clusterId) {
            throw new Error('JWT cluster claim does not match registered identity cluster');
        }
        const capabilityClaim = this.asStringArray(payload['capabilities']);
        if (capabilityClaim) {
            const allowed = new Set([...identity.capabilities, ...ROLE_CAPABILITIES[identity.clusterRole]]);
            const unauthorized = capabilityClaim.filter(capability => !allowed.has(capability));
            if (unauthorized.length > 0) {
                throw new Error(`JWT requested unauthorized capabilities: ${unauthorized.join(', ')}`);
            }
        }
    }
    asString(value) {
        return typeof value === 'string' ? value : undefined;
    }
    asStringArray(value) {
        if (!Array.isArray(value)) {
            return undefined;
        }
        const result = [];
        for (const item of value) {
            if (typeof item !== 'string') {
                throw new Error('JWT capabilities claim must be an array of strings');
            }
            result.push(item);
        }
        return result;
    }
    resolveSessionId(payload, identity) {
        const explicitId = this.asString(payload.sid) || this.asString(payload.jti);
        if (explicitId) {
            return explicitId;
        }
        const issued = typeof payload.iat === 'number' ? payload.iat : Date.now() / 1000;
        return `session-${identity.agentId}-${Math.trunc(issued * 1000)}`;
    }
    upsertSession(sessionId, identity, token, payload) {
        const issuedAt = typeof payload.iat === 'number' ? payload.iat * 1000 : Date.now();
        const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : issuedAt + (60 * 60 * 1000);
        const refreshedIdentity = {
            ...identity,
            isActive: true,
            lastSeen: new Date().toISOString()
        };
        this.identities.set(identity.agentId, refreshedIdentity);
        const existing = this.sessions.get(sessionId);
        const session = existing ? {
            ...existing,
            identity: refreshedIdentity
        } : {
            sessionId,
            identity: refreshedIdentity,
            sessionToken: token,
            issuedAt,
            expiresAt,
            lastActivity: Date.now()
        };
        session.sessionToken = token;
        session.issuedAt = issuedAt;
        session.expiresAt = expiresAt;
        session.lastActivity = Date.now();
        this.sessions.set(sessionId, session);
        return session;
    }
    /**
     * Get session statistics for monitoring
     */
    getSessionStats() {
        const activeAgents = Array.from(this.identities.values())
            .filter(identity => identity.isActive);
        const roleCounts = activeAgents.reduce((counts, identity) => {
            counts[identity.clusterRole] = (counts[identity.clusterRole] || 0) + 1;
            return counts;
        }, {});
        const totalReputation = activeAgents.reduce((sum, id) => sum + id.reputation, 0);
        return {
            totalSessions: this.sessions.size,
            activeAgents: activeAgents.length,
            roleCounts,
            averageReputation: activeAgents.length > 0 ? totalReputation / activeAgents.length : 0
        };
    }
}
// Singleton instance
let federationAuth = null;
export function getFederationAuth() {
    if (!federationAuth) {
        federationAuth = new FederationAuth();
    }
    return federationAuth;
}
