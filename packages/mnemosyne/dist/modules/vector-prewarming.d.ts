import type { VectorAnalysis, VectorPrewarmingStrategy, VectorPrewarmingStatus, AdaptivePrewarmingStrategy, VectorPrioritization, UserBehaviorPattern, PrewarmingPrediction, SessionPrewarmingStrategy, PrewarmingEffectiveness, AdaptedPrewarmingStrategy } from './memory-interfaces';
/**
 * Vector Pre-warming System Module
 *
 * Handles intelligent vector pre-warming for improved query performance
 */
export interface VectorPrewarmingOperations {
    analyzeQueryForVectorNeeds(query: string): VectorAnalysis;
    createPrewarmingStrategy(analysis: VectorAnalysis): VectorPrewarmingStrategy;
    executeVectorPrewarming(strategy: VectorPrewarmingStrategy): Promise<VectorPrewarmingStatus>;
    adaptPrewarmingBasedOnUsage(usagePatterns: UserBehaviorPattern[]): Promise<AdaptivePrewarmingStrategy>;
    prioritizeVectorsByDomain(domain: string): Promise<VectorPrioritization>;
    predictNextQueries(sessionContext: Record<string, unknown>): Promise<PrewarmingPrediction>;
    createVectorSessionPrewarmingStrategy(prediction: PrewarmingPrediction): Promise<SessionPrewarmingStrategy>;
    evaluatePrewarmingEffectiveness(strategy: SessionPrewarmingStrategy): Promise<PrewarmingEffectiveness>;
    adaptPrewarmingStrategy(effectiveness: PrewarmingEffectiveness): Promise<AdaptedPrewarmingStrategy>;
    generateStrategySync(query: string): {
        priorityVectors: string[];
        semanticRadius: number;
        estimatedLatency: number;
    };
    startPrewarmingSync(query: string): void;
    getPrewarmingStatusSync(): {
        isActive: boolean;
        targetConcepts: string[];
        startTime: string;
    };
    recordQueryPatternSync(query: string, concepts: string[]): void;
    recordUserBehaviorPatternSync(pattern: {
        domain: string;
        frequency: number;
        recentQueries: string[];
    }): void;
    generateAdaptivePrewarmingStrategySync(query: string): {
        learnedConcepts: string[];
        confidence: number;
        relatedPatterns: string[];
    };
    prioritizeVectorPrewarmingSync(query: string): {
        domainMatch: string;
        priority: number;
        suggestedVectors: string[];
    };
}
import type { VectorStoreAdapter, KeyValueStoreAdapter } from '../interfaces/storage';
export declare class VectorPrewarmingManager implements VectorPrewarmingOperations {
    private activePrewarming;
    private usagePatterns;
    private effectivenessHistory;
    private adaptedStrategies;
    private vectorStore?;
    private kvStore?;
    constructor(config?: {
        vectorStore?: VectorStoreAdapter;
        kvStore?: KeyValueStoreAdapter;
    });
    analyzeQueryForVectorNeeds(query: string): VectorAnalysis;
    createPrewarmingStrategy(analysis: VectorAnalysis): VectorPrewarmingStrategy;
    executeVectorPrewarming(strategy: VectorPrewarmingStrategy): Promise<VectorPrewarmingStatus>;
    adaptPrewarmingBasedOnUsage(usagePatterns: UserBehaviorPattern[]): Promise<AdaptivePrewarmingStrategy>;
    private persistUsagePatterns;
    prioritizeVectorsByDomain(domain: string): Promise<VectorPrioritization>;
    predictNextQueries(sessionContext: Record<string, unknown>): Promise<PrewarmingPrediction>;
    createVectorSessionPrewarmingStrategy(prediction: PrewarmingPrediction): Promise<SessionPrewarmingStrategy>;
    evaluatePrewarmingEffectiveness(strategy: SessionPrewarmingStrategy): Promise<PrewarmingEffectiveness>;
    adaptPrewarmingStrategy(effectiveness: PrewarmingEffectiveness): Promise<AdaptedPrewarmingStrategy>;
    private extractSemanticConcepts;
    private identifyVectorSearchAreas;
    private calculatePriority;
    private estimateVectorCount;
    private selectPriorityVectors;
    private calculateSemanticRadius;
    private estimateLatency;
    private extractLearnedConcepts;
    private calculateConfidence;
    private identifyRelatedPatterns;
    private getSuggestedVectorsForDomain;
    private calculateDomainPriority;
    private predictTopicsFromContext;
    private calculatePredictionConfidence;
    private getRelevantPatterns;
    private expandTopics;
    private identifyPreferredMethods;
    private calculateAdaptedConfidence;
    getActivePrewarming(): Map<string, VectorPrewarmingStatus>;
    getUsagePatterns(): UserBehaviorPattern[];
    getEffectivenessHistory(): PrewarmingEffectiveness[];
    getAdaptedStrategies(): AdaptedPrewarmingStrategy[];
    generateStrategySync(query: string): {
        priorityVectors: string[];
        semanticRadius: number;
        estimatedLatency: number;
    };
    private currentPrewarming;
    startPrewarmingSync(query: string): void;
    getPrewarmingStatusSync(): {
        isActive: boolean;
        targetConcepts: string[];
        startTime: string;
    };
    private queryPatterns;
    private userBehaviorPatterns;
    recordQueryPatternSync(query: string, concepts: string[]): void;
    recordUserBehaviorPatternSync(pattern: {
        domain: string;
        frequency: number;
        recentQueries: string[];
    }): void;
    generateAdaptivePrewarmingStrategySync(query: string | any): {
        learnedConcepts: string[];
        confidence: number;
        relatedPatterns: string[];
    };
    prioritizeVectorPrewarmingSync(query: string | any): {
        domainMatch: string;
        priority: number;
        suggestedVectors: string[];
    };
}
//# sourceMappingURL=vector-prewarming.d.ts.map