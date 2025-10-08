/**
 * Federation Authentication and Role-Based Access Control
 * Implements ADR-006 distributed architecture security model
 */
export declare enum AgentRole {
    AGENT = "AGENT",// Baseline participation rights
    ARBITER = "ARBITER",// Truth decisions, dispute resolution  
    ARCHIVIST = "ARCHIVIST",// Knowledge flow coordination
    CURATOR = "CURATOR",// Content analysis and enrichment
    CUSTODIAN = "CUSTODIAN"
}
export interface FederationIdentity {
    agentId: string;
    clusterRole: AgentRole;
    clusterId: string;
    publicKey: string;
    capabilities: string[];
    reputation: number;
    isActive: boolean;
    lastSeen: string;
}
export interface FederationSession {
    sessionId: string;
    identity: FederationIdentity;
    sessionToken: string;
    issuedAt: number;
    expiresAt: number;
    lastActivity: number;
}
export interface FederationCapability {
    namespace: string;
    action: string;
    resource?: string;
}
/**
 * Role-based capability definitions per ADR-006
 */
export declare const ROLE_CAPABILITIES: Record<AgentRole, string[]>;
/**
 * Federation Authentication Service
 */
export declare class FederationAuth {
    private sessions;
    private identities;
    private keyCache;
    /**
     * Validate JWT token and extract federation claims
     */
    validateToken(token: string): Promise<FederationSession | null>;
    /**
     * Check if identity has required capability
     */
    hasCapability(identity: FederationIdentity, capability: string): boolean;
    registerIdentity(identity: FederationIdentity): void;
    /**
     * Create development session for testing
     */
    createDevSession(role: AgentRole, clusterId?: string): FederationSession;
    private isDevelopmentToken;
    private validateDevelopmentToken;
    private extractDevSessionId;
    private extractAgentId;
    private getVerificationKey;
    private normalizePublicKey;
    private getNodeBuffer;
    private base64ToUint8Array;
    private hexToUint8Array;
    private uint8ArrayToBase64Url;
    private assertClaims;
    private asString;
    private asStringArray;
    private resolveSessionId;
    private upsertSession;
    /**
     * Get session statistics for monitoring
     */
    getSessionStats(): {
        totalSessions: number;
        activeAgents: number;
        roleCounts: Record<string, number>;
        averageReputation: number;
    };
}
export declare function getFederationAuth(): FederationAuth;
//# sourceMappingURL=federation-auth.d.ts.map