import 'dotenv/config';
import { beforeEach, describe, expect, it } from 'vitest';
import { CloudflareVectorStore } from '@mnemosyne/cloudflare/vector-store';

describe('Cloudflare Vectorize Integration', () => {
	let vectorStore: CloudflareVectorStore;

	beforeEach(() => {
		vectorStore = new CloudflareVectorStore({
			indexName: process.env.CLOUDFLARE_VECTORIZE_INDEX || 'mnemosyne-memory-index',
			accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '55b26a9d0b923a4f304b652aaac6fc16',
			apiToken: process.env.CLOUDFLARE_API_TOKEN || 'test-token-fallback-to-mocks'
		});
	});

	describe('Real Embeddings Generation', () => {
		it('should generate embeddings using Cloudflare AI Workers', async () => {
			const embeddings = await vectorStore.generateEmbeddings('test knowledge content');

			expect(Array.isArray(embeddings)).toBe(true);
			expect(embeddings.length).toBeGreaterThan(0);
			expect(embeddings.every(value => typeof value === 'number')).toBe(true);
		});

		it('should handle different text lengths for embeddings', async () => {
			const shortEmbedding = await vectorStore.generateEmbeddings('Short text');
			const longEmbedding = await vectorStore.generateEmbeddings('This is a much longer piece of text that should still generate embeddings suitable for semantic search.');

			expect(shortEmbedding.length).toBe(longEmbedding.length);
			expect(shortEmbedding).not.toEqual(longEmbedding);
		});
	});

	describe('Vectorize Storage Integration', () => {
		it('should store knowledge in Cloudflare Vectorize', async () => {
			const knowledge = {
				content: 'Important knowledge about vector databases',
				metadata: { type: 'technical', domain: 'databases' },
				tags: ['vectordb', 'cloudflare']
			};

			const result = await vectorStore.storeKnowledge(knowledge);

			expect(result.id).toBeDefined();
			expect(result.content).toBe(knowledge.content);
			expect(Array.isArray(result.embedding)).toBe(true);
			expect(result.vectorizeId).toBeDefined();
		});

		it('should search knowledge using Vectorize similarity search', async () => {
			await vectorStore.storeKnowledge({
				content: 'Python programming language basics',
				metadata: { type: 'programming' },
				tags: ['python', 'basics']
			});

			await vectorStore.storeKnowledge({
				content: 'JavaScript async/await patterns',
				metadata: { type: 'programming' },
				tags: ['javascript', 'async']
			});

			const results = await vectorStore.searchSimilar('programming languages', { limit: 5, threshold: 0 });

			expect(results.length).toBeGreaterThan(0);
			const topResult = results[0];
			expect(topResult).toBeDefined();
			if (!topResult) {
				throw new Error('Expected at least one search result from the shimmed vector store.');
			}
			expect(typeof topResult.similarity).toBe('number');
			expect(results.every(entry => !!(entry.vectorizeId || entry.id))).toBe(true);
		});

		it('should expose configuration helpers for deployment', () => {
			const productionStore = new CloudflareVectorStore({
				indexName: 'mnemosyne-memory',
				accountId: 'test-account-id',
				apiToken: 'test-api-token'
			});

			expect(typeof productionStore.isConfigured()).toBe('boolean');
			expect(productionStore.getIndexName()).toBe('mnemosyne-memory');
		});
	});

	describe('Backward Compatibility', () => {
		it('should maintain VectorStore interface compatibility', async () => {
			const storeResult = await vectorStore.storeKnowledge({ content: 'Test compatibility knowledge', metadata: {}, tags: [] });
			const searchResults = await vectorStore.searchSimilar('test', { limit: 1 });

			expect(typeof vectorStore.storeKnowledge).toBe('function');
			expect(typeof vectorStore.searchSimilar).toBe('function');
			expect(storeResult).toHaveProperty('id');
			expect(Array.isArray(searchResults)).toBe(true);
		});
	});
});
