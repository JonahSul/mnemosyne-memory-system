/**
 * Plan Memory Management Module
 *
 * Implements plan-based accountability and conversation continuity for both agents and users.
 * Integrates with vector space temporal plotting and causality tracking.
 */
import type { PlanMemoryEntry, PlanMilestone, PlanBlocker, PlanOperations } from './memory-interfaces.js';
export declare class PlanMemoryManager implements PlanOperations {
    private vectorStore?;
    private causalityAnalyzer?;
    private plans;
    private enhancedPlans;
    constructor(vectorStore?: any | undefined, causalityAnalyzer?: any | undefined);
    createPlan(plan: Omit<PlanMemoryEntry, 'id' | 'timestamp'>): Promise<string>;
    updatePlanStatus(planId: string, status: PlanMemoryEntry['status'], evidence?: string): Promise<boolean>;
    updatePlanProgress(planId: string, progress: number, milestone?: string): Promise<boolean>;
    addMilestone(planId: string, milestone: Omit<PlanMilestone, 'id'>): Promise<string>;
    addBlocker(planId: string, blocker: Omit<PlanBlocker, 'id'>): Promise<string>;
    resolveBlocker(planId: string, blockerId: string, resolution: string): Promise<boolean>;
    checkAccountability(planId: string): Promise<{
        onTrack: boolean;
        deviations: string[];
        suggestions: string[];
        timeRemaining?: number;
    }>;
    detectConversationFork(currentContext: string, planId: string): Promise<{
        isFork: boolean;
        deviationSeverity: 'minor' | 'moderate' | 'major';
        shouldRemind: boolean;
        reminderMessage?: string;
    }>;
    suggestReturnToPlan(planId: string): Promise<{
        suggestion: string;
        urgency: 'low' | 'medium' | 'high';
        contextBridge: string;
    }>;
    updatePlanVectorPosition(planId: string, currentVector: number[]): Promise<boolean>;
    findRelatedPlans(semanticQuery: string, includeCompleted?: boolean): Promise<PlanMemoryEntry[]>;
    analyzePlanTrajectory(planId: string): Promise<{
        onCourse: boolean;
        projectedCompletion: string;
        courseCorrections: string[];
    }>;
    private calculateCosineSimilarity;
    private calculateVectorDeviation;
    private generateReminderMessage;
    private generateReturnSuggestion;
    private generateContextBridge;
    getAllPlans(): PlanMemoryEntry[];
    getPlan(planId: string): PlanMemoryEntry | undefined;
}
//# sourceMappingURL=plan-memory-manager.d.ts.map