/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Behavioral System Types
 *
 * Type definitions for behavioral analysis, intervention strategies,
 * and adaptive memory folding systems
 */
export interface FoldingStrategy {
    name: 'calm' | 'focus' | 'stabilize' | 'stop' | 'standard';
    description: string;
    triggerConditions: string[];
    interventionActions: string[];
    expectedOutcomes: string[];
}
export interface AgentPerformanceMetrics {
    responseTime: number;
    accuracyScore: number;
    consistencyRating: number;
    errorRate: number;
    cognitiveLoad: number;
    timestamp: string;
}
export interface BehavioralAnalysisResult {
    agent_id: string;
    analysis_timestamp: string;
    performance_metrics: AgentPerformanceMetrics;
    detected_patterns: string[];
    confidence_level: number;
    recommended_strategy: FoldingStrategy['name'];
    intervention_urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface StrategyDetermination {
    selected_strategy: FoldingStrategy['name'];
    confidence: number;
    reasoning: string;
    fallback_strategies: FoldingStrategy['name'][];
    expected_effectiveness: number;
}
export interface InterventionOutcome {
    intervention_id: string;
    strategy_applied: FoldingStrategy['name'];
    start_time: string;
    end_time?: string;
    success_indicators: string[];
    effectiveness_score: number;
    learned_patterns: string[];
}
export interface BehavioralRule {
    id: string;
    name: string;
    description: string;
    category: 'cognitive' | 'operational' | 'ethical' | 'performance';
    priority: 'critical' | 'high' | 'medium' | 'low';
    trigger_pattern: string;
    trigger_conditions: string[];
    required_action: string;
    intervention_type: 'immediate' | 'gradual' | 'conditional';
    violations: number;
    last_violation?: string;
    enforcement_history: EnforcementRecord[];
    created: string;
    last_updated: string;
    active: boolean;
    examples?: string[];
}
export interface EnforcementRecord {
    timestamp: string;
    violation_context: string;
    action_taken: string;
    effectiveness: number;
    outcome: 'resolved' | 'partial' | 'failed';
}
export interface InteractionPattern {
    id: string;
    pattern_name: string;
    description: string;
    category: 'success' | 'failure' | 'neutral' | 'warning';
    frequency: number;
    consistency_score: number;
    predictive_value: number;
    failure_indicators: string[];
    success_indicators: string[];
    warning_indicators: string[];
    first_occurrence: string;
    last_occurrence: string;
    occurrence_pattern: 'increasing' | 'decreasing' | 'stable' | 'sporadic';
    typical_contexts: string[];
    associated_behaviors: string[];
}
export interface PatternSnapshot {
    timestamp: string;
    frequency: number;
    effectiveness: number;
    context_changes: string[];
}
export interface CognitiveState {
    agent_id: string;
    timestamp: string;
    attention_level: number;
    processing_efficiency: number;
    memory_accessibility: number;
    decision_confidence: number;
    cognitive_load: number;
    error_proneness: number;
    response_latency: number;
    consistency_score: number;
    adaptability_score: number;
    learning_rate: number;
    current_task_type: string;
    environment_complexity: number;
    external_stressors: string[];
}
export interface CognitiveStateHistory {
    agent_id: string;
    states: CognitiveState[];
    trend_analysis: {
        attention_trend: 'improving' | 'declining' | 'stable';
        efficiency_trend: 'improving' | 'declining' | 'stable';
        stress_trend: 'increasing' | 'decreasing' | 'stable';
    };
    recommendations: string[];
}
export interface BehavioralIntervention {
    id: string;
    timestamp: string;
    type: 'cognitive_assist' | 'behavior_modification' | 'environmental_change' | 'task_adjustment';
    strategy: FoldingStrategy['name'];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    target_agent: string;
    target_behavior: string;
    intervention_context: string;
    actions_taken: string[];
    duration_planned: number;
    duration_actual?: number;
    immediate_effects: string[];
    success_metrics: Record<string, number>;
    side_effects?: string[];
    lessons_learned: string[];
    pattern_updates: string[];
    rule_modifications: string[];
}
export interface InterventionPlan {
    id: string;
    target_issue: string;
    proposed_interventions: BehavioralIntervention[];
    risk_assessment: {
        likelihood_of_success: number;
        potential_side_effects: string[];
        risk_mitigation_strategies: string[];
    };
    monitoring_plan: {
        success_indicators: string[];
        failure_indicators: string[];
        monitoring_frequency: string;
        escalation_triggers: string[];
    };
}
export interface BehavioralFeedback {
    id: string;
    timestamp: string;
    source: 'user' | 'system' | 'agent' | 'external';
    feedback_type: 'positive' | 'negative' | 'neutral' | 'corrective';
    content: string;
    confidence_level: number;
    behavior_observed: string;
    situation_context: string;
    expected_behavior: string;
    processed: boolean;
    applied_changes: string[];
    impact_assessment: number;
}
export interface LearningOutcome {
    id: string;
    timestamp: string;
    pattern_learned: string;
    rule_derived: string;
    confidence_level: number;
    source_interactions: string[];
    learning_mechanism: 'observation' | 'feedback' | 'trial_error' | 'instruction';
    context_factors: string[];
    validation_status: 'pending' | 'validated' | 'rejected' | 'modified';
    validation_evidence: string[];
    applied_successfully: boolean;
    application_contexts: string[];
    effectiveness_measures: Record<string, number>;
}
export interface BehavioralSystemStatus {
    timestamp: string;
    system_health: 'optimal' | 'good' | 'degraded' | 'critical';
    rule_engine_status: 'active' | 'inactive' | 'error';
    pattern_analyzer_status: 'active' | 'inactive' | 'error';
    intervention_system_status: 'active' | 'inactive' | 'error';
    active_rules: number;
    detected_patterns: number;
    pending_interventions: number;
    system_load: number;
    recent_violations: number;
    recent_interventions: number;
    recent_learning_events: number;
    monitoring_frequency: string;
    intervention_threshold: number;
    learning_enabled: boolean;
}
export interface BehavioralConfiguration {
    rule_enforcement_level: 'strict' | 'moderate' | 'lenient';
    auto_rule_creation: boolean;
    rule_expiration_policy: string;
    pattern_detection_sensitivity: number;
    pattern_retention_period: string;
    min_pattern_frequency: number;
    auto_intervention_enabled: boolean;
    intervention_cooldown_period: string;
    max_concurrent_interventions: number;
    learning_rate: number;
    feedback_integration_mode: 'immediate' | 'batch' | 'manual';
    confidence_threshold: number;
}
//# sourceMappingURL=behavioral.d.ts.map