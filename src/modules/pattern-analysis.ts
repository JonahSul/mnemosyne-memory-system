import type { 
	BehaviorPattern,
	FeedbackPattern,
	FailurePattern,
	FailureAvoidanceStrategy,
	BehaviorAdjustment,
	InteractionPattern
} from './memory-interfaces';

/**
 * Pattern Analysis Module
 * 
 * Handles pattern recognition, learning, and strategy adaptation
 */
export interface PatternAnalysisOperations {
	recordSuccessfulPattern(interaction: Record<string, unknown>): void;
	processFeedbackPattern(feedback: Record<string, unknown>): void;
	recordFailurePattern(pattern: Record<string, unknown>): void;
	
	// Getters for stored patterns
	getLearnedBehaviorPatterns(): BehaviorPattern[];
	getBehaviorAdjustments(): BehaviorAdjustment;
	getFailureAvoidanceStrategies(): FailureAvoidanceStrategy[];
	
	// Analysis methods
	analyzePatterns(): InteractionPattern[];
	generateAdaptiveStrategy(context: Record<string, unknown>): any;
}

export class PatternAnalysisManager implements PatternAnalysisOperations {
	private behaviorPatterns: BehaviorPattern[] = [];
	private feedbackPatterns: FeedbackPattern[] = [];
	private failurePatterns: FailurePattern[] = [];
	private avoidanceStrategies: FailureAvoidanceStrategy[] = [];
	private currentAdjustment: BehaviorAdjustment = {
		searchScopeReduction: false,
		consultationDepthIncrease: false,
		balancedApproachReinforcement: true
	};

	recordSuccessfulPattern(interaction: Record<string, unknown>): void {
		const pattern: BehaviorPattern = {
			id: `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			type: this.extractPatternType(interaction),
			successRate: this.calculateSuccessRate(interaction),
			frequency: 1,
			context: interaction
		};
		
		// Merge with existing patterns or add new
		const existing = this.behaviorPatterns.find(p => p.type === pattern.type);
		if (existing) {
			existing.frequency++;
			existing.successRate = (existing.successRate + pattern.successRate) / 2;
		} else {
			this.behaviorPatterns.push(pattern);
		}
	}

	processFeedbackPattern(feedback: Record<string, unknown>): void {
		const feedbackText = feedback.feedback as string || '';
		const context = feedback.context as string || '';
		
		const pattern: FeedbackPattern = {
			userFeedback: feedbackText,
			behaviorContext: context,
			adjustment: this.determineAdjustmentFromFeedback(feedbackText)
		};
		
		this.feedbackPatterns.push(pattern);
		this.updateBehaviorAdjustment(pattern);
	}

	recordFailurePattern(pattern: Record<string, unknown>): void {
		const failurePattern: FailurePattern = {
			pattern: (pattern.pattern as string) || (pattern.targetPattern as string) || (pattern.type as string) || 'unknown_failure',
			indicators: this.extractIndicators(pattern),
			consequences: this.extractConsequences(pattern),
			frequency: (pattern.frequency as number) || 1
		};
		
		// Merge with existing or add new
		const existing = this.failurePatterns.find(p => p.pattern === failurePattern.pattern);
		if (existing) {
			existing.frequency += failurePattern.frequency;
		} else {
			this.failurePatterns.push(failurePattern);
		}
		
		// Generate avoidance strategy
		const strategy: FailureAvoidanceStrategy = {
			targetPattern: failurePattern.pattern,
			preventionMethods: this.generatePreventionMethods(failurePattern),
			earlyWarningSignals: failurePattern.indicators
		};
		
		this.avoidanceStrategies.push(strategy);
	}

	getLearnedBehaviorPatterns(): BehaviorPattern[] {
		// Add default patterns if none exist
		if (this.behaviorPatterns.length === 0) {
			this.behaviorPatterns.push({
				id: `pattern_${Date.now()}`,
				type: 'memory-first-approach',
				frequency: 1,
				successRate: 0.85,
				context: { description: 'Always consult memory before making decisions' }
			});
		}
		return [...this.behaviorPatterns];
	}

	getBehaviorAdjustments(): BehaviorAdjustment {
		return { ...this.currentAdjustment };
	}

	getFailureAvoidanceStrategies(): FailureAvoidanceStrategy[] {
		// Add default strategies if none exist
		if (this.avoidanceStrategies.length === 0) {
			this.avoidanceStrategies.push({
				targetPattern: 'assumption-without-verification',
				preventionMethods: ['verify claims before proceeding', 'request evidence'],
				earlyWarningSignals: ['making assumptions', 'proceeding without data']
			});
		}
		
		return [...this.avoidanceStrategies];
	}

	analyzePatterns(): InteractionPattern[] {
		return this.behaviorPatterns.map(pattern => ({
			pattern: pattern.type,
			description: `Behavior pattern: ${pattern.type}`,
			frequency: pattern.frequency,
			outcome: pattern.successRate > 0.7 ? 'positive' as const : 'neutral' as const,
			lastOccurrence: new Date().toISOString()
		}));
	}

	generateAdaptiveStrategy(context: Record<string, unknown>): any {
		const insights = context.memoryInsights as Record<string, any> || {};
		
		return {
			checkpointStrategy: insights.consultationEffectiveness > 0.8 ? 'thorough-consultation' : 'selective-consultation',
			prewarmingIntensity: insights.prewarmingValue > 0.7 ? 'high' : 'adaptive',
			responseStyle: insights.detailPreference > 0.6 ? 'detailed-explanations' : 'concise-responses'
		};
	}

	// Private helper methods
	private extractPatternType(interaction: Record<string, unknown>): string {
		if (interaction.type) return interaction.type as string;
		if (interaction.query) return 'query-based';
		if (interaction.action) return 'action-based';
		return 'general-interaction';
	}

	private calculateSuccessRate(interaction: Record<string, unknown>): number {
		if (interaction.success === true) return 1.0;
		if (interaction.success === false) return 0.0;
		return 0.8; // Default positive assumption
	}

	private determineAdjustmentFromFeedback(feedback: string): string {
		if (feedback.includes('slow') || feedback.includes('too detailed')) return 'increase_speed';
		if (feedback.includes('incomplete') || feedback.includes('shallow')) return 'increase_thoroughness';
		if (feedback.includes('good') || feedback.includes('perfect')) return 'maintain_current';
		return 'balanced_adjustment';
	}

	private updateBehaviorAdjustment(pattern: FeedbackPattern): void {
		switch (pattern.adjustment) {
			case 'increase_speed':
				this.currentAdjustment.searchScopeReduction = true;
				break;
			case 'increase_thoroughness':
				this.currentAdjustment.consultationDepthIncrease = true;
				break;
			case 'maintain_current':
				this.currentAdjustment.balancedApproachReinforcement = true;
				break;
		}
	}

	private extractIndicators(pattern: Record<string, unknown>): string[] {
		const indicators: string[] = [];
		if (pattern.timeout) indicators.push('timeout_occurred');
		if (pattern.complexity && (pattern.complexity as number) > 7) indicators.push('high_complexity');
		if (pattern.responseTime && (pattern.responseTime as number) > 3000) indicators.push('slow_response');
		return indicators;
	}

	private extractConsequences(pattern: Record<string, unknown>): string[] {
		const consequences: string[] = [];
		if (pattern.userSatisfaction && (pattern.userSatisfaction as number) < 0.5) {
			consequences.push('poor_user_satisfaction');
		}
		if (pattern.requiresRetry) consequences.push('required_retry');
		return consequences;
	}

	private generatePreventionMethods(pattern: FailurePattern): string[] {
		const methods: string[] = [];
		
		if (pattern.pattern.includes('timeout')) {
			methods.push('implement_timeout_prevention', 'optimize_query_complexity');
		}
		if (pattern.pattern.includes('complexity')) {
			methods.push('break_down_complex_queries', 'use_progressive_disclosure');
		}
		if (pattern.indicators.includes('slow_response')) {
			methods.push('implement_caching', 'optimize_search_algorithms');
		}
		
		return methods.length > 0 ? methods : ['general_error_handling'];
	}

	// Utility getters
	getBehaviorPatterns(): BehaviorPattern[] {
		return [...this.behaviorPatterns];
	}

	getFeedbackPatterns(): FeedbackPattern[] {
		return [...this.feedbackPatterns];
	}

	getFailurePatterns(): FailurePattern[] {
		return [...this.failurePatterns];
	}
}
