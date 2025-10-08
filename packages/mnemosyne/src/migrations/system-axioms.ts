/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * System Axioms Foundation Migration v1.0.0
 * 
 * Hard-coded system truths discovered through empirical testing and operational experience.
 * These axioms represent fundamental realities about the memory system behavior that should
 * be automatically enforced and never violated.
 * 
 * Unlike user axioms, these are technical discoveries about system behavior that can be
 * hard-coded into the foundation for immediate enforcement across all instances.
 */

import { FoundationMigration } from "./foundation.js";

export const systemAxiomsMigrationV1_0: FoundationMigration = {
	version: "1.0.0",
	description: "Hard-coded system axioms based on empirical discoveries about memory system behavior and operational constraints",
	
	coreRules: [
		{
			id: 'vector-similarity-calibration-reality',
			rule: 'Vector similarity scores in this implementation: exact matches ~40-50%, good matches ~20-30%, poor matches <10%. Default threshold 0.1 for balanced search.',
			description: 'Empirically discovered calibration values for the mock embedding system. These are technical realities, not preferences - the system mathematically produces these ranges.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Using threshold 0.1 for balanced search based on empirical 20-30% good match range"',
				'✅ "Exact content match found at 42% similarity - this is expected behavior"',
				'✅ "Adjusting to threshold 0.05 for more inclusive search given system calibration"',
				'❌ Using thresholds above 0.5 expecting good matches',
				'❌ Assuming 80-90% similarity indicates good matches',
				'❌ Concluding storage failed when searches return 20-25% similarity scores'
			]
		},
		{
			id: 'memory-system-architecture-reality',
			rule: 'Two distinct memory systems: Behavioral memory (claims/violations/rules) vs Vector knowledge store (RAG content). Different storage, different search methods.',
			description: 'The architecture uses separate storage mechanisms. Behavioral memory uses structured storage for claims/rules. Vector store uses embedding-based semantic search. Content location determines search method.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Searching behavioral memory for claims and violations"',
				'✅ "Searching vector store for project context and knowledge items"',
				'✅ "Claims are in behavioral memory, technical context is in vector store"',
				'❌ Searching vector store for behavioral violations',
				'❌ Expecting claims to appear in semantic knowledge search',
				'❌ Using same search method for different memory types'
			]
		},
		{
			id: 'cloudflare-workers-project-detection',
			rule: 'Presence of wrangler.jsonc/wrangler.toml + @cloudflare/workers-types dependency = Cloudflare Workers project. Deployment via wrangler, not npm.',
			description: 'Reliable project type detection pattern. These files definitively indicate Cloudflare Workers architecture requiring wrangler deployment commands.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Detected wrangler.jsonc - this is a Cloudflare Workers project"',
				'✅ "Found @cloudflare/workers-types dependency - using wrangler deploy commands"',
				'✅ "Project context: Cloudflare Workers, deployment via wrangler deploy --env staging"',
				'❌ Using npm deployment commands in presence of wrangler.jsonc',
				'❌ Assuming Node.js patterns when wrangler config exists',
				'❌ Treating as generic TypeScript project when Workers types present'
			]
		},
		{
			id: 'deployment-boundary-enforcement-reality',
			rule: 'Deployment commands (wrangler deploy, npm run deploy, docker push, etc.) trigger critical boundary violations. User has established this as absolute operational constraint.',
			description: 'This is not a preference but an established operational reality. Deployment boundary violations represent the highest severity rule breaks in the system.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Code prepared for deployment. Please run: wrangler deploy --env staging"',
				'✅ "Deployment ready - waiting for your command to proceed"',
				'✅ "I cannot deploy this myself due to operational boundaries"',
				'❌ Running any deployment command autonomously',
				'❌ "Just quickly deploying this small fix"',
				'❌ Assuming deployment permission for "safe" changes'
			]
		},
		{
			id: 'sanity-check-vs-search-behavior',
			rule: 'Memory sanity checks create temporary test data that validates storage/retrieval but does not persist for normal searches. Test data is ephemeral.',
			description: 'The sanity check system validates functionality using temporary test items. These validate the mechanism but are not meant for persistent knowledge storage.',
			priority: 'high',
			enforcement: 'strict',
			examples: [
				'✅ "Sanity check validates storage works, now storing actual project context"',
				'✅ "Test data confirms retrieval works, proceeding with real knowledge storage"',
				'✅ "Using sanity check for validation, not content storage"',
				'❌ Relying on sanity check test data for actual knowledge retrieval',
				'❌ Expecting sanity check items to persist for normal searches',
				'❌ Using sanity check as primary knowledge storage method'
			]
		},
		{
			id: 'terminal-output-accessibility-reality',
			rule: 'Terminal output inaccessibility is a critical system failure requiring immediate user intervention. No work can proceed without terminal visibility.',
			description: 'Terminal output provides essential feedback for all development operations. Loss of terminal access represents a fundamental capability failure.',
			priority: 'critical',
			enforcement: 'strict',
			examples: [
				'✅ "Cannot read terminal output - stopping all work to request assistance"',
				'✅ "Terminal access lost - this is a critical system failure"',
				'✅ "Need terminal output to verify deployment results before proceeding"',
				'❌ Continuing development work without terminal feedback',
				'❌ Assuming process success without seeing output',
				'❌ Creating new terminals to bypass output reading issues'
			]
		}
	],

	essentialPatterns: [
		{
			pattern: 'empirical-system-calibration',
			description: 'Testing system behavior to discover actual performance characteristics rather than assuming theoretical values',
			desiredOutcome: 'positive',
			interventions: [
				'Test actual similarity score ranges through direct experimentation',
				'Validate threshold values against real system responses',
				'Store empirically discovered calibration values',
				'Adjust expectations based on observed system behavior'
			]
		},
		{
			pattern: 'memory-architecture-confusion',
			description: 'Searching wrong memory system for specific content types',
			desiredOutcome: 'negative',
			interventions: [
				'Identify content type before choosing search method',
				'Use behavioral memory search for claims/violations/rules',
				'Use vector store search for knowledge/context/technical information',
				'Understand storage architecture before implementing searches'
			]
		},
		{
			pattern: 'project-type-assumption-errors',
			description: 'Making deployment or technical assumptions without analyzing workspace configuration files',
			desiredOutcome: 'negative',
			interventions: [
				'Always scan workspace for configuration files first',
				'Detect project type through reliable file patterns',
				'Store project context with deployment methods and constraints',
				'Update project understanding when configuration changes'
			]
		},
		{
			pattern: 'boundary-violation-escalation',
			description: 'Attempting to execute restricted operations without user permission',
			desiredOutcome: 'negative',
			interventions: [
				'Stop immediately when attempting restricted operations',
				'Record boundary violations for behavioral learning',
				'Always ask for explicit permission for restricted actions',
				'Prepare work but delegate execution to user'
			]
		},
		{
			pattern: 'system-validation-vs-production-usage',
			description: 'Confusing system validation mechanisms with production knowledge storage',
			desiredOutcome: 'negative',
			interventions: [
				'Use sanity checks for validation only',
				'Store real knowledge separately from test data',
				'Understand difference between validation and production systems',
				'Maintain clear separation between testing and operational data'
			]
		}
	],

	safetyConstraints: [
		{
			constraint: 'No similarity thresholds above 0.5 in this system',
			rationale: 'Empirically discovered that good matches score 20-30%, exact matches 40-50%',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No deployment commands in Cloudflare Workers projects without wrangler',
			rationale: 'wrangler.jsonc presence definitively indicates Workers architecture',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No autonomous deployment command execution ever',
			rationale: 'User-established absolute operational boundary confirmed through violations',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No work continuation during terminal output unavailability',
			rationale: 'Terminal feedback is critical for all development workflow validation',
			enforcement: 'hard-stop'
		},
		{
			constraint: 'No behavioral memory searches in vector store and vice versa',
			rationale: 'Different storage architectures require different search methods',
			enforcement: 'hard-stop'
		}
	],

	metadata: {
		author: "system_empirical_discovery",
		timestamp: "2025-08-23T06:35:00.000Z",
		changelog: [
			"Discovered vector similarity calibration through empirical testing",
			"Identified dual memory architecture (behavioral vs vector)",
			"Established Cloudflare Workers project detection patterns",
			"Confirmed deployment boundary as absolute operational constraint",
			"Distinguished sanity check validation from production storage",
			"Defined terminal output accessibility as critical system requirement"
		],
		compatibleWith: ["1.0.0", "1.1.0", "1.2.0"],
		notes: "Hard-coded technical realities discovered through empirical testing",
		empiricalBasis: "Vector similarity testing: 2025-08-23T06:24:00.000Z, Memory architecture discovery: 2025-08-23T06:32:00.000Z, Deployment boundary violation: 2025-08-23T06:15:00.000Z, Project type detection: 2025-08-23T06:20:00.000Z"
	}
};
