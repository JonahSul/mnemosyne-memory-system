/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Persistent Core Memory Operations Module
 *
 * ARCHITECTURAL FIX: Replaces volatile Map storage with immediate persistence
 * to CloudflareVectorStore and KV storage for true persistence compliance
 */
import type { MemoryEntry } from './memory-interfaces';
import type { KeyValueStoreAdapter, VectorStoreAdapter } from '../interfaces/storage';
/**
 * Custom error for when memory entries are not found
 */
export declare class MemoryNotFoundError extends Error {
    constructor(id: string, type?: string);
}
export interface PersistentCoreMemoryOperations {
    logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high', testing?: boolean): Promise<string>;
    logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing?: boolean): Promise<string>;
    verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
    getUnverifiedClaims(includeTestingData?: boolean): Promise<MemoryEntry[]>;
    getUnverifiedClaimsCount(includeTestingData?: boolean): Promise<number>;
    getMemories(includeTestingData?: boolean): Promise<MemoryEntry[]>;
    storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string>;
    searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
    getMemoryStats(includeTestingData?: boolean): Promise<any>;
    exportMemory(includeTestingData?: boolean): Promise<any>;
}
export declare class PersistentCoreMemoryManager implements PersistentCoreMemoryOperations {
    private vectorStore;
    private kvStore?;
    private kvKeyIndex;
    constructor(vectorStore: VectorStoreAdapter, kvStore?: KeyValueStoreAdapter);
    /**
     * PERSISTENCE FIX: Store claim immediately to persistent storage
     */
    logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high', testing?: boolean): Promise<string>;
    /**
     * PERSISTENCE FIX: Store assumption immediately to persistent storage
     */
    logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing?: boolean): Promise<string>;
    /**
     * PERSISTENCE FIX: Update claim verification in persistent storage
     */
    verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
    /**
     * PERSISTENCE FIX: Retrieve unverified claims from persistent storage
     */
    getUnverifiedClaims(includeTestingData?: boolean): Promise<MemoryEntry[]>;
    /**
     * PERSISTENCE FIX: Count unverified claims from persistent storage
     */
    getUnverifiedClaimsCount(includeTestingData?: boolean): Promise<number>;
    /**
     * PERSISTENCE FIX: Retrieve all memories from persistent storage
     */
    getMemories(includeTestingData?: boolean): Promise<MemoryEntry[]>;
    /**
     * PERSISTENCE FIX: Store memory entry immediately to persistent storage
     */
    storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string>;
    /**
     * PERSISTENCE FIX: Search memories in persistent storage
     */
    searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
    /**
     * PERSISTENCE FIX: Get memory statistics from persistent storage
     */
    getMemoryStats(includeTestingData?: boolean): Promise<any>;
    /**
     * PERSISTENCE FIX: Export all memory data from persistent storage
     */
    exportMemory(includeTestingData?: boolean): Promise<any>;
    private loadMemoriesFromKV;
    private trackKvKey;
    private normalizeVectorResult;
    private isValidMemoryType;
    private isValidMemoryStatus;
}
//# sourceMappingURL=persistent-core-memory.d.ts.map