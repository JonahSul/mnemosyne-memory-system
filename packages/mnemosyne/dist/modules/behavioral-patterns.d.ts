import type { BehaviorPattern, InteractionPattern } from './memory-interfaces';
import type { KeyValueStoreAdapter, VectorStoreAdapter } from '../interfaces/storage';
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
export declare class BehavioralPatternLearner implements BehavioralPatternOperations {
    private learnedPatterns;
    private interactionHistory;
    private patternEvolution;
    private adaptationHistory;
    private vectorStore?;
    private kvStore?;
    constructor(vectorStore?: VectorStoreAdapter, kvStore?: KeyValueStoreAdapter);
    learnFromInteractionPatterns(interactions: Array<Record<string, unknown>>): Promise<BehaviorPattern[]>;
    adaptBehaviorBasedOnPatterns(patterns: BehaviorPattern[]): Promise<void>;
    analyzeBehavioralTrends(): Promise<InteractionPattern[]>;
    identifySuccessfulPatterns(): Promise<BehaviorPattern[]>;
    identifyProblematicPatterns(): Promise<BehaviorPattern[]>;
    recommendBehavioralAdjustments(patterns: BehaviorPattern[]): Promise<string[]>;
    trackPatternEvolution(patternId: string): Promise<any>;
    measurePatternEffectiveness(pattern: BehaviorPattern): Promise<number>;
    private groupInteractionsByPattern;
    private classifyInteractionPattern;
    private analyzePatternGroup;
    private determineAdjustment;
    private applyBehavioralAdjustment;
    private extractTrendKey;
    private generateTrendDescription;
    private classifyOutcome;
    private calculateAverageResponseTime;
    private extractCommonCharacteristics;
    private calculateEvolutionTrend;
    private generateEvolutionRecommendations;
    private evaluateContextRelevance;
    getLearnedPatterns(): Map<string, BehaviorPattern>;
    getInteractionHistory(): Array<Record<string, unknown>>;
    getPatternEvolution(): Map<string, Array<{
        timestamp: string;
        effectiveness: number;
    }>>;
    getAdaptationHistory(): Array<{
        timestamp: string;
        adjustment: string;
        reason: string;
    }>;
    clearHistory(): void;
    clearPatterns(): void;
}
//# sourceMappingURL=behavioral-patterns.d.ts.map