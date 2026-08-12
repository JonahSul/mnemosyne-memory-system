/**
 * Tier management domain types.
 *
 * Four-tier persistence model (axiom / long / intermediate / short) extracted
 * from the legacy `modules/persistent-tier-memory.ts`.
 */

import type { MemoryId, MemoryTier } from '../../shared/index.js';

export type PruningStrategy = 'fifo' | 'lru' | 'frequency' | 'importance';
export type PersistenceLevel = 'kv_only' | 'kv_vector' | 'critical_protected';

export interface TierLimits {
	readonly maxItems: number;
	readonly retentionHours: number;
	readonly accessThreshold: number;
	readonly pruningStrategy: PruningStrategy;
	readonly persistenceLevel: PersistenceLevel;
}

export interface TierPolicy {
	readonly tier: MemoryTier;
	readonly maxItems: number;
	readonly decayRate: number;
	readonly promotionThreshold: number;
	readonly demotionThreshold: number;
}

export interface WeightHistoryEntry {
	readonly timestamp: string;
	readonly significance: number;
	readonly semantic: number;
	readonly combined: number;
	readonly reason: string;
}

export interface TierItem {
	readonly id: MemoryId;
	readonly content: string;
	readonly embedding?: number[];
	readonly metadata: Record<string, unknown>;
	readonly tags: string[];
	readonly timestamp: string;
	readonly tier: MemoryTier;
	readonly accessCount: number;
	readonly lastAccessed: string;
	readonly importance: number;
	readonly promotionEligible: boolean;
	readonly significanceWeight: number;
	readonly semanticWeight: number;
	readonly combinedWeight: number;
	readonly weightHistory: WeightHistoryEntry[];
	readonly kvKey: string;
	readonly vectorId?: string;
	readonly persistenceLevel: PersistenceLevel;
	readonly ttlSeconds?: number;
}

export interface TierStats {
	readonly name: MemoryTier;
	readonly itemCount: number;
	readonly config: TierLimits;
	readonly oldestItem?: string;
	readonly newestItem?: string;
	readonly averageImportance?: number;
}

export interface PromotionCandidate {
	readonly id: MemoryId;
	readonly fromTier: MemoryTier;
	readonly toTier: MemoryTier;
	readonly reason: 'frequency' | 'confidence' | 'age';
	readonly score: number;
}

export type { MemoryTier } from '../../shared/index.js';
