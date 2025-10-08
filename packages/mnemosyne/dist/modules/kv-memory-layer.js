/**
 * KV Memory Layer - Foundation Persistence
 *
 * This provides the most reliable, simple persistence layer for critical memory.
 * KV storage is guaranteed persistent and has simple key-value semantics.
 *
 * Architecture:
 * KV Layer (Foundation) → Vector Layer (Enhanced Search) → Durable Objects (Performance)
 */
export class KVMemoryLayer {
    kv;
    keyPrefix = 'mem:';
    constructor(env) {
        this.kv = env.MEMORY_KV;
    }
    /**
     * Store critical memory item in KV with guaranteed persistence
     */
    async store(item) {
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        const memoryItem = {
            id,
            timestamp,
            ...item
        };
        const key = `${this.keyPrefix}${item.type}:${id}`;
        try {
            await this.kv.put(key, JSON.stringify(memoryItem), {
                metadata: {
                    type: item.type,
                    tier: item.tier,
                    timestamp
                }
            });
            // Also store in type-specific index for fast retrieval
            await this.updateTypeIndex(item.type, id);
            return id;
        }
        catch (error) {
            throw new Error(`KV storage failed: ${error}`);
        }
    }
    /**
     * Retrieve memory item by ID
     */
    async get(id) {
        try {
            // Try different type prefixes since we don't know the type
            const types = ['claim', 'violation', 'rule', 'knowledge', 'protocol', 'session_state'];
            for (const type of types) {
                const key = `${this.keyPrefix}${type}:${id}`;
                const result = await this.kv.get(key);
                if (result) {
                    return JSON.parse(result);
                }
            }
            return null;
        }
        catch (error) {
            console.error('KV retrieval failed:', error);
            return null;
        }
    }
    /**
     * Search by type and content
     */
    async searchByType(type, limit = 10) {
        try {
            const prefix = `${this.keyPrefix}${type}:`;
            const list = await this.kv.list({ prefix, limit });
            const items = [];
            for (const key of list.keys) {
                const value = await this.kv.get(key.name);
                if (value) {
                    items.push(JSON.parse(value));
                }
            }
            // Sort by timestamp (newest first)
            return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        catch (error) {
            console.error('KV search failed:', error);
            return [];
        }
    }
    /**
     * Search across all types with text matching
     */
    async search(query, limit = 10) {
        try {
            const allTypes = ['claim', 'violation', 'rule', 'knowledge', 'protocol', 'session_state'];
            const allItems = [];
            for (const type of allTypes) {
                const typeItems = await this.searchByType(type, 50);
                allItems.push(...typeItems);
            }
            // Simple text matching (can be enhanced with better search later)
            const queryLower = query.toLowerCase();
            const filtered = allItems.filter(item => item.content.toLowerCase().includes(queryLower) ||
                JSON.stringify(item.metadata).toLowerCase().includes(queryLower));
            return filtered
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);
        }
        catch (error) {
            console.error('KV search failed:', error);
            return [];
        }
    }
    /**
     * Store terminal protocol in KV for guaranteed persistence
     */
    async storeTerminalProtocol(protocol) {
        return this.store({
            content: protocol,
            type: 'protocol',
            tier: 'critical',
            metadata: {
                protocol_type: 'terminal_handling',
                importance: 'foundational',
                source: 'user_instruction'
            }
        });
    }
    /**
     * Store violation in KV for guaranteed tracking
     */
    async storeViolation(violation) {
        return this.store({
            content: `VIOLATION: ${violation.rule} - ${violation.context}`,
            type: 'violation',
            tier: 'critical',
            metadata: {
                rule: violation.rule,
                severity: violation.severity,
                context: violation.context
            }
        });
    }
    /**
     * Store session state for recovery
     */
    async storeSessionState(state) {
        return this.store({
            content: JSON.stringify(state),
            type: 'session_state',
            tier: 'working',
            metadata: {
                session_type: 'working_memory',
                size: JSON.stringify(state).length
            }
        });
    }
    /**
     * Get all critical items (for recovery scenarios)
     */
    async getCriticalItems() {
        const allTypes = ['protocol', 'rule', 'violation'];
        const criticalItems = [];
        for (const type of allTypes) {
            const items = await this.searchByType(type, 100);
            criticalItems.push(...items.filter(item => item.tier === 'critical'));
        }
        return criticalItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    /**
     * Health check - verify KV is operational
     */
    async healthCheck() {
        try {
            const testId = await this.store({
                content: `Health check ${Date.now()}`,
                type: 'knowledge',
                tier: 'cache',
                metadata: { health_check: true }
            });
            const retrieved = await this.get(testId);
            if (retrieved && retrieved.content.startsWith('Health check')) {
                return { status: 'healthy', details: `KV operational - test item ${testId}` };
            }
            else {
                return { status: 'failed', details: 'KV store/retrieve cycle failed' };
            }
        }
        catch (error) {
            return { status: 'failed', details: `KV error: ${error}` };
        }
    }
    /**
     * Update type index for faster searches
     */
    async updateTypeIndex(type, id) {
        try {
            const indexKey = `${this.keyPrefix}index:${type}`;
            const existing = await this.kv.get(indexKey);
            let index = existing ? JSON.parse(existing) : [];
            index.unshift(id); // Add to front (newest first)
            index = index.slice(0, 100); // Keep only recent 100
            await this.kv.put(indexKey, JSON.stringify(index));
        }
        catch (error) {
            console.error('Index update failed:', error);
            // Don't throw - index is optimization, not critical
        }
    }
    /**
     * Export all memory for backup
     */
    async exportAll() {
        const allTypes = ['claim', 'violation', 'rule', 'knowledge', 'protocol', 'session_state'];
        const allItems = [];
        for (const type of allTypes) {
            const items = await this.searchByType(type, 1000);
            allItems.push(...items);
        }
        return allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
}
// Singleton for consistent access
let kvMemoryInstance = null;
export function getKVMemoryLayer(env) {
    if (!kvMemoryInstance) {
        kvMemoryInstance = new KVMemoryLayer(env);
    }
    return kvMemoryInstance;
}
export function resetKVMemoryLayer() {
    kvMemoryInstance = null;
}
