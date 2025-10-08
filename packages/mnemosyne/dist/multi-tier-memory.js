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
/**
 * Optimized threshold defaults based on empirical testing
 * Testing revealed content similarity clusters around 14%, 37%, and 62% ranges
 */
const OPTIMIZED_THRESHOLDS = {
    // Multi-tier searches - more inclusive due to tier boosting
    multi_tier_search: 0.15,
    // Standard knowledge search - balanced
    knowledge_search: 0.20,
    // Exploration mode - high recall
    exploration: 0.05,
    // Precision mode - high precision
    precision: 0.40,
    // Debugging/discovery - very inclusive
    discovery: 0.10
};
/**
 * Default tier configuration based on established cognitive memory patterns
 */
export const DEFAULT_TIER_CONFIG = {
    axiom: {
        name: 'axiom-tier',
        maxItems: 100, // Reasonable limit for key axioms
        retentionHours: Infinity, // Never expire
        accessThreshold: 0, // No promotion needed
        pruningStrategy: 'importance' // Only remove least important if at capacity
    },
    long: {
        name: 'long-term',
        maxItems: 1000, // Large capacity
        retentionHours: 8760, // 1 year retention
        accessThreshold: 0, // No promotion (axiom is top tier)
        pruningStrategy: 'importance' // Importance-based pruning
    },
    intermediate: {
        name: 'intermediate-term',
        maxItems: 200, // Moderate capacity
        retentionHours: 24, // Daily retention cycle
        accessThreshold: 5, // Promote after 5 accesses
        pruningStrategy: 'frequency' // Frequency-based retention
    },
    short: {
        name: 'short-term',
        maxItems: 50, // Small for token conservation
        retentionHours: 2, // Very aggressive pruning
        accessThreshold: 3, // Promote after 3 accesses
        pruningStrategy: 'lru' // Least recently used
    }
};
export class MultiTierMemorySystem {
    axiomTier = new Map();
    longTerm = new Map();
    intermediateTerm = new Map();
    shortTerm = new Map();
    config;
    constructor(config = DEFAULT_TIER_CONFIG) {
        this.config = config;
    }
    /**
     * Get optimized threshold based on search context
     */
    getOptimizedThreshold(options = {}) {
        const { searchType = 'balanced', expectedResults = 5, queryLength = 0 } = options;
        // Use empirically optimized thresholds
        let baseThreshold = OPTIMIZED_THRESHOLDS.multi_tier_search;
        switch (searchType) {
            case 'exploration':
                baseThreshold = OPTIMIZED_THRESHOLDS.exploration;
                break;
            case 'discovery':
                baseThreshold = OPTIMIZED_THRESHOLDS.discovery;
                break;
            case 'precision':
                baseThreshold = OPTIMIZED_THRESHOLDS.precision;
                break;
            default:
                baseThreshold = OPTIMIZED_THRESHOLDS.multi_tier_search;
        }
        // Adjust based on expected results
        if (expectedResults <= 3) {
            baseThreshold += 0.05; // More selective for fewer results
        }
        else if (expectedResults >= 10) {
            baseThreshold -= 0.05; // More inclusive for more results
        }
        // Adjust based on query complexity
        if (queryLength > 100) {
            baseThreshold -= 0.03; // Complex queries need broader search
        }
        else if (queryLength < 20) {
            baseThreshold += 0.03; // Simple queries can be more precise
        }
        // Ensure reasonable bounds
        return Math.max(0.01, Math.min(0.50, baseThreshold));
    }
    /**
     * Store knowledge in appropriate tier based on importance
     */
    async storeKnowledge(knowledge) {
        const id = `tier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        const embedding = this.generateMockEmbedding(knowledge.content);
        // Determine target tier
        const importance = knowledge.importance || 0.5;
        const targetTier = knowledge.targetTier || this.selectInitialTier(importance);
        // Calculate initial weight values
        const significanceWeight = this.calculateSignificanceWeight(knowledge.content, importance);
        const semanticWeight = await this.calculateSemanticWeight(knowledge.content, embedding);
        const combinedWeight = this.calculateCombinedWeight(significanceWeight, semanticWeight);
        const item = {
            id,
            content: knowledge.content,
            embedding,
            metadata: {
                ...knowledge.metadata || {},
                testing: knowledge.testing || false // Add testing flag to metadata
            },
            tags: knowledge.tags || [],
            timestamp,
            tier: targetTier,
            accessCount: 0,
            lastAccessed: timestamp,
            importance,
            promotionEligible: false,
            significanceWeight,
            semanticWeight,
            combinedWeight,
            weightHistory: [{
                    timestamp,
                    significance: significanceWeight,
                    semantic: semanticWeight,
                    combined: combinedWeight,
                    reason: 'initial_calculation'
                }]
        };
        // Store in appropriate tier
        this.storeInTier(item, targetTier);
        // Trigger pruning if tier is full
        await this.pruneIfNecessary(targetTier);
        return item;
    }
    /**
     * Search across all tiers with tier-aware ranking and optimized thresholds
     */
    async searchSimilar(query, options = {}) {
        const { limit = 10, tierPreference = 'all', includeTestingData = false, searchType = 'balanced' } = options;
        // Use optimized threshold if not explicitly provided
        const threshold = options.threshold ?? this.getOptimizedThreshold({
            searchType,
            expectedResults: limit,
            queryLength: query.length
        });
        const queryEmbedding = this.generateMockEmbedding(query);
        const results = [];
        // Search tiers based on preference
        const tiersToSearch = this.getTiersToSearch(tierPreference);
        for (const [tierName, tierMap] of tiersToSearch) {
            for (const item of tierMap.values()) {
                // Filter out testing data unless explicitly included
                if (!includeTestingData && item.metadata?.testing) {
                    continue;
                }
                const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
                if (similarity >= threshold) {
                    // Update access tracking
                    item.accessCount++;
                    item.lastAccessed = new Date().toISOString();
                    // Apply tier-based boosting (prefer higher tiers)
                    const tierBoost = this.getTierBoost(item.tier);
                    const adjustedSimilarity = similarity * tierBoost;
                    results.push({ ...item, similarity: adjustedSimilarity });
                }
            }
        }
        // Sort by adjusted similarity and limit results
        const sortedResults = results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
        // Trigger promotion check for accessed items
        await this.checkPromotions();
        return sortedResults;
    }
    /**
     * Calculate adaptive threshold based on workload characteristics and search context
     */
    calculateAdaptiveThreshold(options = {}) {
        const { workloadType = 'balanced', contextComplexity = 'moderate', tierPreference = 'all', expectedResultCount, currentMemoryLoad } = options;
        // Base threshold by workload type
        let baseThreshold;
        switch (workloadType) {
            case 'exploration':
                baseThreshold = 0.02;
                break;
            case 'precision':
                baseThreshold = 0.25;
                break;
            case 'recall':
                baseThreshold = 0.05;
                break;
            case 'debugging':
                baseThreshold = 0.08;
                break;
            default: // 'balanced'
                baseThreshold = 0.1;
        }
        // Adjust for context complexity
        const complexityMultiplier = {
            'simple': 1.2,
            'moderate': 1.0,
            'complex': 0.8
        }[contextComplexity];
        // Adjust for tier preference (higher tiers need more precision)
        const tierMultiplier = tierPreference === 'long' || tierPreference === 'axiom' ? 1.1 :
            tierPreference === 'short' ? 0.9 : 1.0;
        // Adjust for expected result count
        let resultCountMultiplier = 1.0;
        if (expectedResultCount) {
            if (expectedResultCount > 10) {
                resultCountMultiplier = 0.9; // Lower threshold for broader search
            }
            else if (expectedResultCount < 3) {
                resultCountMultiplier = 1.1; // Higher threshold for focused search
            }
        }
        // Adjust for current memory load (more selective when memory is full)
        const memoryLoadMultiplier = currentMemoryLoad ? (1 + currentMemoryLoad * 0.3) : 1.0;
        // Calculate final threshold
        const adaptiveThreshold = baseThreshold * complexityMultiplier * tierMultiplier *
            resultCountMultiplier * memoryLoadMultiplier;
        // Keep within reasonable bounds
        return Math.max(0.01, Math.min(0.5, adaptiveThreshold));
    }
    /**
     * Search with adaptive threshold based on context
     */
    async searchWithAdaptiveThreshold(query, options = {}) {
        const currentMemoryLoad = this.calculateMemoryLoad();
        const adaptiveThreshold = options.overrideThreshold ?? this.calculateAdaptiveThreshold({
            ...options,
            currentMemoryLoad
        });
        const results = await this.searchSimilar(query, {
            threshold: adaptiveThreshold,
            limit: options.limit || 10,
            tierPreference: options.tierPreference || 'all'
        });
        // Add threshold information to results
        return results.map(result => ({
            ...result,
            adaptiveThreshold
        }));
    }
    /**
     * Calculate current memory system load (0-1 scale)
     */
    calculateMemoryLoad() {
        const totalUsed = this.shortTerm.size + this.intermediateTerm.size + this.longTerm.size;
        const totalCapacity = this.config.short.maxItems + this.config.intermediate.maxItems + this.config.long.maxItems;
        return totalUsed / totalCapacity;
    }
    /**
     * Promote items between tiers based on access patterns
     */
    async checkPromotions() {
        // Check short-term for promotion to intermediate
        for (const [id, item] of this.shortTerm.entries()) {
            if (item.accessCount >= this.config.short.accessThreshold) {
                this.promoteItem(item, 'intermediate');
                this.shortTerm.delete(id);
            }
        }
        // Check intermediate-term for promotion to long-term
        for (const [id, item] of this.intermediateTerm.entries()) {
            if (item.accessCount >= this.config.intermediate.accessThreshold) {
                this.promoteItem(item, 'long');
                this.intermediateTerm.delete(id);
            }
        }
    }
    /**
     * Prune items from tier based on time expiration and capacity limits
     */
    async pruneIfNecessary(tier) {
        const tierMap = this.getTierMap(tier);
        const config = this.config[tier];
        // Skip if tier is not configured
        if (!config)
            return;
        // Axioms with infinite retention hours need special handling
        if (config.retentionHours === Infinity) {
            // For axioms, only prune if over capacity (no time-based expiration)
            if (tierMap.size <= config.maxItems) {
                return;
            }
        }
        else {
            // First, remove expired items based on retentionHours
            await this.pruneExpiredItems(tier);
        }
        // Then, if still over capacity, remove items based on pruning strategy
        if (tierMap.size <= config.maxItems) {
            return;
        }
        const itemsToRemove = tierMap.size - config.maxItems;
        const sortedItems = Array.from(tierMap.values()).sort((a, b) => {
            switch (config.pruningStrategy) {
                case 'lru':
                    return new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime();
                case 'fifo':
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                case 'frequency':
                    return a.accessCount - b.accessCount;
                case 'importance':
                    return a.importance - b.importance;
                default:
                    return 0;
            }
        });
        // Remove least valuable items
        for (let i = 0; i < itemsToRemove && i < sortedItems.length; i++) {
            const item = sortedItems[i];
            if (item) {
                tierMap.delete(item.id);
            }
        }
    }
    /**
     * Remove items that have exceeded their retention time (used during regular operations)
     */
    async pruneExpiredItems(tier) {
        const tierMap = this.getTierMap(tier);
        const config = this.config[tier];
        const now = Date.now(); // Use Date.now() for better compatibility with fake timers
        // Skip if tier is not configured
        if (!config)
            return;
        const retentionMs = config.retentionHours * 60 * 60 * 1000;
        // Skip expiration for axioms (infinite retention)
        if (config.retentionHours === Infinity) {
            return;
        }
        // Only remove items that have exceeded hard retention time
        const expiredItems = [];
        for (const [id, item] of tierMap.entries()) {
            const itemAge = now - new Date(item.timestamp).getTime();
            if (itemAge > retentionMs) {
                const shouldSpare = this.shouldSpareFromExpiration(item, tier);
                if (!shouldSpare) {
                    expiredItems.push(id);
                }
            }
        }
        // Remove expired items
        for (const id of expiredItems) {
            tierMap.delete(id);
        }
    }
    /**
     * Apply forgetting curves during garbage collection (includes probabilistic forgetting)
     */
    async pruneWithForgettingCurves(tier) {
        const tierMap = this.getTierMap(tier);
        const config = this.config[tier];
        const now = Date.now(); // Use Date.now() for better compatibility with fake timers
        // Skip if tier is not configured
        if (!config)
            return;
        const retentionMs = config.retentionHours * 60 * 60 * 1000;
        // Skip forgetting curves for axioms (infinite retention)
        if (config.retentionHours === Infinity) {
            return;
        }
        // Collect items to be removed
        const itemsToRemove = [];
        for (const [id, item] of tierMap.entries()) {
            const itemAge = now - new Date(item.timestamp).getTime();
            let shouldRemove = false;
            // Apply unified forgetting logic: either probabilistic forgetting OR hard expiration, not both
            if (itemAge > retentionMs) {
                // Hard expiration: Items beyond retention time that aren't spared
                const shouldSpare = this.shouldSpareFromExpiration(item, tier);
                if (!shouldSpare) {
                    shouldRemove = true;
                }
            }
            else {
                // Probabilistic forgetting: Apply forgetting curve for items within retention window
                const shouldForget = this.shouldForgetItem(item, tier);
                if (shouldForget) {
                    shouldRemove = true;
                }
            }
            if (shouldRemove) {
                itemsToRemove.push(id);
            }
        }
        // Remove selected items
        for (const id of itemsToRemove) {
            tierMap.delete(id);
        }
    }
    /**
     * Determine if an item should be spared from time-based expiration
     * based on importance and access patterns
     */
    shouldSpareFromExpiration(item, tier) {
        // Axioms are always spared (infinite retention)
        if (tier === 'axiom')
            return true;
        // High importance items are more likely to be spared
        // Lower tiers should be more lenient (easier to survive)
        const importanceThreshold = tier === 'long' ? 0.8 : tier === 'intermediate' ? 0.6 : 0.4;
        if (item.importance >= importanceThreshold) {
            return true;
        }
        // Frequently accessed items are more likely to be spared 
        // Use tier-appropriate access thresholds that align with promotion logic
        const accessThreshold = tier === 'long' ? 2 : tier === 'intermediate' ? 3 : 5;
        if (item.accessCount >= accessThreshold) {
            return true;
        }
        // Recently accessed items get a slight reprieve
        const recentAccessMs = 24 * 60 * 60 * 1000; // 24 hours
        const timeSinceAccess = Date.now() - new Date(item.lastAccessed).getTime();
        if (timeSinceAccess < recentAccessMs && item.importance >= 0.5) {
            return true;
        }
        return false;
    }
    /**
     * Calculate retention probability based on Ebbinghaus forgetting curve
     * Uses probabilistic decay with importance and access modifiers
     */
    calculateRetentionProbability(item, tier) {
        // Axioms always have 100% retention probability
        if (tier === 'axiom')
            return 1.0;
        const now = Date.now(); // Use Date.now() for better compatibility with fake timers
        const itemAge = now - new Date(item.timestamp).getTime();
        // Convert age to hours for curve calculation
        const ageInHours = itemAge / (60 * 60 * 1000);
        // Base retention probability based on Ebbinghaus curve
        // Exponential decay: P(retention) = e^(-ageInHours / decayConstant)
        const decayConstant = tier === 'long' ? 2000 : tier === 'intermediate' ? 50 : 5; // Tier-specific decay rates
        let baseProbability = Math.exp(-ageInHours / decayConstant);
        // Apply importance modifier (importance boosts retention)
        const importanceModifier = 0.5 + (item.importance * 0.5); // Range: 0.5 to 1.0
        baseProbability *= importanceModifier;
        // Apply access frequency modifier
        const accessModifier = Math.min(1.0 + (item.accessCount * 0.1), 2.0); // Cap at 2x boost
        baseProbability *= accessModifier;
        // Apply recency bonus (recently accessed items get retention boost)
        const timeSinceAccess = now - new Date(item.lastAccessed).getTime();
        const recencyHours = timeSinceAccess / (60 * 60 * 1000);
        const recencyModifier = recencyHours < 24 ? 1.2 : 1.0; // 20% boost if accessed within 24h
        baseProbability *= recencyModifier;
        // Apply semantic reinforcement bonus
        const semanticModifier = 0.8 + (item.semanticWeight * 0.4); // Range: 0.8 to 1.2
        baseProbability *= semanticModifier;
        // Ensure probability stays within bounds
        return Math.min(Math.max(baseProbability, 0.0), 1.0);
    }
    /**
     * Apply probabilistic forgetting curve to determine if item should be forgotten
     */
    shouldForgetItem(item, tier) {
        // Axioms are never forgotten
        if (tier === 'axiom')
            return false;
        const retentionProbability = this.calculateRetentionProbability(item, tier);
        // Generate deterministic "random" number based on item ID for consistent behavior
        const seed = this.simpleHash(item.id);
        const random = this.seededRandom(seed)();
        // Item is forgotten if random value exceeds retention probability
        return random > retentionProbability;
    }
    /**
     * Helper methods
     */
    selectInitialTier(importance) {
        // Axioms are explicitly set via targetTier, not auto-selected
        if (importance >= 0.8)
            return 'long';
        if (importance >= 0.6)
            return 'intermediate';
        return 'short';
    }
    // Weight calculation methods
    calculateSignificanceWeight(content, importance) {
        // Base weight from importance score
        let weight = importance;
        // Boost weight for longer, more detailed content
        const contentLength = content.length;
        const lengthBoost = Math.min(contentLength / 1000, 0.3); // Cap at 0.3 boost
        weight += lengthBoost;
        // Boost weight for content with specific keywords indicating importance
        const importanceKeywords = ['critical', 'important', 'error', 'bug', 'security', 'performance', 'urgent'];
        const keywordMatches = importanceKeywords.filter(keyword => content.toLowerCase().includes(keyword)).length;
        const keywordBoost = Math.min(keywordMatches * 0.1, 0.2); // Cap at 0.2 boost
        weight += keywordBoost;
        // Normalize to [0, 1] range
        return Math.min(weight, 1.0);
    }
    async calculateSemanticWeight(content, embedding) {
        // Start with base weight
        let semanticWeight = 0.5;
        // Find similar memories across all tiers to calculate semantic reinforcement
        const allMemories = [
            ...this.shortTerm.values(),
            ...this.intermediateTerm.values(),
            ...this.longTerm.values()
        ];
        if (allMemories.length === 0) {
            return semanticWeight;
        }
        // Calculate similarity with existing memories
        let maxSimilarity = 0;
        let similarityCount = 0;
        for (const memory of allMemories) {
            const similarity = this.calculateCosineSimilarity(embedding, memory.embedding);
            // Track highest similarity
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
            }
            // Count how many memories are semantically related (>0.7 similarity)
            if (similarity > 0.7) {
                similarityCount++;
            }
        }
        // Boost semantic weight based on similarity patterns
        // High similarity to existing memories indicates semantic reinforcement
        const similarityBoost = maxSimilarity * 0.3;
        const reinforcementBoost = Math.min(similarityCount * 0.1, 0.2);
        semanticWeight += similarityBoost + reinforcementBoost;
        // Normalize to [0, 1] range
        return Math.min(semanticWeight, 1.0);
    }
    calculateCombinedWeight(significanceWeight, semanticWeight) {
        // Weighted combination: 60% significance, 40% semantic
        // Significance weight indicates inherent importance
        // Semantic weight indicates reinforcement through repetition/similarity
        return (significanceWeight * 0.6) + (semanticWeight * 0.4);
    }
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i] || 0;
            const bVal = b[i] || 0;
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }
    storeInTier(item, tier) {
        const tierMap = this.getTierMap(tier);
        tierMap.set(item.id, item);
    }
    promoteItem(item, newTier) {
        item.tier = newTier;
        item.promotionEligible = false;
        this.storeInTier(item, newTier);
    }
    getTierMap(tier) {
        switch (tier) {
            case 'axiom': return this.axiomTier;
            case 'long': return this.longTerm;
            case 'intermediate': return this.intermediateTerm;
            case 'short': return this.shortTerm;
        }
    }
    getTiersToSearch(preference) {
        switch (preference) {
            case 'axiom': return [['axiom', this.axiomTier]];
            case 'long': return [['long', this.longTerm]];
            case 'intermediate': return [['intermediate', this.intermediateTerm]];
            case 'short': return [['short', this.shortTerm]];
            case 'all':
            default:
                return [
                    ['axiom', this.axiomTier], // Search axioms first (highest priority)
                    ['long', this.longTerm], // Then highest tier
                    ['intermediate', this.intermediateTerm],
                    ['short', this.shortTerm]
                ];
        }
    }
    getTierBoost(tier) {
        // Boost scores for higher tiers
        switch (tier) {
            case 'axiom': return 100.0; // Massive boost - axioms always surface first
            case 'long': return 1.2;
            case 'intermediate': return 1.1;
            case 'short': return 1.0;
        }
    }
    /**
     * Generate mock embedding for development
     * Creates embeddings that have similarity for similar texts
     */
    generateMockEmbedding(text) {
        const dimension = 384;
        const embeddings = new Array(dimension).fill(0);
        // Normalize text for consistent processing
        const normalizedText = text.toLowerCase().trim();
        const words = normalizedText.split(/\s+/);
        // Create a base embedding that considers word content
        words.forEach((word, wordIndex) => {
            const wordHash = this.simpleHash(word);
            const random = this.seededRandom(wordHash);
            // Each word contributes to multiple dimensions to create overlap
            for (let i = 0; i < 50; i++) { // Use 50 dimensions per word for overlap
                const dim = Math.abs(wordHash + i) % dimension;
                embeddings[dim] = (embeddings[dim] || 0) + (random() - 0.5) * 0.5; // Smaller magnitude per word
            }
        });
        // Add some randomness based on full text for uniqueness
        const textHash = this.simpleHash(normalizedText);
        const textRandom = this.seededRandom(textHash);
        for (let i = 0; i < dimension; i++) {
            embeddings[i] = (embeddings[i] || 0) + (textRandom() - 0.5) * 0.1; // Small random component
        }
        // Normalize to unit vector
        const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
        return embeddings.map(val => val / (magnitude || 1));
    }
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i] ?? 0;
            const bVal = b[i] ?? 0;
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    seededRandom(seed) {
        let state = seed;
        return () => {
            state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
            return state / Math.pow(2, 32);
        };
    }
    /**
     * Get memory statistics across all tiers
     */
    getMemoryStats(includeTestingData = false) {
        const result = { testingDataIncluded: includeTestingData };
        // Helper function to count items (with optional testing filter)
        const countItems = (tierMap) => {
            if (includeTestingData) {
                return { count: tierMap.size, testingCount: 0 };
            }
            let count = 0;
            let testingCount = 0;
            for (const item of tierMap.values()) {
                if (item.metadata?.testing) {
                    testingCount++;
                }
                else {
                    count++;
                }
            }
            return { count, testingCount };
        };
        // Add axiom tier stats if configured
        if (this.config.axiom) {
            const { count, testingCount } = countItems(this.axiomTier);
            const stats = {
                count: includeTestingData ? this.axiomTier.size : count,
                capacity: this.config.axiom.maxItems,
                utilizationPercent: ((includeTestingData ? this.axiomTier.size : count) / this.config.axiom.maxItems) * 100
            };
            if (!includeTestingData)
                stats.testingItems = testingCount;
            result.axiom = stats;
        }
        const longCounts = countItems(this.longTerm);
        const long = {
            count: includeTestingData ? this.longTerm.size : longCounts.count,
            capacity: this.config.long.maxItems,
            utilizationPercent: ((includeTestingData ? this.longTerm.size : longCounts.count) / this.config.long.maxItems) * 100
        };
        if (!includeTestingData)
            long.testingItems = longCounts.testingCount;
        const intermediateCounts = countItems(this.intermediateTerm);
        const intermediate = {
            count: includeTestingData ? this.intermediateTerm.size : intermediateCounts.count,
            capacity: this.config.intermediate.maxItems,
            utilizationPercent: ((includeTestingData ? this.intermediateTerm.size : intermediateCounts.count) / this.config.intermediate.maxItems) * 100
        };
        if (!includeTestingData)
            intermediate.testingItems = intermediateCounts.testingCount;
        const shortCounts = countItems(this.shortTerm);
        const short = {
            count: includeTestingData ? this.shortTerm.size : shortCounts.count,
            capacity: this.config.short.maxItems,
            utilizationPercent: ((includeTestingData ? this.shortTerm.size : shortCounts.count) / this.config.short.maxItems) * 100
        };
        if (!includeTestingData)
            short.testingItems = shortCounts.testingCount;
        result.long = long;
        result.intermediate = intermediate;
        result.short = short;
        const totalCount = (result.axiom?.count || 0) + long.count + intermediate.count + short.count;
        const totalTestingItems = includeTestingData
            ? 0
            : (result.axiom?.testingItems || 0) + long.testingItems + intermediate.testingItems + short.testingItems;
        result.total = {
            count: totalCount,
            capacityUsed: (result.axiom?.utilizationPercent || 0) + long.utilizationPercent + intermediate.utilizationPercent + short.utilizationPercent
        };
        if (!includeTestingData)
            result.total.testingItems = totalTestingItems;
        return result;
    }
    /**
     * Get forgetting curve analytics for all items
     */
    getForgettingCurveAnalytics() {
        const analytics = {
            retentionProbabilities: { long: [], intermediate: [], short: [] },
            averageRetention: { long: 0, intermediate: 0, short: 0 },
            itemsAtRisk: { long: 0, intermediate: 0, short: 0 }
        };
        // Analyze each tier
        const tiersToAnalyze = [
            ['long', this.longTerm],
            ['intermediate', this.intermediateTerm],
            ['short', this.shortTerm]
        ];
        // Add axiom tier if configured
        if (this.config.axiom) {
            tiersToAnalyze.unshift(['axiom', this.axiomTier]);
            analytics.retentionProbabilities.axiom = [];
            analytics.averageRetention.axiom = 0;
            analytics.itemsAtRisk.axiom = 0;
        }
        for (const [tierName, tierMap] of tiersToAnalyze) {
            const probabilities = [];
            let atRiskCount = 0;
            for (const item of tierMap.values()) {
                const retentionProb = this.calculateRetentionProbability(item, tierName);
                probabilities.push(retentionProb);
                if (retentionProb < 0.5) {
                    atRiskCount++;
                }
            }
            analytics.retentionProbabilities[tierName] = probabilities;
            analytics.averageRetention[tierName] = probabilities.length > 0
                ? probabilities.reduce((sum, p) => sum + p, 0) / probabilities.length
                : 0;
            analytics.itemsAtRisk[tierName] = atRiskCount;
        }
        return analytics;
    }
    /**
     * Manually trigger garbage collection across all tiers
     */
    async runGarbageCollection() {
        const beforeStats = this.getMemoryStats();
        const beforeCurveStats = this.getForgettingCurveAnalytics();
        // Run forgetting curve pruning on all tiers (includes probabilistic forgetting)
        // Note: axioms are automatically skipped due to infinite retention
        await this.pruneWithForgettingCurves('axiom');
        await this.pruneWithForgettingCurves('long');
        await this.pruneWithForgettingCurves('intermediate');
        await this.pruneWithForgettingCurves('short');
        const afterStats = this.getMemoryStats();
        // Calculate items removed
        const expiredItemsRemoved = {
            long: beforeStats.long.count - afterStats.long.count,
            intermediate: beforeStats.intermediate.count - afterStats.intermediate.count,
            short: beforeStats.short.count - afterStats.short.count,
            total: beforeStats.total.count - afterStats.total.count
        };
        if (beforeStats.axiom && afterStats.axiom) {
            expiredItemsRemoved.axiom = beforeStats.axiom.count - afterStats.axiom.count;
        }
        // Calculate spared items (approximation based on what should have expired)
        const itemsSpared = this.getSparedItemsCount();
        return {
            expiredItemsRemoved,
            itemsSpared,
            forgettingCurveStats: beforeCurveStats
        };
    }
    /**
     * Get count of items that were spared from expiration
     */
    getSparedItemsCount() {
        const now = Date.now(); // Use Date.now() for better compatibility with fake timers
        let sparedCounts = { axiom: 0, long: 0, intermediate: 0, short: 0, total: 0 };
        // Check each tier for items that should have expired but were spared
        for (const [tierName, tierMap] of [
            ['axiom', this.axiomTier],
            ['long', this.longTerm],
            ['intermediate', this.intermediateTerm],
            ['short', this.shortTerm]
        ]) {
            const config = this.config[tierName];
            // Skip if tier is not configured
            if (!config)
                continue;
            const retentionMs = config.retentionHours * 60 * 60 * 1000;
            // Skip infinite retention tiers
            if (config.retentionHours === Infinity) {
                continue;
            }
            for (const item of tierMap.values()) {
                const itemAge = now - new Date(item.timestamp).getTime();
                if (itemAge > retentionMs && this.shouldSpareFromExpiration(item, tierName)) {
                    sparedCounts[tierName]++;
                    sparedCounts.total++;
                }
            }
        }
        return sparedCounts;
    }
    /**
     * Get memory health statistics including expiration data
     */
    getMemoryHealth() {
        const stats = this.getMemoryStats();
        const sparedItems = this.getSparedItemsCount();
        const nearExpiration = this.getItemsNearExpiration();
        // Assess tier health  
        const tiersHealth = {
            long: stats.long.utilizationPercent > 80 ? 'overloaded' : stats.long.utilizationPercent > 60 ? 'healthy' : 'underutilized',
            intermediate: stats.intermediate.utilizationPercent > 80 ? 'overloaded' : stats.intermediate.utilizationPercent > 60 ? 'healthy' : 'underutilized',
            short: stats.short.utilizationPercent > 80 ? 'overloaded' : stats.short.utilizationPercent > 60 ? 'healthy' : 'underutilized'
        };
        if (stats.axiom) {
            tiersHealth.axiom = stats.axiom.utilizationPercent > 80 ? 'overloaded' : stats.axiom.utilizationPercent > 60 ? 'healthy' : 'underutilized';
        }
        // Generate recommendations
        const recommendations = [];
        if (sparedItems.total > stats.total.count * 0.3) {
            recommendations.push('Consider adjusting importance thresholds - many expired items are being spared');
        }
        if (nearExpiration > stats.total.count * 0.2) {
            recommendations.push('High number of items approaching expiration - consider garbage collection');
        }
        if (stats.total.count === 0) {
            recommendations.push('Memory system is empty - consider storing some baseline knowledge');
        }
        return {
            tiersHealth,
            expirationStats: {
                itemsNearExpiration: nearExpiration,
                itemsSpared: sparedItems.total
            },
            recommendations
        };
    }
    /**
     * Count items that are approaching expiration (within 10% of retention time)
     */
    getItemsNearExpiration() {
        const now = Date.now(); // Use Date.now() for better compatibility with fake timers
        let nearExpirationCount = 0;
        for (const [tierName, tierMap] of [
            ['long', this.longTerm],
            ['intermediate', this.intermediateTerm],
            ['short', this.shortTerm]
        ]) {
            const config = this.config[tierName];
            const retentionMs = config.retentionHours * 60 * 60 * 1000;
            // Skip infinite retention tiers
            if (config.retentionHours === Infinity) {
                continue;
            }
            const nearExpirationThreshold = retentionMs * 0.9; // 90% of retention time
            for (const item of tierMap.values()) {
                const itemAge = now - new Date(item.timestamp).getTime();
                if (itemAge > nearExpirationThreshold && itemAge < retentionMs) {
                    nearExpirationCount++;
                }
            }
        }
        return nearExpirationCount;
    }
    /**
     * Convenience method for storing axioms - user-provided principles that should always surface first
     */
    async storeAxiom(content, metadata, tags) {
        return this.storeKnowledge({
            content,
            metadata: { ...metadata, isAxiom: true, priority: 'maximum' },
            tags: [...(tags || []), 'axiom', 'user_principle'],
            importance: 1.0, // Maximum importance
            targetTier: 'axiom'
        });
    }
}
