/**
 * Identity Registry - KV-backed DID & Role Store
 * 
 * Implements persistent identity management for the Mnemosyne Memory System.
 * Stores agent DIDs, public keys, role assertions, reputation metadata, and lifecycle state.
 * 
 * Architecture:
 * Identity Registry (KV) → Federation Auth (JWT validation) → Role-based Access Control
 * 
 * Key Features:
 * - KV-backed persistence with versioning
 * - Public key lookup for JWT verification (JWKS-like behavior)
 * - Role-based access control with capability definitions
 * - Identity lifecycle management (active, suspended, revoked)
 * - Audit logging for all identity changes
 * 
 * Security:
 * - Strict access controls for identity registration/modification
 * - Public keys served read-only to validation components
 * - Private keys never stored in KV
 */

import { AgentRole, FederationIdentity, ROLE_CAPABILITIES } from './federation-auth';

export interface IdentityRegistryConfig {
    kv: KVNamespace;
    keyPrefix?: string;
	ttl?: number; // Time to live in seconds
    clusterId?: string;
    agentType?: string;
    reputation?: number;
    lastSeen?: string;
    capabilities?: string[];
    metadata?: Record<string, unknown>;
}

export interface IdentityMetadata {
    clusterId: string;
    agentType: string;
    reputation: number;
    lastSeen: string;
    capabilities: string[];
    metadata?: Record<string, unknown>;
}

// Type alias for KVNamespace to avoid import issues
export type KVNamespace = any;

export interface IdentityFilter {
    clusterId?: string;
    role?: AgentRole;
    isActive?: boolean;
    agentType?: string;
}

export interface IdentityAuditLog {
    action: 'register' | 'update' | 'revoke' | 'suspend' | 'activate';
    did: string;
    performedBy: string;
    timestamp: string;
    reason?: string | undefined;
    previousState?: Partial<FederationIdentity>;
    newState?: Partial<FederationIdentity>;
}

export class IdentityRegistry {
    private kv: KVNamespace;
    private keyPrefix: string;
    private ttl: number | undefined;

    constructor(config: IdentityRegistryConfig) {
        this.kv = config.kv;
        this.keyPrefix = config.keyPrefix || 'identity:v1:';
        this.ttl = config.ttl;
    }

    /**
     * Register a new identity with DID, public key, and roles
     */
    async registerIdentity(
        did: string,
        publicKey: string,
        roles: AgentRole | AgentRole[], // Accept single role or array
        metadata: IdentityMetadata,
        performedBy: string
    ): Promise<FederationIdentity> {
        // Normalize roles to array
        const roleArray = Array.isArray(roles) ? roles : [roles];

        // Check if identity already exists
        const existing = await this.getIdentity(did);
        if (existing) {
            throw new Error(`Identity already registered: ${did}`);
        }

        // Create identity object
        const identity: FederationIdentity = {
            agentId: did,
            clusterRole: roleArray[0] || AgentRole.AGENT, // Primary role
            clusterId: metadata.clusterId,
            publicKey,
            capabilities: this.getCapabilitiesForRoles(roleArray),
            reputation: metadata.reputation,
            isActive: true,
            lastSeen: new Date().toISOString()
        };

        // Store in KV
        const key = `${this.keyPrefix}${did}`;
        const value = JSON.stringify(identity);

        if (this.ttl) {
            await this.kv.put(key, value, { metadata: { created: new Date().toISOString() } });
        } else {
            await this.kv.put(key, value);
        }

        // Create role index
        await this.updateRoleIndex(did, roleArray, 'register');

        // Log audit entry
        await this.logAuditEntry({
            action: 'register',
            did,
            performedBy,
            timestamp: new Date().toISOString(),
            newState: identity
        });

        return identity;
    }

    /**
     * Get identity by DID
     */
    async getIdentity(did: string): Promise<FederationIdentity | null> {
        const key = `${this.keyPrefix}${did}`;
        const value = await this.kv.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value) as FederationIdentity;
    }

    /**
     * Update roles for an existing identity
     */
    async updateRoles(
        did: string,
        newRoles: AgentRole[],
        performedBy: string,
        reason?: string
    ): Promise<FederationIdentity> {
        const existing = await this.getIdentity(did);
        if (!existing) {
            throw new Error(`Identity not found: ${did}`);
        }

        // Get previous state for audit log
        const previousState = { ...existing };

        // Update identity
        if (newRoles.length > 0) {
            const primaryRole = newRoles[0];
            if (primaryRole) {
                existing.clusterRole = primaryRole;
            }
            existing.capabilities = this.getCapabilitiesForRoles(newRoles);
        }
        existing.lastSeen = new Date().toISOString();

        // Store updated identity
        const key = `${this.keyPrefix}${did}`;
        await this.kv.put(key, JSON.stringify(existing));

        // Update role index
        await this.updateRoleIndex(did, newRoles, 'update');

        // Log audit entry
        await this.logAuditEntry({
            action: 'update',
            did,
            performedBy,
            timestamp: new Date().toISOString(),
            reason,
            previousState,
            newState: existing
        });

        return existing;
    }

    /**
     * Revoke an identity
     */
    async revokeIdentity(
        did: string,
        reason: string,
        performedBy: string
    ): Promise<FederationIdentity> {
        const existing = await this.getIdentity(did);
        if (!existing) {
            throw new Error(`Identity not found: ${did}`);
        }

        // Get previous state for audit log
        const previousState = { ...existing };

        // Update identity
        existing.isActive = false;
        existing.lastSeen = new Date().toISOString();
        // Add revocation timestamp to metadata
        if (!existing.metadata) {
            existing.metadata = {};
        }
        existing.metadata.revokedAt = new Date().toISOString();
        existing.metadata.revocationReason = reason;

        // Store updated identity
        const key = `${this.keyPrefix}${did}`;
        await this.kv.put(key, JSON.stringify(existing));

        // Update role index
        await this.updateRoleIndex(did, [], 'revoke');

        // Log audit entry
        await this.logAuditEntry({
            action: 'revoke',
            did,
            performedBy,
            timestamp: new Date().toISOString(),
            reason,
            previousState,
            newState: existing
        });

        return existing;
    }

    /**
     * List identities with optional filtering
     */
    async listIdentities(filter?: IdentityFilter): Promise<FederationIdentity[]> {
        // For now, we'll need to scan all keys since KV doesn't support complex queries
        // In a real implementation, we might use secondary indexes or a separate database
        const list = await this.kv.list({ prefix: this.keyPrefix });
        const identities: FederationIdentity[] = [];

        // Use the keys array from the list result
        for (const key of list.keys) {
            const value = await this.kv.get(key.name);
            if (value) {
                const identity = JSON.parse(value) as FederationIdentity;

                // Apply filters
                if (filter) {
                    if (filter.clusterId && identity.clusterId !== filter.clusterId) continue;
                    if (filter.role && identity.clusterRole !== filter.role) continue;
                    if (filter.isActive !== undefined && identity.isActive !== filter.isActive) continue;
                    if (filter.agentType && identity.agentId.includes(filter.agentType)) continue;
                }

                identities.push(identity);
            }
        }

        return identities;
    }

    /**
     * Get public key for JWT verification
     */
    async getPublicKey(did: string): Promise<string | null> {
        const identity = await this.getIdentity(did);
        return identity ? identity.publicKey : null;
    }

    /**
     * Check if identity is valid for a specific role
     */
    async isIdentityValid(did: string, requiredRole: AgentRole): Promise<boolean> {
        const identity = await this.getIdentity(did);
        if (!identity || !identity.isActive) {
            return false;
        }

        // Check if identity has the required role or higher
        const roleHierarchy: Record<AgentRole, number> = {
            [AgentRole.AGENT]: 1,
            [AgentRole.ARBITER]: 2,
            [AgentRole.ARCHIVIST]: 3,
            [AgentRole.CURATOR]: 4,
            [AgentRole.CUSTODIAN]: 5
        };

        const identityRoleLevel = roleHierarchy[identity.clusterRole] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        return identityRoleLevel >= requiredRoleLevel;
    }

    /**
     * Get capabilities for a set of roles
     */
    private getCapabilitiesForRoles(roles: AgentRole[]): string[] {

        const capabilities = new Set<string>();

        for (const role of roles) {
            const roleCapabilities = ROLE_CAPABILITIES[role] || [];
            roleCapabilities.forEach(capability => capabilities.add(capability));
        }

        return Array.from(capabilities);
    }

    /**
     * Update role index for fast filtering
     */
    private async updateRoleIndex(did: string, roles: AgentRole[], action: string): Promise<void> {
        // Create role-specific indexes for fast filtering
        for (const role of roles) {
            const roleKey = `${this.keyPrefix}role:${role}:${did}`;
            await this.kv.put(roleKey, '1', { metadata: { action, timestamp: new Date().toISOString() } });
        }

        // If revoking, remove role indexes
        if (action === 'revoke') {
            for (const role of Object.values(AgentRole)) {
                const roleKey = `${this.keyPrefix}role:${role}:${did}`;
                await this.kv.delete(roleKey);
            }
        }
    }

    /**
     * Log audit entry for identity changes
     */
    private async logAuditEntry(log: IdentityAuditLog): Promise<void> {
        const key = `${this.keyPrefix}audit:${Date.now()}:${log.did}`;
        const value = JSON.stringify(log);

        if (this.ttl) {
            await this.kv.put(key, value, { metadata: { type: 'audit' } });
        } else {
            await this.kv.put(key, value);
        }
    }

    /**
     * Get audit log for an identity
     */
    async getAuditLog(did: string): Promise<IdentityAuditLog[]> {
        // This would require scanning all audit entries, which is inefficient
        // In a real implementation, we might use a separate audit log database
        // For now, return empty array
        return [];
    }

    /**
     * Check if identity is suspended
     */
    async isIdentitySuspended(did: string): Promise<boolean> {
        const identity = await this.getIdentity(did);
        return identity ? !identity.isActive : false;
    }

    /**
     * Activate a suspended identity
     */
    async activateIdentity(
        did: string,
        performedBy: string
    ): Promise<FederationIdentity> {
        const existing = await this.getIdentity(did);
        if (!existing) {
            throw new Error(`Identity not found: ${did}`);
        }

        // Get previous state for audit log
        const previousState = { ...existing };

        // Update identity
        existing.isActive = true;
        existing.lastSeen = new Date().toISOString();
        // Remove revocation metadata
        if (existing.metadata) {
            delete existing.metadata.revokedAt;
            delete existing.metadata.revocationReason;
        }

        // Store updated identity
        const key = `${this.keyPrefix}${did}`;
        await this.kv.put(key, JSON.stringify(existing));

        // Log audit entry
        await this.logAuditEntry({
            action: 'activate',
            did,
            performedBy,
            timestamp: new Date().toISOString(),
            previousState,
            newState: existing
        });

        return existing;
    }
}