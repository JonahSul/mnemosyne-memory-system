/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Core Memory Operations Module
 *
 * Handles basic memory entry operations: claims, assumptions, verifications
 */
/**
 * Custom error for when memory entries are not found
 * This should be handled as a 404 error, not a 500
 */
export class MemoryNotFoundError extends Error {
    constructor(id, type = 'memory') {
        super(`${type} ${id} not found`);
        this.name = 'MemoryNotFoundError';
    }
}
export class CoreMemoryManager {
    // ARCHITECTURAL VIOLATION: This Map storage is VOLATILE - lost on worker restart
    // FIX REQUIRED: Replace with immediate CloudflareVectorStore/KV writes
    // TODO: Remove volatile Map, implement write-through persistence
    memories = new Map();
    /**
     * Filter memories based on testing flag
     */
    filterMemories(memories, includeTestingData = false) {
        if (includeTestingData) {
            return memories;
        }
        const filtered = new Map();
        for (const [id, memory] of memories) {
            // Exclude testing data (only include if testing flag is explicitly false or undefined)
            if (!memory.context?.testing) {
                filtered.set(id, memory);
            }
        }
        return filtered;
    }
    /**
     * Filter memory array based on testing flag
     */
    filterMemoryArray(memories, includeTestingData = false) {
        if (includeTestingData) {
            return memories;
        }
        return memories.filter(memory => !memory.context?.testing);
    }
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
                testing // Add testing flag to context
            }
        };
        // PERSISTENCE VIOLATION: Writing to volatile Map instead of persistent storage
        // FIX REQUIRED: Replace with await vectorStore.store() or KV.put() call
        this.memories.set(claimId, memory);
        return claimId;
    }
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
                testing // Add testing flag to context
            }
        };
        // PERSISTENCE VIOLATION: Writing to volatile Map instead of persistent storage
        // FIX REQUIRED: Replace with await vectorStore.store() or KV.put() call
        this.memories.set(assumptionId, memory);
        return assumptionId;
    }
    async verifyClaim(claimId, success, evidence, notes) {
        const memory = this.memories.get(claimId);
        if (!memory) {
            throw new MemoryNotFoundError(claimId, 'Claim');
        }
        memory.status = success ? 'verified' : 'failed';
        memory.evidence = evidence;
        if (notes) {
            memory.context = { ...memory.context, notes };
        }
        // PERSISTENCE VIOLATION: Updating volatile Map instead of persistent storage
        // FIX REQUIRED: Replace with await vectorStore.update() or KV.put() call
        this.memories.set(claimId, memory);
        return true;
    }
    getUnverifiedClaims(includeTestingData = false) {
        const unverified = Array.from(this.memories.values()).filter(memory => memory.type === 'claim' && memory.status === 'pending');
        return this.filterMemoryArray(unverified, includeTestingData);
    }
    getUnverifiedClaimsCount(includeTestingData = false) {
        return this.getUnverifiedClaims(includeTestingData).length;
    }
    getMemories(includeTestingData = false) {
        return this.filterMemories(this.memories, includeTestingData);
    }
    async storeMemory(entry, testing = false) {
        // Add testing flag to context if not already present
        if (testing && entry.context) {
            entry.context.testing = true;
        }
        else if (testing) {
            entry.context = { testing: true };
        }
        this.memories.set(entry.id, entry);
        return entry.id;
    }
    async searchMemory(query, includeTestingData = false) {
        const lowerQuery = query.toLowerCase();
        const results = Array.from(this.memories.values()).filter(memory => memory.content.toLowerCase().includes(lowerQuery) ||
            (memory.context && JSON.stringify(memory.context).toLowerCase().includes(lowerQuery)));
        return this.filterMemoryArray(results, includeTestingData);
    }
    getMemoryStats(includeTestingData = false) {
        const memories = Array.from(this.filterMemories(this.memories, includeTestingData).values());
        return {
            totalMemories: memories.length,
            claims: memories.filter(m => m.type === 'claim').length,
            assumptions: memories.filter(m => m.type === 'assumption').length,
            verified: memories.filter(m => m.status === 'verified').length,
            pending: memories.filter(m => m.status === 'pending').length,
            failed: memories.filter(m => m.status === 'failed').length,
            testingDataExcluded: !includeTestingData
        };
    }
    async exportMemory(includeTestingData = false) {
        const filteredMemories = this.filterMemories(this.memories, includeTestingData);
        return {
            memories: Array.from(filteredMemories.entries()),
            stats: this.getMemoryStats(includeTestingData),
            exportTime: new Date().toISOString(),
            testingDataIncluded: includeTestingData
        };
    }
}
