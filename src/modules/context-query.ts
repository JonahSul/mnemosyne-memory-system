import type { ContextQuery } from './memory-interfaces';
import { CloudflareVectorStore } from '../cloudflare-vector-store';

/**
 * Context & Query Management Module
 * 
 * Handles context storage, query processing, and semantic search operations
 */
export interface ContextQueryOperations {
	logContextQuery(query: string, context?: Record<string, unknown>): string;
	getContextLogs(): ContextQuery[];
	getRecommendedMemorySearches(query: string): string[];
	storeContext(context: Record<string, unknown>): Promise<string>;
	searchKnowledge(query: string, limit?: number, threshold?: number, includeTestingData?: boolean): Promise<any[]>;
	searchTiered(query: string, tierPreference?: 'short' | 'intermediate' | 'long' | 'all', limit?: number, threshold?: number, includeTestingData?: boolean): Promise<any[]>;
	storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[], testing?: boolean): Promise<string>;
	storeTieredKnowledge(content: string, importance?: number, metadata?: Record<string, unknown>, tags?: string[], targetTier?: 'short' | 'intermediate' | 'long', testing?: boolean): Promise<string>;
	getStats(): Promise<any>;
	exportState(filterType?: 'claims' | 'violations' | 'rules' | 'all', format?: 'summary' | 'detailed' | 'raw', includeMetadata?: string): Promise<any>;
}

export class ContextQueryManager implements ContextQueryOperations {
	// PERSISTENCE: Use Vectorize for semantic storage + optional KV for rapid-access
	private contexts: Map<string, Record<string, unknown>> = new Map();
	private queries: ContextQuery[] = [];
	private knowledgeStore: Map<string, any> = new Map();
	private tieredKnowledge: Map<string, any> = new Map();
	private vectorStore: CloudflareVectorStore;
	private kvStore: any;

	constructor(vectorStore?: CloudflareVectorStore, kvStore?: any) {
		// ADR-001 COMPLIANCE: Use dependency injection or fail-closed behavior
		if (vectorStore) {
			this.vectorStore = vectorStore;
		} else {
			// Try to get properly initialized vector store from global scope
			if ((globalThis as any).getVectorStoreInstance) {
				try {
					this.vectorStore = (globalThis as any).getVectorStoreInstance();
				} catch (error) {
					// ADR-001 COMPLIANCE: Fail-closed behavior - do not create empty env fallback
					const isDevOrTest = (globalThis as any).FORCE_DEV_MODE || (globalThis as any).NODE_ENV === 'test';
					if (isDevOrTest) {
						this.vectorStore = new CloudflareVectorStore({ env: {} as any });
					} else {
						throw new Error('ContextQueryManager production vector store initialization failed - cannot proceed with volatile storage');
					}
				}
			} else {
				// ADR-001 COMPLIANCE: Fail-closed behavior - do not create empty env fallback
				const isDevOrTest = (globalThis as any).FORCE_DEV_MODE || (globalThis as any).NODE_ENV === 'test';
				if (isDevOrTest) {
					this.vectorStore = new CloudflareVectorStore({ env: {} as any });
				} else {
					throw new Error('ContextQueryManager production vector store initialization failed - cannot proceed with volatile storage');
				}
			}
		}
		this.kvStore = kvStore;
	}

	logContextQuery(query: string, context?: Record<string, unknown>): string {
		const queryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		const contextQuery: ContextQuery = {
			id: queryId,
			timestamp: new Date().toISOString(),
			query,
			context: context || {}
		};
		
		this.queries.push(contextQuery);
		return queryId;
	}

	getContextLogs(): ContextQuery[] {
		return [...this.queries];
	}

	getRecommendedMemorySearches(query: string): string[] {
		// Generate memory search recommendations based on query patterns
		const recommendations: string[] = [];
		
		const queryLower = query.toLowerCase();
		
		// Pattern-based recommendations
		if (queryLower.includes('debug') || queryLower.includes('error') || queryLower.includes('fix')) {
			recommendations.push('Search for similar debugging sessions');
			recommendations.push('Look for error patterns in recent memory');
		}
		
		if (queryLower.includes('test') || queryLower.includes('spec')) {
			recommendations.push('Review testing strategies from memory');
			recommendations.push('Search for test setup patterns');
		}
		
		if (queryLower.includes('deploy') || queryLower.includes('production')) {
			recommendations.push('Search deployment-related memories');
			recommendations.push('Review production issue patterns');
		}
		
		if (queryLower.includes('performance') || queryLower.includes('optimize')) {
			recommendations.push('Search performance optimization memories');
			recommendations.push('Review profiling and analysis patterns');
		}
		
		if (queryLower.includes('authentication') || queryLower.includes('auth') || queryLower.includes('secure') || queryLower.includes('jwt') || queryLower.includes('api')) {
			recommendations.push('Search authentication implementation memories');
			recommendations.push('Review security pattern documentation');
			recommendations.push('Look for JWT and API security examples');
		}
		
		if (queryLower.includes('react') || queryLower.includes('component') || queryLower.includes('frontend') || queryLower.includes('ui')) {
			recommendations.push('Search react component patterns');
			recommendations.push('Review frontend development memories');
			recommendations.push('Look for react optimization examples');
		}
		
		if (queryLower.includes('compliance') || queryLower.includes('no-unverified-claims') || queryLower.includes('behavioral')) {
			recommendations.push('Search compliance verification memories');
			recommendations.push('Review no-unverified-claims patterns');
			recommendations.push('Look for behavioral rule examples');
		}
		
		if ((queryLower.includes('test') && queryLower.includes('fail')) || queryLower.includes('violation') || queryLower.includes('rule')) {
			recommendations.push('Review compliance and behavioral patterns');
			recommendations.push('Search no-unverified-claims guidance');
			recommendations.push('Look for testing and verification patterns');
		}
		
		if (queryLower.includes('session') || queryLower.includes('management') || queryLower.includes('user')) {
			recommendations.push('Search session management patterns');
			recommendations.push('Review user interaction memories');
			recommendations.push('Look for management strategy examples');
		}
		
		// Add context-based recommendations from recent queries
		const recentQueries = this.queries.slice(-5);
		for (const recentQuery of recentQueries) {
			if (this.queriesAreSimilar(query, recentQuery.query)) {
				recommendations.push(`Follow up on recent query: "${recentQuery.query}"`);
			}
		}
		
		return recommendations;
	}

	async storeContext(context: Record<string, unknown>): Promise<string> {
		const contextId = `context_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		const entry = { id: contextId, context, timestamp: new Date().toISOString() };
		// Write-through to KV for rapid access
		if (this.kvStore) {
			await this.kvStore.put(`context:${contextId}`, JSON.stringify(entry));
		}
		// Keep a small in-memory index for quick reads (non-authoritative)
		this.contexts.set(contextId, entry.context as Record<string, unknown>);
		return contextId;
	}

	async searchKnowledge(query: string, limit: number = 5, threshold: number = 0.1, includeTestingData: boolean = false): Promise<any[]> {
		const queryId = `query_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		const contextQuery: ContextQuery = {
			id: queryId,
			timestamp: new Date().toISOString(),
			query,
			context: { limit, threshold, includeTestingData }
		};
		
		this.queries.push(contextQuery);

		// Use Vectorize for semantic search
		const vectorResults = await this.vectorStore.searchSimilar(query, { limit, threshold });
		return vectorResults.map(r => ({
			id: r.id,
			content: r.content,
			similarity: r.similarity,
			metadata: r.metadata,
			tags: r.tags
		}));
	}

	async searchTiered(
		query: string, 
		tierPreference: 'short' | 'intermediate' | 'long' | 'all' = 'all', 
		limit: number = 5, 
		threshold: number = 0.1,
		includeTestingData: boolean = false
	): Promise<any[]> {
		const queryId = `tiered_query_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		const contextQuery: ContextQuery = {
			id: queryId,
			timestamp: new Date().toISOString(),
			query,
			context: { tierPreference, limit, threshold, includeTestingData }
		};
		
		this.queries.push(contextQuery);

		// Use Vectorize and filter by tier metadata when available
		const vectorResults = await this.vectorStore.searchSimilar(query, { limit, threshold });
		const filtered = vectorResults.filter(r => {
			const meta = r.metadata as any;
			if (!meta) return false;
			if (tierPreference === 'all') return true;
			return meta.tier === tierPreference;
		}).slice(0, limit);

		return filtered.map(r => ({
			id: r.id,
			content: r.content,
			similarity: r.similarity,
			tier: (r.metadata as any)?.tier,
			metadata: r.metadata,
			tags: r.tags
		}));
	}

	async storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[], testing?: boolean): Promise<string> {
		const knowledgeId = `knowledge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		const knowledgeEntry = {
			id: knowledgeId,
			content,
			metadata: { 
				...(metadata || {}),
				...(testing && { testing: true })
			},
			tags: tags || [],
			timestamp: new Date().toISOString(),
			embeddings: this.generateEmbeddings(content)
		};

		// Persist to KV (rapid access) and vector store (semantic)
		if (this.kvStore) {
			await this.kvStore.put(`knowledge:${knowledgeId}`, JSON.stringify(knowledgeEntry));
		}
		await this.vectorStore.storeKnowledge({ content, metadata: knowledgeEntry.metadata, tags: knowledgeEntry.tags });
		this.knowledgeStore.set(knowledgeId, knowledgeEntry);
		return knowledgeId;
	}

	async storeTieredKnowledge(
		content: string, 
		importance: number = 0.5, 
		metadata?: Record<string, unknown>, 
		tags?: string[], 
		targetTier?: 'short' | 'intermediate' | 'long',
		testing?: boolean
	): Promise<string> {
		const knowledgeId = `tiered_knowledge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		// Determine tier based on importance if not explicitly specified
		let tier = targetTier;
		if (!tier) {
			if (importance < 0.3) tier = 'short';
			else if (importance < 0.7) tier = 'intermediate';
			else tier = 'long';
		}

		const knowledgeEntry = {
			id: knowledgeId,
			content,
			metadata: { 
				...(metadata || {}),
				...(testing && { testing: true })
			},
			tags: tags || [],
			timestamp: new Date().toISOString(),
			tier,
			importance,
			embeddings: this.generateEmbeddings(content),
			accessCount: 0,
			lastAccessed: new Date().toISOString()
		};

		if (this.kvStore) {
			await this.kvStore.put(`tiered:${knowledgeId}`, JSON.stringify(knowledgeEntry));
		}
		await this.vectorStore.storeKnowledge({ content, metadata: knowledgeEntry.metadata, tags: [...(tags||[]), tier] });
		this.tieredKnowledge.set(knowledgeId, knowledgeEntry);
		return knowledgeId;
	}

	async getStats(): Promise<any> {
		const knowledgeStats = this.calculateKnowledgeStats();
		const tieredStats = this.calculateTieredStats();
		const queryStats = this.calculateQueryStats();
		const contextStats = this.calculateContextStats();
		const vectorStats = this.vectorStore.getStats ? this.vectorStore.getStats() : { localItems: 0 };

		return {
			knowledge: knowledgeStats,
			tiered: tieredStats,
			queries: queryStats,
			contexts: contextStats,
			totalEntries: this.knowledgeStore.size + this.tieredKnowledge.size,
			vectorStore: vectorStats,
			timestamp: new Date().toISOString()
		};
	}

	async exportState(
		filterType: 'claims' | 'violations' | 'rules' | 'all' = 'all', 
		format: 'summary' | 'detailed' | 'raw' = 'summary', 
		includeMetadata?: string
	): Promise<any> {
		const knowledge = Array.from(this.knowledgeStore.values());
		const tieredKnowledge = Array.from(this.tieredKnowledge.values());
		const contexts = Array.from(this.contexts.entries());
		const queries = [...this.queries];

		let filteredData: any = {
			knowledge,
			tieredKnowledge,
			contexts,
			queries
		};

		// Apply filtering based on filterType
		if (filterType !== 'all') {
			filteredData = this.applyFilter(filteredData, filterType);
		}

		// Format the data based on format preference
		switch (format) {
			case 'summary':
				return this.formatSummary(filteredData, includeMetadata);
			case 'detailed':
				return this.formatDetailed(filteredData, includeMetadata);
			case 'raw':
				return this.formatRaw(filteredData, includeMetadata);
			default:
				return filteredData;
		}
	}

	// Private helper methods
	private async performSemanticSearch(query: string, limit: number, threshold: number, includeTestingData: boolean = false): Promise<any[]> {
		const queryEmbeddings = this.generateEmbeddings(query);
	// Fallback: use vector store if available
	const vectorResults = await this.vectorStore.searchSimilar(query, { limit, threshold });
	return vectorResults.map(r => ({ id: r.id, content: r.content, similarity: r.similarity, metadata: r.metadata, tags: r.tags }));
	}

	private async performTieredSearch(query: string, tierPreference: string, limit: number, threshold: number, includeTestingData: boolean = false): Promise<any[]> {
		const queryEmbeddings = this.generateEmbeddings(query);
	const vectorResults = await this.vectorStore.searchSimilar(query, { limit: 100, threshold });
	const mapped = vectorResults.map(r => ({ id: r.id, content: r.content, similarity: r.similarity, tier: (r.metadata as any)?.tier, metadata: r.metadata, tags: r.tags }));
	// Apply tier filtering and ranking
	const filtered = mapped.filter(e => tierPreference === 'all' ? true : e.tier === tierPreference);
	return filtered.slice(0, limit);
	}

	private generateEmbeddings(content: string): number[] {
		// Simulate embedding generation - in practice would use real embedding model
		const words = content.toLowerCase().split(/\s+/);
		const embeddings: number[] = [];
		
		for (let i = 0; i < 384; i++) { // Standard embedding dimension
			let value = 0;
			for (const word of words) {
				value += word.charCodeAt(i % word.length) * 0.001;
			}
			embeddings.push(Math.sin(value) * 0.5 + 0.5); // Normalize to 0-1
		}
		
		return embeddings;
	}

	private calculateSimilarity(embeddings1: number[], embeddings2: number[]): number {
		// Cosine similarity calculation
		let dotProduct = 0;
		let norm1 = 0;
		let norm2 = 0;

		for (let i = 0; i < Math.min(embeddings1.length, embeddings2.length); i++) {
			const val1 = embeddings1[i] ?? 0;
			const val2 = embeddings2[i] ?? 0;
			
			dotProduct += val1 * val2;
			norm1 += val1 * val1;
			norm2 += val2 * val2;
		}

		norm1 = Math.sqrt(norm1);
		norm2 = Math.sqrt(norm2);

		if (norm1 === 0 || norm2 === 0) return 0;
		return dotProduct / (norm1 * norm2);
	}

	private getTierBoost(tier: string): number {
		const tierBoosts = {
			'long': 1.3,      // Long-term memory gets highest boost
			'intermediate': 1.1,  // Intermediate gets moderate boost
			'short': 1.0      // Short-term gets no boost
		};
		return tierBoosts[tier as keyof typeof tierBoosts] || 1.0;
	}

	private calculateKnowledgeStats(): any {
		const entries = Array.from(this.knowledgeStore.values());
		
		return {
			totalEntries: entries.length,
			totalContent: entries.reduce((sum, e) => sum + e.content.length, 0),
			averageContentLength: entries.length > 0 ? entries.reduce((sum, e) => sum + e.content.length, 0) / entries.length : 0,
			uniqueTags: new Set(entries.flatMap(e => e.tags || [])).size
		};
	}

	private calculateTieredStats(): any {
		const entries = Array.from(this.tieredKnowledge.values());
		const tierCounts = { short: 0, intermediate: 0, long: 0 };
		const tierSizes = { short: 0, intermediate: 0, long: 0 };

		for (const entry of entries) {
			tierCounts[entry.tier as keyof typeof tierCounts]++;
			tierSizes[entry.tier as keyof typeof tierSizes] += entry.content.length;
		}

		return {
			totalEntries: entries.length,
			tierDistribution: tierCounts,
			tierSizes,
			averageImportance: entries.length > 0 ? entries.reduce((sum, e) => sum + e.importance, 0) / entries.length : 0,
			totalAccesses: entries.reduce((sum, e) => sum + (e.accessCount || 0), 0)
		};
	}

	private calculateQueryStats(): any {
		return {
			totalQueries: this.queries.length,
			recentQueries: this.queries.slice(-10),
			queryFrequency: this.queries.length > 0 ? this.queries.length / ((Date.now() - Date.parse(this.queries[0]?.timestamp || new Date().toISOString())) / (1000 * 60 * 60)) : 0
		};
	}

	private calculateContextStats(): any {
		return {
			totalContexts: this.contexts.size,
			averageContextSize: this.contexts.size > 0 ? Array.from(this.contexts.values()).reduce((sum, c) => sum + Object.keys(c).length, 0) / this.contexts.size : 0
		};
	}

	private applyFilter(data: any, filterType: string): any {
		// Filter data based on type
		switch (filterType) {
			case 'claims':
				return {
					knowledge: data.knowledge.filter((k: any) => k.metadata?.type === 'claim'),
					tieredKnowledge: data.tieredKnowledge.filter((k: any) => k.metadata?.type === 'claim'),
					contexts: data.contexts,
					queries: data.queries.filter((q: any) => q.query.includes('claim'))
				};
			case 'violations':
				return {
					knowledge: data.knowledge.filter((k: any) => k.metadata?.type === 'violation'),
					tieredKnowledge: data.tieredKnowledge.filter((k: any) => k.metadata?.type === 'violation'),
					contexts: data.contexts,
					queries: data.queries.filter((q: any) => q.query.includes('violation'))
				};
			case 'rules':
				return {
					knowledge: data.knowledge.filter((k: any) => k.metadata?.type === 'rule'),
					tieredKnowledge: data.tieredKnowledge.filter((k: any) => k.metadata?.type === 'rule'),
					contexts: data.contexts,
					queries: data.queries.filter((q: any) => q.query.includes('rule'))
				};
			default:
				return data;
		}
	}

	private formatSummary(data: any, includeMetadata?: string): any {
		return {
			summary: {
				knowledgeEntries: data.knowledge.length,
				tieredEntries: data.tieredKnowledge.length,
				contexts: data.contexts.length,
				queries: data.queries.length
			},
			metadata: includeMetadata ? {
				timestamp: new Date().toISOString(),
				format: 'summary'
			} : undefined
		};
	}

	private formatDetailed(data: any, includeMetadata?: string): any {
		return {
			detailed: {
				knowledge: data.knowledge.map((k: any) => ({
					id: k.id,
					contentLength: k.content.length,
					tags: k.tags,
					timestamp: k.timestamp
				})),
				tieredKnowledge: data.tieredKnowledge.map((k: any) => ({
					id: k.id,
					tier: k.tier,
					importance: k.importance,
					contentLength: k.content.length,
					accessCount: k.accessCount,
					lastAccessed: k.lastAccessed
				})),
				queryPatterns: this.analyzeQueryPatterns(data.queries)
			},
			metadata: includeMetadata ? {
				timestamp: new Date().toISOString(),
				format: 'detailed'
			} : undefined
		};
	}

	private formatRaw(data: any, includeMetadata?: string): any {
		return {
			raw: data,
			metadata: includeMetadata ? {
				timestamp: new Date().toISOString(),
				format: 'raw',
				warning: 'This is raw data - handle with care'
			} : undefined
		};
	}

	private analyzeQueryPatterns(queries: ContextQuery[]): any {
		const patterns: Record<string, number> = {};
		
		for (const query of queries) {
			const words = query.query.toLowerCase().split(/\s+/);
			for (const word of words) {
				if (word.length > 3) {
					patterns[word] = (patterns[word] || 0) + 1;
				}
			}
		}

		return {
			topTerms: Object.entries(patterns)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 10)
				.map(([term, count]) => ({ term, count })),
			totalUniqueTerms: Object.keys(patterns).length
		};
	}

	private queriesAreSimilar(query1: string, query2: string): boolean {
		const words1 = query1.toLowerCase().split(/\s+/);
		const words2 = query2.toLowerCase().split(/\s+/);
		
		const commonWords = words1.filter(word => words2.includes(word));
		const similarity = commonWords.length / Math.max(words1.length, words2.length);
		
		return similarity > 0.3; // 30% similarity threshold
	}

	// Utility methods
	getContexts(): Map<string, Record<string, unknown>> {
		return new Map(this.contexts);
	}

	getQueries(): ContextQuery[] {
		return [...this.queries];
	}

	getKnowledgeStore(): Map<string, any> {
		return new Map(this.knowledgeStore);
	}

	getTieredKnowledge(): Map<string, any> {
		return new Map(this.tieredKnowledge);
	}
}
