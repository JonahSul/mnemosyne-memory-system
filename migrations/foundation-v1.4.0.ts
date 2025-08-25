ge/**
 * Foundation Migration v1.4.0 - Terminal Handling Protocols
 *
 * Formalizes terminal handling (ephemeral lifecycle, safe naming, no interference,
 * cleanup discipline, and preference for sendCommand) as foundation rules.
 */

import { MnemosyneMemorySystem } from "../src/memory-tool.js";

export const foundationMigrationV14 = {
	version: "1.4.0",
	description: "Terminal handling protocols: ephemeral lifecycle, safe naming, no interference, cleanup discipline, and sendCommand preference",
	coreRules: [
		{
			id: 'terminal-ephemeral-lifecycle',
			rule: 'Terminals are ephemeral by default: create→execute→destroy. Persist only for long-running processes.',
			description: 'Terminals must be created only when necessary for a single-purpose command or long-running process, and cleaned up immediately after use.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ Create terminal to run a specific command and destroy it after completion',
				'✅ Keep terminals alive only for servers or builds that must remain running',
				'❌ Leaving ephemeral terminals idle after command execution'
			]
		},
		{
			id: 'terminal-random-hex-naming',
			rule: 'Use random hex-based names for agent-created terminals (e.g., cmd-a3f7b9) to avoid collisions and clearly mark agent terminals.',
			description: 'Randomized naming prevents accidental interaction with user terminals and makes agent-owned terminals obvious.',
			priority: 'high',
			enforcement: 'advisory',
			examples: [
				'✅ Name terminals like "cmd-a3f7b9"',
				'❌ Use predictable or user-like terminal names that could collide'
			]
		},
		{
			id: 'terminal-no-interference',
			rule: 'Never interact with or modify terminals not created by the agent.',
			description: 'Protect user-owned terminals by never attaching to or sending commands to them.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ Always check ownership before sending commands',
				'❌ Attaching to existing user terminals or reusing their sessions'
			]
		},
		{
			id: 'terminal-cleanup-discipline',
			rule: 'Destroy ephemeral terminals immediately after their task completes; detect and alert when accumulated dead terminals indicate lifecycle issues.',
			description: 'Maintain cleanup discipline; implement guard that triggers when multiple dead/idle terminals accumulate.',
			priority: 'high',
			enforcement: 'strict',
			examples: [
				'✅ Destroy terminal after command exit',
				'✅ Trigger alert when >3 idle agent terminals exist without long-running processes'
			]
		},
		{
			id: 'terminal-sendCommand-preference',
			rule: 'Prefer using sendCommand which handles terminal lifecycle automatically instead of manual terminal creation when available.',
			description: 'Use higher-level APIs that manage terminal lifecycle and observation, reducing risk of leaked or interactive terminals.',
			priority: 'medium',
			enforcement: 'advisory',
			examples: [
				'✅ Use sendCommand to execute commands non-interactively',
				'✅ Reserve manual terminal creation for advanced or diagnostic cases only'
			]
		}
	],

essentialPatterns: [
	{
		pattern: 'terminal-ephemeral-pattern',
		description: 'Create → Execute → Destroy lifecycle for ephemeral terminals',
		desiredOutcome: 'positive',
		interventions: [
			'Validate lifecycle on every terminal use',
			'Log creation and destruction events',
			'Run periodic checks for idle agent terminals'
		]
	},
	{
		pattern: 'terminal-naming-clarity',
		description: 'Agent-created terminals use unambiguous names',
		desiredOutcome: 'positive',
		interventions: [
			'Generate random hex names for terminals',
			'Document naming convention in project memory'
		]
	}
],

safetyConstraints: [
	{
		constraint: 'no-interference-with-user-terminals',
		rationale: 'Prevent accidental modification or inspection of user terminals',
		enforcement: 'hard-stop'
	},
	{
		constraint: 'require-output-observation-for-actions',
		rationale: 'Do not proceed with consequential steps if terminal output cannot be observed',
		enforcement: 'warning'
	}
],

metadata: {
	author: 'Athena (agent)',
	timestamp: new Date().toISOString(),
	changelog: ['v1.4.0: Formalized terminal handling protocols'],
	compatibleWith: ['1.3.0', '1.2.0'],
	replaces: '1.3.0',
	notes: 'Formalizes terminal handling as foundation rules per user instruction'
}
};

export async function applyFoundationMigrationV14(memory: MnemosyneMemorySystem) {
	// Apply core rules
	foundationMigrationV14.coreRules.forEach((rule: any) => {
		memory.addBehavioralRule({
			id: rule.id,
			rule: rule.rule,
			description: rule.description,
			priority: rule.priority,
			violations: 0
		});
	});

	// Set foundation metadata
	(memory as any).currentFoundation = { version: foundationMigrationV14.version, timestamp: new Date().toISOString() };

	// Log and verify migration
	const migrationId = await memory.logClaim(`Foundation migration ${foundationMigrationV14.version} applied: Terminal handling protocols`, { migration: foundationMigrationV14.version }, 'foundation-migration', 'high');
	await memory.verifyClaim(migrationId, true, `Migration applied: ${foundationMigrationV14.coreRules.length} rules`);
}
