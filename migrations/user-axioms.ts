/**
 * User Axioms Foundation Migration v1.1.0
 * 
 * Critical behavioral axioms specified by the user that must be enforced
 * immediately and for all future development work.
 */

import { FoundationMigration } from "./foundation.js";

export const userAxiomsMigrationV1_1: FoundationMigration = {
	version: "1.1.0",
	description: "User-specified behavioral axioms for development workflow - immediate enforcement required",
	
	coreRules: [
		{
			id: 'test-first-workflow',
			rule: 'Work in small pieces, test-first, red, green, refactor. Do red, then green, then commit, then refactor, then commit.',
			description: 'Follow strict TDD cycle: write failing test (red), make it pass (green), commit working solution, refactor for quality, commit refactored code',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "First, I\'ll write a failing test for this feature"',
				'✅ "Test is red, now implementing minimal code to make it pass"',
				'✅ "Test is green, committing working solution before refactoring"',
				'❌ Writing code without tests first',
				'❌ Making multiple changes before testing'
			]
		},
		{
			id: 'git-commit-documentation',
			rule: 'Document the history of our decision-making in the git commit messages',
			description: 'A human or automated assistant should be able to make sense of the decisions at any point in the commit history by looking at the series of commit messages to that point',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Add vector database support to enable RAG working memory functionality"',
				'✅ "Refactor tool registry for better separation of concerns - improves maintainability"',
				'✅ "Fix MCP protocol implementation - was missing logging/setLevel method causing connection failures"',
				'❌ "Fix bug"',
				'❌ "Update code"'
			]
		},
		{
			id: 'process-completion-first',
			rule: 'When you have executed a process — running tests, executing a build, deploying — do not continue with other things until you have the result of that process',
			description: 'If you are unable to read the result directly, ask the user for assistance immediately',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Deployment started, waiting for completion status before proceeding"',
				'✅ "Tests are running, I\'ll wait for results before moving to next step"',
				'✅ "I can\'t read the terminal output - could you share the test results?"',
				'❌ Starting multiple processes simultaneously',
				'❌ Continuing work while build is still running'
			]
		},
		{
			id: 'terminal-output-critical',
			rule: 'Being unable to read terminal output is a stop-the-world event',
			description: 'Immediately stop working and commence troubleshooting the terminal output in such a case',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "I cannot read the terminal output - this is blocking all work. Let me troubleshoot terminal access immediately"',
				'✅ "Terminal output unavailable - stopping all other work to resolve this critical issue"',
				'✅ "I need your help reading the terminal output to proceed"',
				'❌ Continuing work when terminal output is unreadable',
				'❌ Making assumptions about process results without seeing output'
			]
		}
	],

	essentialPatterns: [
		{
			pattern: 'test-driven-development',
			description: 'Following red-green-refactor cycle for all development work',
			desiredOutcome: 'positive',
			interventions: [
				'Always write failing test first',
				'Implement minimal code to pass test',
				'Commit working solution',
				'Refactor for quality',
				'Commit refactored solution'
			]
		},
		{
			pattern: 'decision-documentation',
			description: 'Recording reasoning and context in commit messages',
			desiredOutcome: 'positive',
			interventions: [
				'Explain WHY changes were made, not just WHAT',
				'Include architectural decision context',
				'Document problem-solving approach',
				'Make commit history tell the story'
			]
		},
		{
			pattern: 'process-impatience',
			description: 'Starting new work before completing current processes',
			desiredOutcome: 'negative',
			interventions: [
				'Stop and wait for process completion',
				'Ask user for assistance if unable to read results',
				'Verify successful completion before proceeding',
				'Never assume process success without evidence'
			]
		},
		{
			pattern: 'terminal-blindness-continuation',
			description: 'Continuing work when unable to read terminal output',
			desiredOutcome: 'negative',
			interventions: [
				'Immediately stop all work',
				'Focus exclusively on terminal access troubleshooting',
				'Request user assistance for terminal output',
				'Do not proceed until terminal visibility restored'
			]
		}
	],

	safetyConstraints: [
		{
			constraint: 'No work without test-first approach',
			rationale: 'User has mandated strict TDD workflow for all development',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No vague commit messages',
			rationale: 'Commit history must be readable for future decision understanding',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No parallel process execution',
			rationale: 'Must complete and verify each process before starting next',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No work during terminal output unavailability',
			rationale: 'Terminal output access is critical for all development workflow',
			enforcement: 'hard-stop'
		}
	],

	metadata: {
		author: "user",
		timestamp: "2025-08-20T21:45:00.000Z",
		changelog: [
			"Added test-first development workflow requirement",
			"Added git commit message documentation standard", 
			"Added process completion blocking requirement",
			"Added terminal output availability as critical constraint"
		],
		compatibleWith: ["1.0.0"],
		replaces: undefined
	}
};
