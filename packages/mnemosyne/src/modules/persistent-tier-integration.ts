/**
 * Persistent Tier Memory Integration - Foundation v1.8.0
 * 
 * REPLACES VOLATILE MULTITIER: Integration layer that replaces MultiTierMemorySystem
 * volatile Maps with KV-first write-through architecture using PersistentTierMemorySystem.
 * 
 * This provides drop-in replacement for simplified-registry.ts and other components
 * that currently use the volatile MultiTierMemorySystem.
 */

import { PersistentTierMemorySystem, type PersistentTierItem, type TierStorageConfig } from './persistent-tier-memory';
import type { KeyValueStoreAdapter, VectorStoreAdapter } from '../interfaces/storage';

/**
 * Drop-in replacement interface matching original MultiTierMemorySystem
 */
export interface TieredKnowledgeItem {
	id: string;
	content: string;
	embedding?: number[];
	metadata: Record<string, unknown>;
	tags: string[];
	timestamp: string;
	tier: 'axiom' | 'long' | 'intermediate' | 'short';
	accessCount: number;
	lastAccessed: string;
	importance: number;
	promotionEligible: boolean;
	significanceWeight: number;
	semanticWeight: number;
	combinedWeight: number;
	weightHistory: Array<{
		timestamp: string;
		significance: number;
		semantic: number;
		combined: number;
		reason: string;
	}>;
}

/**
 * Adapter to convert PersistentTierItem to TieredKnowledgeItem
 */
function adaptPersistentToTiered(item: PersistentTierItem): TieredKnowledgeItem {
	return {
		id: item.id,
		content: item.content,
		...(item.embedding && { embedding: item.embedding }),
		metadata: item.metadata,
		tags: item.tags,
		timestamp: item.timestamp,
		tier: item.tier,
		accessCount: item.accessCount,
		lastAccessed: item.lastAccessed,
		importance: item.importance,
		promotionEligible: item.promotionEligible,
		significanceWeight: item.significanceWeight,
		semanticWeight: item.semanticWeight,
		combinedWeight: item.combinedWeight,
		weightHistory: item.weightHistory
	};
}

/**
 * Persistent MultiTier Memory System - Drop-in replacement for volatile version
 * 
 * CRITICAL CHANGE: Eliminates all volatile Map storage, replaces with KV-first architecture
 */
export class PersistentMultiTierMemorySystem {
	private persistentTiers: PersistentTierMemorySystem;
	private initialized: boolean = false;

	constructor(storage: TierStorageConfig) {
		this.persistentTiers = new PersistentTierMemorySystem(storage);
		this.initialized = true;
	}

	/**
	 * Store knowledge with persistent tier placement - NO VOLATILE STORAGE
	 */
	async storeKnowledge(params: {
		content: string;
		metadata?: Record<string, unknown>;
		tags?: string[];
		importance: number;
		targetTier?: 'axiom' | 'long' | 'intermediate' | 'short';
	}): Promise<string> {
		if (!this.initialized) {
			throw new Error('PersistentMultiTierMemorySystem not initialized');
		}

		// Add enhanced metadata to track storage source
		const enhancedMetadata = {
			...params.metadata,
			storage_type: 'persistent_kv_vector',
			storage_timestamp: new Date().toISOString(),
			architecture_version: 'v1.8.0_persistent',
			eliminated_volatile: true
		};

		const id = await this.persistentTiers.storeKnowledge({
			content: params.content,
			metadata: enhancedMetadata,
			tags: [...(params.tags || []), 'persistent_storage', 'kv_first'],
			importance: params.importance,
			...(params.targetTier && { targetTier: params.targetTier })
		});

		return id;
	}

	/**
	 * Search across persistent tiers with tier boosting
	 */
	async search(params: {
		query: string;
		threshold?: number;
		maxResults?: number;
		tierBoosts?: Record<string, number>;
	}): Promise<TieredKnowledgeItem[]> {
		if (!this.initialized) {
			throw new Error('PersistentMultiTierMemorySystem not initialized');
		}

		const results = await this.persistentTiers.search(
			params.query, 
			params.maxResults || 10
		);

		return results.map(adaptPersistentToTiered);
	}

	/**
	 * Get knowledge item by ID from persistent storage
	 */
	async getKnowledge(id: string): Promise<TieredKnowledgeItem | null> {
		if (!this.initialized) {
			throw new Error('PersistentMultiTierMemorySystem not initialized');
		}

		const item = await this.persistentTiers.get(id);
		return item ? adaptPersistentToTiered(item) : null;
	}

	/**
	 * Process tier promotions based on access patterns
	 */
	async processPromotions(): Promise<{
		promotionResults: { promoted: number; errors: string[] };
		summary: string;
	}> {
		if (!this.initialized) {
			throw new Error('PersistentMultiTierMemorySystem not initialized');
		}

		const promoted = await this.persistentTiers.processPromotions();
		
		return {
			promotionResults: {
				promoted,
				errors: []
			},
			summary: `Processed ${promoted} tier promotions using persistent storage`
		};
	}

	/**
	 * Get system statistics from persistent tiers
	 */
	async getStats(): Promise<{
		tiers: any[];
		totalKnowledge: number;
		memoryUtilization: any;
		persistenceHealth: 'healthy' | 'degraded' | 'critical';
	}> {
		if (!this.initialized) {
			throw new Error('PersistentMultiTierMemorySystem not initialized');
		}

		const stats = await this.persistentTiers.getStats();
		
		return {
			tiers: stats.tiers,
			totalKnowledge: stats.totalItems,
			memoryUtilization: {
				persistence_enabled: true,
				volatile_storage_eliminated: true,
				kv_first_architecture: true,
				vector_backup_enabled: true
			},
			persistenceHealth: stats.systemHealth
		};
	}

	/**
	 * Export all persistent data
	 */
	async exportMemory(): Promise<{
		version: string;
		timestamp: string;
		storage_type: string;
		data: any;
	}> {
		if (!this.initialized) {
			throw new Error('PersistentMultiTierMemorySystem not initialized');
		}

		const exportData = await this.persistentTiers.exportAll();
		
		return {
			version: 'v1.8.0_persistent',
			timestamp: new Date().toISOString(),
			storage_type: 'kv_first_vector_backup',
			data: exportData
		};
	}

	/**
	 * Health check for persistent storage
	 */
	async healthCheck(): Promise<{
		status: 'healthy' | 'degraded' | 'critical';
		details: {
			persistent_storage: boolean;
			volatile_eliminated: boolean;
			kv_operational: boolean;
			vector_operational: boolean;
		};
	}> {
		if (!this.initialized) {
			return {
				status: 'critical',
				details: {
					persistent_storage: false,
					volatile_eliminated: false,
					kv_operational: false,
					vector_operational: false
				}
			};
		}

		const stats = await this.persistentTiers.getStats();
		const operational = stats.systemHealth === 'healthy';

		return {
			status: stats.systemHealth,
			details: {
				persistent_storage: true,
				volatile_eliminated: true,
				kv_operational: operational,
				vector_operational: operational
			}
		};
	}

	/**
	 * Initialize from existing MultiTierMemorySystem data (migration helper)
	 */
	static async migrateFromVolatile(
		volatileData: TieredKnowledgeItem[], 
		storage: TierStorageConfig
	): Promise<PersistentMultiTierMemorySystem> {
		const persistentSystem = new PersistentMultiTierMemorySystem(storage);
		
		// Migrate each item to persistent storage
		for (const item of volatileData) {
			try {
				await persistentSystem.storeKnowledge({
					content: item.content,
					metadata: {
						...item.metadata,
						migrated_from_volatile: true,
						migration_timestamp: new Date().toISOString(),
						original_id: item.id
					},
					tags: [...item.tags, 'migrated_from_volatile'],
					importance: item.importance,
					targetTier: item.tier
				});
			} catch (error) {
				console.error(`Failed to migrate item ${item.id}:`, error);
			}
		}

		return persistentSystem;
	}
}

/**
 * Factory function for creating persistent tier system
 */
export function createPersistentMultiTierMemorySystem(params: {
	kv: KeyValueStoreAdapter;
	vectorStore: VectorStoreAdapter;
	keyPrefix?: string;
}): PersistentMultiTierMemorySystem {
	const storage: TierStorageConfig = {
		kv: params.kv,
		vectorStore: params.vectorStore,
		keyPrefix: params.keyPrefix || 'persistent_tier:'
	};

	return new PersistentMultiTierMemorySystem(storage);
}

/**
 * Type guard to check if system uses persistent storage
 */
export function isPersistentTierSystem(system: any): system is PersistentMultiTierMemorySystem {
	return system instanceof PersistentMultiTierMemorySystem;
}

export type { TierStorageConfig, PersistentTierItem };
