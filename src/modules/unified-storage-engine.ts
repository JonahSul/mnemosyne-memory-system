/**
 * Unified Storage Engine - Single Point of Truth
 * 
 * Consolidates all storage operations to eliminate architecture fragmentation.
 * Routes all persistence through Cloudflare Vectorize for true data durability.
 * 
 * ELIMINATES:
 * - Multiple competing storage classes (VectorStore, MultiTierMemorySystem, etc.)
 * - False success responses from volatile in-memory Maps
 * - Data loss between sessions due to RAM-only storage
 * 
 * PROVIDES:
 * - Single storage interface for all knowledge operations
 * - Guaranteed persistence through Cloudflare Vectorize 768-dimension indexes
 * - Tier semantics through metadata (not separate storage systems)
 * - Consistent behavior across all memory operations
 */

import { CloudflareVectorStore } from '../cloudflare-vector-store.js';

export interface UnifiedKnowledgeItem {
	id: string;
	content: string;
	metadata: Record<string, unknown>;
	tags: string[];
	timestamp: string;
	tier: 'axiom' | 'long' | 'intermediate' | 'short';
	importance: number;
	source: 'behavioral' | 'knowledge' | 'tiered' | 'vector';
	persistent: boolean; // Always true for this engine
}

export interface UnifiedSearchOptions {
	query: string;
	tierPreference?: 'axiom' | 'long' | 'intermediate' | 'short' | 'all';
	threshold?: number;
	limit?: number;
	tags?: string[];
}

export interface UnifiedSearchResult {
	items: UnifiedKnowledgeItem[];
	totalFound: number;
	searchLatency: number;
	source: 'cloudflare_vectorize';
}

/**
 * Single Storage Engine - Routes Everything to Cloudflare Vectorize
 * 
 * This class replaces:
 * - VectorStore (which stores to Map objects)
 * - MultiTierMemorySystem (which stores to Map objects)
 * - Multiple storeKnowledge implementations
 * 
 * With a single interface that guarantees persistence.
 */
export class UnifiedStorageEngine {
	private cloudflareStore: CloudflareVectorStore;
	private initialized = false;

	constructor(config?: any) {
		// Use environment or default config for Cloudflare
		const defaultConfig = {
			indexName: 'mnemosyne-memory',
			accountId: '',
			apiToken: ''
		};
		this.cloudflareStore = new CloudflareVectorStore(config || defaultConfig);
	}

	/**
	 * Initialize the storage engine - ensures Cloudflare connection
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;
		
		// Validate that we have a working Cloudflare connection
		try {
			// Test connection with a simple query
			await this.cloudflareStore.searchSimilar('connection_test', { limit: 1, threshold: 0.9 });
			this.initialized = true;
		} catch (error) {
			throw new Error(`UnifiedStorageEngine initialization failed - Cloudflare Vectorize not accessible: ${error}`);
		}
	}

	/**
	 * Store knowledge with guaranteed persistence to Cloudflare Vectorize
	 * 
	 * Replaces all other storeKnowledge implementations to ensure single point of truth
	 */
	async storeKnowledge(params: {
		content: string;
		metadata?: Record<string, unknown>;
		tags?: string[];
		importance?: number;
		tier?: 'axiom' | 'long' | 'intermediate' | 'short';
		source?: 'behavioral' | 'knowledge' | 'tiered' | 'vector';
	}): Promise<UnifiedKnowledgeItem> {
		await this.initialize();

		// Determine tier from importance if not specified
		const importance = params.importance ?? 0.5;
		const tier = params.tier ?? this.calculateTierFromImportance(importance);
		const source = params.source ?? 'knowledge';

		// Enhance metadata with tier and persistence information
		const enhancedMetadata = {
			...params.metadata || {},
			tier,
			importance,
			source,
			persistent: true, // Always true for this engine
			storage_engine: 'unified',
			storage_backend: 'cloudflare_vectorize',
			dimensions: 768
		};

		// Store to Cloudflare Vectorize (the only persistent backend)
		const cloudflareResult = await this.cloudflareStore.storeKnowledge({
			content: params.content,
			metadata: enhancedMetadata,
			tags: params.tags || []
		});

		// Return unified format
		return {
			id: cloudflareResult.id,
			content: cloudflareResult.content,
			metadata: enhancedMetadata,
			tags: cloudflareResult.tags,
			timestamp: cloudflareResult.timestamp,
			tier,
			importance,
			source,
			persistent: true
		};
	}

	/**
	 * Search with tier-aware ranking and guaranteed persistence source
	 */
	async searchKnowledge(options: UnifiedSearchOptions): Promise<UnifiedSearchResult> {
		await this.initialize();
		const startTime = performance.now();

		// Search Cloudflare Vectorize (remove tags from options since it's not supported)
		const cloudflareResults = await this.cloudflareStore.searchSimilar(options.query, {
			limit: options.limit || 10,
			threshold: options.threshold || 0.1
		});

		// Filter by tier if specified
		let filteredResults = cloudflareResults;
		if (options.tierPreference && options.tierPreference !== 'all') {
			filteredResults = cloudflareResults.filter(result => {
				const tier = result.metadata?.tier as string;
				return tier === options.tierPreference;
			});
		}

		// Apply tier-aware ranking boost
		const rankedResults = this.applyTierRanking(filteredResults);

		// Convert to unified format
		const unifiedItems: UnifiedKnowledgeItem[] = rankedResults.map(result => ({
			id: result.metadata?.id as string || `cf_${Date.now()}`,
			content: result.content,
			metadata: result.metadata || {},
			tags: result.tags || [],
			timestamp: result.metadata?.timestamp as string || new Date().toISOString(),
			tier: (result.metadata?.tier as any) || 'short',
			importance: (result.metadata?.importance as number) || 0.5,
			source: (result.metadata?.source as any) || 'knowledge',
			persistent: true
		}));

		const searchLatency = performance.now() - startTime;

		return {
			items: unifiedItems,
			totalFound: cloudflareResults.length,
			searchLatency,
			source: 'cloudflare_vectorize'
		};
	}

	/**
	 * Calculate tier from importance score
	 */
	private calculateTierFromImportance(importance: number): 'axiom' | 'long' | 'intermediate' | 'short' {
		if (importance >= 0.9) return 'axiom';
		if (importance >= 0.7) return 'long';
		if (importance >= 0.3) return 'intermediate';
		return 'short';
	}

	/**
	 * Apply tier-aware ranking boost to search results
	 */
	private applyTierRanking(results: any[]): any[] {
		return results.map(result => {
			const tier = result.metadata?.tier as string;
			let boost = 1.0;

			// Higher tiers get ranking boosts
			switch (tier) {
				case 'axiom': boost = 1.4; break;
				case 'long': boost = 1.2; break;
				case 'intermediate': boost = 1.1; break;
				case 'short': boost = 1.0; break;
				default: boost = 1.0;
			}

			return {
				...result,
				similarity: Math.min(1.0, result.similarity * boost)
			};
		}).sort((a, b) => b.similarity - a.similarity);
	}

	/**
	 * Get statistics about the unified storage
	 */
	async getStorageStats(): Promise<{
		backend: string;
		persistent: boolean;
		dimensions: number;
		tierDistribution: Record<string, number>;
		totalItems: number;
	}> {
		await this.initialize();

		// Get all items to calculate tier distribution
		const allItems = await this.searchKnowledge({ query: '', threshold: 0.0, limit: 1000 });
		
		const tierDistribution = allItems.items.reduce((acc, item) => {
			acc[item.tier] = (acc[item.tier] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			backend: 'cloudflare_vectorize',
			persistent: true,
			dimensions: 768,
			tierDistribution,
			totalItems: allItems.totalFound
		};
	}

	/**
	 * Health check - verify persistent storage is working
	 */
	async healthCheck(): Promise<{
		status: 'healthy' | 'degraded' | 'failed';
		backend: string;
		persistent: boolean;
		details: string;
	}> {
		try {
			await this.initialize();
			
			// Test write operation
			const testItem = await this.storeKnowledge({
				content: `Health check ${Date.now()}`,
				metadata: { health_check: true },
				tags: ['system', 'health'],
				importance: 0.1
			});

			// Test read operation
			const searchResult = await this.searchKnowledge({
				query: testItem.content,
				limit: 1,
				threshold: 0.8
			});

			const found = searchResult.items.length > 0;

			return {
				status: found ? 'healthy' : 'degraded',
				backend: 'cloudflare_vectorize',
				persistent: true,
				details: found 
					? `Successfully stored and retrieved test item ${testItem.id}`
					: 'Storage write succeeded but retrieval failed'
			};
		} catch (error) {
			return {
				status: 'failed',
				backend: 'cloudflare_vectorize',
				persistent: false,
				details: `Health check failed: ${error}`
			};
		}
	}
}

// Singleton instance for consistent storage access
let unifiedStorageInstance: UnifiedStorageEngine | null = null;

/**
 * Get the unified storage engine singleton
 * 
 * This replaces all the getXXXInstance() functions with a single source of truth
 */
export function getUnifiedStorageEngine(config?: any): UnifiedStorageEngine {
	if (!unifiedStorageInstance) {
		unifiedStorageInstance = new UnifiedStorageEngine(config);
	}
	return unifiedStorageInstance;
}

/**
 * Reset the storage engine (for testing)
 */
export function resetUnifiedStorageEngine(): void {
	unifiedStorageInstance = null;
}
