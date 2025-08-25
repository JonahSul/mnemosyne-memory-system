import type { BehaviorPattern, InteractionPattern } from './memory-interfaces';
import { CloudflareVectorStore } from '../cloudflare-vector-store';

/**
 * Behavioral Pattern Learning Module
 * 
 * Handles learning from interaction patterns, behavioral adaptation, and pattern analysis
 */
export interface BehavioralPatternOperations {
	learnFromInteractionPatterns(interactions: Array<Record<string, unknown>>): Promise<BehaviorPattern[]>;
	adaptBehaviorBasedOnPatterns(patterns: BehaviorPattern[]): Promise<void>;
	analyzeBehavioralTrends(): Promise<InteractionPattern[]>;
	identifySuccessfulPatterns(): Promise<BehaviorPattern[]>;
	identifyProblematicPatterns(): Promise<BehaviorPattern[]>;
	recommendBehavioralAdjustments(patterns: BehaviorPattern[]): Promise<string[]>;
	trackPatternEvolution(patternId: string): Promise<any>;
	measurePatternEffectiveness(pattern: BehaviorPattern): Promise<number>;
}

export class BehavioralPatternLearner implements BehavioralPatternOperations {
	// Persistence: store learned patterns in Vectorize + optional KV for rapid access
	private learnedPatterns: Map<string, BehaviorPattern> = new Map();
	private interactionHistory: Array<Record<string, unknown>> = [];
	private patternEvolution: Map<string, Array<{timestamp: string; effectiveness: number}>> = new Map();
	private adaptationHistory: Array<{timestamp: string; adjustment: string; reason: string}> = [];
	private vectorStore: CloudflareVectorStore;
	private kvStore: any;

	constructor(vectorStore?: CloudflareVectorStore, kvStore?: any) {
		this.vectorStore = vectorStore || new CloudflareVectorStore({ env: {} as any });
		this.kvStore = kvStore;
	}

	async learnFromInteractionPatterns(interactions: Array<Record<string, unknown>>): Promise<BehaviorPattern[]> {
		this.interactionHistory.push(...interactions);
		
		const patterns: BehaviorPattern[] = [];
		const patternGroups = this.groupInteractionsByPattern(interactions);

		for (const [patternType, groupedInteractions] of patternGroups) {
			const pattern = this.analyzePatternGroup(patternType, groupedInteractions);
			patterns.push(pattern);
			// Immediate persistence: KV + Vectorize
			try {
				if (this.kvStore) {
					await this.kvStore.put(`pattern:${pattern.id}`, JSON.stringify(pattern));
				}
				await this.vectorStore.storeKnowledge({
					content: JSON.stringify(pattern),
					metadata: { id: pattern.id, type: pattern.type, successRate: pattern.successRate, frequency: pattern.frequency, timestamp: new Date().toISOString() },
					tags: [pattern.type]
				});
			} catch (e) {
				// Best-effort persistence; keep in-memory as fallback
				// eslint-disable-next-line no-console
				console.warn('Failed to persist pattern immediately:', e);
			}
			this.learnedPatterns.set(pattern.id, pattern);
		}

		return patterns;
	}

	async adaptBehaviorBasedOnPatterns(patterns: BehaviorPattern[]): Promise<void> {
		for (const pattern of patterns) {
			const adjustment = this.determineAdjustment(pattern);
			if (adjustment) {
				this.adaptationHistory.push({
					timestamp: new Date().toISOString(),
					adjustment: adjustment.action,
					reason: adjustment.reason
				});

				await this.applyBehavioralAdjustment(adjustment);
			}
		}
	}

	async analyzeBehavioralTrends(): Promise<InteractionPattern[]> {
		const trendMap = new Map<string, InteractionPattern>();
		const recentInteractions = this.interactionHistory.slice(-50); // Last 50 interactions

		for (const interaction of recentInteractions) {
			const trendKey = this.extractTrendKey(interaction);
			const existing = trendMap.get(trendKey);

			if (existing) {
				existing.frequency++;
				existing.lastOccurrence = interaction.timestamp as string || new Date().toISOString();
			} else {
				trendMap.set(trendKey, {
					pattern: trendKey,
					description: this.generateTrendDescription(interaction),
					frequency: 1,
					outcome: this.classifyOutcome(interaction),
					lastOccurrence: interaction.timestamp as string || new Date().toISOString()
				});
			}
		}

		return Array.from(trendMap.values()).sort((a, b) => b.frequency - a.frequency);
	}

	async identifySuccessfulPatterns(): Promise<BehaviorPattern[]> {
		return Array.from(this.learnedPatterns.values())
			.filter(pattern => pattern.successRate > 0.7)
			.sort((a, b) => b.successRate - a.successRate);
	}

	async identifyProblematicPatterns(): Promise<BehaviorPattern[]> {
		return Array.from(this.learnedPatterns.values())
			.filter(pattern => pattern.successRate < 0.4 || pattern.frequency > 10)
			.sort((a, b) => a.successRate - b.successRate);
	}

	async recommendBehavioralAdjustments(patterns: BehaviorPattern[]): Promise<string[]> {
		const recommendations: string[] = [];

		for (const pattern of patterns) {
			if (pattern.successRate < 0.5) {
				recommendations.push(`Reduce frequency of ${pattern.type} behavior - current success rate: ${(pattern.successRate * 100).toFixed(1)}%`);
			}

			if (pattern.frequency > 15 && pattern.successRate < 0.8) {
				recommendations.push(`Review ${pattern.type} approach - high frequency but moderate success`);
			}

			if (pattern.successRate > 0.9 && pattern.frequency < 3) {
				recommendations.push(`Increase utilization of ${pattern.type} - highly successful but underused`);
			}
		}

		// Add general recommendations based on overall patterns
		const avgSuccessRate = patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
		if (avgSuccessRate < 0.6) {
			recommendations.push('Overall behavioral patterns show room for improvement - consider comprehensive review');
		}

		return recommendations;
	}

	async trackPatternEvolution(patternId: string): Promise<any> {
		const pattern = this.learnedPatterns.get(patternId);
		if (!pattern) {
			throw new Error(`Pattern ${patternId} not found`);
		}

		const evolution = this.patternEvolution.get(patternId) || [];
		
		// Add current effectiveness measurement
		const currentEffectiveness = await this.measurePatternEffectiveness(pattern);
		evolution.push({
			timestamp: new Date().toISOString(),
			effectiveness: currentEffectiveness
		});
		
		this.patternEvolution.set(patternId, evolution);

		return {
			patternId,
			currentPattern: pattern,
			evolution,
			trend: this.calculateEvolutionTrend(evolution),
			recommendations: this.generateEvolutionRecommendations(evolution)
		};
	}

	async measurePatternEffectiveness(pattern: BehaviorPattern): Promise<number> {
		// Calculate effectiveness based on multiple factors
		const successWeight = 0.4;
		const frequencyWeight = 0.3;
		const contextWeight = 0.3;

		const successScore = pattern.successRate;
		const frequencyScore = Math.min(1.0, pattern.frequency / 10); // Normalize frequency
		const contextScore = this.evaluateContextRelevance(pattern);

		const effectiveness = (successScore * successWeight) + 
		                    (frequencyScore * frequencyWeight) + 
		                    (contextScore * contextWeight);

		return Math.min(1.0, effectiveness);
	}

	// Private helper methods
	private groupInteractionsByPattern(interactions: Array<Record<string, unknown>>): Map<string, Array<Record<string, unknown>>> {
		const groups = new Map<string, Array<Record<string, unknown>>>();

		for (const interaction of interactions) {
			const patternType = this.classifyInteractionPattern(interaction);
			if (!groups.has(patternType)) {
				groups.set(patternType, []);
			}
			groups.get(patternType)!.push(interaction);
		}

		return groups;
	}

	private classifyInteractionPattern(interaction: Record<string, unknown>): string {
		// Classify interaction based on characteristics
		if (interaction.type === 'query') return 'query_pattern';
		if (interaction.type === 'memory_consultation') return 'consultation_pattern';
		if (interaction.type === 'behavioral_adjustment') return 'adjustment_pattern';
		if (interaction.responseTime && (interaction.responseTime as number) > 3000) return 'slow_response_pattern';
		if (interaction.success === false) return 'failure_pattern';
		return 'general_interaction_pattern';
	}

	private analyzePatternGroup(patternType: string, interactions: Array<Record<string, unknown>>): BehaviorPattern {
		const successfulInteractions = interactions.filter(i => i.success !== false);
		const successRate = successfulInteractions.length / interactions.length;

		return {
			id: `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			type: patternType,
			successRate,
			frequency: interactions.length,
			context: {
				firstOccurrence: interactions[0]?.timestamp || new Date().toISOString(),
				lastOccurrence: interactions[interactions.length - 1]?.timestamp || new Date().toISOString(),
				averageResponseTime: this.calculateAverageResponseTime(interactions),
				commonCharacteristics: this.extractCommonCharacteristics(interactions)
			}
		};
	}

	private determineAdjustment(pattern: BehaviorPattern): {action: string; reason: string} | null {
		if (pattern.successRate < 0.3) {
			return {
				action: `disable_${pattern.type}`,
				reason: `Low success rate: ${(pattern.successRate * 100).toFixed(1)}%`
			};
		}

		if (pattern.frequency > 20 && pattern.successRate < 0.6) {
			return {
				action: `reduce_frequency_${pattern.type}`,
				reason: `High frequency with moderate success: ${pattern.frequency} occurrences, ${(pattern.successRate * 100).toFixed(1)}% success`
			};
		}

		if (pattern.successRate > 0.9 && pattern.frequency < 3) {
			return {
				action: `increase_utilization_${pattern.type}`,
				reason: `High success but low utilization: ${(pattern.successRate * 100).toFixed(1)}% success, only ${pattern.frequency} uses`
			};
		}

		return null;
	}

	private async applyBehavioralAdjustment(adjustment: {action: string; reason: string}): Promise<void> {
		// Apply the behavioral adjustment
		// In a real implementation, this would modify system behavior
		console.log(`Applying adjustment: ${adjustment.action} - ${adjustment.reason}`);
	}

	private extractTrendKey(interaction: Record<string, unknown>): string {
		// Extract a key that represents the trend type
		const type = interaction.type as string || 'unknown';
		const success = interaction.success ? 'success' : 'failure';
		const responseTime = interaction.responseTime as number || 0;
		const timeCategory = responseTime > 3000 ? 'slow' : responseTime > 1000 ? 'medium' : 'fast';
		
		return `${type}_${success}_${timeCategory}`;
	}

	private generateTrendDescription(interaction: Record<string, unknown>): string {
		const type = interaction.type as string || 'interaction';
		const success = interaction.success ? 'successful' : 'failed';
		return `${success} ${type} trend`;
	}

	private classifyOutcome(interaction: Record<string, unknown>): 'positive' | 'negative' | 'neutral' {
		if (interaction.success === false) return 'negative';
		if (interaction.success === true && (interaction.responseTime as number || 0) < 2000) return 'positive';
		return 'neutral';
	}

	private calculateAverageResponseTime(interactions: Array<Record<string, unknown>>): number {
		const responseTimes = interactions
			.map(i => i.responseTime as number)
			.filter(rt => typeof rt === 'number');
		
		if (responseTimes.length === 0) return 0;
		return responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
	}

	private extractCommonCharacteristics(interactions: Array<Record<string, unknown>>): Record<string, any> {
		const characteristics: Record<string, any> = {};
		
		// Extract common patterns
		const types = interactions.map(i => i.type).filter(Boolean);
		const uniqueTypes = [...new Set(types)];
		if (uniqueTypes.length === 1) {
			characteristics.consistentType = uniqueTypes[0];
		}

		const avgComplexity = interactions
			.map(i => i.complexity as number)
			.filter(c => typeof c === 'number')
			.reduce((sum, c, _, arr) => sum + c / arr.length, 0);
		if (avgComplexity > 0) {
			characteristics.averageComplexity = avgComplexity;
		}

		return characteristics;
	}

	private calculateEvolutionTrend(evolution: Array<{timestamp: string; effectiveness: number}>): string {
		if (evolution.length < 2) return 'insufficient_data';

		const recent = evolution.slice(-5); // Last 5 measurements
		const firstRecent = recent[0];
		const lastRecent = recent[recent.length - 1];
		
		if (!firstRecent || !lastRecent) return 'insufficient_data';
		
		const trend = lastRecent.effectiveness - firstRecent.effectiveness;

		if (trend > 0.1) return 'improving';
		if (trend < -0.1) return 'declining';
		return 'stable';
	}

	private generateEvolutionRecommendations(evolution: Array<{timestamp: string; effectiveness: number}>): string[] {
		const recommendations: string[] = [];
		
		if (evolution.length === 0) {
			recommendations.push('No evolution data available - continue monitoring');
			return recommendations;
		}

		const latest = evolution[evolution.length - 1];
		if (latest && latest.effectiveness < 0.5) {
			recommendations.push('Pattern effectiveness is low - consider significant changes');
		}

		const trend = this.calculateEvolutionTrend(evolution);
		switch (trend) {
			case 'declining':
				recommendations.push('Pattern is declining - investigate causes and implement corrective measures');
				break;
			case 'improving':
				recommendations.push('Pattern is improving - continue current approach');
				break;
			case 'stable':
				recommendations.push('Pattern is stable - monitor for optimization opportunities');
				break;
		}

		return recommendations;
	}

	private evaluateContextRelevance(pattern: BehaviorPattern): number {
		// Evaluate how relevant the pattern's context is to current operations
		const contextKeys = Object.keys(pattern.context || {});
		const relevantKeys = ['responseTime', 'success', 'complexity', 'userSatisfaction'];
		
		const relevantCount = contextKeys.filter(key => relevantKeys.includes(key)).length;
		return Math.min(1.0, relevantCount / relevantKeys.length);
	}

	// Utility methods
	getLearnedPatterns(): Map<string, BehaviorPattern> {
		return new Map(this.learnedPatterns);
	}

	getInteractionHistory(): Array<Record<string, unknown>> {
		return [...this.interactionHistory];
	}

	getPatternEvolution(): Map<string, Array<{timestamp: string; effectiveness: number}>> {
		return new Map(this.patternEvolution);
	}

	getAdaptationHistory(): Array<{timestamp: string; adjustment: string; reason: string}> {
		return [...this.adaptationHistory];
	}

	clearHistory(): void {
		this.interactionHistory = [];
	}

	clearPatterns(): void {
		this.learnedPatterns.clear();
		this.patternEvolution.clear();
	}
}
