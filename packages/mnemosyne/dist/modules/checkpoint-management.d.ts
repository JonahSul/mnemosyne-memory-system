import type { WorkflowCheckpoint, TriggeredMemorySearch } from './memory-interfaces';
/**
 * Checkpoint Management Module
 *
 * Focused domain for workflow checkpoint creation and memory search triggering
 */
export interface CheckpointOperations {
    createWorkflowCheckpoint(stage: string, context: Record<string, unknown>, priority?: 'low' | 'medium' | 'high' | 'critical'): WorkflowCheckpoint;
    getTriggeredMemorySearches(checkpointId?: string): TriggeredMemorySearch[];
    trackWorkflowExecution(workflowEvents: Array<Record<string, unknown>>): string;
    recordUserInteraction(query: string, context: Record<string, unknown>): void;
}
export declare class CheckpointManager implements CheckpointOperations {
    private checkpoints;
    private triggeredSearches;
    createWorkflowCheckpoint(stage: string, context: Record<string, unknown>, priority?: 'low' | 'medium' | 'high' | 'critical'): WorkflowCheckpoint;
    getTriggeredMemorySearches(checkpointId?: string): TriggeredMemorySearch[];
    trackWorkflowExecution(workflowEvents: Array<Record<string, unknown>>): string;
    recordUserInteraction(query: string, context: Record<string, unknown>): void;
    private shouldTriggerMemoryConsultation;
    private generateQueryFromContext;
    private convertPriorityToNumber;
    getCheckpoints(): Map<string, WorkflowCheckpoint>;
}
//# sourceMappingURL=checkpoint-management.d.ts.map