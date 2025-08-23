/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Behavioral Memory Tools - Focused Subsystem
 * 
 * Dedicated tools for behavioral memory operations extracted from the monolithic memory system.
 * Provides clean separation between behavioral tracking and vector knowledge storage.
 */

import { MemoryEntry, BehavioralRule } from './memory-interfaces.js';
import { CoreMemoryManager, MemoryNotFoundError } from './core-memory.js';
import { BehavioralRuleManager } from './behavioral-rules.js';

export interface ClaimVerificationResult {
	claimId: string;
	verified: boolean;
	evidence: string;
	timestamp: string;
}

export interface BehavioralStatus {
	unverifiedClaims: number;
	recentViolations: Array<{
		ruleId: string;
		context: string;
		timestamp: string;
		severity: string;
	}>;
	activeRules: number;
	complianceScore: number;
}

/**
 * Behavioral Memory Tools
 * 
 * Focused tools for behavioral memory operations including claims, violations, 
 * and rule enforcement. Designed to work with existing modular architecture.
 */
export class BehavioralMemoryTools {
	private coreMemory: CoreMemoryManager;
	private behavioralRules: BehavioralRuleManager;

	constructor() {
		this.coreMemory = new CoreMemoryManager();
		this.behavioralRules = new BehavioralRuleManager();
	}

	/**
	 * Log a claim for future verification tracking
	 */
	async logClaim(content: string, context: Record<string, any> = {}): Promise<string> {
		const claimEntry: MemoryEntry = {
			id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date().toISOString(),
			type: 'claim',
			content,
			status: 'pending',
			context
		};

		await this.coreMemory.storeMemory(claimEntry);
		return claimEntry.id;
	}

	/**
	 * Record a behavioral rule violation
	 */
	async recordViolation(ruleId: string, context: string, severity: 'minor' | 'moderate' | 'major' | 'critical' = 'moderate'): Promise<void> {
		const violationEntry: MemoryEntry = {
			id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date().toISOString(),
			type: 'verification',
			content: `Rule violation: ${ruleId} - ${context}`,
			status: 'failed',
			context: {
				ruleId,
				severity,
				violationContext: context
			}
		};

		await this.coreMemory.storeMemory(violationEntry);
	}

	/**
	 * Get behavioral status from stored memories
	 */
	getBehavioralStatus(): BehavioralStatus {
		const stats = this.coreMemory.getMemoryStats();
		
		return {
			unverifiedClaims: stats.pending || 0,
			recentViolations: [], // Could be enhanced with memory search
			activeRules: 3, // From foundation - could be enhanced
			complianceScore: stats.verified ? 
				(stats.verified / (stats.verified + stats.failed || 1)) * 100 : 
				100
		};
	}

	/**
	 * Export behavioral state using core memory export
	 */
	async exportBehavioralState(): Promise<any> {
		return await this.coreMemory.exportMemory();
	}
}
