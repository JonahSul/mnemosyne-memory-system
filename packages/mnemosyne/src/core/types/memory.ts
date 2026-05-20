/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Core Memory System Types
 * 
 * Consolidated memory interfaces and types for the Mnemosyne Memory System
 * Unified from multiple type definition files to eliminate duplication
 */

// ============================================================================
// CORE MEMORY ENTRY TYPES
// ============================================================================

export interface MemoryEntry {
	id: string;
	timestamp: string;
	type: 'claim' | 'rule' | 'verification' | 'pattern' | 'assumption' | 'plan';
	content: string;
	status: 'pending' | 'verified' | 'failed' | 'enforced' | 'violated';
	evidence?: string;
	context?: Record<string, unknown>;
	session_id?: string;
	verified?: boolean;
}

// Enhanced Memory Entry for Foundation v1.7.1+
export interface EnhancedMemoryEntry extends MemoryEntry {
	// Causality Tracking
	caused_by?: string[];
	dependencies?: string[];
	
	// Semantic Expansion
	semantic_axes?: SemanticAxes;
	expansion_strategy?: ExpansionStrategy;
	
	// Temporal Metadata
	logical_clock?: number;
	vector_clock?: Record<string, number>;
	hybrid_clock?: {
		logical: number;
		physical: number;
	};
	
	// Confidence and Verification
	confidence: number; // 0-1 confidence score
	verification_method: 'manual' | 'automated' | 'cross_reference' | 'inference';
	importance?: number; // 0-1 importance score
	
	// Metadata
	source: string;
	tags?: string[];
	tier?: 'short' | 'intermediate' | 'long' | 'auto';
	metadata?: Record<string, unknown>;
}

// ============================================================================
// PLAN MEMORY OBJECTS
// ============================================================================

export interface PlanMemoryEntry {
	id: string;
	timestamp: string;
	
	// Core Plan Identity
	title: string;
	description: string;
	status: 'draft' | 'active' | 'completed' | 'abandoned';
	
	// Plan Structure
	phases: PlanPhase[];
	dependencies: string[]; // IDs of other plans this depends on
	success_criteria: string[];
	
	// Accountability
	accountability_protocol: string;
	verification_requirements: string[];
	
	// Context and Metadata
	context: Record<string, unknown>;
	created_by: string;
	last_updated: string;
}

export interface PlanPhase {
	id: string;
	name: string;
	description: string;
	status: 'pending' | 'in_progress' | 'completed' | 'blocked';
	deliverables: string[];
	success_criteria: string[];
	dependencies: string[]; // Phase IDs this phase depends on
	estimated_duration: string;
	actual_duration?: string;
	completion_evidence?: string[];
}

// ============================================================================
// BEHAVIORAL SYSTEM TYPES (Legacy - use ./behavioral.ts)
// ============================================================================

// Note: These are kept for backward compatibility
// New code should import from './behavioral.ts'

// ============================================================================
// ANALYSIS AND PATTERN TYPES
// ============================================================================

export interface FailurePattern {
	errorType: string;
	context: string;
	severity: 'low' | 'medium' | 'high';
	timestamp: number;
}

export interface ConsultationValue {
	consultationType: string;
	value: number;
	context: string;
	timestamp: number;
}

export interface UserBehaviorPattern {
	userId: string;
	patterns: string[];
	frequency: number;
}

// ============================================================================
// WORKFLOW AND CHECKPOINT TYPES (Legacy - use ./workflow.ts)
// ============================================================================

// Note: These are kept for backward compatibility
// New code should import from './workflow.ts'

export interface TriggeredMemorySearch {
	searchId: string;
	query: string;
	results: MemoryEntry[];
}

export interface ContextQuery {
	id: string;
	timestamp: string;
	query: string;
	context?: Record<string, unknown>;
}

// ============================================================================
// PREWARMING AND VECTOR TYPES
// ============================================================================

export interface SessionPrewarmingStrategy {
	sessionId?: string;
	confidenceLevel: number;
	timeframe: string;
	[key: string]: any;
}

export interface PrewarmingPrediction {
	query: string;
	confidence: number;
	priority: number;
}

export interface VectorPrewarmingStatus {
	active: boolean;
	progress: number;
	estimatedCompletion: number;
}

export interface VectorAnalysis {
	vectorCount: number;
	averageScore: number;
	topQueries: string[];
}

export interface AdaptivePrewarmingStrategy {
	strategies: string[];
	confidence: number;
}

// ============================================================================
// SEMANTIC EXPANSION TYPES (Foundation v1.7.1+)
// ============================================================================

export type AgentPersonality = 
	| "security_focused" 
	| "architecture_specialist"
	| "development_generalist" 
	| "innovation_explorer";

export interface FieldContext {
	domain: "security" | "architecture" | "development" | "operations" | "innovation";
	criticalityLevel: "critical" | "high" | "medium" | "low";
	taskType: "debugging" | "documentation" | "learning" | "exploration" | "implementation";
	assessmentConfidence: number; // 0-1 confidence in field classification
}

export interface ExpansionStrategy {
	selectedPersonality: AgentPersonality;
	precisionCoefficient: number; // actual precision applied
	overrideReason?: string; // if personality default was overridden
	qualityValidation: boolean; // whether validation passed
	generationTimestamp: string;
}

export interface SemanticAxis {
	tags: string[];
	confidence: number; // 0-1 confidence in relationships
	generationMethod: "automatic" | "manual" | "hybrid";
	validationStatus: "validated" | "pending" | "rejected";
}

export interface SemanticAxes {
	nearSemanticNeighbor: SemanticAxis;
	relatedConcept: SemanticAxis & {
		conceptualDistance: number; // how conceptually distant
	};
	analogicalPattern: SemanticAxis & {
		crossDomainJustification: string; // why this analogy is valid
		transferabilityScore: number; // how transferable the lesson is
	};
}

// ============================================================================
// RESPONSE AND AGGREGATE TYPES
// ============================================================================

export interface MemoryResponse {
	entries: MemoryEntry[];
	rules: any[]; // Legacy - use specific behavioral types from './behavioral.ts'
	patterns: any[]; // Legacy - use specific pattern types from './patterns.ts'
	session_summary: string;
}

export interface FeedbackPattern {
	userId: string;
	feedback: string;
	context: string;
	timestamp: number;
}

// ============================================================================
// SEARCH AND QUERY TYPES
// ============================================================================

export interface SearchOptions {
	limit?: number;
	minConfidence?: number;
	requireEvidence?: boolean;
	searchType?: 'exploration' | 'recall' | 'precision' | 'prewarming';
	threshold?: number;
	tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
	verificationMethod?: 'manual' | 'automated' | 'cross_reference' | 'inference' | 'any';
}

export interface SearchResult {
	entries: MemoryEntry[];
	confidence: number;
	total_found: number;
	search_metadata: {
		query: string;
		threshold_used: number;
		tier_searched: string;
		execution_time_ms: number;
	};
}
