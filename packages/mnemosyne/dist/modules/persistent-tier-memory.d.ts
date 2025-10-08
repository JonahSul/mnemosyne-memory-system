/**
 * Persistent Tier Memory System - Foundation v1.8.0
 *
 * ELIMINATES VOLATILE STORAGE: Replaces MultiTierMemorySystem volatile Maps
 * with KV-first write-through architecture for guaranteed persistence.
 *
 * Architecture: KV (immediate consistency) + Vector (semantic search) + enhanced metadata
 * Ensures "crystallized state amid the chaos" for consciousness continuity.
 */
import type { KeyValueStoreAdapter, VectorStoreAdapter } from '../interfaces/storage';
export interface PersistentTierItem {
    id: string;
    content: string;
    embedding?: number[];
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
    kvKey: string;
    vectorId?: string;
    persistenceLevel: 'kv_only' | 'kv_vector' | 'critical_protected';
    ttlSeconds?: number;
}
export interface TierStorageConfig {
    kv: KeyValueStoreAdapter;
    vectorStore: VectorStoreAdapter;
    keyPrefix: string;
}
export interface TierLimits {
    maxItems: number;
    retentionHours: number;
    accessThreshold: number;
    pruningStrategy: 'fifo' | 'lru' | 'frequency' | 'importance';
    persistenceLevel: 'kv_only' | 'kv_vector' | 'critical_protected';
}
/**
 * Persistent tier configuration eliminating volatile storage
 */
export declare const PERSISTENT_TIER_CONFIG: Record<string, TierLimits>;
/**
 * Individual persistent tier - eliminates volatile Map storage
 */
export declare class PersistentTier {
    private kv;
    private vectorStore;
    private tierName;
    private config;
    private keyPrefix;
    constructor(tierName: string, config: TierLimits, storage: TierStorageConfig);
    /**
     * Store item with immediate KV persistence + optional Vector backup
     */
    store(item: Omit<PersistentTierItem, 'id' | 'timestamp' | 'kvKey' | 'tier' | 'persistenceLevel'>): Promise<string>;
    /**
     * Retrieve item by ID with KV-first lookup
     */
    get(id: string): Promise<PersistentTierItem | null>;
    /**
     * Search within tier using KV index + optional Vector enhancement
     */
    search(query: string, limit?: number): Promise<PersistentTierItem[]>;
    /**
     * List all items in tier for management operations
     */
    listAll(limit?: number): Promise<PersistentTierItem[]>;
    /**
     * Check if item is eligible for promotion to next tier
     */
    checkPromotion(id: string): Promise<boolean>;
    /**
     * Remove item from tier (for promotion or pruning)
     */
    remove(id: string): Promise<boolean>;
    /**
     * Prune tier according to configured strategy
     */
    prune(): Promise<number>;
    /**
     * Update tier index for fast enumeration
     */
    private updateTierIndex;
    /**
     * Remove from tier index
     */
    private removeTierIndex;
    /**
     * Get tier statistics
     */
    getStats(): Promise<{
        name: string;
        itemCount: number;
        config: TierLimits;
        oldestItem?: string | undefined;
        newestItem?: string | undefined;
        averageImportance?: number | undefined;
    }>;
}
/**
 * Complete persistent tier memory system - replaces volatile MultiTierMemorySystem
 */
export declare class PersistentTierMemorySystem {
    private tiers;
    private storage;
    constructor(storage: TierStorageConfig);
    /**
     * Initialize all persistent tiers
     */
    private initializeTiers;
    /**
     * Store knowledge with automatic tier placement
     */
    storeKnowledge(params: {
        content: string;
        metadata?: Record<string, unknown>;
        tags?: string[];
        importance: number;
        targetTier?: string;
    }): Promise<string>;
    /**
     * Search across all tiers with tier-specific boosting
     */
    search(query: string, limit?: number): Promise<PersistentTierItem[]>;
    /**
     * Get item from any tier
     */
    get(id: string): Promise<PersistentTierItem | null>;
    /**
     * Process tier promotions based on access patterns
     */
    processPromotions(): Promise<number>;
    /**
     * Get system statistics
     */
    getStats(): Promise<{
        tiers: any[];
        totalItems: number;
        lastPromotion?: string;
        systemHealth: 'healthy' | 'degraded' | 'critical';
    }>;
    /**
     * Prune specific tier
     */
    private pruneTier;
    /**
     * Determine appropriate tier based on importance score
     */
    private determineTier;
    /**
     * Export all data for backup/migration
     */
    exportAll(): Promise<{
        tiers: Record<string, PersistentTierItem[]>;
        stats: any;
        timestamp: string;
    }>;
}
//# sourceMappingURL=persistent-tier-memory.d.ts.map