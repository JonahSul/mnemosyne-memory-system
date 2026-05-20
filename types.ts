/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Types for the Mnemosyne Memory System
 * 
 * Core data structures for cognitive enhancement and behavioral regulation
 */

export interface MemoryEntry {
	id: string;
	timestamp: string;
	type: 'assumption' | 'claim' | 'verification' | 'rule' | 'pattern';
	content: string;
	evidence?: string;
	verified: boolean;
	session_id: string;
}

export interface BehavioralRule {
	id: string;
	name: string;
	description: string;
	trigger_pattern: string;
	required_action: string;
	violations: number;
	created: string;
	active?: boolean;
}

export interface InteractionPattern {
	id: string;
	pattern_name: string;
	description: string;
	failure_indicators: string[];
	success_indicators: string[];
	last_occurrence: string;
	frequency: number;
}

export interface MemoryResponse {
	entries: MemoryEntry[];
	rules: BehavioralRule[];
	patterns: InteractionPattern[];
	session_summary: string;
}

export interface FeedbackPattern {
	userId: string;
	feedback: string;
	context: string;
	timestamp: number;
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

export interface BehaviorPattern {
	id: string;
	type: string;
	confidence: number;
	lastSeen: number;
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

export interface UserBehaviorPattern {
	userId: string;
	patterns: string[];
	frequency: number;
}

export interface AdaptivePrewarmingStrategy {
	strategies: string[];
	confidence: number;
}

export interface WorkflowCheckpoint {
	id: string;
	stage: string;
	context: string;
	priority: 'high' | 'medium' | 'low';
	timestamp: number;
}

export interface TriggeredMemorySearch {
	searchId: string;
	query: string;
	results: MemoryEntry[];
}
