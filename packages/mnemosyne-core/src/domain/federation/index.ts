/**
 * Federation bounded context.
 *
 * Decentralized agent federation: identity, authentication, governance, and
 * cross-node synchronization. Uses JWT (Ed25519) for authentication.
 *
 * Extracted from the legacy `modules/federation-auth.ts` and
 * `modules/identity-registry.ts` during Phase 2.
 */

export type {
    AgentRole,
    FederationCapability,
    FederationIdentity,
    FederationSession,
    IdentityAuditAction,
    IdentityAuditLog,
    IdentityFilter,
    IdentityMetadata,
} from './types.js';

export { ROLE_CAPABILITIES } from './types.js';
export { FederationService } from './federation-service.js';
export type { FederationServiceConfig } from './federation-service.js';
