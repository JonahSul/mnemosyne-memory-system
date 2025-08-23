/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Vector Knowledge Tools - Focused Subsystem
 * 
 * Dedicated tools for vector-based knowledge storage and semantic search.
 * Provides clean separation from behavioral memory for RAG-based operations.
 */

import { VectorStore, KnowledgeItem, SearchResult, SearchOptions } from '../vector-store.js';
import { MultiTierMemorySystem } from '../multi-tier-memory.js';

export interface KnowledgeStorageResult {
	id: string;
	embedding: number[];
	validated: boolean;
	latency: number;
}

export interface SemanticSearchResult {
	results: SearchResult[];
	queryTime: number;
	threshold: number;
	totalFound: number;
}

export interface TieredSearchResult {
	results: Array<SearchResult & { tier: string }>;
	queryTime: number;
	tierDistribution: Record<string, number>;
}

/**
 * Vector Knowledge Tools
 * 
 * Focused tools for vector-based knowledge management including semantic storage,
 * search, and tiered memory operations. Optimized for RAG-based workflows.
 */
export class VectorKnowledgeTools {
	private vectorStore: VectorStore;
	private multiTierMemory: MultiTierMemorySystem;

	constructor() {
		this.vectorStore = new VectorStore();
		this.multiTierMemory = new MultiTierMemorySystem();
	}

	/**
	 * Store knowledge with semantic embeddings and validation
	 */
	async storeKnowledge(knowledge: KnowledgeItem): Promise<KnowledgeStorageResult> {
		const startTime = performance.now();
		
		const result = await this.vectorStore.storeKnowledge(knowledge);
		
		// Immediate validation - verify storage worked
		const validationResults = await this.vectorStore.searchSimilar(knowledge.content, {
			limit: 1,
			threshold: 0.9
		});
		
		const validated = validationResults.some(item => 
			item.content === knowledge.content && item.similarity >= 0.4 // Using discovered calibration
		);

		const latency = performance.now() - startTime;

		return {
			id: result.id,
			embedding: result.embedding,
			validated,
			latency: Math.round(latency * 1000) / 1000
		};
	}

	/**
	 * Semantic search with empirically calibrated thresholds
	 */
	async searchKnowledge(query: string, options: SearchOptions = {}): Promise<SemanticSearchResult> {
		const startTime = performance.now();
		
		// Apply empirically discovered threshold calibration
		const calibratedOptions: SearchOptions = {
			limit: options.limit || 8,
			threshold: options.threshold || 0.1 // Default to discovered optimal threshold
		};

		const results = await this.vectorStore.searchSimilar(query, calibratedOptions);
		const queryTime = performance.now() - startTime;

		return {
			results,
			queryTime: Math.round(queryTime * 1000) / 1000,
			threshold: calibratedOptions.threshold!,
			totalFound: results.length
		};
	}

	/**
	 * Tiered memory search with tier-aware ranking
	 */
	async searchTiered(query: string, options: {
		tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
		limit?: number;
		threshold?: number;
	} = {}): Promise<TieredSearchResult> {
		const startTime = performance.now();
		
		const calibratedOptions = {
			tierPreference: options.tierPreference || 'all',
			limit: options.limit || 8,
			threshold: options.threshold || 0.1 // Apply discovered calibration
		};

		const results = await this.multiTierMemory.searchSimilar(query, calibratedOptions);
		const queryTime = performance.now() - startTime;

		// Calculate tier distribution
		const tierDistribution: Record<string, number> = {};
		for (const result of results) {
			tierDistribution[result.tier] = (tierDistribution[result.tier] || 0) + 1;
		}

		return {
			results,
			queryTime: Math.round(queryTime * 1000) / 1000,
			tierDistribution
		};
	}

	/**
	 * Store knowledge in tiered memory with importance-based placement
	 */
	async storeTieredKnowledge(knowledge: {
		content: string;
		importance?: number;
		targetTier?: 'short' | 'intermediate' | 'long';
		metadata?: Record<string, any>;
		tags?: string[];
	}): Promise<{ id: string; tier: string }> {
		return await this.multiTierMemory.storeKnowledge(knowledge);
	}

	/**
	 * Get comprehensive memory statistics across all systems
	 */
	getKnowledgeStats(): {
		vectorStore: any;
		tieredMemory: any;
		searchCalibration: {
			recommendedThreshold: number;
			expectedSimilarityRanges: {
				exact: string;
				good: string;
				poor: string;
			};
		};
	} {
		return {
			vectorStore: {
				// Vector store doesn't expose stats directly, could be enhanced
				status: 'operational'
			},
			tieredMemory: this.multiTierMemory.getMemoryStats(),
			searchCalibration: {
				recommendedThreshold: 0.1,
				expectedSimilarityRanges: {
					exact: '40-50%',
					good: '20-30%',
					poor: '<10%'
				}
			}
		};
	}

	/**
	 * Optimize search thresholds based on workload characteristics
	 */
	tuneSearchThresholds(workload: {
		type: 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging';
		complexity?: 'simple' | 'moderate' | 'complex';
		expectedResults?: number;
	}): { threshold: number; description: string } {
		let threshold: number;
		let description: string;

		switch (workload.type) {
			case 'exploration':
				threshold = 0.02;
				description = 'Very inclusive for discovery';
				break;
			case 'precision':
				threshold = 0.25;
				description = 'High threshold for accuracy';
				break;
			case 'recall':
				threshold = 0.05;
				description = 'Low threshold for completeness';
				break;
			case 'debugging':
				threshold = 0.08;
				description = 'Adaptive for troubleshooting';
				break;
			default: // balanced
				threshold = 0.1;
				description = 'Balanced precision/recall';
		}

		// Adjust for complexity
		if (workload.complexity === 'complex') {
			threshold *= 0.8;
			description += ' (adjusted for complexity)';
		} else if (workload.complexity === 'simple') {
			threshold *= 1.2;
			description += ' (simplified context)';
		}

		// Keep within empirical bounds
		threshold = Math.max(0.01, Math.min(0.5, threshold));

		return { threshold, description };
	}
}
