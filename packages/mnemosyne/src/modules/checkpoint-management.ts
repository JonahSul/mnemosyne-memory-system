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

export class CheckpointManager implements CheckpointOperations {
	private checkpoints: Map<string, WorkflowCheckpoint> = new Map();
	private triggeredSearches: TriggeredMemorySearch[] = [];

	createWorkflowCheckpoint(stage: string, context: Record<string, unknown>, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): WorkflowCheckpoint {
		const checkpoint: WorkflowCheckpoint = {
			id: `checkpoint_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			stage,
			context,
			priority,
			timestamp: new Date().toISOString(),
			requiresMemoryConsultation: this.shouldTriggerMemoryConsultation(priority, context)
		};

		this.checkpoints.set(checkpoint.id, checkpoint);

		// Auto-trigger memory search if needed
		if (checkpoint.requiresMemoryConsultation) {
			const search: TriggeredMemorySearch = {
				checkpointId: checkpoint.id,
				query: this.generateQueryFromContext(context),
				priority: this.convertPriorityToNumber(priority),
				estimatedRelevance: 0.8
			};
			this.triggeredSearches.push(search);
		}

		return checkpoint;
	}

	getTriggeredMemorySearches(checkpointId?: string): TriggeredMemorySearch[] {
		if (checkpointId) {
			return this.triggeredSearches.filter(search => search.checkpointId === checkpointId);
		}
		return [...this.triggeredSearches];
	}

	trackWorkflowExecution(workflowEvents: Array<Record<string, unknown>>): string {
		const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		// Track workflow execution internally
		for (const event of workflowEvents) {
			if (event.type === 'checkpoint') {
				this.createWorkflowCheckpoint(event.stage as string, event.context as Record<string, unknown>);
			}
		}
		
		return workflowId;
	}

	recordUserInteraction(query: string, context: Record<string, unknown>): void {
		// Simple interaction recording - can be enhanced as needed
		const interaction = {
			id: `interaction_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			query,
			context,
			timestamp: new Date().toISOString()
		};
		// Store for analysis if needed
	}

	// Private helper methods
	private shouldTriggerMemoryConsultation(priority: string, context: Record<string, unknown>): boolean {
		const priorityScores = { low: 1, medium: 2, high: 3, critical: 4 };
		const priorityScore = priorityScores[priority as keyof typeof priorityScores] || 1;
		const contextComplexity = Object.keys(context).length;
		
		return priorityScore >= 2 || contextComplexity > 3;
	}

	private generateQueryFromContext(context: Record<string, unknown>): string {
		// Extract meaningful terms from context
		const terms: string[] = [];
		
		for (const [key, value] of Object.entries(context)) {
			if (typeof value === 'string') {
				// Extract important keywords
				const words = value.toLowerCase().split(/\s+/);
				words.forEach(word => {
					if (word.length > 4 && !['with', 'this', 'that', 'have', 'been', 'from'].includes(word)) {
						terms.push(word);
					}
				});
			}
		}
		
		return terms.length > 0 ? `Memory consultation for: ${terms.slice(0, 3).join(', ')}` : 'General memory consultation';
	}

	private convertPriorityToNumber(priority: string): number {
		const priorities = { low: 1, medium: 5, high: 8, critical: 10 };
		return priorities[priority as keyof typeof priorities] || 5;
	}

	// Utility getters
	getCheckpoints(): Map<string, WorkflowCheckpoint> {
		return new Map(this.checkpoints);
	}
}
