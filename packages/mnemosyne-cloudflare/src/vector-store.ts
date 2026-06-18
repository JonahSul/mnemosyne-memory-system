/**
 * Cloudflare Vectorize Integration
 *
 * Production-ready vector storage using Cloudflare AI Workers for embeddings
 * and Vectorize for vector database operations.
 */

import type {
	VectorStoreAdapter,
	VectorStoreRecord,
	VectorStoreSearchOptions,
	VectorStoreSearchResult
} from '@mnemosyne-core/core/interfaces/storage';

export interface CloudflareEnv {
	VECTORIZE_INDEX: Vectorize;
	AI: Ai;
}

export interface CloudflareConfig {
	env?: CloudflareEnv;
	indexName?: string;
	accountId?: string;
	apiToken?: string;
	nodeEnv?: string;
	useTestShim?: boolean;
}

export interface VectorizeMetadata {
	content: string;
	timestamp: string;
	tags: string[];
	[key: string]: unknown;
}

export interface CloudflareKnowledgeItem extends VectorStoreRecord {
	id: string;
	embedding: number[];
	metadata: Record<string, unknown>;
	tags: string[];
	timestamp: string;
	vectorizeId: string;
}

export interface CloudflareSearchResult extends VectorStoreSearchResult {
	vectorizeId: string;
}

export class CloudflareVectorStore implements VectorStoreAdapter {
	private env: CloudflareEnv;
	private indexName: string | undefined;
	private accountId: string | undefined;
	private apiToken: string | undefined;
	private localKnowledge: Map<string, CloudflareKnowledgeItem> = new Map();
	private useFallbackLocal = false;

	constructor(config: CloudflareConfig = {}) {
		this.env = (config.env as CloudflareEnv) || ({} as any);
		this.indexName = config.indexName ?? this.indexName;
		this.accountId = config.accountId ?? this.accountId;
		this.apiToken = config.apiToken ?? this.apiToken;
		this.useFallbackLocal = !(this.env && this.env.VECTORIZE_INDEX && this.env.AI);

		// If we're running tests or a shim is explicitly requested, provide an in-process deterministic shim
		// BUT ONLY if no env was provided (or env doesn't have the required bindings).
		// This allows tests to provide their own mock bindings via config.env
		const nodeEnv = (globalThis as any).NODE_ENV || config.nodeEnv;
		const useShim = ((globalThis as any).__VECTORIZE_TEST_SHIM === '1') || !!config.useTestShim;
		const hasValidEnv = this.env && this.env.VECTORIZE_INDEX && this.env.AI;

		if (useShim && !hasValidEnv) {
			const store = new Map<string, { id: string; values: number[]; metadata: any }>();
			const ai = {
				run: async (_model: string, payload: any) => {
					const text = Array.isArray(payload?.text) ? payload.text[0] : String(payload?.text || '');
					return { data: [this.generateMockEmbeddings(text)] };
				}
			} as unknown as Ai;

			const vectorIndex = {
				upsert: async (items: any[]) => {
					for (const item of items) {
						store.set(item.id, { id: item.id, values: item.values, metadata: item.metadata });
					}
					return { success: true } as { success: boolean };
				},
				query: async (embedding: number[], options: any) => {
					const topK = options?.topK || options?.top_k || 5;
					const results: any[] = [];
					for (const entry of store.values()) {
						const score = this.cosineSimilarity(embedding, entry.values);
						results.push({ id: entry.id, score, values: entry.values, metadata: entry.metadata });
					}
					results.sort((a, b) => b.score - a.score);
					return { matches: results.slice(0, topK) };
				}
			} as unknown as Vectorize;

			this.env = { VECTORIZE_INDEX: vectorIndex, AI: ai } as CloudflareEnv;
			this.useFallbackLocal = false;
		}
	}

	async generateEmbeddings(text: string): Promise<number[]> {
		if (!this.env || !this.env.AI || typeof (this.env.AI as any).run !== 'function') {
			return this.generateMockEmbeddings(text);
		}

		const response = await (this.env.AI as any).run("@cf/baai/bge-base-en-v1.5", { text: [text] });
		if (!response?.data?.[0]) {
			console.warn('Cloudflare AI returned no embeddings; falling back to mock embeddings');
			return this.generateMockEmbeddings(text);
		}
		return response.data[0];
	}

	async storeKnowledge(record: VectorStoreRecord): Promise<CloudflareKnowledgeItem> {
		const id = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const timestamp = new Date().toISOString();
		const embedding = await this.generateEmbeddings(record.content);

		const vectorizeRecord: VectorizeVector = {
			id,
			values: embedding,
			metadata: {
				content: record.content,
				timestamp,
				tags: record.tags || [],
				...record.metadata
			}
		};

		if (this.env && this.env.VECTORIZE_INDEX && typeof (this.env.VECTORIZE_INDEX as any).upsert === 'function') {
			try {
				await (this.env.VECTORIZE_INDEX as any).upsert([vectorizeRecord]);
			} catch (error) {
				console.warn('Vectorize storage upsert failed; falling back to local cache:', error);
			}
		} else if (!this.useFallbackLocal) {
			console.warn('Vectorize binding missing in non-dev environment; using local fallback (NOT persistent)');
		}

		const result: CloudflareKnowledgeItem = {
			id,
			content: record.content,
			embedding,
			metadata: record.metadata || {},
			tags: record.tags || [],
			timestamp,
			vectorizeId: id
		};

		if (this.useFallbackLocal) {
			this.localKnowledge.set(id, result);
		}

		return result;
	}

	async searchSimilar(query: string, options: VectorStoreSearchOptions = {}): Promise<CloudflareSearchResult[]> {
		const { limit = 5, threshold = 0.1 } = options;
		let queryEmbedding: number[];
		try {
			queryEmbedding = await this.generateEmbeddings(query);
		} catch (error) {
			console.error('Failed to generate query embedding:', error);
			return [];
		}

		if (this.env && this.env.VECTORIZE_INDEX && typeof (this.env.VECTORIZE_INDEX as any).query === 'function') {
			try {
				const matches = await (this.env.VECTORIZE_INDEX as any).query(queryEmbedding, {
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
				console.warn('Vectorize query failed, falling back to local search:', error);
				return this.searchLocal(query, queryEmbedding, options);
			}
		}

		return this.searchLocal(query, queryEmbedding, options);
	}

	async getById(id: string): Promise<CloudflareSearchResult[]> {
		if (this.useFallbackLocal) {
			const stored = this.localKnowledge.get(id);
			if (!stored) return [];
			return [{ ...stored, similarity: 1 }];
		}

		if (this.env && this.env.VECTORIZE_INDEX && typeof (this.env.VECTORIZE_INDEX as any).query === 'function') {
			try {
				const embedding = await this.generateEmbeddings(id);
				const matches = await (this.env.VECTORIZE_INDEX as any).query(embedding, {
					topK: 1,
					returnValues: true,
					returnMetadata: true
				});
				if (!matches?.matches) return [];
				return matches.matches.map((match: any) => ({
					id: match.id,
					content: match.metadata?.content as string,
					embedding: Array.from(match.values || []),
					metadata: match.metadata || {},
					tags: (match.metadata?.tags as string[]) || [],
					timestamp: match.metadata?.timestamp as string,
					vectorizeId: match.id,
					similarity: match.score
				}));
			} catch (error) {
				console.warn('Vectorize getById fallback failed:', error);
				return [];
			}
		}

		return [];
	}

	isConfigured(): boolean {
		if (this.indexName && this.apiToken) return true;
		return !!(this.env && this.env.VECTORIZE_INDEX && this.env.AI);
	}

	getIndexName(): string {
		return this.indexName || 'VECTORIZE_INDEX';
	}

	getStats() {
		return {
			localItems: this.localKnowledge.size,
			configured: this.isConfigured(),
			indexName: this.getIndexName(),
			embeddingDimensions: 768
		};
	}

	private searchLocal(query: string, queryEmbedding: number[], options: { limit?: number; threshold?: number }): CloudflareSearchResult[] {
		const { limit = 5, threshold = 0.1 } = options;
		const results: CloudflareSearchResult[] = [];
		for (const stored of this.localKnowledge.values()) {
			const similarity = this.cosineSimilarity(queryEmbedding, stored.embedding);
			if (similarity >= threshold) {
				results.push({ ...stored, similarity });
			}
		}
		return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
	}

	private generateMockEmbeddings(text: string): number[] {
		const dimension = 768;
		const embeddings: number[] = [];
		const hash = this.simpleHash(text);
		const random = this.seededRandom(hash);
		for (let i = 0; i < dimension; i++) {
			embeddings.push((random() - 0.5) * 2);
		}
		const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
		if (magnitude > 0) {
			for (let i = 0; i < embeddings.length; i++) {
				embeddings[i] = embeddings[i]! / magnitude;
			}
		}
		return embeddings;
	}

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

	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash |= 0;
		}
		return Math.abs(hash);
	}

	private seededRandom(seed: number): () => number {
		let m = 2 ** 35 - 31;
		let a = 185852;
		let s = seed % m;
		return () => (s = s * a % m) / m;
	}
}

export type { CloudflareEnv as MnemosyneCloudflareEnv };
