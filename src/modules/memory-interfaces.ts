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
	type: 'claim' | 'rule' | 'verification' | 'pattern' | 'assumption' | 'plan';
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

// Plan Memory Object for Agent and User Accountability
export interface PlanMemoryEntry {
	id: string;
	timestamp: string;
	
	// Core Plan Identity
	title: string;
	description: string;
	objectives: string[];
	
	// Temporal Coordination
	plannedStartTime: string;
	plannedEndTime?: string;
	actualStartTime?: string;
	actualEndTime?: string;
	estimatedDuration?: number; // minutes
	
	// Status Tracking
	status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled' | 'derailed';
	priority: 'critical' | 'high' | 'medium' | 'low';
	progress: number; // 0-100 percentage
	
	// Accountability Metadata
	initiatedBy: 'user' | 'agent' | 'collaborative';
	agentResponsible?: string; // agent personality or ID
	userCommitment?: 'explicit' | 'implied' | 'none';
	
	// Conversation Context Integration
	conversationId?: string;
	originatingQuery?: string;
	relatedTopics: string[];
	conversationForkPoint?: {
		forkTimestamp: string;
		originalTopic: string;
		deviation: string;
		returnPriority: 'high' | 'medium' | 'low';
	};
	
	// Vector Space Temporal Plotting
	vectorMetadata: {
		semanticCluster: string[]; // semantic concepts for vector search
		temporalCoordinates: {
			plannedVector: number[]; // where we planned to be in vector space
			currentVector?: number[]; // where we actually are
			trajectoryVector?: number[]; // direction of progress
		};
		relatedEvents: string[]; // IDs of events/memories connected to this plan
		spatialRelevance: number; // 0-1 how semantically relevant this plan is to current context
	};
	
	// Execution Tracking
	milestones: PlanMilestone[];
	blockers: PlanBlocker[];
	dependencies: string[]; // IDs of other plans this depends on
	dependents: string[]; // IDs of plans that depend on this
	
	// Accountability Metrics
	accountability: {
		commitmentLevel: number; // 0-1 how committed user/agent is
		trackingMetrics: string[]; // what we're measuring for success
		checkInFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
		lastAccountabilityCheck?: string;
		deviationAlerts: boolean;
	};
	
	// Context for Conversation Continuity
	continuity: {
		canRemindUser: boolean;
		reminderThreshold: number; // minutes before suggesting return to plan
		contextSwitchTolerance: number; // how many topic switches before intervention
		originalIntent: string; // user's original stated goal
		alternativeApproaches?: string[]; // if plan fails, what else to try
	};
}

export interface PlanMilestone {
	id: string;
	title: string;
	description: string;
	plannedCompletion: string;
	actualCompletion?: string;
	status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
	dependencies: string[]; // milestone IDs this depends on
	evidence?: string; // proof of completion
	blockingIssues?: string[];
}

export interface PlanBlocker {
	id: string;
	description: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	type: 'technical' | 'resource' | 'dependency' | 'knowledge' | 'external';
	discoveredAt: string;
	resolvedAt?: string;
	resolutionStrategy?: string;
	impact: string; // description of how this affects the plan
}

// Plan Management Operations
export interface PlanOperations {
	createPlan(plan: Omit<PlanMemoryEntry, 'id' | 'timestamp'>): Promise<string>;
	updatePlanStatus(planId: string, status: PlanMemoryEntry['status'], evidence?: string): Promise<boolean>;
	updatePlanProgress(planId: string, progress: number, milestone?: string): Promise<boolean>;
	addMilestone(planId: string, milestone: Omit<PlanMilestone, 'id'>): Promise<string>;
	addBlocker(planId: string, blocker: Omit<PlanBlocker, 'id'>): Promise<string>;
	resolveBlocker(planId: string, blockerId: string, resolution: string): Promise<boolean>;
	
	// Accountability and Continuity Functions
	checkAccountability(planId: string): Promise<{
		onTrack: boolean;
		deviations: string[];
		suggestions: string[];
		timeRemaining?: number;
	}>;
	
	detectConversationFork(currentContext: string, planId: string): Promise<{
		isFork: boolean;
		deviationSeverity: 'minor' | 'moderate' | 'major';
		shouldRemind: boolean;
		reminderMessage?: string;
	}>;
	
	suggestReturnToPlan(planId: string): Promise<{
		suggestion: string;
		urgency: 'low' | 'medium' | 'high';
		contextBridge: string; // how to bridge from current topic back to plan
	}>;
	
	// Vector Space Integration
	updatePlanVectorPosition(planId: string, currentVector: number[]): Promise<boolean>;
	findRelatedPlans(semanticQuery: string, includeCompleted?: boolean): Promise<PlanMemoryEntry[]>;
	analyzePlanTrajectory(planId: string): Promise<{
		onCourse: boolean;
		projectedCompletion: string;
		courseCorrections: string[];
	}>;
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
