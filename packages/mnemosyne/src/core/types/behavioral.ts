/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Behavioral System Types
 * 
 * Type definitions for behavioral analysis, intervention strategies,
 * and adaptive memory folding systems
 */

// ============================================================================
// ADAPTIVE MEMORY FOLDING TYPES
// ============================================================================

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

// ============================================================================
// BEHAVIORAL RULE SYSTEM
// ============================================================================

export interface BehavioralRule {
	id: string;
	name: string;
	description: string;
	category: 'cognitive' | 'operational' | 'ethical' | 'performance';
	priority: 'critical' | 'high' | 'medium' | 'low';
	
	// Trigger System
	trigger_pattern: string;
	trigger_conditions: string[];
	
	// Action System
	required_action: string;
	intervention_type: 'immediate' | 'gradual' | 'conditional';
	
	// Tracking
	violations: number;
	last_violation?: string;
	enforcement_history: EnforcementRecord[];
	
	// Metadata
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

// ============================================================================
// PATTERN ANALYSIS TYPES
// ============================================================================

export interface InteractionPattern {
	id: string;
	pattern_name: string;
	description: string;
	category: 'success' | 'failure' | 'neutral' | 'warning';
	
	// Pattern Characteristics
	frequency: number;
	consistency_score: number;
	predictive_value: number;
	
	// Indicators
	failure_indicators: string[];
	success_indicators: string[];
	warning_indicators: string[];
	
	// Temporal Data
	first_occurrence: string;
	last_occurrence: string;
	occurrence_pattern: 'increasing' | 'decreasing' | 'stable' | 'sporadic';
	
	// Context
	typical_contexts: string[];
	associated_behaviors: string[];
}

export interface PatternSnapshot {
	timestamp: string;
	frequency: number;
	effectiveness: number;
	context_changes: string[];
}

// ============================================================================
// COGNITIVE STATE TYPES
// ============================================================================

export interface CognitiveState {
	agent_id: string;
	timestamp: string;
	
	// Core Metrics
	attention_level: number; // 0-1
	processing_efficiency: number; // 0-1
	memory_accessibility: number; // 0-1
	decision_confidence: number; // 0-1
	
	// Stress Indicators
	cognitive_load: number; // 0-1
	error_proneness: number; // 0-1
	response_latency: number; // milliseconds
	
	// Behavioral Indicators
	consistency_score: number; // 0-1
	adaptability_score: number; // 0-1
	learning_rate: number; // 0-1
	
	// Context
	current_task_type: string;
	environment_complexity: number; // 0-1
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

// ============================================================================
// INTERVENTION SYSTEM TYPES
// ============================================================================

export interface BehavioralIntervention {
	id: string;
	timestamp: string;
	
	// Intervention Details
	type: 'cognitive_assist' | 'behavior_modification' | 'environmental_change' | 'task_adjustment';
	strategy: FoldingStrategy['name'];
	urgency: 'low' | 'medium' | 'high' | 'critical';
	
	// Target and Context
	target_agent: string;
	target_behavior: string;
	intervention_context: string;
	
	// Implementation
	actions_taken: string[];
	duration_planned: number; // minutes
	duration_actual?: number; // minutes
	
	// Results
	immediate_effects: string[];
	success_metrics: Record<string, number>;
	side_effects?: string[];
	
	// Learning
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

// ============================================================================
// FEEDBACK AND LEARNING TYPES
// ============================================================================

export interface BehavioralFeedback {
	id: string;
	timestamp: string;
	source: 'user' | 'system' | 'agent' | 'external';
	
	// Feedback Content
	feedback_type: 'positive' | 'negative' | 'neutral' | 'corrective';
	content: string;
	confidence_level: number; // 0-1
	
	// Context
	behavior_observed: string;
	situation_context: string;
	expected_behavior: string;
	
	// Processing
	processed: boolean;
	applied_changes: string[];
	impact_assessment: number; // 0-1
}

export interface LearningOutcome {
	id: string;
	timestamp: string;
	
	// Learning Content
	pattern_learned: string;
	rule_derived: string;
	confidence_level: number; // 0-1
	
	// Source and Context
	source_interactions: string[];
	learning_mechanism: 'observation' | 'feedback' | 'trial_error' | 'instruction';
	context_factors: string[];
	
	// Validation
	validation_status: 'pending' | 'validated' | 'rejected' | 'modified';
	validation_evidence: string[];
	
	// Application
	applied_successfully: boolean;
	application_contexts: string[];
	effectiveness_measures: Record<string, number>;
}

// ============================================================================
// SYSTEM INTEGRATION TYPES
// ============================================================================

export interface BehavioralSystemStatus {
	timestamp: string;
	system_health: 'optimal' | 'good' | 'degraded' | 'critical';
	
	// Component Status
	rule_engine_status: 'active' | 'inactive' | 'error';
	pattern_analyzer_status: 'active' | 'inactive' | 'error';
	intervention_system_status: 'active' | 'inactive' | 'error';
	
	// Performance Metrics
	active_rules: number;
	detected_patterns: number;
	pending_interventions: number;
	system_load: number; // 0-1
	
	// Recent Activity
	recent_violations: number;
	recent_interventions: number;
	recent_learning_events: number;
	
	// System Configuration
	monitoring_frequency: string;
	intervention_threshold: number;
	learning_enabled: boolean;
}

export interface BehavioralConfiguration {
	// Rule System Configuration
	rule_enforcement_level: 'strict' | 'moderate' | 'lenient';
	auto_rule_creation: boolean;
	rule_expiration_policy: string;
	
	// Pattern Analysis Configuration
	pattern_detection_sensitivity: number; // 0-1
	pattern_retention_period: string;
	min_pattern_frequency: number;
	
	// Intervention Configuration
	auto_intervention_enabled: boolean;
	intervention_cooldown_period: string;
	max_concurrent_interventions: number;
	
	// Learning Configuration
	learning_rate: number; // 0-1
	feedback_integration_mode: 'immediate' | 'batch' | 'manual';
	confidence_threshold: number; // 0-1
}
