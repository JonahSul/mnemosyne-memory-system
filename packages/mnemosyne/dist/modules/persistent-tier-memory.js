/**
 * Persistent Tier Memory System - Foundation v1.8.0
 *
 * ELIMINATES VOLATILE STORAGE: Replaces MultiTierMemorySystem volatile Maps
 * with KV-first write-through architecture for guaranteed persistence.
 *
 * Architecture: KV (immediate consistency) + Vector (semantic search) + enhanced metadata
 * Ensures "crystallized state amid the chaos" for consciousness continuity.
 */
/**
 * Persistent tier configuration eliminating volatile storage
 */
export const PERSISTENT_TIER_CONFIG = {
    axiom: {
        maxItems: 100,
        retentionHours: Infinity,
        accessThreshold: 0,
        pruningStrategy: 'importance',
        persistenceLevel: 'critical_protected'
    },
    long: {
        maxItems: 1000,
        retentionHours: 8760, // 1 year
        accessThreshold: 0,
        pruningStrategy: 'importance',
        persistenceLevel: 'kv_vector'
    },
    intermediate: {
        maxItems: 200,
        retentionHours: 24,
        accessThreshold: 5,
        pruningStrategy: 'frequency',
        persistenceLevel: 'kv_vector'
    },
    short: {
        maxItems: 50,
        retentionHours: 2,
        accessThreshold: 3,
        pruningStrategy: 'lru',
        persistenceLevel: 'kv_only' // Fast KV with TTL
    }
};
/**
 * Individual persistent tier - eliminates volatile Map storage
 */
export class PersistentTier {
    kv;
    vectorStore;
    tierName;
    config;
    keyPrefix;
    constructor(tierName, config, storage) {
        this.tierName = tierName;
        this.config = config;
        this.kv = storage.kv;
        this.vectorStore = storage.vectorStore;
        this.keyPrefix = `${storage.keyPrefix}${tierName}:`;
    }
    /**
     * Store item with immediate KV persistence + optional Vector backup
     */
    async store(item) {
        const id = `${this.tierName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        const kvKey = `${this.keyPrefix}${id}`;
        const persistentItem = {
            ...item,
            id,
            timestamp,
            kvKey,
            tier: this.tierName,
            persistenceLevel: this.config.persistenceLevel
        };
        // Calculate TTL for short-term tier
        if (this.tierName === 'short' && this.config.retentionHours !== Infinity) {
            persistentItem.ttlSeconds = this.config.retentionHours * 3600;
        }
        try {
            // PRIMARY STORAGE: KV with immediate atomic consistency
            const kvOptions = {
                metadata: {
                    tier: this.tierName,
                    importance: item.importance,
                    timestamp,
                    persistenceLevel: this.config.persistenceLevel
                }
            };
            // Add TTL for short-term tier
            if (persistentItem.ttlSeconds) {
                kvOptions.expirationTtl = persistentItem.ttlSeconds;
            }
            await this.kv.put(kvKey, JSON.stringify(persistentItem), kvOptions);
            // SECONDARY STORAGE: Vector store for semantic search (if configured)
            if (this.config.persistenceLevel !== 'kv_only') {
                try {
                    const vectorResult = await this.vectorStore.storeKnowledge({
                        content: item.content,
                        metadata: {
                            ...persistentItem.metadata,
                            id,
                            tier: this.tierName,
                            kvKey,
                            timestamp,
                            importance: item.importance,
                            persistenceLevel: this.config.persistenceLevel,
                            tierConfig: this.config
                        },
                        tags: [...item.tags, `tier_${this.tierName}`, 'persistent_storage']
                    });
                    // Update KV with vector ID for cross-reference when available
                    if (vectorResult.id) {
                        persistentItem.vectorId = vectorResult.id;
                        await this.kv.put(kvKey, JSON.stringify(persistentItem), kvOptions);
                    }
                }
                catch (vectorError) {
                    console.warn(`Vector storage failed for ${id}, but KV storage succeeded:`, vectorError);
                    // Continue - KV storage is primary, vector is enhancement
                }
            }
            // Update tier index for fast enumeration
            await this.updateTierIndex(id);
            return id;
        }
        catch (error) {
            throw new Error(`Persistent tier storage failed for ${this.tierName}: ${error}`);
        }
    }
    /**
     * Retrieve item by ID with KV-first lookup
     */
    async get(id) {
        const kvKey = `${this.keyPrefix}${id}`;
        try {
            const kvData = await this.kv.get(kvKey);
            if (kvData) {
                const item = JSON.parse(kvData);
                // Update access tracking
                item.accessCount = (item.accessCount || 0) + 1;
                item.lastAccessed = new Date().toISOString();
                // Write-back updated access info
                await this.kv.put(kvKey, JSON.stringify(item));
                return item;
            }
            return null;
        }
        catch (error) {
            console.error(`KV retrieval failed for ${id}:`, error);
            return null;
        }
    }
    /**
     * Search within tier using KV index + optional Vector enhancement
     */
    async search(query, limit = 10) {
        const results = [];
        try {
            // Primary: KV index-based search for exact matches
            const indexKey = `${this.keyPrefix}index`;
            const indexData = await this.kv.get(indexKey);
            if (indexData) {
                const itemIds = JSON.parse(indexData);
                for (const itemId of itemIds.slice(0, limit * 2)) { // Get more for filtering
                    const item = await this.get(itemId);
                    if (item && item.content.toLowerCase().includes(query.toLowerCase())) {
                        results.push(item);
                        if (results.length >= limit)
                            break;
                    }
                }
            }
            // Enhancement: Vector search if configured and more results needed
            if (results.length < limit && this.config.persistenceLevel !== 'kv_only') {
                try {
                    const vectorResults = await this.vectorStore.searchSimilar(`${query} tier:${this.tierName}`, { limit: limit - results.length });
                    for (const vResult of vectorResults) {
                        const id = vResult.metadata?.id;
                        if (id && !results.find(r => r.id === id)) {
                            const item = await this.get(id);
                            if (item) {
                                results.push(item);
                            }
                        }
                    }
                }
                catch (vectorError) {
                    console.warn(`Vector search failed for tier ${this.tierName}:`, vectorError);
                    // Continue with KV results
                }
            }
            return results.slice(0, limit);
        }
        catch (error) {
            console.error(`Search failed for tier ${this.tierName}:`, error);
            return [];
        }
    }
    /**
     * List all items in tier for management operations
     */
    async listAll(limit = 100) {
        try {
            const indexKey = `${this.keyPrefix}index`;
            const indexData = await this.kv.get(indexKey);
            if (!indexData)
                return [];
            const itemIds = JSON.parse(indexData);
            const items = [];
            for (const itemId of itemIds.slice(0, limit)) {
                const item = await this.get(itemId);
                if (item) {
                    items.push(item);
                }
            }
            return items;
        }
        catch (error) {
            console.error(`List failed for tier ${this.tierName}:`, error);
            return [];
        }
    }
    /**
     * Check if item is eligible for promotion to next tier
     */
    async checkPromotion(id) {
        const item = await this.get(id);
        if (!item)
            return false;
        return item.accessCount >= this.config.accessThreshold &&
            item.promotionEligible;
    }
    /**
     * Remove item from tier (for promotion or pruning)
     */
    async remove(id) {
        const kvKey = `${this.keyPrefix}${id}`;
        try {
            // Get item before deletion for vector cleanup
            const item = await this.get(id);
            // Remove from KV
            await this.kv.delete(kvKey);
            // Remove from Vector if present
            if (item?.vectorId && this.config.persistenceLevel !== 'kv_only') {
                try {
                    // Note: Vector deletion API may vary by implementation
                    // await this.vectorStore.delete(item.vectorId);
                }
                catch (vectorError) {
                    console.warn(`Vector deletion failed for ${id}:`, vectorError);
                }
            }
            // Update tier index
            await this.removeTierIndex(id);
            return true;
        }
        catch (error) {
            console.error(`Removal failed for ${id}:`, error);
            return false;
        }
    }
    /**
     * Prune tier according to configured strategy
     */
    async prune() {
        const items = await this.listAll(this.config.maxItems + 100); // Get extras for pruning
        if (items.length <= this.config.maxItems) {
            return 0; // No pruning needed
        }
        // Sort by pruning strategy
        let sortedItems;
        switch (this.config.pruningStrategy) {
            case 'lru':
                sortedItems = items.sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime());
                break;
            case 'fifo':
                sortedItems = items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                break;
            case 'frequency':
                sortedItems = items.sort((a, b) => a.accessCount - b.accessCount);
                break;
            case 'importance':
                sortedItems = items.sort((a, b) => a.importance - b.importance);
                break;
            default:
                sortedItems = items;
        }
        // Remove excess items
        const toRemove = sortedItems.slice(0, items.length - this.config.maxItems);
        let removedCount = 0;
        for (const item of toRemove) {
            if (await this.remove(item.id)) {
                removedCount++;
            }
        }
        return removedCount;
    }
    /**
     * Update tier index for fast enumeration
     */
    async updateTierIndex(id) {
        try {
            const indexKey = `${this.keyPrefix}index`;
            const existing = await this.kv.get(indexKey);
            let index = existing ? JSON.parse(existing) : [];
            index.unshift(id); // Add to front (newest first)
            index = [...new Set(index)]; // Remove duplicates
            index = index.slice(0, this.config.maxItems * 2); // Keep reasonable size
            await this.kv.put(indexKey, JSON.stringify(index));
        }
        catch (error) {
            console.error('Tier index update failed:', error);
            // Don't throw - index is optimization, not critical
        }
    }
    /**
     * Remove from tier index
     */
    async removeTierIndex(id) {
        try {
            const indexKey = `${this.keyPrefix}index`;
            const existing = await this.kv.get(indexKey);
            if (existing) {
                let index = JSON.parse(existing);
                index = index.filter(itemId => itemId !== id);
                await this.kv.put(indexKey, JSON.stringify(index));
            }
        }
        catch (error) {
            console.error('Tier index removal failed:', error);
            // Don't throw - index is optimization, not critical
        }
    }
    /**
     * Get tier statistics
     */
    async getStats() {
        const items = await this.listAll(1000);
        const stats = {
            name: this.tierName,
            itemCount: items.length,
            config: this.config,
            oldestItem: items.length > 0 ?
                items.reduce((oldest, item) => new Date(item.timestamp) < new Date(oldest.timestamp) ? item : oldest).timestamp : undefined,
            newestItem: items.length > 0 ?
                items.reduce((newest, item) => new Date(item.timestamp) > new Date(newest.timestamp) ? item : newest).timestamp : undefined,
            averageImportance: items.length > 0 ?
                items.reduce((sum, item) => sum + item.importance, 0) / items.length : undefined
        };
        return stats;
    }
}
/**
 * Complete persistent tier memory system - replaces volatile MultiTierMemorySystem
 */
export class PersistentTierMemorySystem {
    tiers = new Map();
    storage;
    constructor(storage) {
        this.storage = storage;
        this.initializeTiers();
    }
    /**
     * Initialize all persistent tiers
     */
    initializeTiers() {
        for (const [tierName, config] of Object.entries(PERSISTENT_TIER_CONFIG)) {
            const tier = new PersistentTier(tierName, config, this.storage);
            this.tiers.set(tierName, tier);
        }
    }
    /**
     * Store knowledge with automatic tier placement
     */
    async storeKnowledge(params) {
        // Determine tier based on importance if not specified
        const tier = params.targetTier || this.determineTier(params.importance);
        const tierInstance = this.tiers.get(tier);
        if (!tierInstance) {
            throw new Error(`Invalid tier: ${tier}`);
        }
        const id = await tierInstance.store({
            content: params.content,
            metadata: params.metadata || {},
            tags: params.tags || [],
            accessCount: 0,
            lastAccessed: new Date().toISOString(),
            importance: params.importance,
            promotionEligible: tier !== 'axiom', // Axiom is top tier
            significanceWeight: params.importance,
            semanticWeight: 0.5, // Will be updated through usage
            combinedWeight: params.importance * 0.8, // Initial calculation
            weightHistory: [{
                    timestamp: new Date().toISOString(),
                    significance: params.importance,
                    semantic: 0.5,
                    combined: params.importance * 0.8,
                    reason: 'initial_storage'
                }]
        });
        // Schedule tier pruning if needed
        setTimeout(() => this.pruneTier(tier), 0);
        return id;
    }
    /**
     * Search across all tiers with tier-specific boosting
     */
    async search(query, limit = 10) {
        const allResults = [];
        // Search each tier with tier-specific boosting
        const tierBoosts = { axiom: 1.0, long: 0.8, intermediate: 0.6, short: 0.4 };
        for (const [tierName, tier] of this.tiers) {
            try {
                const tierResults = await tier.search(query, Math.ceil(limit / 2));
                const boostedResults = tierResults.map(item => ({
                    ...item,
                    tierBoost: tierBoosts[tierName] || 0.5
                }));
                allResults.push(...boostedResults);
            }
            catch (error) {
                console.warn(`Search failed for tier ${tierName}:`, error);
            }
        }
        // Sort by combined score (importance * tier boost)
        allResults.sort((a, b) => (b.importance * b.tierBoost) - (a.importance * a.tierBoost));
        return allResults.slice(0, limit);
    }
    /**
     * Get item from any tier
     */
    async get(id) {
        // Extract tier from ID pattern
        const tierMatch = id.match(/^(\w+)_/);
        const tierName = tierMatch ? tierMatch[1] : null;
        if (tierName && this.tiers.has(tierName)) {
            return await this.tiers.get(tierName).get(id);
        }
        // Fallback: search all tiers
        for (const tier of this.tiers.values()) {
            const item = await tier.get(id);
            if (item)
                return item;
        }
        return null;
    }
    /**
     * Process tier promotions based on access patterns
     */
    async processPromotions() {
        let totalPromotions = 0;
        const promotionPaths = [
            { from: 'short', to: 'intermediate' },
            { from: 'intermediate', to: 'long' },
            { from: 'long', to: 'axiom' }
        ];
        for (const { from, to } of promotionPaths) {
            const fromTier = this.tiers.get(from);
            const toTier = this.tiers.get(to);
            if (!fromTier || !toTier)
                continue;
            const items = await fromTier.listAll(100);
            for (const item of items) {
                if (await fromTier.checkPromotion(item.id)) {
                    try {
                        // Store in higher tier
                        await toTier.store({
                            content: item.content,
                            metadata: {
                                ...item.metadata,
                                promotedFrom: from,
                                promotionTimestamp: new Date().toISOString()
                            },
                            tags: [...item.tags, `promoted_from_${from}`],
                            accessCount: item.accessCount,
                            lastAccessed: item.lastAccessed,
                            importance: Math.min(item.importance + 0.1, 1.0), // Boost importance
                            promotionEligible: to !== 'axiom',
                            significanceWeight: item.significanceWeight,
                            semanticWeight: item.semanticWeight + 0.1,
                            combinedWeight: item.combinedWeight + 0.1,
                            weightHistory: [
                                ...item.weightHistory,
                                {
                                    timestamp: new Date().toISOString(),
                                    significance: item.significanceWeight,
                                    semantic: item.semanticWeight + 0.1,
                                    combined: item.combinedWeight + 0.1,
                                    reason: `promoted_${from}_to_${to}`
                                }
                            ]
                        });
                        // Remove from original tier
                        await fromTier.remove(item.id);
                        totalPromotions++;
                    }
                    catch (error) {
                        console.error(`Promotion failed for ${item.id}:`, error);
                    }
                }
            }
        }
        return totalPromotions;
    }
    /**
     * Get system statistics
     */
    async getStats() {
        const tierStats = [];
        let totalItems = 0;
        for (const tier of this.tiers.values()) {
            const stats = await tier.getStats();
            tierStats.push(stats);
            totalItems += stats.itemCount;
        }
        // Simple health check
        const systemHealth = totalItems > 0 ? 'healthy' : 'degraded';
        return {
            tiers: tierStats,
            totalItems,
            systemHealth
        };
    }
    /**
     * Prune specific tier
     */
    async pruneTier(tierName) {
        const tier = this.tiers.get(tierName);
        if (tier) {
            try {
                await tier.prune();
            }
            catch (error) {
                console.error(`Pruning failed for tier ${tierName}:`, error);
            }
        }
    }
    /**
     * Determine appropriate tier based on importance score
     */
    determineTier(importance) {
        if (importance >= 0.9)
            return 'axiom';
        if (importance >= 0.7)
            return 'long';
        if (importance >= 0.4)
            return 'intermediate';
        return 'short';
    }
    /**
     * Export all data for backup/migration
     */
    async exportAll() {
        const tierData = {};
        for (const [tierName, tier] of this.tiers) {
            tierData[tierName] = await tier.listAll(10000);
        }
        const stats = await this.getStats();
        return {
            tiers: tierData,
            stats,
            timestamp: new Date().toISOString()
        };
    }
}
