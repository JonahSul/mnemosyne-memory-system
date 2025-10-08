/**
 * Multi-Tier Memory System for Mnemosyne
 * Version 1.1.0 - Optimized Threshold Implementation
 *
 * Implements a hierarchical memory architecture with different retention policies:
 * - Short-term: High-frequency access, aggressive pruning (token conservation)
 * - Intermediate-term: Moderate retention, frequency-based pruning
 * - Long-term: Persistent storage, minimal pruning (important knowledge)
 *
 * Based on established patterns from cognitive science and modern vector databases.
 * Enhanced with empirically optimized search thresholds from v1.1.0.
 */
export interface MemoryTier {
    name: string;
    maxItems: number;
    retentionHours: number;
    accessThreshold: number;
    pruningStrategy: 'fifo' | 'lru' | 'frequency' | 'importance';
}
export interface TieredKnowledgeItem {
    id: string;
    content: string;
    embedding: number[];
    metadata: Record<string, unknown>;
    tags: string[];
    timestamp: string;
    tier: 'axiom' | 'long' | 'intermediate' | 'short';
    accessCount: number;
    lastAccessed: string;
    importance: number;
    promotionEligible: boolean;
    significanceWeight: number;
    semanticWeight: number;
    combinedWeight: number;
    weightHistory: Array<{
        timestamp: string;
        significance: number;
        semantic: number;
        combined: number;
        reason: string;
    }>;
}
export interface TierConfig {
    axiom?: MemoryTier;
    long: MemoryTier;
    intermediate: MemoryTier;
    short: MemoryTier;
}
/**
 * Default tier configuration based on established cognitive memory patterns
 */
export declare const DEFAULT_TIER_CONFIG: TierConfig;
export declare class MultiTierMemorySystem {
    private axiomTier;
    private longTerm;
    private intermediateTerm;
    private shortTerm;
    private config;
    constructor(config?: TierConfig);
    /**
     * Get optimized threshold based on search context
     */
    private getOptimizedThreshold;
    /**
     * Store knowledge in appropriate tier based on importance
     */
    storeKnowledge(knowledge: {
        content: string;
        metadata?: Record<string, unknown>;
        tags?: string[];
        importance?: number;
        targetTier?: 'axiom' | 'long' | 'intermediate' | 'short';
        testing?: boolean;
    }): Promise<TieredKnowledgeItem>;
    /**
     * Search across all tiers with tier-aware ranking and optimized thresholds
     */
    searchSimilar(query: string, options?: {
        limit?: number;
        threshold?: number;
        tierPreference?: 'axiom' | 'long' | 'intermediate' | 'short' | 'all';
        includeTestingData?: boolean;
        searchType?: 'exploration' | 'balanced' | 'precision' | 'discovery';
    }): Promise<Array<TieredKnowledgeItem & {
        similarity: number;
    }>>;
    /**
     * Calculate adaptive threshold based on workload characteristics and search context
     */
    calculateAdaptiveThreshold(options?: {
        workloadType?: 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging';
        contextComplexity?: 'simple' | 'moderate' | 'complex';
        tierPreference?: 'axiom' | 'long' | 'intermediate' | 'short' | 'all';
        expectedResultCount?: number;
        currentMemoryLoad?: number;
    }): number;
    /**
     * Search with adaptive threshold based on context
     */
    searchWithAdaptiveThreshold(query: string, options?: {
        workloadType?: 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging';
        contextComplexity?: 'simple' | 'moderate' | 'complex';
        tierPreference?: 'axiom' | 'long' | 'intermediate' | 'short' | 'all';
        expectedResultCount?: number;
        limit?: number;
        overrideThreshold?: number;
    }): Promise<Array<TieredKnowledgeItem & {
        similarity: number;
        adaptiveThreshold: number;
    }>>;
    /**
     * Calculate current memory system load (0-1 scale)
     */
    private calculateMemoryLoad;
    /**
     * Promote items between tiers based on access patterns
     */
    private checkPromotions;
    /**
     * Prune items from tier based on time expiration and capacity limits
     */
    private pruneIfNecessary;
    /**
     * Remove items that have exceeded their retention time (used during regular operations)
     */
    private pruneExpiredItems;
    /**
     * Apply forgetting curves during garbage collection (includes probabilistic forgetting)
     */
    private pruneWithForgettingCurves;
    /**
     * Determine if an item should be spared from time-based expiration
     * based on importance and access patterns
     */
    private shouldSpareFromExpiration;
    /**
     * Calculate retention probability based on Ebbinghaus forgetting curve
     * Uses probabilistic decay with importance and access modifiers
     */
    private calculateRetentionProbability;
    /**
     * Apply probabilistic forgetting curve to determine if item should be forgotten
     */
    private shouldForgetItem;
    /**
     * Helper methods
     */
    private selectInitialTier;
    private calculateSignificanceWeight;
    private calculateSemanticWeight;
    private calculateCombinedWeight;
    private calculateCosineSimilarity;
    private storeInTier;
    private promoteItem;
    private getTierMap;
    private getTiersToSearch;
    private getTierBoost;
    /**
     * Generate mock embedding for development
     * Creates embeddings that have similarity for similar texts
     */
    private generateMockEmbedding;
    private cosineSimilarity;
    private simpleHash;
    private seededRandom;
    /**
     * Get memory statistics across all tiers
     */
    getMemoryStats(includeTestingData?: boolean): {
        axiom?: {
            count: number;
            capacity: number;
            utilizationPercent: number;
            testingItems?: number;
        };
        long: {
            count: number;
            capacity: number;
            utilizationPercent: number;
            testingItems?: number;
        };
        intermediate: {
            count: number;
            capacity: number;
            utilizationPercent: number;
            testingItems?: number;
        };
        short: {
            count: number;
            capacity: number;
            utilizationPercent: number;
            testingItems?: number;
        };
        total: {
            count: number;
            capacityUsed: number;
            testingItems?: number;
        };
        testingDataIncluded: boolean;
    };
    /**
     * Get forgetting curve analytics for all items
     */
    getForgettingCurveAnalytics(): {
        retentionProbabilities: {
            axiom?: number[];
            long: number[];
            intermediate: number[];
            short: number[];
        };
        averageRetention: {
            axiom?: number;
            long: number;
            intermediate: number;
            short: number;
        };
        itemsAtRisk: {
            axiom?: number;
            long: number;
            intermediate: number;
            short: number;
        };
    };
    /**
     * Manually trigger garbage collection across all tiers
     */
    runGarbageCollection(): Promise<{
        expiredItemsRemoved: {
            axiom?: number;
            long: number;
            intermediate: number;
            short: number;
            total: number;
        };
        itemsSpared: {
            axiom?: number;
            long: number;
            intermediate: number;
            short: number;
            total: number;
        };
        forgettingCurveStats: {
            retentionProbabilities: {
                axiom?: number[];
                long: number[];
                intermediate: number[];
                short: number[];
            };
            averageRetention: {
                axiom?: number;
                long: number;
                intermediate: number;
                short: number;
            };
            itemsAtRisk: {
                axiom?: number;
                long: number;
                intermediate: number;
                short: number;
            };
        };
    }>;
    /**
     * Get count of items that were spared from expiration
     */
    private getSparedItemsCount;
    /**
     * Get memory health statistics including expiration data
     */
    getMemoryHealth(): {
        tiersHealth: {
            short: string;
            intermediate: string;
            long: string;
        };
        expirationStats: {
            itemsNearExpiration: number;
            itemsSpared: number;
        };
        recommendations: string[];
    };
    /**
     * Count items that are approaching expiration (within 10% of retention time)
     */
    private getItemsNearExpiration;
    /**
     * Convenience method for storing axioms - user-provided principles that should always surface first
     */
    storeAxiom(content: string, metadata?: Record<string, unknown>, tags?: string[]): Promise<TieredKnowledgeItem>;
}
//# sourceMappingURL=multi-tier-memory.d.ts.map