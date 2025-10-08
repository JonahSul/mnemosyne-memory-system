/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Core Memory Operations Module
 *
 * Handles basic memory entry operations: claims, assumptions, verifications
 */
import type { MemoryEntry } from './memory-interfaces';
/**
 * Custom error for when memory entries are not found
 * This should be handled as a 404 error, not a 500
 */
export declare class MemoryNotFoundError extends Error {
    constructor(id: string, type?: string);
}
export interface CoreMemoryOperations {
    logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high', testing?: boolean): Promise<string>;
    logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing?: boolean): Promise<string>;
    verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
    getUnverifiedClaims(includeTestingData?: boolean): MemoryEntry[];
    getUnverifiedClaimsCount(includeTestingData?: boolean): number;
    getMemories(includeTestingData?: boolean): Map<string, MemoryEntry>;
    storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string>;
    searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
    getMemoryStats(includeTestingData?: boolean): any;
    exportMemory(includeTestingData?: boolean): Promise<any>;
}
export declare class CoreMemoryManager implements CoreMemoryOperations {
    private memories;
    /**
     * Filter memories based on testing flag
     */
    private filterMemories;
    /**
     * Filter memory array based on testing flag
     */
    private filterMemoryArray;
    logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high', testing?: boolean): Promise<string>;
    logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing?: boolean): Promise<string>;
    verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
    getUnverifiedClaims(includeTestingData?: boolean): MemoryEntry[];
    getUnverifiedClaimsCount(includeTestingData?: boolean): number;
    getMemories(includeTestingData?: boolean): Map<string, MemoryEntry>;
    storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string>;
    searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
    getMemoryStats(includeTestingData?: boolean): any;
    exportMemory(includeTestingData?: boolean): Promise<any>;
}
//# sourceMappingURL=core-memory.d.ts.map