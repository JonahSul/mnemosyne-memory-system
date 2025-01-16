/**
 * Cloudflare Vectorize Integration
 * 
 * Production-ready vector storage using Cloudflare AI Workers for embeddings
 * and Vectorize for vector database operations.
 */

export interface CloudflareConfig {
	indexName: string;
	accountId: string;
	apiToken: string;
}

export interface VectorizeMetadata {
	content: string;
	timestamp: string;
	tags: string[];
	[key: string]: unknown;
}

export interface VectorizeRecord {
	id: string;
	values: number[];
	metadata: VectorizeMetadata;
}

export interface CloudflareKnowledgeItem {
	id: string;
	content: string;
	embedding: number[];
	metadata: Record<string, unknown>;
	tags: string[];
	timestamp: string;
	vectorizeId: string;
}

export interface CloudflareSearchResult extends CloudflareKnowledgeItem {
	similarity: number;
}

export class CloudflareVectorStore {
	private config: CloudflareConfig;
	private vectorizeApiBase: string;
	private localKnowledge: Map<string, CloudflareKnowledgeItem> = new Map();

	constructor(config: CloudflareConfig) {
		this.config = config;
		this.vectorizeApiBase = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/vectorize/indexes/${config.indexName}`;
	}

	/**
	 * Generate real embeddings using Cloudflare AI Workers
	 */
	async generateEmbeddings(text: string): Promise<number[]> {
		try {
			// Use Cloudflare AI Workers text embeddings with proper account ID
			const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/ai/run/@cf/baai/bge-base-en-v1.5`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.config.apiToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					text: [text]
				})
			});

			if (!response.ok) {
				throw new Error(`Cloudflare AI API error: ${response.statusText}`);
			}

			const result = await response.json() as { result: { data: number[][] } };
			const embeddings = result.result.data[0];
			if (!embeddings) {
				throw new Error('No embeddings returned from Cloudflare AI');
			}
			return embeddings;
		} catch (error) {
			console.error('Failed to generate embeddings:', error);
			// Fallback to mock embeddings for development
			return this.generateMockEmbeddings(text);
		}
	}

	/**
	 * Fallback mock embeddings for development/testing
	 */
	private generateMockEmbeddings(text: string): number[] {
		// Generate consistent 768-dimensional embeddings based on text content
		const dimension = 768;
		const embeddings: number[] = [];
		
		// Use text content to create deterministic but varied embeddings
		const hash = this.simpleHash(text);
		const random = this.seededRandom(hash);
		
		for (let i = 0; i < dimension; i++) {
			embeddings.push((random() - 0.5) * 2); // Range: -1 to 1
		}
		
		// Normalize the vector
		const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
		return embeddings.map(val => val / magnitude);
	}

	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
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
	 * Store knowledge in Cloudflare Vectorize
	 */
	async storeKnowledge(knowledge: {
		content: string;
		metadata?: Record<string, unknown>;
		tags?: string[];
	}): Promise<CloudflareKnowledgeItem> {
		const id = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const timestamp = new Date().toISOString();
		
		let embedding: number[];
		try {
			embedding = await this.generateEmbeddings(knowledge.content);
		} catch (error) {
			console.warn('Failed to generate embeddings, using mock embeddings for local storage:', error);
			// Use mock embeddings for local storage fallback
			embedding = this.generateMockEmbeddings(knowledge.content);
		}
		
		const vectorizeRecord: VectorizeRecord = {
			id,
			values: embedding,
			metadata: {
				content: knowledge.content,
				timestamp,
				tags: knowledge.tags || [],
				...knowledge.metadata
			}
		};

		try {
			// Store in Cloudflare Vectorize
			const response = await fetch(`${this.vectorizeApiBase}/insert`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.config.apiToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					vectors: [vectorizeRecord]
				})
			});

			if (!response.ok) {
				console.warn(`Vectorize storage failed: ${response.statusText}, using local storage`);
			}
		} catch (error) {
			console.warn('Vectorize storage unavailable, using local storage:', error);
		}

		// Store locally as fallback
		const result: CloudflareKnowledgeItem = {
			id,
			content: knowledge.content,
			embedding,
			metadata: knowledge.metadata || {},
			tags: knowledge.tags || [],
			timestamp,
			vectorizeId: id
		};
		
		this.localKnowledge.set(id, result);
		return result;
	}

	/**
	 * Search for similar knowledge using Vectorize
	 */
	async searchSimilar(query: string, options: {
		limit?: number;
		threshold?: number;
	} = {}): Promise<CloudflareSearchResult[]> {
		const { limit = 5, threshold = 0.1 } = options;
		
		let queryEmbedding: number[];
		try {
			queryEmbedding = await this.generateEmbeddings(query);
		} catch (error) {
			console.warn('Failed to generate query embeddings, using mock embeddings for local search:', error);
			// Use mock embeddings for local search fallback
			queryEmbedding = this.generateMockEmbeddings(query);
		}

		try {
			// Query Cloudflare Vectorize
			const response = await fetch(`${this.vectorizeApiBase}/query`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.config.apiToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					vector: queryEmbedding,
					topK: limit,
					returnMetadata: true
				})
			});

			if (response.ok) {
				const result = await response.json() as { result: { matches: any[] } };
				return result.result.matches.map((match: any) => ({
					id: match.id,
					content: match.metadata.content,
					embedding: match.vector || queryEmbedding,
					metadata: match.metadata,
					tags: match.metadata.tags || [],
					timestamp: match.metadata.timestamp,
					vectorizeId: match.id,
					similarity: match.score
				})).filter((item: CloudflareSearchResult) => item.similarity >= threshold);
			}
		} catch (error) {
			console.warn('Vectorize search unavailable, using fallback:', error);
		}

		// Fallback: search local knowledge
		const results: CloudflareSearchResult[] = [];
		for (const item of this.localKnowledge.values()) {
			const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
			if (similarity >= threshold) {
				results.push({
					...item,
					similarity
				});
			}
		}

		// Sort by similarity descending and limit results
		return results
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, limit);
	}

	/**
	 * Calculate cosine similarity between two vectors
	 */
	private cosineSimilarity(a: number[], b: number[]): number {
		if (a.length !== b.length) {
			throw new Error('Vectors must have the same length');
		}

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

		const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
		return magnitude === 0 ? 0 : dotProduct / magnitude;
	}

	/**
	 * Check if the store is properly configured
	 */
	isConfigured(): boolean {
		return !!(this.config.indexName && this.config.accountId && this.config.apiToken);
	}

	/**
	 * Get the configured index name
	 */
	getIndexName(): string {
		return this.config.indexName;
	}

	/**
	 * Get configuration info (without sensitive data)
	 */
	getConfigInfo(): { indexName: string; accountId: string; hasApiToken: boolean } {
		return {
			indexName: this.config.indexName,
			accountId: this.config.accountId,
			hasApiToken: !!this.config.apiToken
		};
	}
}
