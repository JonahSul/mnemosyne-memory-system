import type { WorkflowEfficiencyAnalysis } from './memory-interfaces';
/**
 * Workflow Analysis Module
 *
 * Focused domain for workflow efficiency analysis and optimization
 */
export interface WorkflowAnalysisOperations {
    analyzeWorkflowEfficiency(workflowId: string): WorkflowEfficiencyAnalysis;
    optimizeWorkflow(insights: Record<string, unknown>): {
        checkpointStrategy: string;
        prewarmingIntensity: string;
        responseStyle: string;
    };
    balanceSpeedVsThoroughness(context: Record<string, unknown>): {
        approach: string;
    };
}
export declare class WorkflowAnalysisManager implements WorkflowAnalysisOperations {
    private efficiencyAnalyses;
    analyzeWorkflowEfficiency(workflowId: string): WorkflowEfficiencyAnalysis;
    optimizeWorkflow(insights: Record<string, unknown>): {
        checkpointStrategy: string;
        prewarmingIntensity: string;
        responseStyle: string;
    };
    balanceSpeedVsThoroughness(context: Record<string, unknown>): {
        approach: string;
    };
    getEfficiencyAnalyses(): WorkflowEfficiencyAnalysis[];
}
//# sourceMappingURL=workflow-analysis.d.ts.map