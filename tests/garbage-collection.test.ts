/**
 * Memory Garbage Collection Tests
 * 
 * Tests for time-based memory expiration and human-like forgetting curves.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiTierMemorySystem, DEFAULT_TIER_CONFIG } from '../src/multi-tier-memory';

describe('Memory Garbage Collection', () => {
	let memorySystem: MultiTierMemorySystem;
	
	beforeEach(() => {
		memorySystem = new MultiTierMemorySystem();
		// Mock current time for predictable tests
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Time-Based Expiration', () => {
		it('should remove expired items based on retentionHours', async () => {
			// Set initial time
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store items in different tiers
			await memorySystem.storeKnowledge({
				content: 'Short-term item',
				targetTier: 'short',
				importance: 0.3
			});

			await memorySystem.storeKnowledge({
				content: 'Intermediate item',
				targetTier: 'intermediate', 
				importance: 0.5
			});

			await memorySystem.storeKnowledge({
				content: 'Long-term item',
				targetTier: 'long',
				importance: 0.7
			});

			// Verify initial state
			let stats = memorySystem.getMemoryStats();
			expect(stats.short.count).toBe(1);
			expect(stats.intermediate.count).toBe(1);
			expect(stats.long.count).toBe(1);

			// Advance time by 3 hours (should expire short-term items - 2h retention)
			vi.setSystemTime(new Date(startTime.getTime() + 3 * 60 * 60 * 1000));

			// Run garbage collection
			const gcResult = await memorySystem.runGarbageCollection();

			// Verify short-term item expired
			stats = memorySystem.getMemoryStats();
			expect(stats.short.count).toBe(0);
			expect(stats.intermediate.count).toBe(1);
			expect(stats.long.count).toBe(1);
			expect(gcResult.expiredItemsRemoved.short).toBe(1);
			expect(gcResult.expiredItemsRemoved.total).toBe(1);
		});

		it('should spare high importance items from expiration', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store high-importance short-term item
			await memorySystem.storeKnowledge({
				content: 'Critical short-term item',
				targetTier: 'short',
				importance: 0.95 // Very high importance
			});

			// Store low-importance short-term item
			await memorySystem.storeKnowledge({
				content: 'Unimportant short-term item',
				targetTier: 'short',
				importance: 0.1 // Low importance
			});

			// Advance time beyond retention
			vi.setSystemTime(new Date(startTime.getTime() + 5 * 60 * 60 * 1000));

			const gcResult = await memorySystem.runGarbageCollection();

			// High importance item should be spared, low importance should expire
			const stats = memorySystem.getMemoryStats();
			expect(stats.short.count).toBe(1); // One item spared
			expect(gcResult.expiredItemsRemoved.short).toBe(1); // One item expired
			expect(gcResult.itemsSpared.short).toBe(1); // One item spared
		});

		it('should spare recently accessed items from expiration', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Store item with moderate importance
			const item = await memorySystem.storeKnowledge({
				content: 'recently accessed item',
				targetTier: 'short',
				importance: 0.6 // Above 0.5 threshold for recent access sparing
			});

			// Access the item once to update lastAccessed
			await memorySystem.searchSimilar('recently', { threshold: 0.01, limit: 1 });

			// Advance time to just beyond retention but within recent access window (less than 24h)
			vi.setSystemTime(new Date(startTime.getTime() + 3 * 60 * 60 * 1000)); // 3 hours later

			const gcResult = await memorySystem.runGarbageCollection();

			// Recently accessed item should be spared due to recent access + importance >= 0.5
			const stats = memorySystem.getMemoryStats();
			expect(stats.short.count).toBe(1);
			expect(gcResult.itemsSpared.short).toBe(1);
		});
	});

	describe('Memory Health Monitoring', () => {
		it('should provide memory health statistics', async () => {
			// Add some items to create a realistic scenario
			for (let i = 0; i < 30; i++) {
				await memorySystem.storeKnowledge({
					content: `Test item ${i}`,
					importance: Math.random(),
					targetTier: 'short'
				});
			}

			const health = memorySystem.getMemoryHealth();

			expect(health.tiersHealth.short).toBeDefined();
			expect(['underutilized', 'healthy', 'overloaded']).toContain(health.tiersHealth.short);
			expect(health.expirationStats).toBeDefined();
			expect(health.recommendations).toBeDefined();
			expect(Array.isArray(health.recommendations)).toBe(true);
		});

		it('should identify items near expiration', async () => {
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			await memorySystem.storeKnowledge({
				content: 'Item approaching expiration',
				targetTier: 'short',
				importance: 0.3
			});

			// Advance time to 95% of retention period (1.9 hours of 2 hour retention)
			vi.setSystemTime(new Date(startTime.getTime() + 1.9 * 60 * 60 * 1000));

			const health = memorySystem.getMemoryHealth();
			expect(health.expirationStats.itemsNearExpiration).toBeGreaterThan(0);
		});
	});

	describe('Integration with Existing Pruning', () => {
		it('should run time-based expiration before capacity pruning', async () => {
			// Use very small capacity for testing
			const smallConfig = {
				...DEFAULT_TIER_CONFIG,
				short: {
					...DEFAULT_TIER_CONFIG.short,
					maxItems: 2 // Very small capacity
				}
			};
			
			const smallMemorySystem = new MultiTierMemorySystem(smallConfig);
			
			const startTime = new Date('2025-08-21T12:00:00Z');
			vi.setSystemTime(startTime);

			// Fill up beyond capacity
			await smallMemorySystem.storeKnowledge({
				content: 'Item 1',
				targetTier: 'short',
				importance: 0.3
			});
			
			await smallMemorySystem.storeKnowledge({
				content: 'Item 2', 
				targetTier: 'short',
				importance: 0.4
			});
			
			await smallMemorySystem.storeKnowledge({
				content: 'Item 3',
				targetTier: 'short',
				importance: 0.5
			});

			// Advance time to expire old items
			vi.setSystemTime(new Date(startTime.getTime() + 3 * 60 * 60 * 1000));

			// Add another item to trigger pruning
			await smallMemorySystem.storeKnowledge({
				content: 'New item',
				targetTier: 'short',
				importance: 0.6
			});

			// Should have removed expired items first, then capacity-based pruning
			const stats = smallMemorySystem.getMemoryStats();
			expect(stats.short.count).toBeLessThanOrEqual(2);
		});
	});
});
