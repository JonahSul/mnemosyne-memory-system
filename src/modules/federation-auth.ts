/**
 * Federation Authentication and Role-Based Access Control
 * Implements ADR-006 distributed architecture security model
 */

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
	private identities = new Map<string, FederationIdentity>();
	
	/**
	 * Validate JWT token and extract federation claims
	 */
	async validateToken(token: string): Promise<FederationSession | null> {
		try {
			// TODO: Implement proper JWT validation with Ed25519 signature verification
			// For now, return mock validation for development
			
			// Extract session from token
			const sessionId = this.extractSessionId(token);
			const session = this.sessions.get(sessionId);
			
			if (!session || session.expiresAt < Date.now()) {
				return null;
			}
			
			// Update last activity
			session.lastActivity = Date.now();
			return session;
			
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
	 * Create development session for testing
	 */
	createDevSession(role: AgentRole, clusterId: string = 'dev-cluster'): FederationSession {
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
		
		this.identities.set(agentId, identity);
		this.sessions.set(sessionId, session);
		
		return session;
	}
	
	private extractSessionId(token: string): string {
		// Simple extraction for development
		return token.replace('dev-token-', '');
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
		
		return {
			totalSessions: this.sessions.size,
			activeAgents: activeAgents.length,
			roleCounts,
			averageReputation: activeAgents.reduce((sum, id) => sum + id.reputation, 0) / activeAgents.length
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
