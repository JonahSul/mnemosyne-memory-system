/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Foundation Migration v1.1.0
 * 
 * Major architectural evolution incorporating empirical discoveries and modular patterns.
 * This migration elevates the foundation with proven calibration rules, deployment boundaries,
 * and elegant subsystem separation discovered through iterative development.
 */

import type { FoundationMigration } from './foundation.js';

export const foundationMigrationV11: FoundationMigration = {
	version: '1.1.0',
	description: 'Architectural Evolution: Empirical Calibration & Modular Subsystems',
	
	coreRules: [
		{
			id: 'truth-tracking',
			rule: 'All factual claims must be logged and verified to prevent false confidence',
			description: 'Use memory_log_claim immediately after making assertions, then verify with evidence',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'After saying "The deployment was successful" → log claim → verify with evidence',
				'When stating "The bug is in line 42" → log claim → verify by checking code',
				'Before concluding "User wants feature X" → log assumption → verify with user'
			]
		},
		{
			id: 'deployment-boundaries',
			rule: 'NEVER deploy, publish, or push without explicit user permission',
			description: 'This is an absolute boundary - always ask permission before any deployment action',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'Before git push → ask "May I push these changes?"',
				'Before wrangler deploy → request "Should I deploy to staging?"',
				'Before npm publish → confirm "Permission to publish this package?"'
			]
		},
		{
			id: 'memory-calibration',
			rule: 'Use empirically discovered similarity thresholds: 20-30% for good matches, 40-50% for exact',
			description: 'Apply calibrated thresholds based on testing with mock embeddings rather than theoretical values',
			priority: 'high',
			enforcement: 'strict',
			examples: [
				'For balanced search → use threshold 0.1',
				'For high recall → use threshold 0.05',
				'For precision → use threshold 0.25',
				'Never assume 70-90% similarity ranges without empirical validation'
			]
		},
		{
			id: 'modular-architecture',
			rule: 'Maintain clean separation between behavioral memory and vector knowledge subsystems',
			description: 'Use focused subsystems with clear responsibilities and unified coordination',
			priority: 'high',
			enforcement: 'advisory',
			examples: [
				'Behavioral subsystem → claims, violations, rules, compliance',
				'Vector subsystem → knowledge storage, semantic search, RAG',
				'Unified facade → coordinated access with intelligent routing',
				'Avoid mixing behavioral tracking with vector operations'
			]
		},
		{
			id: 'terminal-hygiene',
			rule: 'Kill broken terminals immediately to maintain operational efficiency',
			description: 'Identify and terminate terminals that lose connection or become unresponsive',
			priority: 'medium',
			enforcement: 'advisory',
			examples: [
				'When terminal shows "connection lost" → terminate immediately',
				'If terminal becomes unresponsive → start fresh terminal',
				'Keep workspace clean of cluttered terminal state'
			]
		},
		{
			id: 'copyright-compliance',
			rule: 'All new files must include proper copyright attribution to Jonah Sullivan',
			description: 'Use established copyright header format for legal compliance',
			priority: 'high',
			enforcement: 'strict',
			examples: [
				'/** Copyright © 2025, Jonah Sullivan */',
				'Include at top of every new .ts, .js, .md file',
				'Use consistent formatting across project'
			]
		},
		{
			id: 'empirical-validation',
			rule: 'Capture and apply empirical discoveries through systematic testing',
			description: 'Document actual system behavior and integrate learnings permanently',
			priority: 'high',
			enforcement: 'advisory',
			examples: [
				'Test actual similarity ranges → document in system axioms',
				'Discover system behaviors → create migration rules',
				'Measure performance → optimize based on data not assumptions'
			]
		}
	],

	essentialPatterns: [
		{
			pattern: 'dual-memory-architecture',
			description: 'Behavioral memory for rules/claims/violations + Vector knowledge for semantic search/RAG',
			desiredOutcome: 'positive',
			interventions: [
				'Separate behavioral tracking from vector operations',
				'Use unified facade for coordinated access',
				'Apply focused subsystems with clear responsibilities',
				'Maintain clean interfaces between subsystems'
			]
		},
		{
			pattern: 'empirical-calibration',
			description: 'Systematic discovery and application of actual system behavior through testing',
			desiredOutcome: 'positive',
			interventions: [
				'Test actual behavior vs assumptions',
				'Document discoveries in system axioms',
				'Apply learnings in code and configuration',
				'Avoid theoretical optimization without validation'
			]
		},
		{
			pattern: 'progressive-decomposition',
			description: 'Elegant separation of monolithic systems into focused subsystems',
			desiredOutcome: 'positive',
			interventions: [
				'Create focused, single-responsibility modules',
				'Maintain backward compatibility during refactoring',
				'Use established patterns for consistency',
				'Avoid big bang architectural changes'
			]
		}
	],

	safetyConstraints: [
		{
			constraint: 'No deployment actions without explicit user permission',
			rationale: 'Prevents unauthorized changes to production systems and maintains user control',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'All claims must be logged and tracked for verification',
			rationale: 'Prevents false confidence and enables accountability and self-correction',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'Use empirically validated thresholds, not theoretical assumptions',
			rationale: 'Ensures system operates based on actual measured behavior rather than documentation',
			enforcement: 'warning'
		},
		{
			constraint: 'Maintain modular architecture with clear subsystem boundaries',
			rationale: 'Preserves maintainability and prevents architectural decay',
			enforcement: 'warning'
		}
	],

	metadata: {
		author: 'mnemosyne-agent',
		timestamp: new Date().toISOString(),
		changelog: [
			'Added empirically calibrated memory thresholds (20-30% good matches)',
			'Established absolute deployment boundaries with violation tracking',
			'Implemented modular subsystem architecture (behavioral + vector)',
			'Added terminal hygiene and operational efficiency rules',
			'Required mandatory copyright compliance for new files',
			'Integrated systematic empirical discovery patterns'
		],
		replaces: '1.0.0',
		empiricalBasis: 'Session discoveries through systematic testing and measurement',
		notes: 'This migration represents a major architectural evolution based on empirical discoveries and proven patterns from iterative development'
	}
};
