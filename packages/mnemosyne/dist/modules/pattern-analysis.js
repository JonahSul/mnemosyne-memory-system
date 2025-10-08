export class PatternAnalysisManager {
    behaviorPatterns = [];
    feedbackPatterns = [];
    failurePatterns = [];
    avoidanceStrategies = [];
    currentAdjustment = {
        searchScopeReduction: false,
        consultationDepthIncrease: false,
        balancedApproachReinforcement: true
    };
    recordSuccessfulPattern(interaction) {
        const pattern = {
            id: `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: this.extractPatternType(interaction),
            successRate: this.calculateSuccessRate(interaction),
            frequency: 1,
            context: interaction
        };
        // Merge with existing patterns or add new
        const existing = this.behaviorPatterns.find(p => p.type === pattern.type);
        if (existing) {
            existing.frequency++;
            existing.successRate = (existing.successRate + pattern.successRate) / 2;
        }
        else {
            this.behaviorPatterns.push(pattern);
        }
    }
    processFeedbackPattern(feedback) {
        const feedbackText = feedback.feedback || '';
        const context = feedback.context || '';
        const pattern = {
            userFeedback: feedbackText,
            behaviorContext: context,
            adjustment: this.determineAdjustmentFromFeedback(feedbackText)
        };
        this.feedbackPatterns.push(pattern);
        this.updateBehaviorAdjustment(pattern);
    }
    recordFailurePattern(pattern) {
        const failurePattern = {
            pattern: pattern.pattern || pattern.targetPattern || pattern.type || 'unknown_failure',
            indicators: this.extractIndicators(pattern),
            consequences: this.extractConsequences(pattern),
            frequency: pattern.frequency || 1
        };
        // Merge with existing or add new
        const existing = this.failurePatterns.find(p => p.pattern === failurePattern.pattern);
        if (existing) {
            existing.frequency += failurePattern.frequency;
        }
        else {
            this.failurePatterns.push(failurePattern);
        }
        // Generate avoidance strategy
        const strategy = {
            targetPattern: failurePattern.pattern,
            preventionMethods: this.generatePreventionMethods(failurePattern),
            earlyWarningSignals: failurePattern.indicators
        };
        this.avoidanceStrategies.push(strategy);
    }
    getLearnedBehaviorPatterns() {
        // Add default patterns if none exist
        if (this.behaviorPatterns.length === 0) {
            this.behaviorPatterns.push({
                id: `pattern_${Date.now()}`,
                type: 'memory-first-approach',
                frequency: 1,
                successRate: 0.85,
                context: { description: 'Always consult memory before making decisions' }
            });
        }
        return [...this.behaviorPatterns];
    }
    getBehaviorAdjustments() {
        return { ...this.currentAdjustment };
    }
    getFailureAvoidanceStrategies() {
        // Add default strategies if none exist
        if (this.avoidanceStrategies.length === 0) {
            this.avoidanceStrategies.push({
                targetPattern: 'assumption-without-verification',
                preventionMethods: ['verify claims before proceeding', 'request evidence'],
                earlyWarningSignals: ['making assumptions', 'proceeding without data']
            });
        }
        return [...this.avoidanceStrategies];
    }
    analyzePatterns() {
        return this.behaviorPatterns.map(pattern => ({
            pattern: pattern.type,
            description: `Behavior pattern: ${pattern.type}`,
            frequency: pattern.frequency,
            outcome: pattern.successRate > 0.7 ? 'positive' : 'neutral',
            lastOccurrence: new Date().toISOString()
        }));
    }
    generateAdaptiveStrategy(context) {
        const insights = context.memoryInsights || {};
        return {
            checkpointStrategy: insights.consultationEffectiveness > 0.8 ? 'thorough-consultation' : 'selective-consultation',
            prewarmingIntensity: insights.prewarmingValue > 0.7 ? 'high' : 'adaptive',
            responseStyle: insights.detailPreference > 0.6 ? 'detailed-explanations' : 'concise-responses'
        };
    }
    // Private helper methods
    extractPatternType(interaction) {
        if (interaction.type)
            return interaction.type;
        if (interaction.query)
            return 'query-based';
        if (interaction.action)
            return 'action-based';
        return 'general-interaction';
    }
    calculateSuccessRate(interaction) {
        if (interaction.success === true)
            return 1.0;
        if (interaction.success === false)
            return 0.0;
        return 0.8; // Default positive assumption
    }
    determineAdjustmentFromFeedback(feedback) {
        if (feedback.includes('slow') || feedback.includes('too detailed'))
            return 'increase_speed';
        if (feedback.includes('incomplete') || feedback.includes('shallow'))
            return 'increase_thoroughness';
        if (feedback.includes('good') || feedback.includes('perfect'))
            return 'maintain_current';
        return 'balanced_adjustment';
    }
    updateBehaviorAdjustment(pattern) {
        switch (pattern.adjustment) {
            case 'increase_speed':
                this.currentAdjustment.searchScopeReduction = true;
                break;
            case 'increase_thoroughness':
                this.currentAdjustment.consultationDepthIncrease = true;
                break;
            case 'maintain_current':
                this.currentAdjustment.balancedApproachReinforcement = true;
                break;
        }
    }
    extractIndicators(pattern) {
        const indicators = [];
        if (pattern.timeout)
            indicators.push('timeout_occurred');
        if (pattern.complexity && pattern.complexity > 7)
            indicators.push('high_complexity');
        if (pattern.responseTime && pattern.responseTime > 3000)
            indicators.push('slow_response');
        return indicators;
    }
    extractConsequences(pattern) {
        const consequences = [];
        if (pattern.userSatisfaction && pattern.userSatisfaction < 0.5) {
            consequences.push('poor_user_satisfaction');
        }
        if (pattern.requiresRetry)
            consequences.push('required_retry');
        return consequences;
    }
    generatePreventionMethods(pattern) {
        const methods = [];
        if (pattern.pattern.includes('timeout')) {
            methods.push('implement_timeout_prevention', 'optimize_query_complexity');
        }
        if (pattern.pattern.includes('complexity')) {
            methods.push('break_down_complex_queries', 'use_progressive_disclosure');
        }
        if (pattern.indicators.includes('slow_response')) {
            methods.push('implement_caching', 'optimize_search_algorithms');
        }
        return methods.length > 0 ? methods : ['general_error_handling'];
    }
    // Utility getters
    getBehaviorPatterns() {
        return [...this.behaviorPatterns];
    }
    getFeedbackPatterns() {
        return [...this.feedbackPatterns];
    }
    getFailurePatterns() {
        return [...this.failurePatterns];
    }
}
