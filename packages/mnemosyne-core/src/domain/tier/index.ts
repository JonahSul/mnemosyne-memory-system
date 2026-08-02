/**
 * Tier management bounded context.
 *
 * Manages the four-tier persistence model (axiom / long / intermediate / short)
 * with forgetting-curve-inspired promotion and demotion. Tier storage is
 * shard-able by tenant. Delegates all I/O to injected adapters.
 *
 * Extracted from the legacy `modules/persistent-tier-memory.ts` during Phase 2.
 */

export type {
    MemoryTier,
    PersistenceLevel,
    PruningStrategy,
    PromotionCandidate,
    TierItem,
    TierLimits,
    TierPolicy,
    TierStats,
    WeightHistoryEntry,
} from './types.js';

export { DEFAULT_TIER_LIMITS, TierManagementService } from './tier-service.js';
export type { StoreKnowledgeParams, TierServiceConfig } from './tier-service.js';
