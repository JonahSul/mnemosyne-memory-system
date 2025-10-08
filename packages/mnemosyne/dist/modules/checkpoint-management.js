export class CheckpointManager {
    checkpoints = new Map();
    triggeredSearches = [];
    createWorkflowCheckpoint(stage, context, priority = 'medium') {
        const checkpoint = {
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
            const search = {
                checkpointId: checkpoint.id,
                query: this.generateQueryFromContext(context),
                priority: this.convertPriorityToNumber(priority),
                estimatedRelevance: 0.8
            };
            this.triggeredSearches.push(search);
        }
        return checkpoint;
    }
    getTriggeredMemorySearches(checkpointId) {
        if (checkpointId) {
            return this.triggeredSearches.filter(search => search.checkpointId === checkpointId);
        }
        return [...this.triggeredSearches];
    }
    trackWorkflowExecution(workflowEvents) {
        const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        // Track workflow execution internally
        for (const event of workflowEvents) {
            if (event.type === 'checkpoint') {
                this.createWorkflowCheckpoint(event.stage, event.context);
            }
        }
        return workflowId;
    }
    recordUserInteraction(query, context) {
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
    shouldTriggerMemoryConsultation(priority, context) {
        const priorityScores = { low: 1, medium: 2, high: 3, critical: 4 };
        const priorityScore = priorityScores[priority] || 1;
        const contextComplexity = Object.keys(context).length;
        return priorityScore >= 2 || contextComplexity > 3;
    }
    generateQueryFromContext(context) {
        // Extract meaningful terms from context
        const terms = [];
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
    convertPriorityToNumber(priority) {
        const priorities = { low: 1, medium: 5, high: 8, critical: 10 };
        return priorities[priority] || 5;
    }
    // Utility getters
    getCheckpoints() {
        return new Map(this.checkpoints);
    }
}
