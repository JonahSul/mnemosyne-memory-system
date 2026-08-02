/**
 * Federation bounded context — domain types.
 *
 * Decentralized agent federation: identity, authentication, governance, and
 * cross-node synchronization. Uses JWT (Ed25519) for authentication.
 *
 * Extracted from the legacy `modules/federation-auth.ts` and
 * `modules/identity-registry.ts` during Phase 2.
 */

/** Agent role within a federation cluster (ADR-006). */
export type AgentRole = 'AGENT' | 'ARBITER' | 'ARCHIVIST' | 'CURATOR' | 'CUSTODIAN';

export interface FederationCapability {
    readonly namespace: string;
    readonly action: string;
    readonly resource?: string;
}

/** Federated agent identity. `agentId` is DID-based: `did:key:z6Mk...` */
export interface FederationIdentity {
    agentId: string;
    clusterRole: AgentRole;
    clusterId: string;
    publicKey: string;
    capabilities: string[];
    reputation: number;
    isActive: boolean;
    lastSeen: string;
    metadata?: Record<string, unknown>;
}

/** Authenticated federation session. `sessionToken` is a JWT with role claims. */
export interface FederationSession {
    sessionId: string;
    identity: FederationIdentity;
    sessionToken: string;
    issuedAt: number;
    expiresAt: number;
    lastActivity: number;
}

/** Role-based capability definitions per ADR-006. */
export const ROLE_CAPABILITIES: Record<AgentRole, string[]> = {
    AGENT: ['memory:search', 'memory:store', 'reputation:view-own', 'cluster:participate'],
    ARBITER: ['truth:resolve-dispute', 'truth:validate-claim', 'truth:final-decision', 'governance:tie-break', 'memory:arbitrate', 'cluster:democratic-vote'],
    ARCHIVIST: ['knowledge:bulk-ingest', 'knowledge:validate-submission', 'knowledge:route-flow', 'knowledge:policy-enforce', 'memory:bulk-operations', 'cluster:traffic-control'],
    CURATOR: ['content:analyze', 'content:detect-duplicates', 'content:enrich-metadata', 'content:classify', 'memory:enhancement', 'cluster:quality-assurance'],
    CUSTODIAN: ['security:threat-analysis', 'security:scan-system', 'security:isolate-threat', 'health:monitor-system', 'memory:security-audit', 'cluster:defense'],
};

export interface IdentityMetadata {
    clusterId: string;
    agentType: string;
    reputation: number;
    lastSeen: string;
    capabilities: string[];
    metadata?: Record<string, unknown>;
}

export interface IdentityFilter {
    clusterId?: string;
    role?: AgentRole;
    isActive?: boolean;
    agentType?: string;
}

export type IdentityAuditAction = 'register' | 'update' | 'revoke' | 'suspend' | 'activate';

export interface IdentityAuditLog {
    action: IdentityAuditAction;
    did: string;
    performedBy: string;
    timestamp: string;
    reason?: string;
    previousState?: Partial<FederationIdentity>;
    newState?: Partial<FederationIdentity>;
}
