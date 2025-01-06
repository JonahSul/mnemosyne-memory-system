/**
 * Vector Store for Mnemosyne Working Memory
 * 
 * Provides RAG-based semantic knowledge storage and retrieval
 * to complement the behavioral memory system.
 */

export interface KnowledgeItem {
	content: string;
	metadata: {
		type?: string;
		domain?: string;
		importance?: string;
		[key: string]: any;
	};
	tags: string[];
}

export interface StoredKnowledge {
	id: string;
	content: string;
	embedding: number[];
	metadata: KnowledgeItem['metadata'];
	tags: string[];
	timestamp: string;
}

export interface SearchResult {
	content: string;
	similarity: number;
	metadata: KnowledgeItem['metadata'];
	tags: string[];
}

export interface SearchOptions {
	limit?: number;
	threshold?: number;
}

/**
 * Basic vector store implementation for semantic knowledge management
 * 
 * Currently uses simple mock embeddings - will be enhanced with real
 * embedding generation (OpenAI, local models, etc.)
 */
export class VectorStore {
	private knowledge: Map<string, StoredKnowledge> = new Map();
	private idCounter = 0;

	/**
	 * Store knowledge item with generated embedding
	 */
	async storeKnowledge(knowledge: KnowledgeItem): Promise<StoredKnowledge> {
		// Ensure unique ID generation
		const id = `vec_${Date.now()}_${this.idCounter++}`;
		
		// Generate mock embedding (will be replaced with real embedding service)
		const embedding = this.generateMockEmbedding(knowledge.content);
		
		const stored: StoredKnowledge = {
			id,
			content: knowledge.content,
			embedding,
			metadata: knowledge.metadata,
			tags: knowledge.tags,
			timestamp: new Date().toISOString()
		};

		this.knowledge.set(id, stored);
		return stored;
	}

	/**
	 * Search for similar knowledge using vector similarity
	 */
	async searchSimilar(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
		const { limit = 10, threshold = 0.7 } = options;
		
		// Generate query embedding
		const queryEmbedding = this.generateMockEmbedding(query);
		
		// Calculate similarities and filter by threshold
		const results: SearchResult[] = [];
		
		for (const stored of this.knowledge.values()) {
			const similarity = this.cosineSimilarity(queryEmbedding, stored.embedding);
			
			if (similarity >= threshold) {
				results.push({
					content: stored.content,
					similarity,
					metadata: stored.metadata,
					tags: stored.tags
				});
			}
		}
		
		// Sort by similarity (highest first) and limit results
		return results
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, limit);
	}

	/**
	 * Generate mock embedding for content
	 * TODO: Replace with real embedding service (OpenAI, local model, etc.)
	 */
	private generateMockEmbedding(content: string): number[] {
		// Generate embedding based on content features for realistic similarity
		const words = content.toLowerCase().split(/\s+/);
		const embedding: number[] = [];
		
		// Generate 384-dimensional mock embedding
		for (let i = 0; i < 384; i++) {
			let value = 0;
			
			// Add contribution from each word
			for (const word of words) {
				const wordHash = this.simpleHash(word + i);
				value += Math.sin(wordHash * 0.01) * 0.1;
			}
			
			// Add some content-length based variance
			value += Math.cos(content.length * i * 0.001) * 0.05;
			
			// Normalize to reasonable range
			value = Math.tanh(value);
			embedding.push(value);
		}
		
		return embedding;
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
			const aVal = a[i]!;
			const bVal = b[i]!;
			dotProduct += aVal * bVal;
			normA += aVal * aVal;
			normB += bVal * bVal;
		}

		const denominator = Math.sqrt(normA) * Math.sqrt(normB);
		return denominator === 0 ? 0 : dotProduct / denominator;
	}

	/**
	 * Simple hash function for mock embedding generation
	 */
	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}
}
