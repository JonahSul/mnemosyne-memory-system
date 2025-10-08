/**
 * Prewarming Strategy Module
 *
 * Focused domain for memory prewarming predictions and session strategies
 */
export interface PrewarmingOperations {
    generatePrewarmingPredictions(userContext?: Record<string, unknown>): Array<{
        query: string;
        confidence: number;
    }> | {
        predictedTopics: string[];
        confidence: number;
        confidenceScores: number[];
    };
    createPrewarmingSessionStrategy(sessionContext: Record<string, unknown>): {
        targetConcepts: string[];
        relatedTopics: string[];
        priorityLevel: number;
        sessionId: string;
        context: Record<string, unknown>;
    };
    getAdaptedPrewarmingStrategy(): {
        preferredMethods: string[];
        confidenceThresholds: number[];
        successRate: number;
    };
}
export declare class PrewarmingManager implements PrewarmingOperations {
    private prewarmingHistory;
    createSessionPrewarmingStrategy(sessionContext: Record<string, unknown>): {
        targetConcepts: string[];
        relatedTopics: string[];
        priorityLevel: number;
        sessionId: string;
        context: Record<string, unknown>;
    };
    recordPrewarmingEffectiveness(strategy: any, effectiveness: number): void;
    getPrewarmingHistory(): {
        strategy: any;
        effectiveness: number;
        timestamp: number;
    }[];
    analyzePrewarmingPatterns(): {
        totalEntries: number;
        averageEffectiveness: number;
        patterns: {
            effectiveness: number;
            timestamp: number;
            strategyType: any;
        }[];
    };
    createPrewarmingSessionStrategy(sessionContext: Record<string, unknown>): {
        targetConcepts: string[];
        relatedTopics: string[];
        priorityLevel: number;
        sessionId: string;
        context: Record<string, unknown>;
    };
    generatePrewarmingPredictions(userContext?: Record<string, unknown>): Array<{
        query: string;
        confidence: number;
    }> | {
        predictedTopics: string[];
        confidence: number;
        confidenceScores: number[];
    };
    getAdaptedPrewarmingStrategy(): {
        preferredMethods: string[];
        confidenceThresholds: number[];
        successRate: number;
    };
    getPrewarmingAttempts(): Array<Record<string, unknown>>;
}
//# sourceMappingURL=prewarming-strategy.d.ts.map