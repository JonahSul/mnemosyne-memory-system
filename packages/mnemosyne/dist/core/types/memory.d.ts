/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Core Memory System Types
 *
 * Consolidated memory interfaces and types for the Mnemosyne Memory System
 * Unified from multiple type definition files to eliminate duplication
 */
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
export interface EnhancedMemoryEntry extends MemoryEntry {
    caused_by?: string[];
    dependencies?: string[];
    semantic_axes?: SemanticAxes;
    expansion_strategy?: ExpansionStrategy;
    logical_clock?: number;
    vector_clock?: Record<string, number>;
    hybrid_clock?: {
        logical: number;
        physical: number;
    };
    confidence: number;
    verification_method: 'manual' | 'automated' | 'cross_reference' | 'inference';
    importance?: number;
    source: string;
    tags?: string[];
    tier?: 'short' | 'intermediate' | 'long' | 'auto';
    metadata?: Record<string, unknown>;
}
export interface PlanMemoryEntry {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'abandoned';
    phases: PlanPhase[];
    dependencies: string[];
    success_criteria: string[];
    accountability_protocol: string;
    verification_requirements: string[];
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
    dependencies: string[];
    estimated_duration: string;
    actual_duration?: string;
    completion_evidence?: string[];
}
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
export type AgentPersonality = "security_focused" | "architecture_specialist" | "development_generalist" | "innovation_explorer";
export interface FieldContext {
    domain: "security" | "architecture" | "development" | "operations" | "innovation";
    criticalityLevel: "critical" | "high" | "medium" | "low";
    taskType: "debugging" | "documentation" | "learning" | "exploration" | "implementation";
    assessmentConfidence: number;
}
export interface ExpansionStrategy {
    selectedPersonality: AgentPersonality;
    precisionCoefficient: number;
    overrideReason?: string;
    qualityValidation: boolean;
    generationTimestamp: string;
}
export interface SemanticAxis {
    tags: string[];
    confidence: number;
    generationMethod: "automatic" | "manual" | "hybrid";
    validationStatus: "validated" | "pending" | "rejected";
}
export interface SemanticAxes {
    nearSemanticNeighbor: SemanticAxis;
    relatedConcept: SemanticAxis & {
        conceptualDistance: number;
    };
    analogicalPattern: SemanticAxis & {
        crossDomainJustification: string;
        transferabilityScore: number;
    };
}
export interface MemoryResponse {
    entries: MemoryEntry[];
    rules: any[];
    patterns: any[];
    session_summary: string;
}
export interface FeedbackPattern {
    userId: string;
    feedback: string;
    context: string;
    timestamp: number;
}
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
//# sourceMappingURL=memory.d.ts.map