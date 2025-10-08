import type { BehaviorPattern, FeedbackPattern, FailurePattern, FailureAvoidanceStrategy, BehaviorAdjustment, InteractionPattern } from './memory-interfaces';
/**
 * Pattern Analysis Module
 *
 * Handles pattern recognition, learning, and strategy adaptation
 */
export interface PatternAnalysisOperations {
    recordSuccessfulPattern(interaction: Record<string, unknown>): void;
    processFeedbackPattern(feedback: Record<string, unknown>): void;
    recordFailurePattern(pattern: Record<string, unknown>): void;
    getLearnedBehaviorPatterns(): BehaviorPattern[];
    getBehaviorAdjustments(): BehaviorAdjustment;
    getFailureAvoidanceStrategies(): FailureAvoidanceStrategy[];
    analyzePatterns(): InteractionPattern[];
    generateAdaptiveStrategy(context: Record<string, unknown>): any;
}
export declare class PatternAnalysisManager implements PatternAnalysisOperations {
    private behaviorPatterns;
    private feedbackPatterns;
    private failurePatterns;
    private avoidanceStrategies;
    private currentAdjustment;
    recordSuccessfulPattern(interaction: Record<string, unknown>): void;
    processFeedbackPattern(feedback: Record<string, unknown>): void;
    recordFailurePattern(pattern: Record<string, unknown>): void;
    getLearnedBehaviorPatterns(): BehaviorPattern[];
    getBehaviorAdjustments(): BehaviorAdjustment;
    getFailureAvoidanceStrategies(): FailureAvoidanceStrategy[];
    analyzePatterns(): InteractionPattern[];
    generateAdaptiveStrategy(context: Record<string, unknown>): any;
    private extractPatternType;
    private calculateSuccessRate;
    private determineAdjustmentFromFeedback;
    private updateBehaviorAdjustment;
    private extractIndicators;
    private extractConsequences;
    private generatePreventionMethods;
    getBehaviorPatterns(): BehaviorPattern[];
    getFeedbackPatterns(): FeedbackPattern[];
    getFailurePatterns(): FailurePattern[];
}
//# sourceMappingURL=pattern-analysis.d.ts.map