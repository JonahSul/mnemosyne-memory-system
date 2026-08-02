/**
 * @mnemosyne/core — the Mnemosyne domain model.
 *
 * Pure TypeScript, zero I/O dependencies. Contains:
 * - Domain aggregates (Memory, FoundationRules)
 * - Domain services (TierManagement, Search, Causality, Federation)
 * - Application services (use cases)
 * - Shared kernel (types, repository interfaces, ports)
 *
 * Infrastructure packages (@mnemosyne/infra-cloudflare, @mnemosyne/infra-sqlite)
 * provide real adapter implementations. The SaaS Worker (@mnemosyne/saas) and
 * CLI (@mnemosyne/cli) are composition roots that bind adapters to the domain.
 *
 * @see FOUNDATION.md for the behavioral protocol this domain enforces.
 */

// Shared kernel (repository ports, value objects, identifiers)
// Note: MemoryId and MemoryTier are defined in shared and re-exported by
// domain/memory for convenience. We export shared first, then domain modules
// that don't conflict.
export * from './shared/index.js';

// Domain aggregates and services
export { MemoryAggregate, MemoryValidationError } from './domain/memory/memory-aggregate.js';
export type { MemoryEntry, MemoryMetadata, MemoryWriteSpec, TemporalMetadata, SemanticExpansion, SemanticAxis, AgentAttribution, TaskContext } from './domain/memory/types.js';
export { TierManagementService } from './domain/tier/tier-service.js';
export type { TierPolicy, TierStats, PromotionCandidate } from './domain/tier/types.js';
export { SearchService, EMPIRICAL_THRESHOLDS } from './domain/search/search-service.js';
export type { SearchSpec, SearchOptions, RankedResult } from './domain/search/types.js';
export { FoundationRulesAggregate, seedFoundationRules, FOUNDATION_VERSION } from './domain/foundation/foundation-aggregate.js';
export type { FoundationRule, FoundationRules, RuleSeverity, RuleCategory } from './domain/foundation/types.js';
export { CausalityService } from './domain/causality/causality-service.js';
export type { CausalRelationship, CausalRelationshipType, CausalityMethod, LamportClock, VectorClock, HybridLogicalClock, CausalContext, EnhancedTemporalMetadata, CausalityAnalysisResult } from './domain/causality/types.js';
export { FederationService } from './domain/federation/federation-service.js';
export type { FederationServiceConfig } from './domain/federation/federation-service.js';
export { ROLE_CAPABILITIES } from './domain/federation/types.js';
export type { AgentRole, FederationCapability, FederationIdentity, FederationSession, IdentityAuditAction, IdentityAuditLog, IdentityFilter, IdentityMetadata } from './domain/federation/types.js';

// Application services (use cases)
export { StoreMemoryUseCase } from './application/store-memory.js';
export type { StoreMemoryInput, StoreMemoryOutput } from './application/store-memory.js';
export { SearchMemoryUseCase } from './application/search-memory.js';
export type { SearchMemoryInput, SearchMemoryOutput } from './application/search-memory.js';
export { GetSystemStatsUseCase } from './application/get-system-stats.js';
export type { GetSystemStatsInput, GetSystemStatsOutput } from './application/get-system-stats.js';
export { AdministerFoundationUseCase } from './application/administer-foundation.js';
export type { AdministerFoundationInput, AdministerFoundationOutput, AdminOperation } from './application/administer-foundation.js';
export { StoreEnhancedMemoryUseCase } from './application/store-enhanced-memory.js';
export type { StoreEnhancedMemoryInput, StoreEnhancedMemoryOutput } from './application/store-enhanced-memory.js';
export { AnalyzeCausalityUseCase } from './application/analyze-causality.js';
export type { AnalyzeCausalityInput, AnalyzeCausalityOutput } from './application/analyze-causality.js';
