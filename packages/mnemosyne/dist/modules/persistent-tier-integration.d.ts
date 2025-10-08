/**
 * Persistent Tier Memory Integration - Foundation v1.8.0
 *
 * REPLACES VOLATILE MULTITIER: Integration layer that replaces MultiTierMemorySystem
 * volatile Maps with KV-first write-through architecture using PersistentTierMemorySystem.
 *
 * This provides drop-in replacement for simplified-registry.ts and other components
 * that currently use the volatile MultiTierMemorySystem.
 */
import { type PersistentTierItem, type TierStorageConfig } from './persistent-tier-memory';
import type { KeyValueStoreAdapter, VectorStoreAdapter } from '../interfaces/storage';
/**
 * Drop-in replacement interface matching original MultiTierMemorySystem
 */
export interface TieredKnowledgeItem {
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
}
/**
 * Persistent MultiTier Memory System - Drop-in replacement for volatile version
 *
 * CRITICAL CHANGE: Eliminates all volatile Map storage, replaces with KV-first architecture
 */
export declare class PersistentMultiTierMemorySystem {
    private persistentTiers;
    private initialized;
    constructor(storage: TierStorageConfig);
    /**
     * Store knowledge with persistent tier placement - NO VOLATILE STORAGE
     */
    storeKnowledge(params: {
        content: string;
        metadata?: Record<string, unknown>;
        tags?: string[];
        importance: number;
        targetTier?: 'axiom' | 'long' | 'intermediate' | 'short';
    }): Promise<string>;
    /**
     * Search across persistent tiers with tier boosting
     */
    search(params: {
        query: string;
        threshold?: number;
        maxResults?: number;
        tierBoosts?: Record<string, number>;
    }): Promise<TieredKnowledgeItem[]>;
    /**
     * Get knowledge item by ID from persistent storage
     */
    getKnowledge(id: string): Promise<TieredKnowledgeItem | null>;
    /**
     * Process tier promotions based on access patterns
     */
    processPromotions(): Promise<{
        promotionResults: {
            promoted: number;
            errors: string[];
        };
        summary: string;
    }>;
    /**
     * Get system statistics from persistent tiers
     */
    getStats(): Promise<{
        tiers: any[];
        totalKnowledge: number;
        memoryUtilization: any;
        persistenceHealth: 'healthy' | 'degraded' | 'critical';
    }>;
    /**
     * Export all persistent data
     */
    exportMemory(): Promise<{
        version: string;
        timestamp: string;
        storage_type: string;
        data: any;
    }>;
    /**
     * Health check for persistent storage
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'critical';
        details: {
            persistent_storage: boolean;
            volatile_eliminated: boolean;
            kv_operational: boolean;
            vector_operational: boolean;
        };
    }>;
    /**
     * Initialize from existing MultiTierMemorySystem data (migration helper)
     */
    static migrateFromVolatile(volatileData: TieredKnowledgeItem[], storage: TierStorageConfig): Promise<PersistentMultiTierMemorySystem>;
}
/**
 * Factory function for creating persistent tier system
 */
export declare function createPersistentMultiTierMemorySystem(params: {
    kv: KeyValueStoreAdapter;
    vectorStore: VectorStoreAdapter;
    keyPrefix?: string;
}): PersistentMultiTierMemorySystem;
/**
 * Type guard to check if system uses persistent storage
 */
export declare function isPersistentTierSystem(system: any): system is PersistentMultiTierMemorySystem;
export type { TierStorageConfig, PersistentTierItem };
//# sourceMappingURL=persistent-tier-integration.d.ts.map