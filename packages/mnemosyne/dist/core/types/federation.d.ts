/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Federation System Types
 *
 * Type definitions for multi-agent federation, identity management,
 * and distributed collaboration systems
 */
export interface FederationNode {
    node_id: string;
    name: string;
    description: string;
    type: 'coordinator' | 'delegate' | 'observer' | 'specialist';
    status: 'active' | 'inactive' | 'maintenance' | 'failed';
    capabilities: FederationCapability[];
    resource_capacity: ResourceCapacity;
    specializations: string[];
    endpoint: string;
    protocol_version: string;
    last_heartbeat: string;
    network_latency: number;
    trust_level: number;
    security_clearance: SecurityClearance;
    authentication_method: string;
    created: string;
    last_updated: string;
    owner: string;
    tags: string[];
}
export interface FederationCapability {
    capability_id: string;
    name: string;
    description: string;
    category: 'memory' | 'computation' | 'analysis' | 'storage' | 'communication';
    performance_level: number;
    availability: number;
    resource_cost: number;
    quality_score: number;
}
export interface ResourceCapacity {
    memory_mb: number;
    cpu_cores: number;
    storage_gb: number;
    network_bandwidth_mbps: number;
    concurrent_tasks: number;
    utilization_current: number;
    utilization_average: number;
}
export interface SecurityClearance {
    level: 'public' | 'restricted' | 'confidential' | 'secret' | 'top_secret';
    permissions: string[];
    restrictions: string[];
    expiration?: string;
    granted_by: string;
    granted_at: string;
}
export interface FederationIdentity {
    identity_id: string;
    name: string;
    type: 'human' | 'agent' | 'system' | 'service';
    status: 'active' | 'inactive' | 'suspended' | 'revoked';
    display_name: string;
    description?: string;
    organization?: string;
    contact_info?: ContactInfo;
    roles: FederationRole[];
    permissions: Permission[];
    delegation_rights: DelegationRight[];
    authentication_methods: AuthenticationMethod[];
    multi_factor_required: boolean;
    session_timeout: number;
    trust_score: number;
    reputation_score: number;
    verification_status: 'unverified' | 'pending' | 'verified' | 'disputed';
    created: string;
    last_login?: string;
    login_count: number;
    created_by: string;
}
export interface ContactInfo {
    email?: string;
    phone?: string;
    alternate_contacts: string[];
    preferred_contact_method: string;
    contact_restrictions?: string[];
}
export interface FederationRole {
    role_id: string;
    name: string;
    description: string;
    hierarchy_level: number;
    scope: 'global' | 'node' | 'domain' | 'resource';
    scope_targets?: string[];
    inherent_permissions: string[];
    assignable_permissions: string[];
    forbidden_permissions: string[];
    assignable_by: string[];
    revocable_by: string[];
    temporary_assignment_allowed: boolean;
    max_assignment_duration?: number;
}
export interface Permission {
    permission_id: string;
    name: string;
    description: string;
    category: 'read' | 'write' | 'execute' | 'admin' | 'delegate';
    resource_type: string;
    resource_identifiers?: string[];
    conditions?: PermissionCondition[];
    delegatable: boolean;
    delegation_depth: number;
    granted_at: string;
    expires_at?: string;
    temporary: boolean;
}
export interface PermissionCondition {
    condition_type: 'time' | 'location' | 'context' | 'approval' | 'custom';
    condition_value: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
    required: boolean;
}
export interface DelegationRight {
    delegation_id: string;
    delegator: string;
    delegatee: string;
    permissions_delegated: string[];
    delegation_depth: number;
    further_delegation_allowed: boolean;
    conditions?: DelegationCondition[];
    granted_at: string;
    expires_at?: string;
    active: boolean;
    usage_count: number;
    last_used?: string;
    audit_trail: DelegationAuditEntry[];
}
export interface DelegationCondition {
    condition_type: string;
    condition_value: string;
    enforcement_level: 'advisory' | 'warning' | 'blocking';
}
export interface DelegationAuditEntry {
    timestamp: string;
    action: string;
    resource_accessed: string;
    outcome: 'success' | 'failure' | 'partial';
    details?: Record<string, unknown>;
}
export interface AuthenticationMethod {
    method_id: string;
    type: 'password' | 'api_key' | 'certificate' | 'oauth' | 'biometric' | 'multi_factor';
    status: 'active' | 'inactive' | 'expired' | 'revoked';
    configuration: Record<string, unknown>;
    strength_score: number;
    last_used?: string;
    usage_count: number;
    compromise_indicators: string[];
    security_events: SecurityEvent[];
    rotation_required: boolean;
    rotation_schedule?: string;
}
export interface SecurityEvent {
    event_id: string;
    timestamp: string;
    event_type: 'login_success' | 'login_failure' | 'permission_escalation' | 'suspicious_activity' | 'security_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, unknown>;
    source_ip?: string;
    user_agent?: string;
    investigation_status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}
export interface FederationMessage {
    message_id: string;
    sender: string;
    recipients: string[];
    timestamp: string;
    message_type: 'request' | 'response' | 'notification' | 'broadcast' | 'heartbeat';
    subject: string;
    content: Record<string, unknown>;
    attachments?: MessageAttachment[];
    routing_path: string[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    delivery_requirements: DeliveryRequirement[];
    status: 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'expired';
    delivery_attempts: number;
    last_attempt?: string;
    encrypted: boolean;
    signed: boolean;
    signature_valid?: boolean;
    integrity_verified?: boolean;
}
export interface MessageAttachment {
    attachment_id: string;
    name: string;
    type: string;
    size_bytes: number;
    content_hash: string;
    encrypted: boolean;
    access_permissions: string[];
}
export interface DeliveryRequirement {
    requirement_type: 'acknowledgment' | 'read_receipt' | 'delivery_confirmation' | 'execution_confirmation';
    timeout: number;
    retry_count: number;
    failure_action: 'ignore' | 'escalate' | 'retry' | 'fallback';
}
export interface FederationProtocol {
    protocol_id: string;
    name: string;
    version: string;
    description: string;
    message_formats: Record<string, unknown>;
    communication_patterns: CommunicationPattern[];
    security_requirements: SecurityRequirement[];
    supported_by: string[];
    compatibility_matrix: Record<string, string[]>;
    migration_paths: ProtocolMigration[];
    standardized: boolean;
    official_specification_url?: string;
    implementation_guide_url?: string;
    last_updated: string;
}
export interface CommunicationPattern {
    pattern_name: string;
    description: string;
    message_flow: MessageFlow[];
    timing_constraints: TimingConstraint[];
    error_handling: ErrorHandlingStrategy[];
}
export interface MessageFlow {
    step: number;
    sender_role: string;
    receiver_role: string;
    message_type: string;
    required: boolean;
    conditions?: string[];
}
export interface TimingConstraint {
    constraint_type: 'timeout' | 'interval' | 'deadline' | 'ordering';
    value: number;
    tolerance: number;
    violation_action: string;
}
export interface ErrorHandlingStrategy {
    error_type: string;
    detection_method: string;
    recovery_actions: string[];
    escalation_policy: string;
    notification_required: boolean;
}
export interface SecurityRequirement {
    requirement_type: 'encryption' | 'authentication' | 'authorization' | 'integrity' | 'non_repudiation';
    level: 'optional' | 'recommended' | 'required' | 'mandatory';
    implementation_details: Record<string, unknown>;
    compliance_standards: string[];
}
export interface ProtocolMigration {
    from_version: string;
    to_version: string;
    migration_steps: string[];
    compatibility_period: number;
    breaking_changes: string[];
    automated_migration_available: boolean;
}
export interface CollaborationSession {
    session_id: string;
    name: string;
    description: string;
    type: 'meeting' | 'task_execution' | 'problem_solving' | 'knowledge_sharing' | 'decision_making';
    status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
    participants: SessionParticipant[];
    coordinator: string;
    facilitators: string[];
    observers: string[];
    scheduled_start: string;
    scheduled_end: string;
    actual_start?: string;
    actual_end?: string;
    timezone: string;
    agenda: AgendaItem[];
    decisions_made: Decision[];
    action_items: ActionItem[];
    knowledge_captured: KnowledgeItem[];
    shared_resources: SharedResource[];
    collaboration_tools: string[];
    documentation: DocumentReference[];
    recording_enabled: boolean;
    transcription_enabled: boolean;
    real_time_collaboration: boolean;
    access_restrictions: AccessRestriction[];
}
export interface SessionParticipant {
    participant_id: string;
    role: 'coordinator' | 'facilitator' | 'contributor' | 'observer' | 'specialist';
    status: 'invited' | 'accepted' | 'declined' | 'active' | 'disconnected' | 'left';
    joined_at?: string;
    left_at?: string;
    participation_quality: number;
    contributions: Contribution[];
    can_speak: boolean;
    can_share_screen: boolean;
    can_modify_documents: boolean;
    can_make_decisions: boolean;
    connection_quality: number;
    device_info?: DeviceInfo;
    location?: string;
}
export interface Contribution {
    contribution_id: string;
    timestamp: string;
    type: 'comment' | 'suggestion' | 'decision' | 'question' | 'answer' | 'resource_share';
    content: string;
    impact_score: number;
    related_to?: string;
}
export interface AgendaItem {
    item_id: string;
    title: string;
    description: string;
    type: 'discussion' | 'decision' | 'presentation' | 'brainstorming' | 'review';
    estimated_duration: number;
    actual_duration?: number;
    start_time?: string;
    objectives: string[];
    prerequisites: string[];
    materials: string[];
    presenter?: string;
    required_participants: string[];
    optional_participants: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'deferred';
    outcomes: string[];
    follow_up_required: boolean;
}
export interface Decision {
    decision_id: string;
    timestamp: string;
    title: string;
    description: string;
    decision_method: 'consensus' | 'majority_vote' | 'authority' | 'delegation';
    participants_involved: string[];
    voting_results?: VotingResult[];
    options_considered: DecisionOption[];
    selected_option: string;
    rationale: string;
    implementation_required: boolean;
    implementation_plan?: string[];
    responsible_parties: string[];
    deadline?: string;
    status: 'pending' | 'approved' | 'implemented' | 'cancelled' | 'superseded';
    review_date?: string;
    success_criteria: string[];
}
export interface DecisionOption {
    option_id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    risk_assessment: RiskAssessment;
    cost_estimate?: number;
    implementation_complexity: 'low' | 'medium' | 'high';
}
export interface VotingResult {
    participant_id: string;
    vote: 'yes' | 'no' | 'abstain' | 'conditional';
    reasoning?: string;
    weight: number;
    timestamp: string;
}
export interface RiskAssessment {
    overall_risk: 'low' | 'medium' | 'high' | 'critical';
    risk_factors: RiskFactor[];
    mitigation_strategies: string[];
    residual_risk: 'low' | 'medium' | 'high';
}
export interface RiskFactor {
    factor: string;
    probability: number;
    impact: number;
    risk_score: number;
    category: 'technical' | 'operational' | 'strategic' | 'compliance' | 'security';
}
export interface ActionItem {
    action_id: string;
    title: string;
    description: string;
    assigned_to: string[];
    created_by: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    due_date?: string;
    estimated_effort?: number;
    status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
    completion_percentage: number;
    depends_on: string[];
    blocks: string[];
    progress_updates: ProgressUpdate[];
    completion_criteria: string[];
    success_metrics: string[];
}
export interface ProgressUpdate {
    update_id: string;
    timestamp: string;
    updated_by: string;
    progress_percentage: number;
    description: string;
    challenges?: string[];
    next_steps: string[];
    help_needed?: string;
}
export interface KnowledgeItem {
    knowledge_id: string;
    title: string;
    description: string;
    type: 'fact' | 'insight' | 'lesson_learned' | 'best_practice' | 'pattern' | 'solution';
    content: string;
    tags: string[];
    categories: string[];
    source_session: string;
    contributed_by: string[];
    context: string;
    related_decisions: string[];
    confidence_level: number;
    validation_status: 'unvalidated' | 'peer_reviewed' | 'validated' | 'disputed';
    validation_evidence: string[];
    reuse_count: number;
    impact_score: number;
    feedback_received: KnowledgeFeedback[];
}
export interface KnowledgeFeedback {
    feedback_id: string;
    timestamp: string;
    provided_by: string;
    feedback_type: 'validation' | 'correction' | 'enhancement' | 'usage_report';
    content: string;
    usefulness_score: number;
}
export interface SharedResource {
    resource_id: string;
    name: string;
    type: 'document' | 'dataset' | 'tool' | 'service' | 'knowledge_base' | 'model';
    location: string;
    access_permissions: ResourcePermission[];
    sharing_restrictions: string[];
    usage_tracking: boolean;
    description: string;
    version: string;
    last_updated: string;
    size?: number;
    format?: string;
    access_count: number;
    last_accessed?: string;
    frequent_users: string[];
    usage_patterns: UsagePattern[];
}
export interface ResourcePermission {
    permission_type: 'read' | 'write' | 'execute' | 'share' | 'admin';
    granted_to: string[];
    conditions?: string[];
    temporary: boolean;
    expires_at?: string;
}
export interface UsagePattern {
    pattern_type: 'time_based' | 'user_based' | 'context_based' | 'frequency_based';
    pattern_details: Record<string, unknown>;
    confidence: number;
    last_observed: string;
}
export interface AccessRestriction {
    restriction_type: 'geographic' | 'temporal' | 'role_based' | 'clearance_based' | 'context_based';
    restriction_details: Record<string, unknown>;
    enforcement_level: 'advisory' | 'warning' | 'blocking';
    exceptions: string[];
}
export interface DocumentReference {
    document_id: string;
    title: string;
    type: 'meeting_notes' | 'presentation' | 'report' | 'specification' | 'diagram' | 'other';
    location: string;
    access_level: 'public' | 'restricted' | 'confidential';
    created_during_session: boolean;
    version: string;
    last_modified: string;
}
export interface DeviceInfo {
    device_type: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'server' | 'embedded';
    operating_system: string;
    browser?: string;
    capabilities: string[];
    limitations: string[];
}
export interface FederationGovernance {
    governance_id: string;
    federation_id: string;
    governance_model: 'centralized' | 'decentralized' | 'federated' | 'hybrid';
    governing_bodies: GoverningBody[];
    decision_making_processes: DecisionProcess[];
    federation_policies: Policy[];
    compliance_requirements: ComplianceRequirement[];
    enforcement_mechanisms: EnforcementMechanism[];
    audit_schedule: string;
    audit_scope: string[];
    compliance_monitoring: boolean;
    violation_handling: ViolationHandling;
    governance_version: string;
    last_updated: string;
    update_process: string;
    stakeholder_feedback: boolean;
}
export interface QuorumRequirement {
    minimum_members: number;
    minimum_percentage: number;
    special_quorum_conditions?: string[];
    proxy_voting_allowed: boolean;
    virtual_participation_counts: boolean;
}
export interface VotingProcedure {
    procedure_id: string;
    name: string;
    description: string;
    applicable_to: string[];
    voting_method: 'simple_majority' | 'supermajority' | 'unanimous' | 'weighted' | 'ranked_choice';
    required_threshold: number;
    abstention_handling: 'ignore' | 'count_as_no' | 'separate_category';
    nomination_period?: number;
    discussion_period: number;
    voting_period: number;
    secret_ballot: boolean;
    tie_breaking_method: string;
    special_voting_rights: string[];
    voting_restrictions: string[];
}
export interface GoverningBody {
    body_id: string;
    name: string;
    type: 'council' | 'committee' | 'board' | 'working_group' | 'advisory_panel';
    authority_level: 'advisory' | 'decision_making' | 'oversight' | 'enforcement';
    members: GovernanceMember[];
    member_selection_process: string;
    term_limits: boolean;
    term_duration?: number;
    responsibilities: string[];
    decision_authority: string[];
    reporting_requirements: string[];
    meeting_frequency: string;
    quorum_requirements: QuorumRequirement;
    voting_procedures: VotingProcedure[];
    documentation_requirements: string[];
}
export interface GovernanceMember {
    member_id: string;
    identity_id: string;
    role: 'chair' | 'vice_chair' | 'secretary' | 'treasurer' | 'member' | 'advisor';
    term_start: string;
    term_end?: string;
    reelection_eligible: boolean;
    represents: string;
    voting_weight: number;
    special_authorities: string[];
    attendance_record: AttendanceRecord[];
    contribution_score: number;
    conflict_declarations: ConflictDeclaration[];
}
export interface AttendanceRecord {
    meeting_id: string;
    date: string;
    attended: boolean;
    participation_quality: number;
    excused_absence: boolean;
    proxy_designation?: string;
}
export interface ConflictDeclaration {
    declaration_id: string;
    conflict_type: 'financial' | 'organizational' | 'personal' | 'professional';
    description: string;
    mitigation_measures: string[];
    disclosure_date: string;
    resolution_status: 'active' | 'mitigated' | 'resolved';
}
export interface DecisionProcess {
    process_id: string;
    name: string;
    description: string;
    applicable_to: string[];
    steps: ProcessStep[];
    decision_criteria: DecisionCriteria[];
    stakeholder_involvement: StakeholderInvolvement[];
    typical_duration: number;
    maximum_duration: number;
    escalation_triggers: string[];
    documentation_requirements: string[];
    transparency_level: 'public' | 'members_only' | 'governing_body_only' | 'confidential';
    appeal_process?: AppealProcess;
}
export interface ProcessStep {
    step_id: string;
    name: string;
    description: string;
    sequence: number;
    required_inputs: string[];
    responsible_parties: string[];
    approval_required: boolean;
    estimated_duration: number;
    dependencies: string[];
    completion_criteria: string[];
    success_metrics: string[];
    failure_conditions: string[];
}
export interface DecisionCriteria {
    criteria_id: string;
    name: string;
    description: string;
    weight: number;
    measurement_method: string;
    acceptable_threshold: number;
    evaluation_guidelines: string[];
}
export interface StakeholderInvolvement {
    stakeholder_group: string;
    involvement_type: 'consultation' | 'input' | 'review' | 'approval' | 'decision';
    timing: 'early' | 'middle' | 'late' | 'throughout';
    communication_method: string[];
    feedback_incorporation: string;
}
export interface AppealProcess {
    appeal_grounds: string[];
    appeal_timeline: number;
    appeal_authority: string;
    appeal_procedures: string[];
    final_authority: string;
}
export interface Policy {
    policy_id: string;
    name: string;
    description: string;
    category: 'operational' | 'security' | 'governance' | 'technical' | 'ethical';
    policy_statements: PolicyStatement[];
    scope: string[];
    applicability: string[];
    exceptions: PolicyException[];
    version: string;
    effective_date: string;
    review_date: string;
    expiration_date?: string;
    approved_by: string;
    approval_date: string;
    approval_authority: string;
    implementation_guidelines: string[];
    compliance_measures: string[];
    enforcement_actions: string[];
    monitoring_requirements: string[];
    success_metrics: string[];
    evaluation_schedule: string;
}
export interface PolicyStatement {
    statement_id: string;
    content: string;
    requirement_level: 'must' | 'should' | 'may' | 'must_not' | 'should_not';
    rationale: string;
    implementation_guidance: string[];
}
export interface PolicyException {
    exception_id: string;
    description: string;
    conditions: string[];
    approval_required: boolean;
    approval_authority: string;
    temporary: boolean;
    expiration_date?: string;
}
export interface ComplianceRequirement {
    requirement_id: string;
    name: string;
    description: string;
    source: 'internal_policy' | 'external_regulation' | 'industry_standard' | 'contractual';
    requirement_text: string;
    compliance_level: 'mandatory' | 'recommended' | 'optional';
    applicable_entities: string[];
    implementation_deadline: string;
    implementation_status: 'not_started' | 'in_progress' | 'completed' | 'non_compliant';
    responsible_parties: string[];
    monitoring_frequency: string;
    monitoring_methods: string[];
    evidence_requirements: string[];
    non_compliance_consequences: string[];
    remediation_procedures: string[];
    escalation_path: string[];
}
export interface EnforcementMechanism {
    mechanism_id: string;
    name: string;
    description: string;
    type: 'automated' | 'manual' | 'hybrid';
    trigger_events: string[];
    trigger_thresholds: Record<string, number>;
    monitoring_scope: string[];
    available_actions: EnforcementAction[];
    escalation_matrix: EscalationLevel[];
    appeal_rights: boolean;
    implementation_authority: string[];
    implementation_procedures: string[];
    documentation_requirements: string[];
    success_metrics: string[];
    effectiveness_reviews: string;
    improvement_mechanisms: string[];
}
export interface EnforcementAction {
    action_id: string;
    name: string;
    description: string;
    severity: 'warning' | 'minor' | 'major' | 'severe' | 'critical';
    action_type: 'notification' | 'restriction' | 'suspension' | 'termination' | 'penalty';
    implementation_steps: string[];
    duration?: number;
    authorization_required: boolean;
    authorization_level: string;
    approval_process: string[];
    impact_scope: string[];
    side_effects: string[];
    reversal_conditions: string[];
}
export interface EscalationLevel {
    level: number;
    name: string;
    trigger_conditions: string[];
    available_actions: string[];
    authority_required: string;
    timeline: number;
    notification_requirements: string[];
}
export interface ViolationHandling {
    detection_methods: string[];
    investigation_procedures: string[];
    evidence_requirements: string[];
    due_process_rights: string[];
    resolution_timelines: Record<string, number>;
    appeal_procedures: string[];
    record_keeping_requirements: string[];
}
//# sourceMappingURL=federation.d.ts.map