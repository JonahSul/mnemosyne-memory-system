export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RuleCategory =
    | 'verification'
    | 'memory_integrity'
    | 'agent_behavior'
    | 'search_discipline'
    | 'safety';

export interface FoundationRule {
    readonly id: string;
    readonly rule: string;
    readonly severity: RuleSeverity;
    readonly category: RuleCategory;
    readonly description?: string;
}

export interface FoundationRules {
    readonly version: string;
    readonly coreRules: FoundationRule[];
    readonly essentialPatterns: unknown[];
    readonly safetyConstraints: unknown[];
}
