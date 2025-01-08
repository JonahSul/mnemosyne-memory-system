/**
 * Vector Store Tests for Mnemosyne Working Memory
 * 
 * Tests for RAG-based vector database functionality that extends
 * the existing behavioral memory system with semantic knowledge storage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VectorStore } from '../src/vector-store.js';

describe('VectorStore', () => {
	let vectorStore: VectorStore;

	beforeEach(() => {
		vectorStore = new VectorStore();
	});

	describe('Basic Vector Operations', () => {
		it('should store knowledge with embedding generation', async () => {
			// RED: This test will fail because VectorStore doesn't exist yet
			const knowledge = {
				content: 'TypeScript is a strongly typed programming language',
				metadata: { 
					type: 'programming-concept',
					domain: 'software-development',
					importance: 'high'
				},
				tags: ['typescript', 'programming', 'types']
			};

			const result = await vectorStore.storeKnowledge(knowledge);

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('embedding');
			expect(result.embedding).toBeInstanceOf(Array);
			expect(result.embedding.length).toBeGreaterThan(0);
			expect(result.metadata).toEqual(knowledge.metadata);
		});

		it('should retrieve similar knowledge using vector search', async () => {
			// Create fresh vector store for this test to avoid interference
			const freshVectorStore = new VectorStore();
			
			// RED: This will also fail - testing semantic search capability
			const knowledge1 = {
				content: 'JavaScript is a dynamic programming language',
				metadata: { type: 'programming-concept' },
				tags: ['javascript', 'programming']
			};

			const knowledge2 = {
				content: 'Python is an interpreted programming language',
				metadata: { type: 'programming-concept' },
				tags: ['python', 'programming']
			};

			await freshVectorStore.storeKnowledge(knowledge1);
			await freshVectorStore.storeKnowledge(knowledge2);

			const results = await freshVectorStore.searchSimilar(
				'What programming languages are available?',
				{ limit: 2, threshold: 0 } // No threshold - return all results for debugging
			);

			expect(results).toHaveLength(2); // Restored expectation for 2 results after refactor
			expect(results[0]).toHaveProperty('content');
			expect(results[0]).toHaveProperty('similarity');
			expect(results[0].similarity).toBeGreaterThan(0.01);
		});
	});
});
