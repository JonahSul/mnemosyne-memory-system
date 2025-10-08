/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Workflow System Types
 *
 * Type definitions for workflow management, process orchestration,
 * and integration systems
 */
export interface Workflow {
    id: string;
    name: string;
    description: string;
    version: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'archived';
    steps: WorkflowStep[];
    dependencies: WorkflowDependency[];
    triggers: WorkflowTrigger[];
    context: Record<string, unknown>;
    variables: Record<string, unknown>;
    created: string;
    created_by: string;
    last_updated: string;
    last_executed?: string;
    timeout_duration?: number;
    retry_policy?: RetryPolicy;
    error_handling?: ErrorHandlingPolicy;
}
export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    type: 'task' | 'decision' | 'parallel' | 'loop' | 'wait' | 'merge';
    position: number;
    configuration: Record<string, unknown>;
    conditions?: string[];
    timeout?: number;
    depends_on: string[];
    blocks: string[];
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    started_at?: string;
    completed_at?: string;
    error_message?: string;
    output?: Record<string, unknown>;
    success_criteria?: string[];
    failure_criteria?: string[];
}
export interface WorkflowDependency {
    id: string;
    source_step: string;
    target_step: string;
    dependency_type: 'sequential' | 'conditional' | 'data' | 'resource';
    condition?: string;
    data_mapping?: Record<string, string>;
}
export interface WorkflowTrigger {
    id: string;
    name: string;
    type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'condition';
    configuration: Record<string, unknown>;
    enabled: boolean;
    last_triggered?: string;
    trigger_count: number;
}
export interface WorkflowExecution {
    execution_id: string;
    workflow_id: string;
    trigger_id?: string;
    started_at: string;
    completed_at?: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
    current_step?: string;
    completed_steps: string[];
    failed_steps: string[];
    skipped_steps: string[];
    execution_context: Record<string, unknown>;
    input_data: Record<string, unknown>;
    output_data?: Record<string, unknown>;
    execution_time: number;
    steps_completed: number;
    steps_total: number;
    resource_usage?: ResourceUsage;
    errors: WorkflowError[];
    retry_attempts: number;
    recovery_actions: string[];
}
export interface WorkflowError {
    error_id: string;
    timestamp: string;
    step_id: string;
    error_type: string;
    error_message: string;
    error_details?: Record<string, unknown>;
    recovery_possible: boolean;
    recovery_actions?: string[];
}
export interface ResourceUsage {
    memory_peak_mb: number;
    cpu_time_seconds: number;
    network_requests: number;
    storage_operations: number;
    external_api_calls: number;
}
export interface WorkflowOrchestrator {
    orchestrator_id: string;
    name: string;
    status: 'active' | 'inactive' | 'maintenance';
    max_concurrent_workflows: number;
    current_load: number;
    queue_size: number;
    workflows_executed: number;
    workflows_succeeded: number;
    workflows_failed: number;
    average_execution_time: number;
    scheduling_policy: 'fifo' | 'priority' | 'fair_share' | 'custom';
    resource_limits: ResourceLimits;
    timeout_policy: TimeoutPolicy;
}
export interface ResourceLimits {
    max_memory_per_workflow: number;
    max_cpu_time_per_workflow: number;
    max_network_requests_per_workflow: number;
    max_storage_operations_per_workflow: number;
    global_rate_limits: Record<string, number>;
}
export interface TimeoutPolicy {
    default_step_timeout: number;
    default_workflow_timeout: number;
    escalation_timeouts: number[];
    timeout_actions: string[];
}
export interface RetryPolicy {
    max_retries: number;
    retry_delays: number[];
    retry_conditions: string[];
    backoff_strategy: 'fixed' | 'exponential' | 'linear' | 'custom';
    retry_on_errors: string[];
}
export interface ErrorHandlingPolicy {
    error_escalation: boolean;
    notification_channels: string[];
    recovery_strategies: string[];
    fallback_workflows: string[];
    error_logging_level: 'minimal' | 'standard' | 'detailed' | 'debug';
}
export interface WorkflowIntegration {
    integration_id: string;
    name: string;
    type: 'memory_system' | 'behavioral_system' | 'pattern_analysis' | 'external_api' | 'database';
    status: 'active' | 'inactive' | 'error';
    endpoint: string;
    authentication: AuthenticationConfig;
    data_mapping: Record<string, string>;
    requests_made: number;
    requests_successful: number;
    average_response_time: number;
    last_successful_request?: string;
    last_error?: string;
    rate_limit: number;
    current_usage: number;
    quota_reset_time?: string;
}
export interface AuthenticationConfig {
    type: 'none' | 'api_key' | 'oauth' | 'basic' | 'custom';
    credentials: Record<string, string>;
    expiration?: string;
    refresh_token?: string;
}
export interface DataTransformation {
    transformation_id: string;
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
    output_schema: Record<string, unknown>;
    transformation_rules: TransformationRule[];
    validation_enabled: boolean;
    validation_rules: string[];
    error_handling: 'fail' | 'skip' | 'default_value' | 'custom';
}
export interface TransformationRule {
    rule_id: string;
    source_field: string;
    target_field: string;
    transformation_type: 'copy' | 'format' | 'calculate' | 'lookup' | 'custom';
    transformation_logic: string;
    conditions?: string[];
}
export interface WorkflowCheckpoint {
    checkpoint_id: string;
    workflow_execution_id: string;
    step_id: string;
    timestamp: string;
    execution_state: Record<string, unknown>;
    variables_state: Record<string, unknown>;
    context_state: Record<string, unknown>;
    checkpoint_type: 'automatic' | 'manual' | 'error_recovery';
    description?: string;
    created_by?: string;
    recovery_possible: boolean;
    recovery_steps?: string[];
    dependencies?: string[];
}
export interface CheckpointManager {
    manager_id: string;
    auto_checkpoint_enabled: boolean;
    checkpoint_frequency: string;
    max_checkpoints_per_workflow: number;
    checkpoint_retention_period: string;
    storage_backend: 'memory' | 'disk' | 'database' | 'cloud';
    compression_enabled: boolean;
    encryption_enabled: boolean;
    checkpoints_created: number;
    checkpoints_restored: number;
    average_checkpoint_size: number;
    average_restore_time: number;
}
export interface WorkflowMonitoring {
    monitoring_id: string;
    workflow_id: string;
    monitoring_enabled: boolean;
    monitoring_frequency: number;
    alert_thresholds: AlertThreshold[];
    notification_channels: NotificationChannel[];
    last_check: string;
    health_score: number;
    active_alerts: WorkflowAlert[];
    performance_history: PerformanceMetric[];
    error_history: WorkflowError[];
    availability_history: AvailabilityMetric[];
}
export interface AlertThreshold {
    metric_name: string;
    threshold_value: number;
    comparison_operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
    severity: 'low' | 'medium' | 'high' | 'critical';
    notification_delay: number;
}
export interface NotificationChannel {
    channel_id: string;
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'push';
    configuration: Record<string, unknown>;
    enabled: boolean;
    filters: NotificationFilter[];
}
export interface NotificationFilter {
    filter_type: 'severity' | 'workflow' | 'step' | 'error_type';
    filter_value: string;
    include: boolean;
}
export interface WorkflowAlert {
    alert_id: string;
    timestamp: string;
    workflow_id: string;
    step_id?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    alert_type: string;
    message: string;
    details?: Record<string, unknown>;
    status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
    acknowledged_by?: string;
    acknowledged_at?: string;
    resolved_at?: string;
    actions_taken: string[];
    escalation_level: number;
    notification_sent: boolean;
}
export interface PerformanceMetric {
    timestamp: string;
    metric_name: string;
    metric_value: number;
    unit: string;
    context?: Record<string, unknown>;
}
export interface AvailabilityMetric {
    timestamp: string;
    availability_percentage: number;
    uptime_seconds: number;
    downtime_seconds: number;
    incidents: number;
}
export interface WorkflowAnalytics {
    analytics_id: string;
    workflow_id: string;
    analysis_period: {
        start_date: string;
        end_date: string;
    };
    execution_statistics: {
        total_executions: number;
        successful_executions: number;
        failed_executions: number;
        average_execution_time: number;
        median_execution_time: number;
        success_rate: number;
    };
    performance_metrics: {
        throughput: number;
        resource_efficiency: number;
        bottleneck_steps: string[];
        optimization_opportunities: string[];
    };
    trend_analysis: {
        execution_trend: 'increasing' | 'decreasing' | 'stable';
        success_rate_trend: 'improving' | 'degrading' | 'stable';
        performance_trend: 'improving' | 'degrading' | 'stable';
        predictions: WorkflowPrediction[];
    };
    recommendations: {
        optimization_recommendations: string[];
        scaling_recommendations: string[];
        maintenance_recommendations: string[];
        cost_optimization_recommendations: string[];
    };
}
export interface WorkflowPrediction {
    prediction_type: 'execution_count' | 'success_rate' | 'performance' | 'failure_rate';
    time_horizon: string;
    predicted_value: number;
    confidence_interval: [number, number];
    confidence_level: number;
}
//# sourceMappingURL=workflow.d.ts.map