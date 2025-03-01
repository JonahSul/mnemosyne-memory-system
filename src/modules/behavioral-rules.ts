import type { BehavioralRule, MemoryEntry, InteractionPattern } from './memory-interfaces';

/**
 * Behavioral Rule Management Module
 * 
 * Handles all behavioral rule operations including rule storage,
 * violation tracking, and pattern analysis
 */
export interface BehavioralRuleOperations {
	recordViolation(ruleId: string, context: string, correctionPlan?: string, severity?: 'minor' | 'moderate' | 'major' | 'critical'): Promise<void>;
	getBehavioralRules(): Promise<BehavioralRule[]>;
	getBehavioralStatus(): any;
	updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
	viewFoundation(ruleId?: string, checkCompliance?: string, includeExamples?: string): Promise<any>;
	analyzePatterns(): Promise<InteractionPattern[]>;
}

export class BehavioralRuleManager implements BehavioralRuleOperations {
	private rules: Map<string, BehavioralRule> = new Map();
	private violations: MemoryEntry[] = [];
	private patterns: InteractionPattern[] = [];

	async recordViolation(
		ruleId: string, 
		context: string, 
		correctionPlan?: string, 
		severity: 'minor' | 'moderate' | 'major' | 'critical' = 'moderate'
	): Promise<void> {
		const violation: MemoryEntry = {
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

	async getBehavioralRules(): Promise<BehavioralRule[]> {
		return Array.from(this.rules.values());
	}

	async updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): Promise<void> {
		// Process foundation migration
		if (migration.rules && Array.isArray(migration.rules)) {
			for (const rule of migration.rules) {
				if (typeof rule === 'object' && rule !== null && 'id' in rule) {
					this.rules.set(rule.id as string, rule as BehavioralRule);
				}
			}
		}
	}

	async viewFoundation(ruleId?: string, checkCompliance?: string, includeExamples?: string): Promise<any> {
		if (ruleId) {
			const rule = this.rules.get(ruleId);
			if (!rule) return null;

			const result: any = { ...rule };
			
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

	async analyzePatterns(): Promise<InteractionPattern[]> {
		// Analyze violation patterns to identify behavioral trends
		const patternMap = new Map<string, InteractionPattern>();

		for (const violation of this.violations) {
			const ruleId = violation.context?.ruleId as string;
			if (!ruleId) continue;

			const pattern = patternMap.get(ruleId) || {
				pattern: `Rule ${ruleId} violations`,
				description: `Pattern of violations for rule ${ruleId}`,
				frequency: 0,
				outcome: 'negative' as const,
				lastOccurrence: violation.timestamp
			};

			pattern.frequency++;
			pattern.lastOccurrence = violation.timestamp;
			patternMap.set(ruleId, pattern);
		}

		this.patterns = Array.from(patternMap.values());
		return this.patterns;
	}

	getBehavioralStatus(): any {
		const recentViolations = this.violations
			.filter(v => {
				const violationTime = new Date(v.timestamp).getTime();
				const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
				return violationTime > oneDayAgo;
			})
			.map(v => {
				const ruleId = v.context?.ruleId;
				const rule = this.rules.get(ruleId);
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

	private generateRecommendations(): string[] {
		const recommendations: string[] = [];
		
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
	addRule(rule: BehavioralRule): void {
		this.rules.set(rule.id, rule);
	}

	getViolations(): MemoryEntry[] {
		return [...this.violations];
	}

	getPatterns(): InteractionPattern[] {
		return [...this.patterns];
	}
}
