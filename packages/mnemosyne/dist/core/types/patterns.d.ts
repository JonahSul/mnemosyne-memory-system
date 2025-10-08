/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Pattern Analysis Types
 *
 * Type definitions for pattern recognition, analysis algorithms,
 * and pattern-based learning systems
 */
export interface Pattern {
    id: string;
    name: string;
    description: string;
    type: 'behavioral' | 'usage' | 'performance' | 'error' | 'success' | 'temporal';
    confidence: number;
    significance: number;
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
    confidence: number;
    match_quality: number;
    variant_characteristics?: string[];
}
export interface PatternDetectionConfig {
    sensitivity: number;
    min_occurrence_threshold: number;
    max_pattern_age: string;
    confidence_threshold: number;
    feature_types: string[];
    temporal_window_size: number;
    context_depth: number;
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
    success_rate: number;
    last_calibration: string;
}
export interface TemporalPattern extends Pattern {
    temporal_characteristics: {
        frequency: number;
        periodicity: string;
        duration_typical: number;
        duration_range: [number, number];
        time_of_day_preference?: string;
        seasonal_variation?: boolean;
    };
    trend_analysis: {
        trend_direction: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
        trend_strength: number;
        prediction_horizon: string;
        prediction_accuracy: number;
    };
}
export interface TemporalSequence {
    sequence_id: string;
    name: string;
    description: string;
    events: TemporalEvent[];
    sequence_constraints: TemporalConstraint[];
    completion_probability: number;
    average_duration: number;
}
export interface TemporalEvent {
    event_id: string;
    event_type: string;
    position_in_sequence: number;
    required: boolean;
    typical_duration: number;
    conditions: string[];
}
export interface TemporalConstraint {
    constraint_type: 'before' | 'after' | 'concurrent' | 'within_time' | 'exactly_after';
    source_event: string;
    target_event: string;
    time_constraint?: number;
    flexibility: number;
}
export interface PatternAnalysis {
    analysis_id: string;
    timestamp: string;
    pattern_id: string;
    occurrence_statistics: {
        total_occurrences: number;
        average_frequency: number;
        frequency_variance: number;
        occurrence_distribution: Record<string, number>;
    };
    quality_metrics: {
        consistency_score: number;
        predictive_power: number;
        false_positive_rate: number;
        false_negative_rate: number;
        precision: number;
        recall: number;
    };
    context_analysis: {
        common_contexts: string[];
        context_diversity: number;
        context_specificity: number;
        environmental_factors: string[];
    };
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
    correlation_strength: number;
    correlation_type: 'positive' | 'negative' | 'neutral';
    statistical_significance: number;
    causal_likelihood: number;
    common_contexts: string[];
    temporal_relationship?: 'concurrent' | 'sequential' | 'causal' | 'independent';
}
export interface PatternLearning {
    learning_session_id: string;
    timestamp: string;
    learning_type: 'supervised' | 'unsupervised' | 'reinforcement' | 'hybrid';
    input_patterns: string[];
    training_data_size: number;
    validation_data_size: number;
    algorithm_used: string;
    hyperparameters: Record<string, unknown>;
    training_duration: number;
    convergence_achieved: boolean;
    patterns_learned: string[];
    patterns_modified: string[];
    patterns_deprecated: string[];
    learning_accuracy: number;
    validation_results: {
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
        cross_validation_score: number;
    };
}
export interface PatternEvolution {
    pattern_id: string;
    evolution_history: PatternEvolutionStep[];
    current_version: string;
    stability_score: number;
    evolution_trend: 'stable' | 'improving' | 'degrading' | 'oscillating';
}
export interface PatternEvolutionStep {
    step_id: string;
    timestamp: string;
    version: string;
    changes_made: string[];
    performance_delta: number;
    stability_impact: number;
    trigger_event: string;
}
export interface PatternApplication {
    application_id: string;
    pattern_id: string;
    timestamp: string;
    application_context: string;
    target_domain: string;
    application_type: 'prediction' | 'classification' | 'recommendation' | 'intervention';
    input_data: Record<string, unknown>;
    processing_steps: string[];
    confidence_level: number;
    output_result: Record<string, unknown>;
    success_probability: number;
    alternative_patterns: string[];
    actual_outcome?: Record<string, unknown>;
    success_achieved?: boolean;
    accuracy_score?: number;
    lessons_learned?: string[];
}
export interface PatternRecommendation {
    recommendation_id: string;
    timestamp: string;
    recommended_patterns: string[];
    recommendation_confidence: number;
    recommendation_rationale: string;
    current_situation: Record<string, unknown>;
    desired_outcome: string;
    constraints: string[];
    expected_effectiveness: number;
    potential_risks: string[];
    risk_mitigation_strategies: string[];
    success_indicators: string[];
    failure_indicators: string[];
    monitoring_plan: string;
}
export interface PatternRegistry {
    registry_id: string;
    name: string;
    description: string;
    patterns: Record<string, Pattern>;
    pattern_categories: Record<string, string[]>;
    pattern_hierarchies: Record<string, string[]>;
    created: string;
    last_updated: string;
    version: string;
    maintainer: string;
    access_policies: Record<string, string>;
    visibility: 'public' | 'private' | 'restricted';
}
export interface PatternSystemStatus {
    timestamp: string;
    system_health: 'optimal' | 'good' | 'degraded' | 'critical';
    detection_engine_status: 'active' | 'inactive' | 'error';
    analysis_engine_status: 'active' | 'inactive' | 'error';
    learning_engine_status: 'active' | 'inactive' | 'error';
    total_patterns: number;
    active_patterns: number;
    pattern_detection_rate: number;
    analysis_throughput: number;
    average_pattern_confidence: number;
    false_positive_rate: number;
    system_accuracy: number;
    memory_usage: number;
    cpu_usage: number;
    storage_usage: number;
}
export interface PatternSystemConfiguration {
    detection_enabled: boolean;
    detection_frequency: string;
    detection_sensitivity: number;
    analysis_depth: 'shallow' | 'medium' | 'deep';
    correlation_analysis_enabled: boolean;
    temporal_analysis_enabled: boolean;
    learning_enabled: boolean;
    learning_mode: 'continuous' | 'batch' | 'manual';
    learning_rate: number;
    max_concurrent_analyses: number;
    result_cache_size: number;
    pattern_retention_period: string;
    validation_required: boolean;
    quality_threshold: number;
    auto_deprecation_enabled: boolean;
}
//# sourceMappingURL=patterns.d.ts.map