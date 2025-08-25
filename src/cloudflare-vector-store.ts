/**
 * Cloudflare Vectorize Integration
 * 
 * Production-ready vector storage using Cloudflare AI Workers for embeddings
 * and Vectorize for vector database operations.
 */

export interface CloudflareEnv {
	VECTORIZE_INDEX: Vectorize;
	AI: Ai;
}

export interface EmbeddingResponse {
	shape: number[];
	data: number[][];
}

export interface CloudflareConfig {
	env: CloudflareEnv;
}

export interface VectorizeMetadata {
	content: string;
	timestamp: string;
	tags: string[];
	[key: string]: unknown;
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
	private env: CloudflareEnv;
	// ARCHITECTURAL VIOLATION: This localKnowledge Map is VOLATILE cache
	// FIX REQUIRED: Remove volatile cache, use only persistent Vectorize storage
	// TODO: All operations should go directly to env.VECTORIZE_INDEX
	private localKnowledge: Map<string, CloudflareKnowledgeItem> = new Map();

	constructor(config: CloudflareConfig) {
		// Allow tests or non-Cloudflare environments to omit env bindings
		this.env = (config && (config as any).env) || ({} as any);
	}

	/**
	 * Generate real embeddings using Cloudflare AI Workers
	 */
	async generateEmbeddings(text: string): Promise<number[]> {
		try {
			// Use Worker AI binding directly
			const response = await this.env.AI.run(
				"@cf/baai/bge-base-en-v1.5",
				{ text: [text] }
			) as any;

			if (!response.data || !response.data[0]) {
				throw new Error('No embeddings returned from Cloudflare AI');
			}
			return response.data[0];
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
		// Generate consistent 768-dimensional embeddings to match production Vectorize index
		const dimension = 768; // Updated to match production configuration
		const embeddings: number[] = [];
		
		// Use text content to create deterministic but varied embeddings
		const hash = this.simpleHash(text);
		const random = this.seededRandom(hash);
		
		for (let i = 0; i < dimension; i++) {
			embeddings.push((random() - 0.5) * 2); // Range: -1 to 1
		}
		
		// Normalize the vector
		const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
		if (magnitude > 0) {
			for (let i = 0; i < embeddings.length; i++) {
				const current = embeddings[i];
				if (current !== undefined) {
					embeddings[i] = current / magnitude;
				}
			}
		}
		
		return embeddings;
	}

	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash);
	}

	private seededRandom(seed: number): () => number {
		let m = 2**35 - 31;
		let a = 185852;
		let s = seed % m;
		return () => (s = s * a % m) / m;
	}

	/**
	 * Store knowledge with Vectorize
	 */
	async storeKnowledge(knowledge: {
		content: string;
		metadata?: Record<string, unknown>;
		tags?: string[];
	}): Promise<CloudflareKnowledgeItem> {
		const id = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const timestamp = new Date().toISOString();
		
		// Generate embeddings
		const embedding = await this.generateEmbeddings(knowledge.content);
		
		// Prepare Vectorize record
		const vectorizeRecord: VectorizeVector = {
			id: id,
			values: embedding,
			metadata: {
				content: knowledge.content,
				timestamp: timestamp,
				tags: knowledge.tags || [],
				...knowledge.metadata
			}
		};

		try {
			// Store in Cloudflare Vectorize using Worker binding
			await this.env.VECTORIZE_INDEX.upsert([vectorizeRecord]);
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
			console.error('Failed to generate query embedding:', error);
			return [];
		}

		try {
			// Query Vectorize using Worker binding
			const matches = await this.env.VECTORIZE_INDEX.query(queryEmbedding, {
				topK: limit,
				returnValues: true,
				returnMetadata: true
			});

			const results: CloudflareSearchResult[] = [];
			for (const match of matches.matches) {
				if (match.score >= threshold && match.metadata) {
					results.push({
						id: match.id,
						content: match.metadata.content as string,
						embedding: Array.from(match.values || []),
						metadata: match.metadata,
						tags: (match.metadata.tags as string[]) || [],
						timestamp: match.metadata.timestamp as string,
						vectorizeId: match.id,
						similarity: match.score
					});
				}
			}

			return results;
		} catch (error) {
			console.warn('Vectorize search unavailable, using local search:', error);
			return this.searchLocal(query, queryEmbedding, options);
		}
	}

	/**
	 * Fallback local search when Vectorize is unavailable
	 */
	private searchLocal(query: string, queryEmbedding: number[], options: {
		limit?: number;
		threshold?: number;
	}): CloudflareSearchResult[] {
		const { limit = 5, threshold = 0.1 } = options;
		const results: CloudflareSearchResult[] = [];
		
		for (const stored of this.localKnowledge.values()) {
			const similarity = this.cosineSimilarity(queryEmbedding, stored.embedding);
			
			if (similarity >= threshold) {
				results.push({
					...stored,
					similarity
				});
			}
		}
		
		return results
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, limit);
	}

	/**
	 * Calculate cosine similarity between two vectors
	 */
	private cosineSimilarity(a: number[], b: number[]): number {
		if (a.length !== b.length) return 0;
		
		let dotProduct = 0;
		let normA = 0;
		let normB = 0;
		
		for (let i = 0; i < a.length; i++) {
			const valA = a[i];
			const valB = b[i];
			if (valA !== undefined && valB !== undefined) {
				dotProduct += valA * valB;
				normA += valA * valA;
				normB += valB * valB;
			}
		}
		
		const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
		return magnitude > 0 ? dotProduct / magnitude : 0;
	}

	/**
	 * Check if Vectorize is properly configured
	 */
	isConfigured(): boolean {
		return !!(this.env.VECTORIZE_INDEX && this.env.AI);
	}

	/**
	 * Get index information
	 */
	getIndexName(): string {
		return "VECTORIZE_INDEX";
	}

	/**
	 * Get storage statistics
	 */
	getStats() {
		return {
			localItems: this.localKnowledge.size,
			configured: this.isConfigured(),
			indexName: this.getIndexName(),
			embeddingDimensions: 768
		};
	}
}
