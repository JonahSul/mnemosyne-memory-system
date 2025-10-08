/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Federation System Types
 * 
 * Type definitions for multi-agent federation, identity management,
 * and distributed collaboration systems
 */

// ============================================================================
// CORE FEDERATION TYPES
// ============================================================================

export interface FederationNode {
	node_id: string;
	name: string;
	description: string;
	type: 'coordinator' | 'delegate' | 'observer' | 'specialist';
	status: 'active' | 'inactive' | 'maintenance' | 'failed';
	
	// Node Capabilities
	capabilities: FederationCapability[];
	resource_capacity: ResourceCapacity;
	specializations: string[];
	
	// Network Information
	endpoint: string;
	protocol_version: string;
	last_heartbeat: string;
	network_latency: number; // milliseconds
	
	// Trust and Security
	trust_level: number; // 0-1
	security_clearance: SecurityClearance;
	authentication_method: string;
	
	// Metadata
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
	performance_level: number; // 0-1
	availability: number; // 0-1
	resource_cost: number; // relative cost
	quality_score: number; // 0-1
}

export interface ResourceCapacity {
	memory_mb: number;
	cpu_cores: number;
	storage_gb: number;
	network_bandwidth_mbps: number;
	concurrent_tasks: number;
	utilization_current: number; // 0-1
	utilization_average: number; // 0-1
}

export interface SecurityClearance {
	level: 'public' | 'restricted' | 'confidential' | 'secret' | 'top_secret';
	permissions: string[];
	restrictions: string[];
	expiration?: string;
	granted_by: string;
	granted_at: string;
}

// ============================================================================
// FEDERATION IDENTITY AND AUTH TYPES
// ============================================================================

export interface FederationIdentity {
	identity_id: string;
	name: string;
	type: 'human' | 'agent' | 'system' | 'service';
	status: 'active' | 'inactive' | 'suspended' | 'revoked';
	
	// Identity Details
	display_name: string;
	description?: string;
	organization?: string;
	contact_info?: ContactInfo;
	
	// Roles and Permissions
	roles: FederationRole[];
	permissions: Permission[];
	delegation_rights: DelegationRight[];
	
	// Authentication
	authentication_methods: AuthenticationMethod[];
	multi_factor_required: boolean;
	session_timeout: number; // seconds
	
	// Trust and Reputation
	trust_score: number; // 0-1
	reputation_score: number; // 0-1
	verification_status: 'unverified' | 'pending' | 'verified' | 'disputed';
	
	// Metadata
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
	
	// Role Scope
	scope: 'global' | 'node' | 'domain' | 'resource';
	scope_targets?: string[];
	
	// Permissions
	inherent_permissions: string[];
	assignable_permissions: string[];
	forbidden_permissions: string[];
	
	// Role Management
	assignable_by: string[];
	revocable_by: string[];
	temporary_assignment_allowed: boolean;
	max_assignment_duration?: number; // seconds
}

export interface Permission {
	permission_id: string;
	name: string;
	description: string;
	category: 'read' | 'write' | 'execute' | 'admin' | 'delegate';
	
	// Permission Scope
	resource_type: string;
	resource_identifiers?: string[];
	conditions?: PermissionCondition[];
	
	// Delegation
	delegatable: boolean;
	delegation_depth: number; // how many levels deep delegation can go
	
	// Temporal
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
	
	// Delegation Constraints
	delegation_depth: number;
	further_delegation_allowed: boolean;
	conditions?: DelegationCondition[];
	
	// Temporal
	granted_at: string;
	expires_at?: string;
	active: boolean;
	
	// Audit
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
	
	// Method Details
	configuration: Record<string, unknown>;
	strength_score: number; // 0-1
	last_used?: string;
	usage_count: number;
	
	// Security
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

// ============================================================================
// FEDERATION COMMUNICATION TYPES
// ============================================================================

export interface FederationMessage {
	message_id: string;
	sender: string;
	recipients: string[];
	timestamp: string;
	
	// Message Content
	message_type: 'request' | 'response' | 'notification' | 'broadcast' | 'heartbeat';
	subject: string;
	content: Record<string, unknown>;
	attachments?: MessageAttachment[];
	
	// Routing
	routing_path: string[];
	priority: 'low' | 'normal' | 'high' | 'urgent';
	delivery_requirements: DeliveryRequirement[];
	
	// Status
	status: 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'expired';
	delivery_attempts: number;
	last_attempt?: string;
	
	// Security
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
	timeout: number; // seconds
	retry_count: number;
	failure_action: 'ignore' | 'escalate' | 'retry' | 'fallback';
}

export interface FederationProtocol {
	protocol_id: string;
	name: string;
	version: string;
	description: string;
	
	// Protocol Specification
	message_formats: Record<string, unknown>;
	communication_patterns: CommunicationPattern[];
	security_requirements: SecurityRequirement[];
	
	// Implementation
	supported_by: string[]; // node IDs
	compatibility_matrix: Record<string, string[]>;
	migration_paths: ProtocolMigration[];
	
	// Metadata
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
	value: number; // seconds or sequence number
	tolerance: number; // acceptable deviation
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
	compatibility_period: number; // seconds
	breaking_changes: string[];
	automated_migration_available: boolean;
}

// ============================================================================
// FEDERATION COLLABORATION TYPES
// ============================================================================

export interface CollaborationSession {
	session_id: string;
	name: string;
	description: string;
	type: 'meeting' | 'task_execution' | 'problem_solving' | 'knowledge_sharing' | 'decision_making';
	status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
	
	// Participants
	participants: SessionParticipant[];
	coordinator: string;
	facilitators: string[];
	observers: string[];
	
	// Session Details
	scheduled_start: string;
	scheduled_end: string;
	actual_start?: string;
	actual_end?: string;
	timezone: string;
	
	// Content and Outcomes
	agenda: AgendaItem[];
	decisions_made: Decision[];
	action_items: ActionItem[];
	knowledge_captured: KnowledgeItem[];
	
	// Resources
	shared_resources: SharedResource[];
	collaboration_tools: string[];
	documentation: DocumentReference[];
	
	// Configuration
	recording_enabled: boolean;
	transcription_enabled: boolean;
	real_time_collaboration: boolean;
	access_restrictions: AccessRestriction[];
}

export interface SessionParticipant {
	participant_id: string;
	role: 'coordinator' | 'facilitator' | 'contributor' | 'observer' | 'specialist';
	status: 'invited' | 'accepted' | 'declined' | 'active' | 'disconnected' | 'left';
	
	// Participation Details
	joined_at?: string;
	left_at?: string;
	participation_quality: number; // 0-1
	contributions: Contribution[];
	
	// Permissions
	can_speak: boolean;
	can_share_screen: boolean;
	can_modify_documents: boolean;
	can_make_decisions: boolean;
	
	// Technical Details
	connection_quality: number; // 0-1
	device_info?: DeviceInfo;
	location?: string;
}

export interface Contribution {
	contribution_id: string;
	timestamp: string;
	type: 'comment' | 'suggestion' | 'decision' | 'question' | 'answer' | 'resource_share';
	content: string;
	impact_score: number; // 0-1
	related_to?: string; // agenda item or topic
}

export interface AgendaItem {
	item_id: string;
	title: string;
	description: string;
	type: 'discussion' | 'decision' | 'presentation' | 'brainstorming' | 'review';
	
	// Timing
	estimated_duration: number; // minutes
	actual_duration?: number; // minutes
	start_time?: string;
	
	// Content
	objectives: string[];
	prerequisites: string[];
	materials: string[];
	
	// Participants
	presenter?: string;
	required_participants: string[];
	optional_participants: string[];
	
	// Outcomes
	status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'deferred';
	outcomes: string[];
	follow_up_required: boolean;
}

export interface Decision {
	decision_id: string;
	timestamp: string;
	title: string;
	description: string;
	
	// Decision Process
	decision_method: 'consensus' | 'majority_vote' | 'authority' | 'delegation';
	participants_involved: string[];
	voting_results?: VotingResult[];
	
	// Decision Content
	options_considered: DecisionOption[];
	selected_option: string;
	rationale: string;
	
	// Implementation
	implementation_required: boolean;
	implementation_plan?: string[];
	responsible_parties: string[];
	deadline?: string;
	
	// Status
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
	weight: number; // voting weight
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
	probability: number; // 0-1
	impact: number; // 0-1
	risk_score: number; // calculated from probability and impact
	category: 'technical' | 'operational' | 'strategic' | 'compliance' | 'security';
}

export interface ActionItem {
	action_id: string;
	title: string;
	description: string;
	
	// Assignment
	assigned_to: string[];
	created_by: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	
	// Timeline
	created_at: string;
	due_date?: string;
	estimated_effort?: number; // hours
	
	// Status
	status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
	completion_percentage: number; // 0-100
	
	// Dependencies
	depends_on: string[]; // other action item IDs
	blocks: string[]; // action items that this blocks
	
	// Tracking
	progress_updates: ProgressUpdate[];
	completion_criteria: string[];
	success_metrics: string[];
}

export interface ProgressUpdate {
	update_id: string;
	timestamp: string;
	updated_by: string;
	progress_percentage: number; // 0-100
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
	
	// Content
	content: string;
	tags: string[];
	categories: string[];
	
	// Source and Context
	source_session: string;
	contributed_by: string[];
	context: string;
	related_decisions: string[];
	
	// Quality and Validation
	confidence_level: number; // 0-1
	validation_status: 'unvalidated' | 'peer_reviewed' | 'validated' | 'disputed';
	validation_evidence: string[];
	
	// Usage and Impact
	reuse_count: number;
	impact_score: number; // 0-1
	feedback_received: KnowledgeFeedback[];
}

export interface KnowledgeFeedback {
	feedback_id: string;
	timestamp: string;
	provided_by: string;
	feedback_type: 'validation' | 'correction' | 'enhancement' | 'usage_report';
	content: string;
	usefulness_score: number; // 0-1
}

export interface SharedResource {
	resource_id: string;
	name: string;
	type: 'document' | 'dataset' | 'tool' | 'service' | 'knowledge_base' | 'model';
	location: string;
	
	// Access Control
	access_permissions: ResourcePermission[];
	sharing_restrictions: string[];
	usage_tracking: boolean;
	
	// Resource Details
	description: string;
	version: string;
	last_updated: string;
	size?: number; // bytes
	format?: string;
	
	// Usage Statistics
	access_count: number;
	last_accessed?: string;
	frequent_users: string[];
	usage_patterns: UsagePattern[];
}

export interface ResourcePermission {
	permission_type: 'read' | 'write' | 'execute' | 'share' | 'admin';
	granted_to: string[]; // identity IDs or role names
	conditions?: string[];
	temporary: boolean;
	expires_at?: string;
}

export interface UsagePattern {
	pattern_type: 'time_based' | 'user_based' | 'context_based' | 'frequency_based';
	pattern_details: Record<string, unknown>;
	confidence: number; // 0-1
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

// ============================================================================
// FEDERATION GOVERNANCE TYPES
// ============================================================================

export interface FederationGovernance {
	governance_id: string;
	federation_id: string;
	
	// Governance Structure
	governance_model: 'centralized' | 'decentralized' | 'federated' | 'hybrid';
	governing_bodies: GoverningBody[];
	decision_making_processes: DecisionProcess[];
	
	// Policies and Rules
	federation_policies: Policy[];
	compliance_requirements: ComplianceRequirement[];
	enforcement_mechanisms: EnforcementMechanism[];
	
	// Oversight and Auditing
	audit_schedule: string;
	audit_scope: string[];
	compliance_monitoring: boolean;
	violation_handling: ViolationHandling;
	
	// Evolution and Updates
	governance_version: string;
	last_updated: string;
	update_process: string;
	stakeholder_feedback: boolean;
}

export interface QuorumRequirement {
	minimum_members: number;
	minimum_percentage: number; // 0-100
	special_quorum_conditions?: string[];
	proxy_voting_allowed: boolean;
	virtual_participation_counts: boolean;
}

export interface VotingProcedure {
	procedure_id: string;
	name: string;
	description: string;
	applicable_to: string[]; // types of decisions
	
	// Voting Method
	voting_method: 'simple_majority' | 'supermajority' | 'unanimous' | 'weighted' | 'ranked_choice';
	required_threshold: number; // percentage or absolute number
	abstention_handling: 'ignore' | 'count_as_no' | 'separate_category';
	
	// Process
	nomination_period?: number; // days
	discussion_period: number; // days
	voting_period: number; // days
	secret_ballot: boolean;
	
	// Special Conditions
	tie_breaking_method: string;
	special_voting_rights: string[];
	voting_restrictions: string[];
}

export interface GoverningBody {
	body_id: string;
	name: string;
	type: 'council' | 'committee' | 'board' | 'working_group' | 'advisory_panel';
	authority_level: 'advisory' | 'decision_making' | 'oversight' | 'enforcement';
	
	// Membership
	members: GovernanceMember[];
	member_selection_process: string;
	term_limits: boolean;
	term_duration?: number; // months
	
	// Responsibilities
	responsibilities: string[];
	decision_authority: string[];
	reporting_requirements: string[];
	
	// Operations
	meeting_frequency: string;
	quorum_requirements: QuorumRequirement;
	voting_procedures: VotingProcedure[];
	documentation_requirements: string[];
}

export interface GovernanceMember {
	member_id: string;
	identity_id: string;
	role: 'chair' | 'vice_chair' | 'secretary' | 'treasurer' | 'member' | 'advisor';
	
	// Term Information
	term_start: string;
	term_end?: string;
	reelection_eligible: boolean;
	
	// Representation
	represents: string; // organization, role, or constituency
	voting_weight: number;
	special_authorities: string[];
	
	// Participation
	attendance_record: AttendanceRecord[];
	contribution_score: number; // 0-1
	conflict_declarations: ConflictDeclaration[];
}

export interface AttendanceRecord {
	meeting_id: string;
	date: string;
	attended: boolean;
	participation_quality: number; // 0-1
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
	applicable_to: string[]; // types of decisions
	
	// Process Steps
	steps: ProcessStep[];
	decision_criteria: DecisionCriteria[];
	stakeholder_involvement: StakeholderInvolvement[];
	
	// Timing and Deadlines
	typical_duration: number; // days
	maximum_duration: number; // days
	escalation_triggers: string[];
	
	// Documentation
	documentation_requirements: string[];
	transparency_level: 'public' | 'members_only' | 'governing_body_only' | 'confidential';
	appeal_process?: AppealProcess;
}

export interface ProcessStep {
	step_id: string;
	name: string;
	description: string;
	sequence: number;
	
	// Step Requirements
	required_inputs: string[];
	responsible_parties: string[];
	approval_required: boolean;
	
	// Timing
	estimated_duration: number; // days
	dependencies: string[]; // other step IDs
	
	// Completion Criteria
	completion_criteria: string[];
	success_metrics: string[];
	failure_conditions: string[];
}

export interface DecisionCriteria {
	criteria_id: string;
	name: string;
	description: string;
	weight: number; // relative importance
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
	appeal_timeline: number; // days
	appeal_authority: string;
	appeal_procedures: string[];
	final_authority: string;
}

export interface Policy {
	policy_id: string;
	name: string;
	description: string;
	category: 'operational' | 'security' | 'governance' | 'technical' | 'ethical';
	
	// Policy Content
	policy_statements: PolicyStatement[];
	scope: string[];
	applicability: string[];
	exceptions: PolicyException[];
	
	// Lifecycle
	version: string;
	effective_date: string;
	review_date: string;
	expiration_date?: string;
	
	// Authority and Approval
	approved_by: string;
	approval_date: string;
	approval_authority: string;
	
	// Implementation
	implementation_guidelines: string[];
	compliance_measures: string[];
	enforcement_actions: string[];
	
	// Monitoring and Evaluation
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
	
	// Requirement Details
	requirement_text: string;
	compliance_level: 'mandatory' | 'recommended' | 'optional';
	applicable_entities: string[];
	
	// Implementation
	implementation_deadline: string;
	implementation_status: 'not_started' | 'in_progress' | 'completed' | 'non_compliant';
	responsible_parties: string[];
	
	// Monitoring
	monitoring_frequency: string;
	monitoring_methods: string[];
	evidence_requirements: string[];
	
	// Consequences
	non_compliance_consequences: string[];
	remediation_procedures: string[];
	escalation_path: string[];
}

export interface EnforcementMechanism {
	mechanism_id: string;
	name: string;
	description: string;
	type: 'automated' | 'manual' | 'hybrid';
	
	// Trigger Conditions
	trigger_events: string[];
	trigger_thresholds: Record<string, number>;
	monitoring_scope: string[];
	
	// Enforcement Actions
	available_actions: EnforcementAction[];
	escalation_matrix: EscalationLevel[];
	appeal_rights: boolean;
	
	// Implementation
	implementation_authority: string[];
	implementation_procedures: string[];
	documentation_requirements: string[];
	
	// Effectiveness
	success_metrics: string[];
	effectiveness_reviews: string;
	improvement_mechanisms: string[];
}

export interface EnforcementAction {
	action_id: string;
	name: string;
	description: string;
	severity: 'warning' | 'minor' | 'major' | 'severe' | 'critical';
	
	// Action Details
	action_type: 'notification' | 'restriction' | 'suspension' | 'termination' | 'penalty';
	implementation_steps: string[];
	duration?: number; // days, if temporary
	
	// Authorization
	authorization_required: boolean;
	authorization_level: string;
	approval_process: string[];
	
	// Impact
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
	timeline: number; // days
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
