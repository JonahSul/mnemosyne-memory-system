/**
 * Shared Prewarming Service - Consolidates duplicated prewarming functionality
 * 
 * This module extracts common prewarming operations that were duplicated across
 * multiple modules, eliminating method collisions in the Delegator system.
 */

import type { 
	SessionPrewarmingStrategy, 
	PrewarmingEffectiveness,
	PrewarmingPrediction
} from './memory-interfaces';

export interface SharedPrewarmingOperations {
	createSessionPrewarmingStrategy(sessionContext: Record<string, unknown>): SessionPrewarmingStrategy | { targetConcepts: string[]; relatedTopics: string[]; priorityLevel?: number };
	recordPrewarmingEffectiveness(attempt: Record<string, unknown>): void;
	getPrewarmingHistory(): Array<Record<string, unknown>>;
	analyzePrewarmingPatterns(): { successRate: number; commonPatterns: string[] };
}

export class SharedPrewarmingService implements SharedPrewarmingOperations {
	private prewarmingAttempts: Array<Record<string, unknown>> = [];
	private effectivenessRecords: Array<Record<string, unknown>> = [];

	createSessionPrewarmingStrategy(sessionContext: Record<string, unknown>): { targetConcepts: string[]; relatedTopics: string[]; priorityLevel?: number } {
		const userQueries = sessionContext.userQueries as string[] || [];
		const identifiedDomain = sessionContext.identifiedDomain as string || '';
		
		// Extract concepts from domain and queries
		const targetConcepts: string[] = [];
		const relatedTopics: string[] = [];
		
		// Add domain-specific concepts
		if (identifiedDomain) {
			const domainWords = identifiedDomain.toLowerCase().split(/[\s-_]+/);
			targetConcepts.push(...domainWords);
		}
		
		// Extract concepts from user queries
		userQueries.forEach(query => {
			const words = query.toLowerCase().split(/\s+/);
			words.forEach(word => {
				// Clean word from punctuation and check length
				const cleanWord = word.replace(/[^\w]/g, '');
				if (cleanWord.length > 3 && !['with', 'this', 'that', 'have', 'been', 'issues', 'query'].includes(cleanWord)) {
					if (!targetConcepts.includes(cleanWord)) {
						targetConcepts.push(cleanWord);
					}
				}
			});
		});
		
		// Generate related topics based on concepts
		targetConcepts.forEach(concept => {
			if (concept.includes('memory') || concept.includes('behavioral')) {
				relatedTopics.push('pattern_recognition', 'behavior_analysis', 'memory_optimization');
			}
			if (concept.includes('workflow') || concept.includes('integration')) {
				relatedTopics.push('workflow_optimization', 'integration_patterns', 'automation');
			}
			if (concept.includes('database') || concept.includes('sql')) {
				relatedTopics.push('sql optimization', 'database performance', 'query tuning');
			}
		});
		
		return {
			targetConcepts: [...new Set(targetConcepts)],
			relatedTopics: [...new Set(relatedTopics)],
			priorityLevel: targetConcepts.length > 3 ? 3 : 2
		};
	}

	recordPrewarmingEffectiveness(attempt: Record<string, unknown>): void {
		const record = {
			id: `prewarming_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			timestamp: new Date().toISOString(),
			successRate: (attempt.success as number) || 0.5,
			context: attempt,
			type: 'prewarming_effectiveness'
		};
		
		this.effectivenessRecords.push(record);
		
		// Keep only last 100 records to prevent memory bloat
		if (this.effectivenessRecords.length > 100) {
			this.effectivenessRecords = this.effectivenessRecords.slice(-100);
		}
	}

	getPrewarmingHistory(): Array<Record<string, unknown>> {
		return [...this.effectivenessRecords];
	}

	analyzePrewarmingPatterns(): { successRate: number; commonPatterns: string[] } {
		if (this.effectivenessRecords.length === 0) {
			return { successRate: 0, commonPatterns: [] };
		}

		const totalSuccess = this.effectivenessRecords.reduce((sum, record) => {
			return sum + (record.successRate as number || 0);
		}, 0);

		const successRate = totalSuccess / this.effectivenessRecords.length;

		// Analyze common patterns from context
		const patterns = new Set<string>();
		this.effectivenessRecords.forEach(record => {
			const context = record.context as Record<string, unknown> || {};
			if (context.type) {
				patterns.add(context.type as string);
			}
		});

		return {
			successRate,
			commonPatterns: Array.from(patterns)
		};
	}

	// Utility method for modules that need specific prewarming behavior
	createModuleSpecificStrategy(moduleName: string, sessionContext: Record<string, unknown>) {
		const baseStrategy = this.createSessionPrewarmingStrategy(sessionContext);
		
		// Add module-specific enhancements
		switch (moduleName) {
			case 'vector':
				return {
					...baseStrategy,
					vectorSpecific: true,
					embeddingPriority: 'high'
				};
			case 'workflow':
				return {
					...baseStrategy,
					workflowOptimized: true,
					checkpointIntegration: true
				};
			default:
				return baseStrategy;
		}
	}
}

// Singleton instance for shared use across modules
export const sharedPrewarming = new SharedPrewarmingService();
