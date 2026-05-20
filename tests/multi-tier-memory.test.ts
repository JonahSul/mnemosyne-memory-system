/**
 * Multi-Tier Memory System Tests
 * 
 * Tests for hierarchical memory management with automatic promotion and pruning.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MultiTierMemorySystem, DEFAULT_TIER_CONFIG } from '../packages/mnemosyne/src/multi-tier-memory';

describe('MultiTierMemorySystem', () => {
	let memorySystem: MultiTierMemorySystem;

	beforeEach(() => {
		memorySystem = new MultiTierMemorySystem();
	});

	describe('Basic Tier Management', () => {
		it('should store knowledge in appropriate tier based on importance', async () => {
			// High importance -> long-term
			const highImportance = await memorySystem.storeKnowledge({
				content: 'Critical system knowledge',
				importance: 0.9
			});
			expect(highImportance.tier).toBe('long');
			expect(highImportance.importance).toBe(0.9);

			// Medium importance -> intermediate-term
			const mediumImportance = await memorySystem.storeKnowledge({
				content: 'Moderately important knowledge',
				importance: 0.7
			});
			expect(mediumImportance.tier).toBe('intermediate');

			// Low importance -> short-term
			const lowImportance = await memorySystem.storeKnowledge({
				content: 'Temporary working knowledge',
				importance: 0.3
			});
			expect(lowImportance.tier).toBe('short');
		});

		it('should allow explicit tier targeting', async () => {
			const knowledge = await memorySystem.storeKnowledge({
				content: 'Force into long-term storage',
				importance: 0.1, // Low importance but explicit targeting
				targetTier: 'long'
			});
			
			expect(knowledge.tier).toBe('long');
			expect(knowledge.importance).toBe(0.1);
		});

		it('should track access patterns correctly', async () => {
			const knowledge = await memorySystem.storeKnowledge({
				content: 'Access tracking test',
				importance: 0.3
			});

			expect(knowledge.accessCount).toBe(0);
			
			// Search should increment access count
			await memorySystem.searchSimilar('access tracking', { threshold: 0.1 });
			
			// Access count should be incremented (we can't easily verify this without exposing internals)
			// This is more of an integration test
		});
	});

	describe('Cross-Tier Search', () => {
		it('should search across all tiers with tier-aware ranking', async () => {
			// Store same content in different tiers
			await memorySystem.storeKnowledge({
				content: 'JavaScript programming concepts',
				targetTier: 'short',
				importance: 0.3
			});

			await memorySystem.storeKnowledge({
				content: 'JavaScript programming fundamentals',
				targetTier: 'intermediate', 
				importance: 0.6
			});

			await memorySystem.storeKnowledge({
				content: 'JavaScript programming principles',
				targetTier: 'long',
				importance: 0.9
			});

			const results = await memorySystem.searchSimilar('JavaScript programming', {
				limit: 3,
				threshold: 0.1
			});

			expect(results.length).toBeGreaterThan(0);
			// Higher tier items should rank higher due to tier boost
			expect(results[0].tier).toBe('long'); // Should be first due to tier boosting
		});

		it('should support tier-specific search', async () => {
			await memorySystem.storeKnowledge({
				content: 'Short-term knowledge',
				targetTier: 'short'
			});

			await memorySystem.storeKnowledge({
				content: 'Long-term knowledge', 
				targetTier: 'long'
			});

			// Search only short-term
			const shortResults = await memorySystem.searchSimilar('knowledge', {
				tierPreference: 'short',
				threshold: 0.1
			});

			expect(shortResults.length).toBe(1);
			expect(shortResults[0].tier).toBe('short');

			// Search only long-term
			const longResults = await memorySystem.searchSimilar('knowledge', {
				tierPreference: 'long',
				threshold: 0.1
			});

			expect(longResults.length).toBe(1);
			expect(longResults[0].tier).toBe('long');
		});
	});

	describe('Memory Statistics', () => {
		it('should provide accurate memory statistics', async () => {
			const initialStats = memorySystem.getMemoryStats();
			expect(initialStats.total.count).toBe(0);

			// Add items to different tiers
			await memorySystem.storeKnowledge({
				content: 'Short-term item',
				targetTier: 'short'
			});

			await memorySystem.storeKnowledge({
				content: 'Intermediate item',
				targetTier: 'intermediate'
			});

			await memorySystem.storeKnowledge({
				content: 'Long-term item',
				targetTier: 'long'
			});

			const stats = memorySystem.getMemoryStats();
			expect(stats.short.count).toBe(1);
			expect(stats.intermediate.count).toBe(1);
			expect(stats.long.count).toBe(1);
			expect(stats.total.count).toBe(3);

			// Check capacity calculations
			expect(stats.short.capacity).toBe(DEFAULT_TIER_CONFIG.short.maxItems);
			expect(stats.short.utilizationPercent).toBe((1 / DEFAULT_TIER_CONFIG.short.maxItems) * 100);
		});
	});

	describe('Tier Configuration', () => {
		it('should use custom tier configuration', async () => {
			const customConfig = {
				short: {
					name: 'custom-short',
					maxItems: 10,
					retentionHours: 1,
					accessThreshold: 2,
					pruningStrategy: 'lru' as const
				},
				intermediate: {
					name: 'custom-intermediate',
					maxItems: 20,
					retentionHours: 12,
					accessThreshold: 4,
					pruningStrategy: 'frequency' as const
				},
				long: {
					name: 'custom-long',
					maxItems: 50,
					retentionHours: 168,
					accessThreshold: 0,
					pruningStrategy: 'importance' as const
				}
			};

			const customMemory = new MultiTierMemorySystem(customConfig);
			const stats = customMemory.getMemoryStats();

			expect(stats.short.capacity).toBe(10);
			expect(stats.intermediate.capacity).toBe(20);
			expect(stats.long.capacity).toBe(50);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty search queries', async () => {
			const results = await memorySystem.searchSimilar('', { threshold: 0.1 });
			expect(Array.isArray(results)).toBe(true);
		});

		it('should handle very high similarity thresholds', async () => {
			await memorySystem.storeKnowledge({
				content: 'Test knowledge for high threshold'
			});

			const results = await memorySystem.searchSimilar('test', { threshold: 0.99 });
			expect(Array.isArray(results)).toBe(true);
		});

		it('should handle metadata and tags correctly', async () => {
			const knowledge = await memorySystem.storeKnowledge({
				content: 'Tagged knowledge',
				metadata: { type: 'test', category: 'experimental' },
				tags: ['test', 'experimental', 'memory']
			});

			expect(knowledge.metadata).toMatchObject({ type: 'test', category: 'experimental' });
			expect(knowledge.tags).toEqual(['test', 'experimental', 'memory']);
		});
	});
});
