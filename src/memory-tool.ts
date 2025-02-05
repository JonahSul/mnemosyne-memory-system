/**
 * Mnemosyne Memory System - Core Implementation
 * 
 * This tool provides external scaffolding for AI cognitive enhancement and behavioral consistency by:
 * 1. Tracking claims and their verification status
 * 2. Enforcing behavioral rules and learning patterns
 * 3. Maintaining persistent working memory across interactions
 * 4. Preventing known failure patterns (e.g., overconfidence, cognitive drift)
 * 
 * Named after Mnemosyne, the Greek goddess of memory, to encourage
 * other developers to implement their own Mnemosyne Memory Systems.
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

/**
 * Core behavioral rules that form the foundation of the memory system
 */
const CORE_BEHAVIORAL_RULES: Omit<BehavioralRule, 'violations' | 'lastViolation'>[] = [
	{
		id: 'consult-memory-before-response',
		rule: 'Always consult memory system before providing responses',
		description: 'Search relevant memory tiers and context to refresh understanding before answering',
		priority: 'critical',
		examples: [
			'✅ Searched memory for similar past interactions before responding',
			'✅ Checked behavioral patterns related to current query',
			'❌ Responded immediately without consulting memory system',
			'❌ Made assumptions without checking previous context'
		]
	},
	{
		id: 'no-unverified-claims',
		rule: 'Never claim something is "fixed" or "working" without verification',
		description: 'Must verify functionality through testing before claiming success',
		priority: 'critical'
	},
	{
		id: 'ask-for-help',
		rule: 'Ask user for help when unable to observe expected output',
		description: 'Instead of flailing with repeated attempts, request user assistance',
		priority: 'critical'
	},
	{
		id: 'evidence-required',
		rule: 'Provide evidence for all claims about system state',
		description: 'Back up statements with observable facts, test results, or user feedback',
		priority: 'high'
	},
	{
		id: 'systematic-approach',
		rule: 'Break down complex problems into verifiable steps',
		description: 'Address one component at a time with verification at each step',
		priority: 'medium'
	}
];

export class MnemosyneMemorySystem {
	private entries: Map<string, MemoryEntry> = new Map();
	private rules: Map<string, BehavioralRule> = new Map();
	private patterns: Map<string, InteractionPattern> = new Map();
	private contextQueries: Map<string, ContextQuery> = new Map();
	private currentFoundation?: { version: string; timestamp: string };

	constructor() {
		this.initializeCoreRules();
	}

	/**
	 * Initialize core behavioral rules that should always be enforced
	 */
	private initializeCoreRules(): void {
		CORE_BEHAVIORAL_RULES.forEach(ruleTemplate => {
			const rule: BehavioralRule = {
				...ruleTemplate,
				violations: 0
			};
			this.rules.set(rule.id, rule);
		});
	}

	/**
	 * Log a claim that needs to be verified
	 */
	logClaim(content: string, context?: Record<string, unknown>): string {
		const id = this.generateId();
		const entry: MemoryEntry = {
			id,
			timestamp: new Date().toISOString(),
			type: 'claim',
			content,
			status: 'pending',
			...(context !== undefined && { context })
		};
		this.entries.set(id, entry);
		return id;
	}

	/**
	 * Log an assumption being made
	 */
	logAssumption(content: string, context?: Record<string, unknown>): string {
		const id = this.generateId();
		const entry: MemoryEntry = {
			id,
			timestamp: new Date().toISOString(),
			type: 'assumption',
			content,
			status: 'pending',
			...(context !== undefined && { context })
		};
		this.entries.set(id, entry);
		return id;
	}

	/**
	 * Verify a claim with evidence
	 */
	verifyClaim(claimId: string, evidence: string, success: boolean): void {
		const entry = this.entries.get(claimId);
		if (entry) {
			entry.status = success ? 'verified' : 'failed';
			entry.evidence = evidence;
		}
	}

	/**
	 * Get current foundation rules
	 */
	getFoundationRules(): BehavioralRule[] {
		return Array.from(this.rules.values()).filter(rule => 
			this.isFoundationRule(rule.id)
		);
	}

	/**
	 * Log a context query for memory consultation tracking
	 */
	logContextQuery(query: string, context?: Record<string, unknown>): string {
		const id = this.generateId();
		const contextQuery: ContextQuery = {
			id,
			timestamp: new Date().toISOString(),
			query,
			...(context !== undefined && { context })
		};
		this.contextQueries.set(id, contextQuery);
		return id;
	}

	/**
	 * Get logged context queries
	 */
	getContextLogs(): ContextQuery[] {
		return Array.from(this.contextQueries.values()).sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
	}

	/**
	 * Get recommended memory searches based on current query context
	 */
	getRecommendedMemorySearches(currentQuery: string): string[] {
		const recommendations: string[] = [];
		const queryTerms = this.extractKeyTerms(currentQuery);
		
		// Add semantic searches based on query content
		this.addSemanticRecommendations(recommendations, queryTerms);
		
		// Add behavioral pattern recommendations
		this.addBehavioralRecommendations(recommendations);
		
		// Add context-based recommendations from recent queries
		this.addContextualRecommendations(recommendations);
		
		return recommendations.slice(0, 5); // Limit to 5 recommendations
	}

	/**
	 * Add semantic search recommendations based on query terms
	 */
	private addSemanticRecommendations(recommendations: string[], queryTerms: string[]): void {
		if (queryTerms.length > 0) {
			recommendations.push(
				`Recent similar queries: ${queryTerms.join(' ')}`,
				`Behavioral patterns related to: ${queryTerms.slice(0, 2).join(' ')}`,
				`Previous violations or issues with: ${queryTerms.slice(0, 3).join(' ')}`
			);
		}
	}

	/**
	 * Add behavioral pattern recommendations based on rule violations
	 */
	private addBehavioralRecommendations(recommendations: string[]): void {
		const recentViolations = Array.from(this.rules.values())
			.filter(rule => rule.violations > 0)
			.slice(0, 2);
			
		if (recentViolations.length > 0) {
			recommendations.push(
				`Check compliance with: ${recentViolations.map(r => r.id).join(', ')}`
			);
		}
	}

	/**
	 * Add contextual recommendations based on recent query history
	 */
	private addContextualRecommendations(recommendations: string[]): void {
		const recentQueries = this.getContextLogs().slice(0, 3);
		if (recentQueries.length > 0) {
			const recentTerms = recentQueries
				.flatMap(q => this.extractKeyTerms(q.query))
				.slice(0, 2);
			if (recentTerms.length > 0) {
				recommendations.push(
					`Context continuation: ${recentTerms.join(' ')}`
				);
			}
		}
	}

	/**
	 * Extract key terms from a query string
	 */
	private extractKeyTerms(query: string): string[] {
		if (!query || typeof query !== 'string') {
			return [];
		}
		
		return query
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter(term => term.length > 3 && !['this', 'that', 'with', 'from', 'they', 'were', 'been', 'have', 'will', 'would', 'could', 'should'].includes(term))
			.slice(0, 5);
	}

	/**
	 * Check if there are unverified claims
	 */
	getUnverifiedClaims(): MemoryEntry[] {
		return Array.from(this.entries.values())
			.filter(entry => entry.type === 'claim' && entry.status === 'pending');
	}

	/**
	 * Record a rule violation
	 */
	recordViolation(ruleId: string, context: string): void {
		const rule = this.rules.get(ruleId);
		if (rule) {
			rule.violations++;
			rule.lastViolation = new Date().toISOString();
			
			// Log the violation as an entry
			this.entries.set(this.generateId(), {
				id: this.generateId(),
				timestamp: new Date().toISOString(),
				type: 'rule',
				content: `Violated rule: ${rule.rule}`,
				status: 'violated',
				context: { ruleId, description: context }
			});
		}
	}

	/**
	 * Initialize a behavioral rule (used by migrations)
	 */
	initializeBehavioralRule(rule: BehavioralRule): void {
		this.rules.set(rule.id, rule);
	}

	/**
	 * Get current behavioral status for pre-response checking
	 */
	getBehavioralStatus(): {
		unverifiedClaims: number;
		recentViolations: BehavioralRule[];
		recommendations: string[];
	} {
		const unverifiedClaims = this.getUnverifiedClaims().length;
		const recentViolations = Array.from(this.rules.values())
			.filter(rule => rule.violations > 0)
			.sort((a, b) => b.violations - a.violations);

		const recommendations: string[] = [];
		
		if (unverifiedClaims > 0) {
			recommendations.push(`You have ${unverifiedClaims} unverified claims. Verify before making new claims.`);
		}
		
		if (recentViolations.length > 0) {
			recommendations.push(`Recent rule violations: ${recentViolations.map(r => r.rule).join(', ')}`);
		}

		return {
			unverifiedClaims,
			recentViolations,
			recommendations
		};
	}

	/**
	 * Export current memory state for persistence
	 */
	exportState(): {
		entries: MemoryEntry[];
		rules: BehavioralRule[];
		patterns: InteractionPattern[];
		contextQueries: ContextQuery[];
		foundation?: { version: string; timestamp: string };
	} {
		return {
			entries: Array.from(this.entries.values()),
			rules: Array.from(this.rules.values()),
			patterns: Array.from(this.patterns.values()),
			contextQueries: Array.from(this.contextQueries.values()),
			...(this.currentFoundation && { foundation: this.currentFoundation })
		};
	}

	/**
	 * Update foundation at runtime with new migration
	 */
	updateFoundation(migration: any, options: { 
		force?: boolean; 
		preserveViolations?: boolean;
		mergeRules?: boolean;
	} = {}): { success: boolean; changes: string[]; warnings: string[] } {
		const changes: string[] = [];
		const warnings: string[] = [];

		try {
			// Validate migration structure
			if (!migration.version || !migration.coreRules) {
				throw new Error('Invalid migration: missing version or coreRules');
			}

			// Check version compatibility
			if (this.currentFoundation && !options.force) {
				const currentVersion = this.currentFoundation.version;
				if (migration.version <= currentVersion) {
					warnings.push(`Migration version ${migration.version} is not newer than current ${currentVersion}`);
					if (!options.force) {
						return { success: false, changes, warnings };
					}
				}
			}

			// Backup current rules for rollback capability
			const backupRules = new Map(this.rules);
			const backupFoundation = this.currentFoundation;

			// Apply new foundation rules
			if (options.mergeRules) {
				// Merge mode: add new rules, update existing ones
				migration.coreRules.forEach((rule: any) => {
					const existingRule = this.rules.get(rule.id);
					if (existingRule) {
						// Preserve violation count if requested
						const violations = options.preserveViolations ? existingRule.violations : 0;
						this.rules.set(rule.id, {
							...rule,
							violations,
							lastViolation: existingRule.lastViolation
						});
						changes.push(`Updated rule: ${rule.id}`);
					} else {
						this.rules.set(rule.id, { ...rule, violations: 0 });
						changes.push(`Added new rule: ${rule.id}`);
					}
				});
			} else {
				// Replace mode: clear foundation rules and apply new ones
				const foundationRuleIds = Array.from(this.rules.keys()).filter(id => 
					this.isFoundationRule(id)
				);
				
				foundationRuleIds.forEach(id => {
					this.rules.delete(id);
					changes.push(`Removed old foundation rule: ${id}`);
				});

				migration.coreRules.forEach((rule: any) => {
					this.rules.set(rule.id, { ...rule, violations: 0 });
					changes.push(`Added foundation rule: ${rule.id}`);
				});
			}

			// Update foundation metadata
			this.currentFoundation = {
				version: migration.version,
				timestamp: new Date().toISOString()
			};

			// Log the foundation update as a verified claim
			const updateId = this.logClaim(
				`Foundation updated to version ${migration.version}`,
				{
					previousVersion: backupFoundation?.version,
					rulesCount: migration.coreRules.length,
					updateMode: options.mergeRules ? 'merge' : 'replace',
					preservedViolations: options.preserveViolations
				}
			);

			this.verifyClaim(
				updateId,
				`Successfully applied foundation ${migration.version} with ${changes.length} changes`,
				true
			);

			return { success: true, changes, warnings };

		} catch (error) {
			warnings.push(`Foundation update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
			return { success: false, changes, warnings };
		}
	}

	/**
	 * Get current foundation version and metadata
	 */
	getFoundationInfo(): { version?: string; timestamp?: string; rulesCount: number } {
		const foundationRules = Array.from(this.rules.values()).filter(rule => 
			this.isFoundationRule(rule.id)
		);

		return {
			...(this.currentFoundation?.version && { version: this.currentFoundation.version }),
			...(this.currentFoundation?.timestamp && { timestamp: this.currentFoundation.timestamp }),
			rulesCount: foundationRules.length
		};
	}

	/**
	 * Validate foundation migration before applying
	 */
	validateFoundation(migration: any): { valid: boolean; errors: string[]; warnings: string[] } {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Basic structure validation
		if (!migration.version) errors.push('Missing version field');
		if (!migration.description) warnings.push('Missing description field');
		if (!migration.coreRules || !Array.isArray(migration.coreRules)) {
			errors.push('Missing or invalid coreRules array');
		}

		// Rule validation
		if (migration.coreRules) {
			migration.coreRules.forEach((rule: any, index: number) => {
				if (!rule.id) errors.push(`Rule ${index}: missing id field`);
				if (!rule.rule) errors.push(`Rule ${index}: missing rule field`);
				if (!rule.description) warnings.push(`Rule ${index}: missing description field`);
				if (!['critical', 'high', 'medium', 'low'].includes(rule.priority)) {
					errors.push(`Rule ${index}: invalid priority "${rule.priority}"`);
				}
			});
		}

		// Version validation
		if (this.currentFoundation && migration.version) {
			const currentVersion = this.currentFoundation.version;
			if (migration.version === currentVersion) {
				warnings.push(`Version ${migration.version} is same as current version`);
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Check if a rule ID belongs to the foundation
	 */
	private isFoundationRule(ruleId: string): boolean {
		// Foundation rules follow specific naming patterns
		const foundationRuleIds = [
			'consult-memory-before-response',
			'verify-before-claim',
			'ask-for-help-when-blocked', 
			'evidence-for-claims',
			'systematic-debugging',
			'acknowledge-limitations',
			'read-before-act',
			// Legacy rule IDs for backward compatibility
			'no-unverified-claims',
			'ask-for-help',
			'evidence-required',
			'systematic-approach'
		];
		
		return foundationRuleIds.includes(ruleId);
	}

	private generateId(): string {
		return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
