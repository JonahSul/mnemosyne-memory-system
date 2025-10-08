/**
 * Copyright © 2025, Jonah Sullivan
 */
import type { BehavioralRule, MemoryEntry, InteractionPattern } from './memory-interfaces';
/**
 * Behavioral Rule Management Module
 *
 * Handles all behavioral rule operations including rule storage,
 * violation tracking, and pattern analysis
 */
export interface BehavioralRuleOperations {
    addBehavioralRule(rule: BehavioralRule): void;
    recordViolation(ruleId: string, context: string, correctionPlan?: string, severity?: 'minor' | 'moderate' | 'major' | 'critical'): Promise<void>;
    getBehavioralRules(): Promise<BehavioralRule[]>;
    getFoundationRules(): BehavioralRule[];
    checkRuleCompliance(ruleId: string, action: string): boolean;
    recordRuleViolation(ruleId: string, context: string): void;
    getBehavioralStatus(): any;
    updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
    viewFoundation(ruleId?: string, checkCompliance?: string, includeExamples?: string): Promise<any>;
    analyzePatterns(): Promise<InteractionPattern[]>;
}
export declare class BehavioralRuleManager implements BehavioralRuleOperations {
    private rules;
    private violations;
    private patterns;
    addBehavioralRule(rule: BehavioralRule): void;
    getFoundationRules(): BehavioralRule[];
    checkRuleCompliance(ruleId: string, action: string): boolean;
    recordRuleViolation(ruleId: string, context: string): void;
    recordViolation(ruleId: string, context: string, correctionPlan?: string, severity?: 'minor' | 'moderate' | 'major' | 'critical'): Promise<void>;
    getBehavioralRules(): Promise<BehavioralRule[]>;
    updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
    viewFoundation(ruleId?: string, checkCompliance?: string, includeExamples?: string): Promise<any>;
    analyzePatterns(): Promise<InteractionPattern[]>;
    getBehavioralStatus(): any;
    private generateRecommendations;
    addRule(rule: BehavioralRule): void;
    getViolations(): MemoryEntry[];
    getPatterns(): InteractionPattern[];
}
//# sourceMappingURL=behavioral-rules.d.ts.map