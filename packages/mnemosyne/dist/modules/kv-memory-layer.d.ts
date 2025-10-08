/**
 * KV Memory Layer - Foundation Persistence
 *
 * This provides the most reliable, simple persistence layer for critical memory.
 * KV storage is guaranteed persistent and has simple key-value semantics.
 *
 * Architecture:
 * KV Layer (Foundation) → Vector Layer (Enhanced Search) → Durable Objects (Performance)
 */
export interface KVMemoryItem {
    id: string;
    content: string;
    timestamp: string;
    type: 'claim' | 'violation' | 'rule' | 'knowledge' | 'protocol' | 'session_state';
    metadata: Record<string, unknown>;
    tier: 'critical' | 'important' | 'working' | 'cache';
}
export interface KVMemoryEnv {
    MEMORY_KV: KVNamespace;
}
export declare class KVMemoryLayer {
    private kv;
    private keyPrefix;
    constructor(env: KVMemoryEnv);
    /**
     * Store critical memory item in KV with guaranteed persistence
     */
    store(item: Omit<KVMemoryItem, 'id' | 'timestamp'>): Promise<string>;
    /**
     * Retrieve memory item by ID
     */
    get(id: string): Promise<KVMemoryItem | null>;
    /**
     * Search by type and content
     */
    searchByType(type: KVMemoryItem['type'], limit?: number): Promise<KVMemoryItem[]>;
    /**
     * Search across all types with text matching
     */
    search(query: string, limit?: number): Promise<KVMemoryItem[]>;
    /**
     * Store terminal protocol in KV for guaranteed persistence
     */
    storeTerminalProtocol(protocol: string): Promise<string>;
    /**
     * Store violation in KV for guaranteed tracking
     */
    storeViolation(violation: {
        rule: string;
        context: string;
        severity: 'minor' | 'major' | 'critical';
    }): Promise<string>;
    /**
     * Store session state for recovery
     */
    storeSessionState(state: Record<string, unknown>): Promise<string>;
    /**
     * Get all critical items (for recovery scenarios)
     */
    getCriticalItems(): Promise<KVMemoryItem[]>;
    /**
     * Health check - verify KV is operational
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'failed';
        details: string;
    }>;
    /**
     * Update type index for faster searches
     */
    private updateTypeIndex;
    /**
     * Export all memory for backup
     */
    exportAll(): Promise<KVMemoryItem[]>;
}
export declare function getKVMemoryLayer(env: KVMemoryEnv): KVMemoryLayer;
export declare function resetKVMemoryLayer(): void;
//# sourceMappingURL=kv-memory-layer.d.ts.map