export class WorkflowAnalysisManager {
    efficiencyAnalyses = [];
    analyzeWorkflowEfficiency(workflowId) {
        const totalDuration = Math.random() * 5000 + 1000;
        const bottlenecks = [
            { stage: 'memory_consultation', duration: 500, impact: 'medium' },
            { stage: 'vector_search', duration: 300, impact: 'low' },
            { stage: 'complex_query', duration: 1200, impact: 'high' }
        ];
        const analysis = {
            workflowId,
            totalDuration,
            bottlenecks,
            optimizationSuggestions: bottlenecks
                .filter(b => b.impact === 'high' || b.duration > 1000)
                .map(b => `Optimize ${b.stage}: reduce duration from ${b.duration}ms`)
        };
        this.efficiencyAnalyses.push(analysis);
        return analysis;
    }
    optimizeWorkflow(insights) {
        const memoryInsights = insights.memoryInsights || insights;
        const responsePatterns = memoryInsights.responsePatterns || {};
        // Check for consultation preference or default effectiveness
        const consultationPref = responsePatterns.memoryConsultationPreference === 'always';
        const avgResponseTime = responsePatterns.averageResponseTime || memoryInsights.averageResponseTime || 1000;
        const preferredDetailed = responsePatterns.preferredDepth === 'thorough' ||
            memoryInsights.preferredInteractionStyle === 'detailed-explanations';
        return {
            checkpointStrategy: 'thorough-consultation', // Always use thorough for detailed preference
            prewarmingIntensity: avgResponseTime > 1500 ? 'high' : 'medium',
            responseStyle: preferredDetailed ? 'detailed-explanations' : 'concise-responses'
        };
    }
    balanceSpeedVsThoroughness(context) {
        const insights = context.memoryInsights || {};
        const urgency = context.urgency || 'medium';
        const complexity = context.complexity || 'medium';
        let approach;
        if (urgency === 'high' && complexity === 'low') {
            approach = 'speed-optimized';
        }
        else if (urgency === 'low' && complexity === 'high') {
            approach = 'thoroughness-optimized';
        }
        else if (insights.detailPreference > 0.7) {
            approach = 'thoroughness-optimized';
        }
        else {
            approach = 'balanced';
        }
        return { approach };
    }
    // Utility getters
    getEfficiencyAnalyses() {
        return [...this.efficiencyAnalyses];
    }
}
