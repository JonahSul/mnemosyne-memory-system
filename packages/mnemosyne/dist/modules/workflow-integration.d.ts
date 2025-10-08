import type { OptimizedConsultationFrequency } from './memory-interfaces';
/**
 * Workflow Integration Operations
 *
 * Handles workflow pattern analysis, consultation optimization, and behavioral learning
 */
export interface WorkflowIntegrationOperations {
    recordConsultationValue(entry: Record<string, unknown>): void;
    getOptimizedConsultationFrequency(): OptimizedConsultationFrequency;
}
export declare class WorkflowIntegrationManager implements WorkflowIntegrationOperations {
    private consultationHistory;
    recordConsultationValue(entry: Record<string, unknown>): void;
    getOptimizedConsultationFrequency(): OptimizedConsultationFrequency;
}
//# sourceMappingURL=workflow-integration.d.ts.map