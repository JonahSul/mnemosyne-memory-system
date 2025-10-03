/**
 * InstinctManager Scaffold - Foundation v1.6.0 Runtime Integration
 * 
 * HARDCODED VERSION DEPENDENCIES:
 * - Foundation Target: v1.6.0 minimum required
 * - Behavioral System: Part of Foundation v1.6.0 scaffold
 * - Runtime Mode: Disabled by default (enabled: false)
 * 
 * VERSION COUPLING NOTES:
 * This lightweight scaffold provides safe hooks into decision points for instinct surfacing
 * as part of the Foundation v1.6.0 Instinctual Behavioral Priority System. It starts as
 * a no-op/logging adapter to validate flow without changing core logic.
 * 
 * MAINTENANCE INSTRUCTIONS:
 * When upgrading to Foundation v1.7.0:
 * 1. Review instinct priority algorithms for compatibility
 * 2. Update behavioral pattern thresholds if modified
 * 3. Validate enabled/disabled state management
 * 4. Test backward compatibility with v1.5.0 patterns
 * 5. Update documentation with new version references
 * 
 * ACTIVATION REQUIREMENTS:
 * - Foundation v1.6.0 must be successfully deployed
 * - Phase 1 validation must pass
 * - Manual activation through Foundation management interface
 * - Proper scaffold validation and memory persistence
 */

export interface InstinctHook {
	context: string;
	tags: string[];
	priority: number;
	action: string;
	triggered: boolean;
	mandatory_surfacing?: boolean;
	priority_override?: boolean;
	blocking_behavior?: boolean;
	confidence_threshold: number;
	result?: {
		instincts_surfaced: number;
		guidance: string[];
		violations_prevented: number;
		acknowledgment_required?: boolean | undefined;
		action_blocked?: boolean | undefined;
	};
}

export class InstinctManager {
	private static instance: InstinctManager;
	private hooks: Map<string, InstinctHook[]> = new Map();
	private enabled: boolean = false;
	
	private constructor() {
		this.initializeBootstrapInstincts();
	}
	
	public static getInstance(): InstinctManager {
		if (!InstinctManager.instance) {
			InstinctManager.instance = new InstinctManager();
		}
		return InstinctManager.instance;
	}
	
	/**
	 * Reset singleton instance for testing (test use only)
	 */
	public static resetInstance(): void {
		InstinctManager.instance = undefined as any;
	}
	
	/**
	 * Bootstrap seed instincts (enhanced with priority override)
	 */
	private initializeBootstrapInstincts(): void {
		const bootstrapInstincts = [
			{
				context: "terminal_operations",
				tags: ["terminal", "command", "git", "exec"],
				priority: 0.99,
				action: "surface_terminal_safety_firewall",
				mandatory_surfacing: true,
				priority_override: true,
				blocking_behavior: true,
				confidence_threshold: 0.99
			},
			{
				context: "factual_claims",
				tags: ["claim", "fact", "verification"],
				priority: 0.98,
				action: "surface_evidence_requirements",
				mandatory_surfacing: true,
				priority_override: false,
				blocking_behavior: false,
				confidence_threshold: 0.98
			},
			{
				context: "memory_operations",
				tags: ["memory_store", "memory_search"],
				priority: 0.97,
				action: "surface_memory_protocol",
				mandatory_surfacing: false,
				priority_override: false,
				blocking_behavior: false,
				confidence_threshold: 0.97
			}
		];
		
		bootstrapInstincts.forEach(instinct => {
			this.registerHook(instinct as InstinctHook);
		});
	}
	
	/**
	 * Safe hook registration (Phase 1: logging only)
	 */
	public registerHook(hook: InstinctHook): void {
		const contextHooks = this.hooks.get(hook.context) || [];
		contextHooks.push({...hook, triggered: false});
		this.hooks.set(hook.context, contextHooks);
	}
	
	/**
	 * Enhanced instinct check with mandatory surfacing and blocking behavior
	 */
	public async checkInstincts(context: string, tags: string[]): Promise<InstinctHook[]> {
		if (!this.enabled) {
			return [];
		}
		
		const contextHooks = this.hooks.get(context) || [];
		const triggeredHooks: InstinctHook[] = [];
		
		// Sort by priority (highest first) and priority_override
		const sortedHooks = contextHooks.sort((a, b) => {
			if (a.priority_override && !b.priority_override) return -1;
			if (!a.priority_override && b.priority_override) return 1;
			return (b.confidence_threshold || b.priority) - (a.confidence_threshold || a.priority);
		});
		
		for (const hook of sortedHooks) {
			const tagMatch = hook.tags.some(tag => tags.includes(tag));
			if (tagMatch) {
				hook.triggered = true;
				
				const requiresAcknowledgment = hook.blocking_behavior || hook.mandatory_surfacing;
				const actionBlocked = hook.blocking_behavior && hook.confidence_threshold >= 0.99;
				
				hook.result = {
					instincts_surfaced: 1,
					guidance: [
						hook.priority_override ? 
							`🚨 PRIORITY OVERRIDE: ${hook.action} - MANDATORY COMPLIANCE` :
							`📋 ${hook.action}`,
						...(actionBlocked ? ["⛔ ACTION BLOCKED - Acknowledgment required"] : [])
					],
					violations_prevented: actionBlocked ? 1 : 0,
					acknowledgment_required: requiresAcknowledgment ? true : undefined,
					action_blocked: actionBlocked ? true : undefined
				};
				
				triggeredHooks.push(hook);
				
				// If blocking behavior, stop processing and require acknowledgment
				if (hook.blocking_behavior) {
					break;
				}
			}
		}
		
		return triggeredHooks;
	}
	
	/**
	 * Mandatory pre-action instinct interception
	 */
	public async interceptAction(actionType: string, actionContext: any): Promise<{
		allowed: boolean;
		instincts_triggered: InstinctHook[];
		blocking_reason?: string;
		acknowledgment_required: boolean;
	}> {
		// Detect context from action type
		let context = "";
		let tags: string[] = [];
		
		if (actionType.includes("terminal") || actionType.includes("sendCommand")) {
			context = "terminal_operations";
			tags = ["terminal", "command"];
		} else if (actionType.includes("claim") || actionType.includes("fact")) {
			context = "factual_claims";
			tags = ["claim", "fact"];
		} else if (actionType.includes("memory")) {
			context = "memory_operations";
			tags = ["memory"];
		}
		
		if (!context) {
			return { allowed: true, instincts_triggered: [], acknowledgment_required: false };
		}
		
		const triggeredInstincts = await this.checkInstincts(context, tags);
		
		// Check for blocking instincts
		const blockingInstinct = triggeredInstincts.find(h => h.result?.action_blocked);
		
		if (blockingInstinct) {
			return {
				allowed: false,
				instincts_triggered: triggeredInstincts,
				blocking_reason: `Critical safety instinct triggered: ${blockingInstinct.action}`,
				acknowledgment_required: true
			};
		}
		
		// Check for acknowledgment requirements
		const requiresAck = triggeredInstincts.some(h => h.result?.acknowledgment_required);
		
		return {
			allowed: !requiresAck, // If acknowledgment required, action not immediately allowed
			instincts_triggered: triggeredInstincts,
			acknowledgment_required: requiresAck
		};
	}
	
	/**
	 * Acknowledge instinct requirements to proceed with action
	 */
	public acknowledgeInstincts(instinctIds: string[]): boolean {
		return true;
	}
	/**
	 * Enable/disable instinct system (safety toggle)
	 */
	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}
	
	/**
	 * Get system status for monitoring
	 */
	public getStatus(): {
		enabled: boolean;
		hooks_registered: number;
		contexts: string[];
		last_triggered?: string | undefined;
	} {
		return {
			enabled: this.enabled,
			hooks_registered: Array.from(this.hooks.values()).flat().length,
			contexts: Array.from(this.hooks.keys())
			// last_triggered intentionally omitted in Phase 1
		};
	}
}

/**
 * Enhanced convenience functions with mandatory pre-action checking
 */
export const interceptTerminalAction = async (operation: string, actionContext?: any) => {
	const manager = InstinctManager.getInstance();
	return await manager.interceptAction(`terminal_${operation}`, actionContext);
};

export const checkTerminalInstincts = async (operation: string) => {
	const manager = InstinctManager.getInstance();
	return await manager.checkInstincts("terminal_operations", ["terminal", operation]);
};

export const checkClaimInstincts = async (claimType: string) => {
	const manager = InstinctManager.getInstance();
	return await manager.checkInstincts("factual_claims", ["claim", claimType]);
};

export const checkMemoryInstincts = async (operation: string) => {
	const manager = InstinctManager.getInstance();
	return await manager.checkInstincts("memory_operations", ["memory", operation]);
};
