/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Unified Memory Facade
 * 
 * Elegant coordination layer that provides a single interface for both behavioral 
 * memory and vector knowledge operations while maintaining clear architectural separation.
 */

import { BehavioralMemoryTools, BehavioralStatus } from './behavioral-memory-subsystem.js';
import { VectorKnowledgeTools, SemanticSearchResult, TieredSearchResult } from './vector-knowledge-tools.js';

export interface MemorySystemHealth {
	behavioral: {
		status: BehavioralStatus;
		operational: boolean;
	};
	vector: {
		stats: any;
		operational: boolean;
	};
	overall: 'healthy' | 'degraded' | 'critical';
	calibration: {
		thresholds: Record<string, number>;
		recommendations: string[];
	};
}

export interface UnifiedSearchResult {
	behavioral: {
		claims: any[];
		violations: any[];
	};
	vector: {
		knowledge: SemanticSearchResult;
		tiered?: TieredSearchResult;
	};
	searchStrategy: string;
	totalLatency: number;
}

/**
 * Unified Memory Facade
 * 
 * Provides coordinated access to both behavioral memory and vector knowledge systems
 * while maintaining architectural separation and applying empirically discovered optimizations.
 */
export class UnifiedMemoryFacade {
	private behavioral: BehavioralMemoryTools;
	private vector: VectorKnowledgeTools;

	constructor() {
		this.behavioral = new BehavioralMemoryTools();
		this.vector = new VectorKnowledgeTools();
	}

	/**
	 * Store content in the appropriate memory system based on type
	 */
	async storeContent(content: {
		text: string;
		type: 'claim' | 'knowledge' | 'context' | 'violation';
		metadata?: Record<string, any>;
		importance?: number;
		tags?: string[];
	}): Promise<{ system: 'behavioral' | 'vector'; id: string; details: any }> {
		
		if (content.type === 'claim') {
			const id = await this.behavioral.logClaim(content.text, content.metadata || {});
			return {
				system: 'behavioral',
				id,
				details: { type: 'claim', status: 'pending' }
			};
		}

		if (content.type === 'violation') {
			const ruleId = content.metadata?.ruleId || 'unknown';
			await this.behavioral.recordViolation(ruleId, content.text, content.metadata?.severity);
			return {
				system: 'behavioral',
				id: `violation_${Date.now()}`,
				details: { type: 'violation', ruleId }
			};
		}

		// Store in vector system for knowledge/context
		const result = await this.vector.storeKnowledge({
			content: content.text,
			metadata: content.metadata || {},
			tags: content.tags || []
		});

		return {
			system: 'vector',
			id: result.id,
			details: { 
				validated: result.validated, 
				latency: result.latency,
				embeddingDim: result.embedding.length 
			}
		};
	}

	/**
	 * Intelligent search that queries appropriate memory systems based on query type
	 */
	async intelligentSearch(query: string, options: {
		searchBehavioral?: boolean;
		searchVector?: boolean;
		autoDetect?: boolean;
		threshold?: number;
		limit?: number;
	} = {}): Promise<UnifiedSearchResult> {
		const startTime = performance.now();
		
		// Auto-detect search strategy if not specified
		let searchBehavioral = options.searchBehavioral ?? options.autoDetect ?? true;
		let searchVector = options.searchVector ?? options.autoDetect ?? true;
		let strategy = 'unified';

		if (options.autoDetect) {
			// Behavioral keywords
			const behavioralKeywords = ['claim', 'violation', 'rule', 'compliance', 'behavioral'];
			const vectorKeywords = ['project', 'context', 'technical', 'knowledge', 'deployment'];
			
			const queryLower = query.toLowerCase();
			const behavioralScore = behavioralKeywords.filter(k => queryLower.includes(k)).length;
			const vectorScore = vectorKeywords.filter(k => queryLower.includes(k)).length;

			if (behavioralScore > vectorScore) {
				searchVector = false;
				strategy = 'behavioral-focused';
			} else if (vectorScore > behavioralScore) {
				searchBehavioral = false;
				strategy = 'vector-focused';
			}
		}

		const results: UnifiedSearchResult = {
			behavioral: { claims: [], violations: [] },
			vector: { knowledge: { results: [], queryTime: 0, threshold: 0, totalFound: 0 } },
			searchStrategy: strategy,
			totalLatency: 0
		};

		// Search behavioral memory if requested
		if (searchBehavioral) {
			try {
				const behavioralState = await this.behavioral.exportBehavioralState();
				// Could enhance with specific search logic
				results.behavioral = {
					claims: behavioralState.entries?.filter((e: any) => 
						e[1].type === 'claim' && e[1].content.toLowerCase().includes(query.toLowerCase())
					) || [],
					violations: behavioralState.entries?.filter((e: any) => 
						e[1].content.toLowerCase().includes('violation') && 
						e[1].content.toLowerCase().includes(query.toLowerCase())
					) || []
				};
			} catch (error) {
				// Behavioral search failed, continue with vector
			}
		}

		// Search vector memory if requested
		if (searchVector) {
			results.vector.knowledge = await this.vector.searchKnowledge(query, {
				threshold: options.threshold || 0.1, // Apply discovered calibration
				limit: options.limit || 8
			});

			// Also try tiered search for comprehensive results
			try {
				results.vector.tiered = await this.vector.searchTiered(query, {
					threshold: options.threshold || 0.1,
					limit: options.limit || 5
				});
			} catch (error) {
				// Tiered search failed, continue
			}
		}

		results.totalLatency = Math.round((performance.now() - startTime) * 1000) / 1000;
		return results;
	}

	/**
	 * Comprehensive system health check
	 */
	async getSystemHealth(): Promise<MemorySystemHealth> {
		const behavioralStatus = this.behavioral.getBehavioralStatus();
		const vectorStats = this.vector.getKnowledgeStats();

		const health: MemorySystemHealth = {
			behavioral: {
				status: behavioralStatus,
				operational: true // Could add specific health checks
			},
			vector: {
				stats: vectorStats,
				operational: true // Could add specific health checks
			},
			overall: 'healthy',
			calibration: {
				thresholds: {
					default: 0.1,
					precision: 0.25,
					recall: 0.05,
					exploration: 0.02
				},
				recommendations: [
					'Use threshold 0.1 for balanced search',
					'Expect 20-30% similarity for good matches',
					'Apply auto-detection for search strategy',
					'Consider tiered search for comprehensive results'
				]
			}
		};

		// Determine overall health
		if (behavioralStatus.recentViolations.length > 5) {
			health.overall = 'degraded';
		}
		if (behavioralStatus.complianceScore < 70) {
			health.overall = 'critical';
		}

		return health;
	}

	/**
	 * Export complete memory state from both systems
	 */
	async exportCompleteState(): Promise<{
		behavioral: any;
		vector: any;
		metadata: {
			exportTime: string;
			systems: string[];
			calibration: any;
		};
	}> {
		const [behavioralState, vectorStats] = await Promise.all([
			this.behavioral.exportBehavioralState(),
			this.vector.getKnowledgeStats()
		]);

		return {
			behavioral: behavioralState,
			vector: vectorStats,
			metadata: {
				exportTime: new Date().toISOString(),
				systems: ['behavioral-memory', 'vector-knowledge'],
				calibration: {
					similarityRanges: {
						exact: '40-50%',
						good: '20-30%',
						poor: '<10%'
					},
					recommendedThresholds: {
						default: 0.1,
						precision: 0.25,
						recall: 0.05
					}
				}
			}
		};
	}
}
