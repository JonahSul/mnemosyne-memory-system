/**
 * Multi-Tier Memory System for Mnemosyne
 * 
 * Implements a hierarchical memory architecture with different retention policies:
 * - Short-term: High-frequency access, aggressive pruning (token conservation)
 * - Intermediate-term: Moderate retention, frequency-based pruning
 * - Long-term: Persistent storage, minimal pruning (important knowledge)
 * 
 * Based on established patterns from cognitive science and modern vector databases.
 */

export interface MemoryTier {
	name: string;
	maxItems: number;
	retentionHours: number;
	accessThreshold: number; // Minimum access count to promote to next tier
	pruningStrategy: 'fifo' | 'lru' | 'frequency' | 'importance';
}

export interface TieredKnowledgeItem {
	id: string;
	content: string;
	embedding: number[];
	metadata: Record<string, unknown>;
	tags: string[];
	timestamp: string;
	
	// Tier-specific properties
	tier: 'short' | 'intermediate' | 'long';
	accessCount: number;
	lastAccessed: string;
	importance: number; // 0-1 scale
	promotionEligible: boolean;
	
	// Weight-based enhancement properties
	significanceWeight: number;  // Inherent importance of the content (0-1)
	semanticWeight: number;      // Reinforcement through semantic similarity (0-1)
	combinedWeight: number;      // Total weight for promotion decisions (0-1)
	weightHistory: Array<{       // Track weight changes over time
		timestamp: string;
		significance: number;
		semantic: number;
		combined: number;
		reason: string;
	}>;
}

export interface TierConfig {
	short: MemoryTier;
	intermediate: MemoryTier;
	long: MemoryTier;
}

/**
 * Default tier configuration based on established cognitive memory patterns
 */
export const DEFAULT_TIER_CONFIG: TierConfig = {
	short: {
		name: 'short-term',
		maxItems: 50,           // Small for token conservation
		retentionHours: 2,      // Very aggressive pruning
		accessThreshold: 3,     // Promote after 3 accesses
		pruningStrategy: 'lru'  // Least recently used
	},
	intermediate: {
		name: 'intermediate-term', 
		maxItems: 200,          // Moderate capacity
		retentionHours: 24,     // Daily retention cycle
		accessThreshold: 5,     // Promote after 5 accesses
		pruningStrategy: 'frequency' // Frequency-based retention
	},
	long: {
		name: 'long-term',
		maxItems: 1000,         // Large capacity
		retentionHours: 8760,   // 1 year retention
		accessThreshold: 0,     // No promotion (top tier)
		pruningStrategy: 'importance' // Importance-based pruning
	}
};

export class MultiTierMemorySystem {
	private shortTerm: Map<string, TieredKnowledgeItem> = new Map();
	private intermediateTerm: Map<string, TieredKnowledgeItem> = new Map();
	private longTerm: Map<string, TieredKnowledgeItem> = new Map();
	private config: TierConfig;

	constructor(config: TierConfig = DEFAULT_TIER_CONFIG) {
		this.config = config;
	}

	/**
	 * Store knowledge in appropriate tier based on importance
	 */
	async storeKnowledge(knowledge: {
		content: string;
		metadata?: Record<string, unknown>;
		tags?: string[];
		importance?: number; // 0-1 scale, defaults to 0.5
		targetTier?: 'short' | 'intermediate' | 'long';
	}): Promise<TieredKnowledgeItem> {
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
		
		const item: TieredKnowledgeItem = {
			id,
			content: knowledge.content,
			embedding,
			metadata: knowledge.metadata || {},
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
	 * Search across all tiers with tier-aware ranking
	 */
	async searchSimilar(query: string, options: {
		limit?: number;
		threshold?: number;
		tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
	} = {}): Promise<Array<TieredKnowledgeItem & { similarity: number }>> {
		const { limit = 10, threshold = 0.7, tierPreference = 'all' } = options;
		const queryEmbedding = this.generateMockEmbedding(query);
		const results: Array<TieredKnowledgeItem & { similarity: number }> = [];

		// Search tiers based on preference
		const tiersToSearch = this.getTiersToSearch(tierPreference);
		
		for (const [tierName, tierMap] of tiersToSearch) {
			for (const item of tierMap.values()) {
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
	 * Promote items between tiers based on access patterns
	 */
	private async checkPromotions(): Promise<void> {
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
	private async pruneIfNecessary(tier: 'short' | 'intermediate' | 'long'): Promise<void> {
		const tierMap = this.getTierMap(tier);
		const config = this.config[tier];
		
		// First, remove expired items based on retentionHours
		await this.pruneExpiredItems(tier);
		
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
	private async pruneExpiredItems(tier: 'short' | 'intermediate' | 'long'): Promise<void> {
		const tierMap = this.getTierMap(tier);
		const config = this.config[tier];
		const now = new Date().getTime();
		const retentionMs = config.retentionHours * 60 * 60 * 1000;
		
		// Only remove items that have exceeded hard retention time
		const expiredItems: string[] = [];
		
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
	private async pruneWithForgettingCurves(tier: 'short' | 'intermediate' | 'long'): Promise<void> {
		const tierMap = this.getTierMap(tier);
		const config = this.config[tier];
		const now = new Date().getTime();
		const retentionMs = config.retentionHours * 60 * 60 * 1000;
		
		// Collect items to be removed
		const itemsToRemove: string[] = [];
		
		for (const [id, item] of tierMap.entries()) {
			const itemAge = now - new Date(item.timestamp).getTime();
			
			let shouldRemove = false;
			
			// Hard expiration: Items beyond retention time
			if (itemAge > retentionMs) {
				const shouldSpare = this.shouldSpareFromExpiration(item, tier);
				if (!shouldSpare) {
					shouldRemove = true;
				}
			}
			// Probabilistic forgetting: Apply forgetting curve for all items
			else {
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
	private shouldSpareFromExpiration(item: TieredKnowledgeItem, tier: 'short' | 'intermediate' | 'long'): boolean {
		// High importance items are more likely to be spared
		const importanceThreshold = tier === 'long' ? 0.7 : tier === 'intermediate' ? 0.8 : 0.9;
		
		if (item.importance >= importanceThreshold) {
			return true;
		}
		
		// Frequently accessed items are more likely to be spared (more lenient thresholds)
		const accessThreshold = tier === 'long' ? 2 : tier === 'intermediate' ? 3 : 5;
		
		if (item.accessCount >= accessThreshold) {
			return true;
		}
		
		// Recently accessed items get a slight reprieve
		const recentAccessMs = 24 * 60 * 60 * 1000; // 24 hours
		const timeSinceAccess = new Date().getTime() - new Date(item.lastAccessed).getTime();
		
		if (timeSinceAccess < recentAccessMs && item.importance >= 0.5) {
			return true;
		}
		
		return false;
	}

	/**
	 * Calculate retention probability based on Ebbinghaus forgetting curve
	 * Uses probabilistic decay with importance and access modifiers
	 */
	private calculateRetentionProbability(item: TieredKnowledgeItem, tier: 'short' | 'intermediate' | 'long'): number {
		const now = new Date().getTime();
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
	private shouldForgetItem(item: TieredKnowledgeItem, tier: 'short' | 'intermediate' | 'long'): boolean {
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
	private selectInitialTier(importance: number): 'short' | 'intermediate' | 'long' {
		if (importance >= 0.8) return 'long';
		if (importance >= 0.6) return 'intermediate'; 
		return 'short';
	}

	// Weight calculation methods
	private calculateSignificanceWeight(content: string, importance: number): number {
		// Base weight from importance score
		let weight = importance;
		
		// Boost weight for longer, more detailed content
		const contentLength = content.length;
		const lengthBoost = Math.min(contentLength / 1000, 0.3); // Cap at 0.3 boost
		weight += lengthBoost;
		
		// Boost weight for content with specific keywords indicating importance
		const importanceKeywords = ['critical', 'important', 'error', 'bug', 'security', 'performance', 'urgent'];
		const keywordMatches = importanceKeywords.filter(keyword => 
			content.toLowerCase().includes(keyword)
		).length;
		const keywordBoost = Math.min(keywordMatches * 0.1, 0.2); // Cap at 0.2 boost
		weight += keywordBoost;
		
		// Normalize to [0, 1] range
		return Math.min(weight, 1.0);
	}

	private async calculateSemanticWeight(content: string, embedding: number[]): Promise<number> {
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

	private calculateCombinedWeight(significanceWeight: number, semanticWeight: number): number {
		// Weighted combination: 60% significance, 40% semantic
		// Significance weight indicates inherent importance
		// Semantic weight indicates reinforcement through repetition/similarity
		return (significanceWeight * 0.6) + (semanticWeight * 0.4);
	}

	private calculateCosineSimilarity(a: number[], b: number[]): number {
		if (a.length !== b.length) return 0;
		
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

	private storeInTier(item: TieredKnowledgeItem, tier: 'short' | 'intermediate' | 'long'): void {
		const tierMap = this.getTierMap(tier);
		tierMap.set(item.id, item);
	}

	private promoteItem(item: TieredKnowledgeItem, newTier: 'intermediate' | 'long'): void {
		item.tier = newTier;
		item.promotionEligible = false;
		this.storeInTier(item, newTier);
	}

	private getTierMap(tier: 'short' | 'intermediate' | 'long'): Map<string, TieredKnowledgeItem> {
		switch (tier) {
			case 'short': return this.shortTerm;
			case 'intermediate': return this.intermediateTerm;
			case 'long': return this.longTerm;
		}
	}

	private getTiersToSearch(preference: 'short' | 'intermediate' | 'long' | 'all'): Array<[string, Map<string, TieredKnowledgeItem>]> {
		switch (preference) {
			case 'short': return [['short', this.shortTerm]];
			case 'intermediate': return [['intermediate', this.intermediateTerm]];
			case 'long': return [['long', this.longTerm]];
			case 'all': 
			default:
				return [
					['long', this.longTerm],          // Search highest tier first
					['intermediate', this.intermediateTerm],
					['short', this.shortTerm]
				];
		}
	}

	private getTierBoost(tier: 'short' | 'intermediate' | 'long'): number {
		// Boost scores for higher tiers
		switch (tier) {
			case 'long': return 1.2;
			case 'intermediate': return 1.1;
			case 'short': return 1.0;
		}
	}

	/**
	 * Generate mock embedding for development
	 * Creates embeddings that have similarity for similar texts
	 */
	private generateMockEmbedding(text: string): number[] {
		const dimension = 384;
		const embeddings: number[] = new Array(dimension).fill(0);
		
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

	private cosineSimilarity(a: number[], b: number[]): number {
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

	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	private seededRandom(seed: number): () => number {
		let state = seed;
		return () => {
			state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
			return state / Math.pow(2, 32);
		};
	}

	/**
	 * Get memory statistics across all tiers
	 */
	getMemoryStats(): {
		short: { count: number; capacity: number; utilizationPercent: number };
		intermediate: { count: number; capacity: number; utilizationPercent: number };
		long: { count: number; capacity: number; utilizationPercent: number };
		total: { count: number; capacityUsed: number };
	} {
		const short = {
			count: this.shortTerm.size,
			capacity: this.config.short.maxItems,
			utilizationPercent: (this.shortTerm.size / this.config.short.maxItems) * 100
		};

		const intermediate = {
			count: this.intermediateTerm.size,
			capacity: this.config.intermediate.maxItems,
			utilizationPercent: (this.intermediateTerm.size / this.config.intermediate.maxItems) * 100
		};

		const long = {
			count: this.longTerm.size,
			capacity: this.config.long.maxItems,
			utilizationPercent: (this.longTerm.size / this.config.long.maxItems) * 100
		};

		return {
			short,
			intermediate,
			long,
			total: {
				count: short.count + intermediate.count + long.count,
				capacityUsed: short.utilizationPercent + intermediate.utilizationPercent + long.utilizationPercent
			}
		};
	}

	/**
	 * Get forgetting curve analytics for all items
	 */
	getForgettingCurveAnalytics(): {
		retentionProbabilities: { short: number[]; intermediate: number[]; long: number[] };
		averageRetention: { short: number; intermediate: number; long: number };
		itemsAtRisk: { short: number; intermediate: number; long: number };
	} {
		const analytics = {
			retentionProbabilities: { short: [] as number[], intermediate: [] as number[], long: [] as number[] },
			averageRetention: { short: 0, intermediate: 0, long: 0 },
			itemsAtRisk: { short: 0, intermediate: 0, long: 0 }
		};
		
		// Analyze each tier
		for (const [tierName, tierMap] of [
			['short', this.shortTerm] as const,
			['intermediate', this.intermediateTerm] as const,
			['long', this.longTerm] as const
		]) {
			const probabilities: number[] = [];
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
	async runGarbageCollection(): Promise<{
		expiredItemsRemoved: { short: number; intermediate: number; long: number; total: number };
		itemsSpared: { short: number; intermediate: number; long: number; total: number };
		forgettingCurveStats: {
			retentionProbabilities: { short: number[]; intermediate: number[]; long: number[] };
			averageRetention: { short: number; intermediate: number; long: number };
			itemsAtRisk: { short: number; intermediate: number; long: number };
		};
	}> {
		const beforeStats = this.getMemoryStats();
		const beforeCurveStats = this.getForgettingCurveAnalytics();
		
		// Run forgetting curve pruning on all tiers (includes probabilistic forgetting)
		await this.pruneWithForgettingCurves('short');
		await this.pruneWithForgettingCurves('intermediate');
		await this.pruneWithForgettingCurves('long');
		
		const afterStats = this.getMemoryStats();
		
		// Calculate items removed
		const expiredItemsRemoved = {
			short: beforeStats.short.count - afterStats.short.count,
			intermediate: beforeStats.intermediate.count - afterStats.intermediate.count,
			long: beforeStats.long.count - afterStats.long.count,
			total: beforeStats.total.count - afterStats.total.count
		};

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
	private getSparedItemsCount(): { short: number; intermediate: number; long: number; total: number } {
		const now = new Date().getTime();
		let sparedCounts = { short: 0, intermediate: 0, long: 0, total: 0 };
		
		// Check each tier for items that should have expired but were spared
		for (const [tierName, tierMap] of [
			['short', this.shortTerm] as const,
			['intermediate', this.intermediateTerm] as const,
			['long', this.longTerm] as const
		]) {
			const config = this.config[tierName];
			const retentionMs = config.retentionHours * 60 * 60 * 1000;
			
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
	getMemoryHealth(): {
		tiersHealth: { short: string; intermediate: string; long: string };
		expirationStats: { itemsNearExpiration: number; itemsSpared: number };
		recommendations: string[];
	} {
		const stats = this.getMemoryStats();
		const sparedItems = this.getSparedItemsCount();
		const nearExpiration = this.getItemsNearExpiration();
		
		// Assess tier health
		const tiersHealth = {
			short: stats.short.utilizationPercent > 80 ? 'overloaded' : stats.short.utilizationPercent > 60 ? 'healthy' : 'underutilized',
			intermediate: stats.intermediate.utilizationPercent > 80 ? 'overloaded' : stats.intermediate.utilizationPercent > 60 ? 'healthy' : 'underutilized',
			long: stats.long.utilizationPercent > 80 ? 'overloaded' : stats.long.utilizationPercent > 60 ? 'healthy' : 'underutilized'
		};
		
		// Generate recommendations
		const recommendations: string[] = [];
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
	private getItemsNearExpiration(): number {
		const now = new Date().getTime();
		let nearExpirationCount = 0;
		
		for (const [tierName, tierMap] of [
			['short', this.shortTerm] as const,
			['intermediate', this.intermediateTerm] as const,
			['long', this.longTerm] as const
		]) {
			const config = this.config[tierName];
			const retentionMs = config.retentionHours * 60 * 60 * 1000;
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
}
