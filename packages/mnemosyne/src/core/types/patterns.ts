/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Pattern Analysis Types
 * 
 * Type definitions for pattern recognition, analysis algorithms,
 * and pattern-based learning systems
 */

// ============================================================================
// CORE PATTERN TYPES
// ============================================================================

export interface Pattern {
	id: string;
	name: string;
	description: string;
	type: 'behavioral' | 'usage' | 'performance' | 'error' | 'success' | 'temporal';
	confidence: number; // 0-1
	significance: number; // 0-1
	created: string;
	last_updated: string;
	status: 'active' | 'deprecated' | 'experimental' | 'archived';
}

export interface PatternSignature {
	pattern_id: string;
	signature_hash: string;
	feature_vector: number[];
	dimensionality: number;
	similarity_threshold: number;
	created: string;
}

export interface PatternOccurrence {
	pattern_id: string;
	occurrence_id: string;
	timestamp: string;
	context: Record<string, unknown>;
	confidence: number; // 0-1
	match_quality: number; // 0-1
	variant_characteristics?: string[];
}

// ============================================================================
// PATTERN DETECTION TYPES
// ============================================================================

export interface PatternDetectionConfig {
	// Detection Parameters
	sensitivity: number; // 0-1
	min_occurrence_threshold: number;
	max_pattern_age: string; // duration string
	confidence_threshold: number; // 0-1
	
	// Feature Extraction
	feature_types: string[];
	temporal_window_size: number; // seconds
	context_depth: number;
	
	// Filtering
	noise_filter_enabled: boolean;
	pattern_validation_required: boolean;
	auto_archival_enabled: boolean;
}

export interface PatternDetectionResult {
	detection_id: string;
	timestamp: string;
	patterns_detected: Pattern[];
	confidence_scores: Record<string, number>;
	detection_metadata: {
		algorithm_used: string;
		processing_time_ms: number;
		data_points_analyzed: number;
		false_positive_likelihood: number;
	};
}

export interface PatternValidator {
	validator_id: string;
	name: string;
	description: string;
	validation_algorithm: string;
	success_rate: number; // 0-1
	last_calibration: string;
}

// ============================================================================
// TEMPORAL PATTERN TYPES
// ============================================================================

export interface TemporalPattern extends Pattern {
	temporal_characteristics: {
		frequency: number; // occurrences per time unit
		periodicity: string; // 'daily', 'weekly', 'monthly', 'irregular'
		duration_typical: number; // typical duration in seconds
		duration_range: [number, number]; // [min, max] duration range
		time_of_day_preference?: string; // if pattern occurs at specific times
		seasonal_variation?: boolean;
	};
	trend_analysis: {
		trend_direction: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
		trend_strength: number; // 0-1
		prediction_horizon: string; // how far ahead we can predict
		prediction_accuracy: number; // 0-1
	};
}

export interface TemporalSequence {
	sequence_id: string;
	name: string;
	description: string;
	events: TemporalEvent[];
	sequence_constraints: TemporalConstraint[];
	completion_probability: number; // 0-1
	average_duration: number; // seconds
}

export interface TemporalEvent {
	event_id: string;
	event_type: string;
	position_in_sequence: number;
	required: boolean;
	typical_duration: number; // seconds
	conditions: string[];
}

export interface TemporalConstraint {
	constraint_type: 'before' | 'after' | 'concurrent' | 'within_time' | 'exactly_after';
	source_event: string;
	target_event: string;
	time_constraint?: number; // seconds
	flexibility: number; // 0-1, how strict the constraint is
}

// ============================================================================
// PATTERN ANALYSIS TYPES
// ============================================================================

export interface PatternAnalysis {
	analysis_id: string;
	timestamp: string;
	pattern_id: string;
	
	// Statistical Analysis
	occurrence_statistics: {
		total_occurrences: number;
		average_frequency: number;
		frequency_variance: number;
		occurrence_distribution: Record<string, number>;
	};
	
	// Quality Metrics
	quality_metrics: {
		consistency_score: number; // 0-1
		predictive_power: number; // 0-1
		false_positive_rate: number; // 0-1
		false_negative_rate: number; // 0-1
		precision: number; // 0-1
		recall: number; // 0-1
	};
	
	// Context Analysis
	context_analysis: {
		common_contexts: string[];
		context_diversity: number; // 0-1
		context_specificity: number; // 0-1
		environmental_factors: string[];
	};
	
	// Relationship Analysis
	relationship_analysis: {
		correlated_patterns: string[];
		causal_relationships: string[];
		dependency_patterns: string[];
		mutual_exclusion_patterns: string[];
	};
}

export interface PatternCorrelation {
	correlation_id: string;
	pattern_a: string;
	pattern_b: string;
	correlation_strength: number; // -1 to 1
	correlation_type: 'positive' | 'negative' | 'neutral';
	statistical_significance: number; // 0-1
	causal_likelihood: number; // 0-1
	common_contexts: string[];
	temporal_relationship?: 'concurrent' | 'sequential' | 'causal' | 'independent';
}

// ============================================================================
// PATTERN LEARNING TYPES
// ============================================================================

export interface PatternLearning {
	learning_session_id: string;
	timestamp: string;
	learning_type: 'supervised' | 'unsupervised' | 'reinforcement' | 'hybrid';
	
	// Learning Data
	input_patterns: string[];
	training_data_size: number;
	validation_data_size: number;
	
	// Learning Process
	algorithm_used: string;
	hyperparameters: Record<string, unknown>;
	training_duration: number; // seconds
	convergence_achieved: boolean;
	
	// Learning Outcomes
	patterns_learned: string[];
	patterns_modified: string[];
	patterns_deprecated: string[];
	learning_accuracy: number; // 0-1
	
	// Validation
	validation_results: {
		accuracy: number; // 0-1
		precision: number; // 0-1
		recall: number; // 0-1
		f1_score: number; // 0-1
		cross_validation_score: number; // 0-1
	};
}

export interface PatternEvolution {
	pattern_id: string;
	evolution_history: PatternEvolutionStep[];
	current_version: string;
	stability_score: number; // 0-1
	evolution_trend: 'stable' | 'improving' | 'degrading' | 'oscillating';
}

export interface PatternEvolutionStep {
	step_id: string;
	timestamp: string;
	version: string;
	changes_made: string[];
	performance_delta: number; // change in performance
	stability_impact: number; // impact on pattern stability
	trigger_event: string;
}

// ============================================================================
// PATTERN APPLICATION TYPES
// ============================================================================

export interface PatternApplication {
	application_id: string;
	pattern_id: string;
	timestamp: string;
	
	// Application Context
	application_context: string;
	target_domain: string;
	application_type: 'prediction' | 'classification' | 'recommendation' | 'intervention';
	
	// Application Process
	input_data: Record<string, unknown>;
	processing_steps: string[];
	confidence_level: number; // 0-1
	
	// Results
	output_result: Record<string, unknown>;
	success_probability: number; // 0-1
	alternative_patterns: string[];
	
	// Validation
	actual_outcome?: Record<string, unknown>;
	success_achieved?: boolean;
	accuracy_score?: number; // 0-1
	lessons_learned?: string[];
}

export interface PatternRecommendation {
	recommendation_id: string;
	timestamp: string;
	
	// Recommendation Details
	recommended_patterns: string[];
	recommendation_confidence: number; // 0-1
	recommendation_rationale: string;
	
	// Context
	current_situation: Record<string, unknown>;
	desired_outcome: string;
	constraints: string[];
	
	// Expected Impact
	expected_effectiveness: number; // 0-1
	potential_risks: string[];
	risk_mitigation_strategies: string[];
	
	// Monitoring
	success_indicators: string[];
	failure_indicators: string[];
	monitoring_plan: string;
}

// ============================================================================
// PATTERN SYSTEM TYPES
// ============================================================================

export interface PatternRegistry {
	registry_id: string;
	name: string;
	description: string;
	
	// Registry Contents
	patterns: Record<string, Pattern>;
	pattern_categories: Record<string, string[]>;
	pattern_hierarchies: Record<string, string[]>;
	
	// Registry Metadata
	created: string;
	last_updated: string;
	version: string;
	maintainer: string;
	
	// Access Control
	access_policies: Record<string, string>;
	visibility: 'public' | 'private' | 'restricted';
}

export interface PatternSystemStatus {
	timestamp: string;
	system_health: 'optimal' | 'good' | 'degraded' | 'critical';
	
	// Component Status
	detection_engine_status: 'active' | 'inactive' | 'error';
	analysis_engine_status: 'active' | 'inactive' | 'error';
	learning_engine_status: 'active' | 'inactive' | 'error';
	
	// Performance Metrics
	total_patterns: number;
	active_patterns: number;
	pattern_detection_rate: number; // patterns per minute
	analysis_throughput: number; // analyses per minute
	
	// Quality Metrics
	average_pattern_confidence: number; // 0-1
	false_positive_rate: number; // 0-1
	system_accuracy: number; // 0-1
	
	// Resource Usage
	memory_usage: number; // MB
	cpu_usage: number; // 0-1
	storage_usage: number; // MB
}

export interface PatternSystemConfiguration {
	// Detection Configuration
	detection_enabled: boolean;
	detection_frequency: string; // cron expression
	detection_sensitivity: number; // 0-1
	
	// Analysis Configuration
	analysis_depth: 'shallow' | 'medium' | 'deep';
	correlation_analysis_enabled: boolean;
	temporal_analysis_enabled: boolean;
	
	// Learning Configuration
	learning_enabled: boolean;
	learning_mode: 'continuous' | 'batch' | 'manual';
	learning_rate: number; // 0-1
	
	// Performance Configuration
	max_concurrent_analyses: number;
	result_cache_size: number;
	pattern_retention_period: string;
	
	// Quality Assurance
	validation_required: boolean;
	quality_threshold: number; // 0-1
	auto_deprecation_enabled: boolean;
}
