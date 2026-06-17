/**
 * Federation Authentication and Role-Based Access Control
 * Implements ADR-006 distributed architecture security model
 */

import { decodeJwt, decodeProtectedHeader, importJWK, jwtVerify, type JWTPayload } from 'jose';
import { IdentityRegistry } from './identity-registry';

type CryptoKeyLike = Awaited<ReturnType<typeof importJWK>>;

export enum AgentRole {
	AGENT = 'AGENT',         // Baseline participation rights
	ARBITER = 'ARBITER',     // Truth decisions, dispute resolution  
	ARCHIVIST = 'ARCHIVIST', // Knowledge flow coordination
	CURATOR = 'CURATOR',     // Content analysis and enrichment
	CUSTODIAN = 'CUSTODIAN'  // Security and health monitoring
}

export interface FederationIdentity {
	agentId: string;        // DID-based identity: "did:key:z6Mk..."
	clusterRole: AgentRole;
	clusterId: string;      // "cluster-alpha-001"
	publicKey: string;      // Ed25519 public key for signature verification
	capabilities: string[]; // Role-specific permissions
	reputation: number;     // 0-1 reputation score
	isActive: boolean;
	lastSeen: string;
	metadata?: Record<string, unknown>; // Additional metadata
}

export interface FederationSession {
	sessionId: string;
	identity: FederationIdentity;
	sessionToken: string;   // JWT with role claims
	issuedAt: number;
	expiresAt: number;
	lastActivity: number;
}

export interface FederationCapability {
	namespace: string;      // "truth", "knowledge", "security", etc.
	action: string;         // "resolve", "bulk-ingest", "scan", etc.
	resource?: string;      // Optional resource restriction
}

/**
 * Role-based capability definitions per ADR-006
 */
export const ROLE_CAPABILITIES: Record<AgentRole, string[]> = {
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
	private sessions = new Map<string, FederationSession>();
	private identities = new Map<string, FederationIdentity>(); // Fallback for development
	private identityRegistry: IdentityRegistry;
	private keyCache = new Map<string, CryptoKeyLike>();

	/**
	 * Initialize federation authentication with optional identity registry
	 */
	constructor(identityRegistry?: IdentityRegistry) {
		this.identityRegistry = identityRegistry || new IdentityRegistry({
			kv: {} as any, // This will be replaced with real KV in production
			ttl: 3600, // 1 hour default TTL
			clusterId: 'default-cluster',
			agentType: 'default',
			reputation: 0,
			lastSeen: new Date().toISOString(),
			capabilities: [],
		});
		// If no identity registry provided, use in-memory fallback for development
		if (!identityRegistry) {
			console.warn('FederationAuth: No identity registry provided. Using in-memory fallback for development only.');
		}
	}

	/**
	 * Validate JWT token and extract federation claims
	 */
	async validateToken(token: string): Promise<FederationSession | null> {
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
			
			// Get identity from identity registry if available, otherwise fallback to in-memory
			let identity: FederationIdentity | null = null;
			if (this.identityRegistry) {
				identity = await this.identityRegistry.getIdentity(agentId);
			} else {
				identity = this.identities.get(agentId) || null;
			}
			
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
		} catch (error) {
			console.error('Token validation failed:', error);
			return null;
		}
	}

	/**
	 * Check if identity has required capability
	 */
	hasCapability(identity: FederationIdentity, capability: string): boolean {
		const roleCapabilities = ROLE_CAPABILITIES[identity.clusterRole] || [];
		return identity.capabilities.includes(capability) ||
			roleCapabilities.includes(capability);
	}

	/**
	 * Register identity with the identity registry
	 */
	async registerIdentity(identity: FederationIdentity, performedBy: string): Promise<void> {
		if (this.identityRegistry) {
			// Extract metadata from identity for identity registry
			const metadata: IdentityMetadata = {
				clusterId: identity.clusterId,
				agentType: identity.agentId.includes('dev') ? 'development' : 'production',
				reputation: identity.reputation,
				lastSeen: identity.lastSeen,
				capabilities: identity.capabilities,
				metadata: {}
			};

			await this.identityRegistry.registerIdentity(
				identity.agentId,
				identity.publicKey,
				[identity.clusterRole],
				metadata,
				performedBy
			);
			// Also store in in-memory fallback for backward compatibility
			this.identities.set(identity.agentId, identity);
			this.keyCache.delete(identity.agentId);
		} else {
			// Fallback to in-memory storage for development
			this.identities.set(identity.agentId, identity);
			this.keyCache.delete(identity.agentId);
		}
	}

	/**
	 * Create development session for testing
	 */
	async createDevSession(role: AgentRole, clusterId: string = 'dev-cluster'): Promise<FederationSession> {
		const agentId = `did:key:dev-${role.toLowerCase()}-${Date.now()}`;
		const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const identity: FederationIdentity = {
			agentId,
			clusterRole: role,
			clusterId,
			publicKey: 'dev-public-key',
			capabilities: ROLE_CAPABILITIES[role],
			reputation: 0.8,
			isActive: true,
			lastSeen: new Date().toISOString()
		};

		const session: FederationSession = {
			sessionId,
			identity,
			sessionToken: `dev-token-${sessionId}`,
			issuedAt: Date.now(),
			expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
			lastActivity: Date.now()
		};

		await this.registerIdentity(identity, 'development');
		this.sessions.set(sessionId, session);

		return session;
	}

	private isDevelopmentToken(token: string): boolean {
		return token.startsWith('dev-token-');
	}

	private validateDevelopmentToken(token: string): FederationSession | null {
		const sessionId = this.extractDevSessionId(token);
		const session = this.sessions.get(sessionId);
		if (!session || session.expiresAt < Date.now()) {
			return null;
		}
		session.lastActivity = Date.now();
		return session;
	}

	private extractDevSessionId(token: string): string {
		return token.replace(/^dev-token-/, '');
	}

	private extractAgentId(payload: JWTPayload): string {
		const agentId = (payload.sub ?? (payload as Record<string, unknown>)['agent_id'] ?? (payload as Record<string, unknown>)['agentId']);
		if (typeof agentId !== 'string' || agentId.length === 0) {
			throw new Error('JWT payload missing subject or agent identifier');
		}
		return agentId;
	}

	private async getVerificationKey(identity: FederationIdentity): Promise<CryptoKeyLike> {
		const cacheKey = identity.agentId;
		const cached = this.keyCache.get(cacheKey);
		if (cached) {
			return cached;
		}

		const normalizedKey = this.normalizePublicKey(identity.publicKey);
		const jwk = {
			kty: 'OKP' as const,
			crv: 'Ed25519' as const,
			x: normalizedKey
		};

		const importedKey = await importJWK(jwk, 'EdDSA');
		this.keyCache.set(cacheKey, importedKey);
		return importedKey;
	}

	private normalizePublicKey(key: string): string {
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

	private getNodeBuffer(): { from(value: string | Uint8Array, encoding?: string): any } | undefined {
		const globalBuffer = typeof globalThis !== 'undefined' ? (globalThis as any).Buffer : undefined;
		return typeof globalBuffer === 'function' ? globalBuffer : undefined;
	}

	private base64ToUint8Array(value: string): Uint8Array {
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

	private hexToUint8Array(value: string): Uint8Array {
		const bytes = new Uint8Array(value.length / 2);
		for (let i = 0; i < value.length; i += 2) {
			bytes[i / 2] = parseInt(value.slice(i, i + 2), 16);
		}
		return bytes;
	}

	private uint8ArrayToBase64Url(bytes: Uint8Array): string {
		const bufferCtor = this.getNodeBuffer();
		if (bufferCtor) {
			return bufferCtor.from(bytes).toString('base64url');
		}
		if (typeof globalThis.btoa === 'function') {
			let binary = '';
			for (let i = 0; i < bytes.length; i++) {
				const byte = bytes[i];
				if (byte !== undefined) {
					binary += String.fromCharCode(byte);
				}
			}
			return globalThis.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		}
		throw new Error('Base64 encoding not available in current runtime');
	}

	private assertClaims(payload: JWTPayload, identity: FederationIdentity): void {
		const roleClaim = this.asString((payload as Record<string, unknown>)['role']);
		if (roleClaim && roleClaim !== identity.clusterRole) {
			throw new Error('JWT role claim does not match registered identity role');
		}

		const clusterClaim = this.asString((payload as Record<string, unknown>)['cluster_id'] ?? (payload as Record<string, unknown>)['clusterId']);
		if (clusterClaim && clusterClaim !== identity.clusterId) {
			throw new Error('JWT cluster claim does not match registered identity cluster');
		}

		const capabilityClaim = this.asStringArray((payload as Record<string, unknown>)['capabilities']);
		if (capabilityClaim) {
			const allowed = new Set([...identity.capabilities, ...ROLE_CAPABILITIES[identity.clusterRole]]);
			const unauthorized = capabilityClaim.filter(capability => !allowed.has(capability));
			if (unauthorized.length > 0) {
				throw new Error(`JWT requested unauthorized capabilities: ${unauthorized.join(', ')}`);
			}
		}
	}

	private asString(value: unknown): string | undefined {
		return typeof value === 'string' ? value : undefined;
	}

	private asStringArray(value: unknown): string[] | undefined {
		if (!Array.isArray(value)) {
			return undefined;
		}
		const result: string[] = [];
		for (const item of value) {
			if (typeof item !== 'string') {
				throw new Error('JWT capabilities claim must be an array of strings');
			}
			result.push(item);
		}
		return result;
	}

	private resolveSessionId(payload: JWTPayload, identity: FederationIdentity): string {
		const explicitId = this.asString(payload.sid) || this.asString(payload.jti);
		if (explicitId) {
			return explicitId;
		}
		const issued = typeof payload.iat === 'number' ? payload.iat : Date.now() / 1000;
		return `session-${identity.agentId}-${Math.trunc(issued * 1000)}`;
	}

	private upsertSession(sessionId: string, identity: FederationIdentity, token: string, payload: JWTPayload): FederationSession {
		const issuedAt = typeof payload.iat === 'number' ? payload.iat * 1000 : Date.now();
		const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : issuedAt + (60 * 60 * 1000);
		const refreshedIdentity: FederationIdentity = {
			...identity,
			isActive: true,
			lastSeen: new Date().toISOString()
		};
		this.identities.set(identity.agentId, refreshedIdentity);

		const existing = this.sessions.get(sessionId);
		const session: FederationSession = existing ? {
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
		}, {} as Record<string, number>);

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
let federationAuth: FederationAuth | null = null;

export function getFederationAuth(): FederationAuth {
	if (!federationAuth) {
		federationAuth = new FederationAuth();
	}
	return federationAuth;
}

export interface IdentityMetadata {
	clusterId: string;
	agentType: string;
	reputation: number;
	lastSeen: string;
	capabilities: string[];
	metadata?: Record<string, unknown>;
}
