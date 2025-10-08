/**
 * Copyright © 2025, Jonah Sullivan
 */
export class BehavioralRuleManager {
    rules = new Map();
    violations = [];
    patterns = [];
    addBehavioralRule(rule) {
        // Initialize violations count if not set
        if (rule.violations === undefined) {
            rule.violations = 0;
        }
        this.rules.set(rule.id, rule);
    }
    getFoundationRules() {
        // Return all rules that are marked as foundation rules
        return Array.from(this.rules.values()).filter(rule => [
            // Legacy v1.4.3 rules
            'no-unverified-claims',
            'systematic-approach',
            'consult-memory-before-response',
            // New v1.5.0 evidence-based rules
            'evidence-first-principle',
            'atomic-commit-pattern',
            'accountability-chain'
        ].includes(rule.id));
    }
    checkRuleCompliance(ruleId, action) {
        const rule = this.rules.get(ruleId);
        if (!rule)
            return true; // No rule means no violation
        // Basic compliance checking - extensible
        if (ruleId === 'no-unverified-claims' && action.includes('claim without verification')) {
            return false;
        }
        if (ruleId === 'systematic-approach' && action.includes('desperate debugging')) {
            return false;
        }
        return true;
    }
    recordRuleViolation(ruleId, context) {
        // Synchronous version for immediate violation recording
        const violation = {
            id: `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'rule',
            content: `Rule ${ruleId} violated: ${context}`,
            status: 'violated',
            context: { ruleId, originalContext: context }
        };
        this.violations.push(violation);
        // Update rule violation count
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.violations = (rule.violations || 0) + 1;
            rule.lastViolation = violation.timestamp;
        }
    }
    async recordViolation(ruleId, context, correctionPlan, severity = 'moderate') {
        const violation = {
            id: `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'rule',
            content: `Rule ${ruleId} violated: ${context}`,
            status: 'violated',
            context: {
                ruleId,
                severity,
                correctionPlan,
                originalContext: context
            }
        };
        this.violations.push(violation);
        // Update rule violation count
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.violations++;
            rule.lastViolation = violation.timestamp;
        }
    }
    async getBehavioralRules() {
        return Array.from(this.rules.values());
    }
    async updateFoundation(migration, options) {
        // Process foundation migration
        if (migration.rules && Array.isArray(migration.rules)) {
            for (const rule of migration.rules) {
                if (typeof rule === 'object' && rule !== null && 'id' in rule) {
                    this.rules.set(rule.id, rule);
                }
            }
        }
    }
    async viewFoundation(ruleId, checkCompliance, includeExamples) {
        if (ruleId) {
            const rule = this.rules.get(ruleId);
            if (!rule)
                return null;
            const result = { ...rule };
            if (checkCompliance) {
                const recentViolations = this.violations
                    .filter(v => v.context?.ruleId === ruleId)
                    .slice(-5);
                result.compliance = {
                    recentViolations: recentViolations.length,
                    lastViolation: rule.lastViolation,
                    status: recentViolations.length === 0 ? 'compliant' : 'violations_detected'
                };
            }
            if (includeExamples && rule.examples) {
                result.examples = rule.examples;
            }
            return result;
        }
        const allRules = Array.from(this.rules.values());
        if (checkCompliance) {
            return allRules.map(rule => ({
                ...rule,
                compliance: {
                    recentViolations: this.violations.filter(v => v.context?.ruleId === rule.id).length,
                    status: rule.violations === 0 ? 'compliant' : 'violations_detected'
                }
            }));
        }
        return allRules;
    }
    async analyzePatterns() {
        // Analyze violation patterns to identify behavioral trends
        const patternMap = new Map();
        for (const violation of this.violations) {
            const ruleId = violation.context?.ruleId;
            if (!ruleId)
                continue;
            const pattern = patternMap.get(ruleId) || {
                pattern: `Rule ${ruleId} violations`,
                description: `Pattern of violations for rule ${ruleId}`,
                frequency: 0,
                outcome: 'negative',
                lastOccurrence: violation.timestamp
            };
            pattern.frequency++;
            pattern.lastOccurrence = violation.timestamp;
            patternMap.set(ruleId, pattern);
        }
        this.patterns = Array.from(patternMap.values());
        return this.patterns;
    }
    getBehavioralStatus() {
        const recentViolations = this.violations
            .filter(v => {
            const violationTime = new Date(v.timestamp).getTime();
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            return violationTime > oneDayAgo;
        })
            .map(v => {
            const ruleId = v.context?.ruleId;
            const rule = typeof ruleId === 'string' ? this.rules.get(ruleId) : null;
            return {
                id: ruleId,
                rule: rule ? rule.rule : v.content,
                timestamp: v.timestamp,
                severity: v.context?.severity
            };
        });
        return {
            unverifiedClaims: 0, // Will be filled by main class
            recentViolations,
            totalViolations: this.violations.length,
            activeRules: this.rules.size,
            recommendations: this.generateRecommendations()
        };
    }
    generateRecommendations() {
        const recommendations = [];
        if (this.violations.length > 5) {
            recommendations.push("Consider reviewing behavioral patterns - high violation count detected");
        }
        const recentViolations = this.violations.filter(v => {
            const violationTime = new Date(v.timestamp).getTime();
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            return violationTime > oneHourAgo;
        });
        if (recentViolations.length > 0) {
            recommendations.push("Recent violations detected - immediate behavioral correction needed");
        }
        return recommendations;
    }
    // Utility methods for rule management
    addRule(rule) {
        this.rules.set(rule.id, rule);
    }
    getViolations() {
        return [...this.violations];
    }
    getPatterns() {
        return [...this.patterns];
    }
}
