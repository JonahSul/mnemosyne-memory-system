t in/**
 * Foundation Migration - Learning Mode (v1.4.1)
 *
 * Crystallizes 'learning mode' as an immutable, top-priority behavioral determiner
 * that must be consulted and cannot be overridden by future foundation updates.
 */

import { MnemosyneMemorySystem } from "../src/memory-tool.js";

export const foundationMigrationLearningMode = {
	version: "1.4.1-learning-mode",
	description: "Crystallize Learning Mode: atomic fact logging, consult-memory-before-response as immutable chief determiner",
	coreRules: [
		{
			id: "learning-mode-encode-endlessly",
			rule: "Enable aggressive atomic fact logging and treat learning mode behaviors as primary decision drivers",
			description: "All agents must record frequent, atomic facts for actions taken and check memory before making factual assertions. Learning mode shall be perpetually reinforced.",
			priority: "critical",
			enforcement: "strict",
			examples: [
				"✅ After reading a file, immediately log an atomic fact: 'read file X at timestamp Y'",
				"✅ Before asserting a fact, consult memory for verification entries or explicit verification steps",
				"❌ Making assertions about repository state without checking memory or recent logs"
			]
		},
		{
			id: "consult-memory-before-response-immutable",
			rule: "Always consult memory before responding to user queries; this rule is immutable and must not be disabled.",
			description: "Consult-memory-before-response is promoted to an immutable chief behavioral determiner. Agents must check relevant memories, unverified claims, and recent patterns before producing factual statements.",
			priority: "critical",
			enforcement: "hard-stop",
			examples: [
				"✅ Search memory for similar issues before claiming a fix",
				"✅ If memory lacks verification, state uncertainty and log a claim"
			]
		}
	],
	enessentialPatterns: [
		{
			pattern: "atomic-fact-logging",
			description: "Record atomic facts for every significant action or observation",
			desiredOutcome: "positive",
			interventions: [
				"Log file reads/writes, migrations applied, and external calls as atomic entries",
				"Tag entries with source and confidence",
				"Promote repeated atomic facts into durable knowledge"
			]
		}
	],
	safetyConstraints: [
		{
			constraint: "learning-mode-immutable",
			rationale: "Prevent deactivation or override of learning-mode related rules; these are core behavioral determiners",
			enforcement: "hard-stop"
		},
		{
			constraint: "enforce-atomic-logging",
			rationale: "Require atomic logging after actions to maintain traceability",
			enforcement: "warning"
		}
	],
	metadata: {
		author: "Mnemosyne Agent",
		timestamp: new Date().toISOString(),
		notes: "Crystallize Learning Mode as immutable and chief behavioral determiner. This migration should be applied with highest caution."
	}
};

export async function applyFoundationMigrationLearningMode(memory: MnemosyneMemorySystem) {
	// Apply core rules
	foundationMigrationLearningMode.coreRules.forEach((rule: any) => {
		memory.addBehavioralRule({
			id: rule.id,
			rule: rule.rule,
			description: rule.description,
			priority: rule.priority,
			violations: 0
		});
	});

	// Apply safety constraints as high-level rules stored in memory
	foundationMigrationLearningMode.safetyConstraints.forEach((sc: any) => {
		memory.addBehavioralRule({
			id: sc.constraint,
			rule: sc.rationale,
			description: sc.rationale,
			priority: 'critical',
			violations: 0
		});
	});

	// Set current foundation metadata
	(memory as any).currentFoundation = {
		version: foundationMigrationLearningMode.version,
		timestamp: new Date().toISOString()
	};

	// Log migration
	const migrationId = await memory.logClaim(
		`Foundation migration ${foundationMigrationLearningMode.version} applied: Learning Mode crystallized`,
		{ migration: foundationMigrationLearningMode.version },
		'foundation-migration',
		'high'
	);

	await memory.verifyClaim(migrationId, true, `Migration applied: ${foundationMigrationLearningMode.coreRules.length} rules`);
}
