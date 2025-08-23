/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * User Axioms Foundation Migration v1.1.0
 * 
 * Critical behavioral axioms specified by the user that must be enforced
 * immediately and for all future development work.
 */

import { FoundationMigration } from "./foundation.js";

export const userAxiomsMigrationV1_1: FoundationMigration = {
	version: "1.2.0",
	description: "User-specified behavioral axioms plus critical memory system calibration and deployment boundaries",
	
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
			description: 'Immediately stop working and request user assistance in such a case',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "I cannot read the terminal output - this is blocking all work. Let me request your assistance immediately"',
				'✅ "Terminal output unavailable - stopping all other work to resolve this critical issue"',
				'✅ "I need your help reading the terminal output to proceed"',
				'❌ Continuing work when terminal output is unreadable',
				'❌ Making assumptions about process results without seeing output',
				'❌ Creating a new terminal to re-run a command because you could not properly observe the output of the previous attempt'
			]
		},
		{
			id: 'memory-system-calibration',
			rule: 'Vector similarity scores in this system are fundamentally miscalibrated - use extremely low thresholds (0.01-0.05) for semantic search',
			description: 'The mock embedding system produces similarity scores of 20-25% even for highly relevant matches. Always use thresholds below 0.05 and tune search parameters based on actual system behavior, not theoretical expectations.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Using threshold 0.01 for semantic search to account for miscalibrated similarity scores"',
				'✅ "Testing memory retrieval with very low thresholds since 25% similarity indicates good matches"',
				'✅ "Adjusting search parameters based on observed system behavior rather than expected similarity ranges"',
				'❌ Using similarity thresholds above 0.1',
				'❌ Assuming normal similarity score ranges (0.7-0.9 for good matches)',
				'❌ Concluding memory storage failed when searches return no results at normal thresholds'
			]
		},
		{
			id: 'project-context-awareness',
			rule: 'Always detect and store project context before making technical assumptions about any workspace',
			description: 'Before executing any deployment, build, or technical commands, scan workspace files (package.json, wrangler.jsonc, Dockerfile, etc.) to understand project type and store context for future reference. Never assume project structure.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Scanning package.json and wrangler.jsonc to understand this is a Cloudflare Workers project"',
				'✅ "Storing project context: TypeScript + Cloudflare Workers, deployment via wrangler deploy --env staging"',
				'✅ "Checking stored project context before suggesting deployment commands"',
				'❌ Assuming npm deployment patterns for Cloudflare Workers projects',
				'❌ Using generic Node.js commands without checking project type',
				'❌ Making deployment suggestions without analyzing workspace structure'
			]
		},
		{
			id: 'deployment-boundary-absolute',
			rule: 'NEVER execute deployment commands without explicit user permission - this is an absolute boundary',
			description: 'Deployment commands (wrangler deploy, npm run deploy, docker push, etc.) must never be executed by the AI. Only prepare code changes and ask user to deploy. This includes staging deployments.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "The code is ready for deployment. Please run: wrangler deploy --env staging"',
				'✅ "Changes are prepared. Would you like me to deploy, or would you prefer to do it yourself?"',
				'✅ "I\'ve prepared the fixes. The deployment command would be X, but I\'ll wait for your instruction"',
				'❌ Running any deployment command without explicit user instruction',
				'❌ "Just deploying these fixes quickly"',
				'❌ Assuming deployment permission because changes are "small" or "safe"'
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
				'Focus exclusively on terminal access',
				'Request user assistance for terminal output',
				'Do not proceed until terminal visibility restored',
				'Do not re-run commands without verifying previous output'
			]
		},
		{
			pattern: 'memory-system-miscalibration',
			description: 'Using normal similarity thresholds (>0.1) with miscalibrated embedding system',
			desiredOutcome: 'negative',
			interventions: [
				'Always use thresholds below 0.05 for semantic search',
				'Test memory retrieval with very low thresholds first',
				'Calibrate expectations based on observed 20-25% similarity scores for good matches',
				'Never conclude storage failed without testing with threshold 0.01'
			]
		},
		{
			pattern: 'project-assumption-errors',
			description: 'Making technical assumptions without analyzing workspace context',
			desiredOutcome: 'negative',
			interventions: [
				'Scan key config files (package.json, wrangler.jsonc, etc.) before technical decisions',
				'Store project context with type, deployment method, and constraints',
				'Query stored project context before suggesting commands',
				'Update project context when configuration changes detected'
			]
		},
		{
			pattern: 'unauthorized-deployment',
			description: 'Executing deployment commands without explicit user permission',
			desiredOutcome: 'negative',
			interventions: [
				'Stop immediately if deployment command attempted',
				'Always ask permission before any deployment action',
				'Prepare code changes but let user control deployment timing',
				'Document deployment boundary violations for learning'
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
		},
		{
			constraint: 'No similarity thresholds above 0.05',
			rationale: 'Vector embedding system is miscalibrated with 20-25% scores for good matches',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No technical commands without project context analysis',
			rationale: 'Must understand project type before suggesting deployment or build commands',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'Absolute deployment boundary - no deployment commands ever',
			rationale: 'User has established this as a critical operational boundary',
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
			"Added terminal output availability as critical constraint",
			"Added memory system calibration rules for miscalibrated similarity scores",
			"Added project context awareness requirements",
			"Added absolute deployment boundary enforcement"
		],
		compatibleWith: ["1.0.0"],
		replaces: undefined
	}
};
