/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Persistent Core Memory Operations Module
 *
 * ARCHITECTURAL FIX: Replaces volatile Map storage with immediate persistence
 * to CloudflareVectorStore and KV storage for true persistence compliance
 */
/**
 * Custom error for when memory entries are not found
 */
export class MemoryNotFoundError extends Error {
    constructor(id, type = 'memory') {
        super(`${type} ${id} not found`);
        this.name = 'MemoryNotFoundError';
    }
}
export class PersistentCoreMemoryManager {
    vectorStore;
    kvStore;
    kvKeyIndex = new Set();
    constructor(vectorStore, kvStore) {
        this.vectorStore = vectorStore;
        if (kvStore) {
            this.kvStore = kvStore;
        }
    }
    /**
     * PERSISTENCE FIX: Store claim immediately to persistent storage
     */
    async logClaim(claim, context, source, confidence = 'medium', testing = false) {
        const claimId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const memory = {
            id: claimId,
            timestamp: new Date().toISOString(),
            type: 'claim',
            content: claim,
            status: 'pending',
            context: {
                ...context,
                source,
                confidence,
                testing
            }
        };
        // IMMEDIATE PERSISTENCE: Store to both KV and vector store
        if (this.kvStore) {
            const kvKey = `memory:${claimId}`;
            await this.kvStore.put(kvKey, JSON.stringify(memory));
            this.trackKvKey(kvKey);
        }
        // Store to vector store for semantic search using provided adapter
        await this.vectorStore.storeKnowledge({
            id: claimId,
            content: memory.content,
            metadata: {
                id: claimId,
                type: memory.type,
                status: memory.status,
                timestamp: memory.timestamp,
                confidence,
                ...memory.context
            },
            tags: [memory.type, memory.status, `confidence_${confidence}`, testing ? 'testing' : 'production']
        });
        return claimId;
    }
    /**
     * PERSISTENCE FIX: Store assumption immediately to persistent storage
     */
    async logAssumption(assumption, reasoning, context, testing = false) {
        const assumptionId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const memory = {
            id: assumptionId,
            timestamp: new Date().toISOString(),
            type: 'assumption',
            content: assumption,
            status: 'pending',
            context: {
                ...context,
                reasoning,
                testing
            }
        };
        // IMMEDIATE PERSISTENCE: Store to both KV and vector store
        if (this.kvStore) {
            const kvKey = `memory:${assumptionId}`;
            await this.kvStore.put(kvKey, JSON.stringify(memory));
            this.trackKvKey(kvKey);
        }
        await this.vectorStore.storeKnowledge({
            id: assumptionId,
            content: memory.content,
            metadata: {
                id: assumptionId,
                type: memory.type,
                status: memory.status,
                timestamp: memory.timestamp,
                reasoning,
                ...memory.context
            },
            tags: [memory.type, memory.status, testing ? 'testing' : 'production']
        });
        return assumptionId;
    }
    /**
     * PERSISTENCE FIX: Update claim verification in persistent storage
     */
    async verifyClaim(claimId, success, evidence, notes) {
        // Retrieve from KV store
        let memory = null;
        if (this.kvStore) {
            const kvData = await this.kvStore.get(`memory:${claimId}`);
            if (kvData) {
                memory = JSON.parse(kvData);
            }
        }
        if (!memory) {
            // Fallback: first try direct id lookup on vector store (if implemented), then semantic search
            let searchResults = [];
            if (typeof this.vectorStore.getById === 'function') {
                searchResults = await this.vectorStore.getById(claimId);
            }
            if (!searchResults || searchResults.length === 0) {
                searchResults = await this.vectorStore.searchSimilar(claimId, { limit: 1 });
            }
            if (!searchResults || searchResults.length === 0) {
                throw new MemoryNotFoundError(claimId, 'Claim');
            }
            const first = searchResults[0];
            const meta = (first && first.metadata) ? first.metadata : {};
            memory = {
                id: claimId,
                timestamp: meta.timestamp || new Date().toISOString(),
                type: 'claim',
                content: first ? first.content : '',
                status: meta.status || 'pending',
                context: meta || {}
            };
        }
        // Update memory
        memory.status = success ? 'verified' : 'failed';
        memory.evidence = evidence;
        if (notes) {
            memory.context = { ...memory.context, notes };
        }
        // IMMEDIATE PERSISTENCE: Update in both stores
        if (this.kvStore) {
            const kvKey = `memory:${claimId}`;
            await this.kvStore.put(kvKey, JSON.stringify(memory));
            this.trackKvKey(kvKey);
        }
        // Update vector store (upsert semantic record)
        await this.vectorStore.storeKnowledge({
            id: claimId,
            content: memory.content,
            metadata: {
                ...memory.context,
                id: claimId,
                type: memory.type,
                status: memory.status,
                timestamp: memory.timestamp,
                evidence,
                verification_timestamp: new Date().toISOString()
            },
            tags: [memory.type, memory.status, (memory.context && memory.context.testing) ? 'testing' : 'production']
        });
        return true;
    }
    /**
     * PERSISTENCE FIX: Retrieve unverified claims from persistent storage
     */
    async getUnverifiedClaims(includeTestingData = false) {
        const searchQuery = includeTestingData ? 'type:claim status:pending' : 'type:claim status:pending -testing';
        const results = await this.vectorStore.searchSimilar(searchQuery, { limit: 100 });
        let claims = results.map(result => this.normalizeVectorResult(result, 'claim'));
        // Fallback to KV-derived entries when vector search returns no matches (e.g., mock adapters)
        if (claims.length === 0) {
            const kvEntries = await this.loadMemoriesFromKV(includeTestingData);
            claims = kvEntries.filter(entry => entry.type === 'claim' && entry.status === 'pending');
        }
        return claims;
    }
    /**
     * PERSISTENCE FIX: Count unverified claims from persistent storage
     */
    async getUnverifiedClaimsCount(includeTestingData = false) {
        const claims = await this.getUnverifiedClaims(includeTestingData);
        return claims.length;
    }
    /**
     * PERSISTENCE FIX: Retrieve all memories from persistent storage
     */
    async getMemories(includeTestingData = false) {
        const searchQuery = includeTestingData ? '*' : '-testing';
        const results = await this.vectorStore.searchSimilar(searchQuery, { limit: 1000 });
        const memoryMap = new Map();
        for (const result of results) {
            const entry = this.normalizeVectorResult(result);
            memoryMap.set(entry.id, entry);
        }
        if (memoryMap.size === 0) {
            const kvEntries = await this.loadMemoriesFromKV(includeTestingData);
            for (const kvEntry of kvEntries) {
                memoryMap.set(kvEntry.id, kvEntry);
            }
        }
        return Array.from(memoryMap.values());
    }
    /**
     * PERSISTENCE FIX: Store memory entry immediately to persistent storage
     */
    async storeMemory(entry, testing) {
        // IMMEDIATE PERSISTENCE: Store to both KV and vector store
        if (this.kvStore) {
            const kvKey = `memory:${entry.id}`;
            await this.kvStore.put(kvKey, JSON.stringify(entry));
            this.trackKvKey(kvKey);
        }
        await this.vectorStore.storeKnowledge({
            id: entry.id,
            content: entry.content,
            metadata: {
                ...entry.context,
                id: entry.id,
                type: entry.type,
                status: entry.status,
                timestamp: entry.timestamp,
                evidence: entry.evidence
            },
            tags: [entry.type, entry.status || 'unknown', testing ? 'testing' : 'production']
        });
        return entry.id;
    }
    /**
     * PERSISTENCE FIX: Search memories in persistent storage
     */
    async searchMemory(query, includeTestingData) {
        const searchQuery = includeTestingData ? query : `${query} -testing`;
        let results = await this.vectorStore.searchSimilar(searchQuery, { limit: 50 });
        if (!includeTestingData && results.length === 0) {
            results = await this.vectorStore.searchSimilar(query, { limit: 50 });
        }
        if (results.length === 0) {
            const kvEntries = await this.loadMemoriesFromKV(!!includeTestingData);
            const normalizedQuery = query.toLowerCase();
            return kvEntries.filter(entry => entry.content.toLowerCase().includes(normalizedQuery));
        }
        return results.map(result => this.normalizeVectorResult(result));
    }
    /**
     * PERSISTENCE FIX: Get memory statistics from persistent storage
     */
    async getMemoryStats(includeTestingData) {
        const memories = await this.getMemories(includeTestingData);
        const claims = memories.filter(m => m.type === 'claim');
        const assumptions = memories.filter(m => m.type === 'assumption');
        const verified = memories.filter(m => m.status === 'verified');
        const pending = memories.filter(m => m.status === 'pending');
        const failed = memories.filter(m => m.status === 'failed');
        return {
            totalMemories: memories.length,
            claims: claims.length,
            assumptions: assumptions.length,
            verified: verified.length,
            pending: pending.length,
            failed: failed.length,
            testingDataExcluded: !includeTestingData
        };
    }
    /**
     * PERSISTENCE FIX: Export all memory data from persistent storage
     */
    async exportMemory(includeTestingData) {
        const memories = await this.getMemories(includeTestingData);
        const stats = await this.getMemoryStats(includeTestingData);
        return {
            memories,
            stats,
            timestamp: new Date().toISOString(),
            source: 'persistent_storage'
        };
    }
    async loadMemoriesFromKV(includeTestingData) {
        if (!this.kvStore) {
            return [];
        }
        const keys = typeof this.kvStore.list === 'function'
            ? await this.kvStore.list()
            : Array.from(this.kvKeyIndex);
        if (!keys || keys.length === 0) {
            return [];
        }
        const entries = [];
        for (const key of keys) {
            if (!key.startsWith('memory:'))
                continue;
            const raw = await this.kvStore.get(key);
            if (!raw)
                continue;
            try {
                const parsed = JSON.parse(raw);
                if (!includeTestingData && parsed.context && parsed.context.testing) {
                    continue;
                }
                entries.push(parsed);
            }
            catch (error) {
                console.warn(`Failed to parse memory entry for key ${key}:`, error);
            }
        }
        return entries;
    }
    trackKvKey(key) {
        if (key.startsWith('memory:')) {
            this.kvKeyIndex.add(key);
        }
    }
    normalizeVectorResult(result, fallbackType = 'pattern') {
        const metadata = (result.metadata ?? {});
        const rawType = typeof metadata.type === 'string' ? metadata.type : undefined;
        const type = this.isValidMemoryType(rawType) ? rawType : fallbackType;
        const rawStatus = typeof metadata.status === 'string' ? metadata.status : undefined;
        const status = this.isValidMemoryStatus(rawStatus) ? rawStatus : 'pending';
        const timestamp = typeof metadata.timestamp === 'string' ? metadata.timestamp : new Date().toISOString();
        const context = Object.keys(metadata).length > 0 ? metadata : undefined;
        const evidenceValue = typeof metadata.evidence === 'string' ? metadata.evidence : undefined;
        return {
            id: result.id,
            timestamp,
            type,
            content: result.content,
            status,
            ...(evidenceValue !== undefined ? { evidence: evidenceValue } : {}),
            ...(context ? { context } : {})
        };
    }
    isValidMemoryType(value) {
        return value === 'claim' || value === 'rule' || value === 'verification' || value === 'pattern' || value === 'assumption' || value === 'plan';
    }
    isValidMemoryStatus(value) {
        return value === 'pending' || value === 'verified' || value === 'failed' || value === 'enforced' || value === 'violated';
    }
}
