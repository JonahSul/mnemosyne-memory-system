/**
 * Forgetting Curve Implementation Tests
 * 
 * Tests for Phase 2 - probabilistic memory decay based on Ebbinghaus research.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiTierMemorySystem, DEFAULT_TIER_CONFIG } from '../packages/mnemosyne/src/multi-tier-memory';

describe('Forgetting Curve Implementation', () => {
	let memorySystem: MultiTierMemorySystem;

	beforeEach(() => {
		memorySystem = new MultiTierMemorySystem();
		vi.useFakeTimers();
		// Stabilize Math.random with a counter so forgetting outcomes are reproducible across test runs.
		let counter = 0;
		vi.spyOn(Math, 'random').mockImplementation(() => {
			counter += 1;
			return (counter % 1000) / 1000;
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('Retention Probability Calculation', () => {
		it('should calculate higher retention probability for important items', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store high importance item
			await memorySystem.storeKnowledge({
				content: 'Critical information',
				targetTier: 'short',
				importance: 0.9
			});

			// Store low importance item
			await memorySystem.storeKnowledge({
				content: 'Trivial information',
				targetTier: 'short',
				importance: 0.1
			});

			// Advance time slightly
			vi.setSystemTime(new Date(startTime.getTime() + 30 * 60 * 1000)); // 30 minutes

			const analytics = memorySystem.getForgettingCurveAnalytics();

			expect(analytics.retentionProbabilities.short).toHaveLength(2);
			expect(analytics.retentionProbabilities.short[0]).toBeGreaterThan(analytics.retentionProbabilities.short[1]);
			expect(analytics.averageRetention.short).toBeGreaterThan(0);
		});

		it('should show decreasing retention probability over time', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			await memorySystem.storeKnowledge({
				content: 'Test memory decay',
				targetTier: 'short',
				importance: 0.5
			});

			// Get initial retention probability
			const analytics1 = memorySystem.getForgettingCurveAnalytics();
			const initialRetention = analytics1.averageRetention.short;

			// Advance time by 1 hour
			vi.setSystemTime(new Date(startTime.getTime() + 60 * 60 * 1000));

			const analytics2 = memorySystem.getForgettingCurveAnalytics();
			const laterRetention = analytics2.averageRetention.short;

			// Retention probability should decrease over time
			expect(laterRetention).toBeLessThan(initialRetention);
		});

		it('should boost retention for frequently accessed items', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store item and access it multiple times
			await memorySystem.storeKnowledge({
				content: 'frequently accessed memory',
				targetTier: 'short',
				importance: 0.3
			});

			// Access the item to boost retention
			await memorySystem.searchSimilar('frequently', { threshold: 0.01 });

			// Advance time
			vi.setSystemTime(new Date(startTime.getTime() + 30 * 60 * 1000));

			const analytics = memorySystem.getForgettingCurveAnalytics();

			// Should have reasonable retention due to access boost
			expect(analytics.averageRetention.short).toBeGreaterThan(0.3);
		});
	});

	describe('Probabilistic Forgetting', () => {
		it('should probabilistically forget items over time', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store many low-importance items to test probabilistic removal
			const initialCount = 20;
			for (let i = 0; i < initialCount; i++) {
				await memorySystem.storeKnowledge({
					content: `Low importance item ${i}`,
					targetTier: 'short',
					importance: 0.1
				});
			}

			const beforeStats = memorySystem.getMemoryStats();
			expect(beforeStats.short.count).toBe(initialCount);

			// Advance time to trigger forgetting curves
			vi.setSystemTime(new Date(startTime.getTime() + 45 * 60 * 1000)); // 45 minutes

			const gcResult = await memorySystem.runGarbageCollection();
			const afterStats = memorySystem.getMemoryStats();

			// Some items should be forgotten probabilistically
			expect(afterStats.short.count).toBeLessThan(beforeStats.short.count);
			expect(gcResult.expiredItemsRemoved.total).toBeGreaterThan(0);
		});

		it('should preserve high-importance items despite forgetting curves', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store high-importance items
			for (let i = 0; i < 5; i++) {
				await memorySystem.storeKnowledge({
					content: `Critical item ${i}`,
					targetTier: 'short',
					importance: 0.95
				});
			}

			// Advance time significantly
			vi.setSystemTime(new Date(startTime.getTime() + 90 * 60 * 1000)); // 1.5 hours

			await memorySystem.runGarbageCollection();
			const afterStats = memorySystem.getMemoryStats();

			// High importance items should mostly survive
			expect(afterStats.short.count).toBeGreaterThanOrEqual(3);
		});
	});

	describe('Forgetting Curve Analytics', () => {
		it('should identify items at risk of being forgotten', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store mix of items
			await memorySystem.storeKnowledge({
				content: 'Safe item',
				targetTier: 'short',
				importance: 0.8
			});

			await memorySystem.storeKnowledge({
				content: 'At risk item',
				targetTier: 'short',
				importance: 0.1
			});

			// Advance time significantly to trigger decay (2 hours - near retention limit)
			vi.setSystemTime(new Date(startTime.getTime() + 2 * 60 * 60 * 1000)); // 2 hours

			const analytics = memorySystem.getForgettingCurveAnalytics();

			expect(analytics.itemsAtRisk.short).toBeGreaterThan(0);
			expect(analytics.averageRetention.short).toBeLessThan(1.0);
		});

		it('should provide retention probability distributions', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store items with different characteristics
			for (let i = 0; i < 5; i++) {
				await memorySystem.storeKnowledge({
					content: `Test item ${i}`,
					targetTier: 'short',
					importance: i * 0.2 // 0.0 to 0.8
				});
			}

			const analytics = memorySystem.getForgettingCurveAnalytics();

			expect(analytics.retentionProbabilities.short).toHaveLength(5);
			expect(analytics.averageRetention.short).toBeGreaterThan(0);
			expect(analytics.averageRetention.short).toBeLessThan(1);
		});
	});

	describe('Integration with Existing Systems', () => {
		it('should work with tier promotion system', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			await memorySystem.storeKnowledge({
				content: 'promotable item',
				targetTier: 'short',
				importance: 0.5
			});

			// Access enough times to promote (threshold is 3)
			for (let i = 0; i < 4; i++) {
				await memorySystem.searchSimilar('promotable', { threshold: 0.01 });
			}

			// Item should be promoted to intermediate tier
			const stats = memorySystem.getMemoryStats();
			expect(stats.intermediate.count).toBe(1);
			expect(stats.short.count).toBe(0);

			// Forgetting curves should work on intermediate tier too
			const analytics = memorySystem.getForgettingCurveAnalytics();
			expect(analytics.retentionProbabilities.intermediate).toHaveLength(1);
		});

		it('should complement capacity-based pruning', async () => {
			// Use small capacity for testing
			const smallConfig = {
				...DEFAULT_TIER_CONFIG,
				short: {
					...DEFAULT_TIER_CONFIG.short,
					maxItems: 3
				}
			};

			const smallMemorySystem = new MultiTierMemorySystem(smallConfig);

			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Fill beyond capacity with mixed importance
			await smallMemorySystem.storeKnowledge({
				content: 'Item 1',
				targetTier: 'short',
				importance: 0.1
			});

			await smallMemorySystem.storeKnowledge({
				content: 'Item 2',
				targetTier: 'short',
				importance: 0.9
			});

			await smallMemorySystem.storeKnowledge({
				content: 'Item 3',
				targetTier: 'short',
				importance: 0.1
			});

			// Advance time and add new item to trigger both forgetting curves and capacity pruning
			vi.setSystemTime(new Date(startTime.getTime() + 30 * 60 * 1000));

			await smallMemorySystem.storeKnowledge({
				content: 'New item',
				targetTier: 'short',
				importance: 0.5
			});

			const stats = smallMemorySystem.getMemoryStats();
			expect(stats.short.count).toBeLessThanOrEqual(3);

			// High importance item should likely survive
			const searchResults = await smallMemorySystem.searchSimilar('Item 2', { threshold: 0.01 });
			expect(searchResults.length).toBeGreaterThan(0);
		});
	});
});
