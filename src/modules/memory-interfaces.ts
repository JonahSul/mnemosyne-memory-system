/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Shared Memory System Interfaces
 * 
 * Common type definitions used across memory system modules
 */

export interface MemoryEntry {
	id: string;
	timestamp: string;
	type: 'claim' | 'rule' | 'verification' | 'pattern' | 'assumption';
	content: string;
	status: 'pending' | 'verified' | 'failed' | 'enforced' | 'violated';
	evidence?: string;
	context?: Record<string, unknown>;
}

export interface BehavioralRule {
	id: string;
	rule: string;
	description: string;
	priority: 'critical' | 'high' | 'medium' | 'low';
	violations: number;
	lastViolation?: string;
	examples?: string[];
}

export interface InteractionPattern {
	pattern: string;
	description: string;
	frequency: number;
	outcome: 'positive' | 'negative' | 'neutral';
	lastOccurrence: string;
}

export interface ContextQuery {
	id: string;
	timestamp: string;
	query: string;
	context?: Record<string, unknown>;
}

// Vector and Pre-warming Interfaces
export interface VectorAnalysis {
	semanticConcepts: string[];
	vectorSearchAreas: string[];
	priority: number;
	estimatedRelevantVectors: number;
}

export interface VectorPrewarmingStrategy {
	priorityVectors: string[];
	semanticRadius: number;
	estimatedLatency: number;
}

export interface VectorPrewarmingStatus {
	isActive: boolean;
	targetConcepts: string[];
	startTime: string;
}

export interface AdaptivePrewarmingStrategy {
	learnedConcepts: string[];
	confidence: number;
	relatedPatterns: string[];
}

export interface VectorPrioritization {
	domainMatch: string;
	priority: number;
	suggestedVectors: string[];
}

export interface UserBehaviorPattern {
	domain: string;
	frequency: number;
	recentQueries: string[];
}

// Workflow Integration Interfaces
export interface WorkflowCheckpoint {
	id: string;
	stage: string;
	timestamp: string;
	context: Record<string, unknown>;
	requiresMemoryConsultation: boolean;
	priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TriggeredMemorySearch {
	checkpointId: string;
	query: string;
	priority: number;
	estimatedRelevance: number;
}

export interface WorkflowEfficiencyAnalysis {
	workflowId: string;
	totalDuration: number;
	bottlenecks: Array<{
		stage: string;
		duration: number;
		impact: 'low' | 'medium' | 'high';
	}>;
	optimizationSuggestions: string[];
}

export interface PrewarmingPrediction {
	predictedTopics: string[];
	confidence: number;
	basedOnPatterns: string[];
}

export interface SessionPrewarmingStrategy {
	sessionId: string;
	targetConcepts: string[];
	relatedTopics: string[];
	priorityLevel: number;
}

export interface PrewarmingEffectiveness {
	strategy: string;
	targetConcepts: string[];
	actualRelevance: number;
	userSatisfaction: number;
}

export interface AdaptedPrewarmingStrategy {
	preferredMethods: string[];
	successRate: number;
	confidenceLevel: number;
}

export interface BehaviorPattern {
	id: string;
	type: string;
	successRate: number;
	frequency: number;
	context: Record<string, unknown>;
}

export interface FeedbackPattern {
	userFeedback: string;
	behaviorContext: string;
	adjustment: string;
}

export interface BehaviorAdjustment {
	searchScopeReduction: boolean;
	consultationDepthIncrease: boolean;
	balancedApproachReinforcement: boolean;
}

export interface FailurePattern {
	pattern: string;
	indicators: string[];
	consequences: string[];
	frequency: number;
}

export interface FailureAvoidanceStrategy {
	targetPattern: string;
	preventionMethods: string[];
	earlyWarningSignals: string[];
}

export interface OptimizedWorkflow {
	checkpointStrategy: string;
	prewarmingIntensity: string;
	responseStyle: string;
}

export interface SpeedThoroughnessBalance {
	approach: string;
	speedWeight: number;
	thoroughnessWeight: number;
}

export interface ConsultationValue {
	consulted: boolean;
	valueAdded: number;
	responseTime: number;
}

export interface OptimizedConsultationFrequency {
	recommendedFrequency: number;
	valueThreshold: number;
	confidenceLevel: number;
}
