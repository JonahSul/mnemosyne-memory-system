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
export class InstinctManager {
    static instance;
    hooks = new Map();
    enabled = false;
    constructor() {
        this.initializeBootstrapInstincts();
    }
    static getInstance() {
        if (!InstinctManager.instance) {
            InstinctManager.instance = new InstinctManager();
        }
        return InstinctManager.instance;
    }
    /**
     * Reset singleton instance for testing (test use only)
     */
    static resetInstance() {
        InstinctManager.instance = undefined;
    }
    /**
     * Bootstrap seed instincts (enhanced with priority override)
     */
    initializeBootstrapInstincts() {
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
            this.registerHook(instinct);
        });
    }
    /**
     * Safe hook registration (Phase 1: logging only)
     */
    registerHook(hook) {
        const contextHooks = this.hooks.get(hook.context) || [];
        contextHooks.push({ ...hook, triggered: false });
        this.hooks.set(hook.context, contextHooks);
        // Phase 1: Log registration for validation
        console.log(`[InstinctManager] Registered hook: ${hook.context} -> ${hook.action}`);
    }
    /**
     * Enhanced instinct check with mandatory surfacing and blocking behavior
     */
    async checkInstincts(context, tags) {
        if (!this.enabled) {
            console.log(`[InstinctManager] Instinct check bypassed (disabled): ${context}`);
            return [];
        }
        const contextHooks = this.hooks.get(context) || [];
        const triggeredHooks = [];
        // Sort by priority (highest first) and priority_override
        const sortedHooks = contextHooks.sort((a, b) => {
            if (a.priority_override && !b.priority_override)
                return -1;
            if (!a.priority_override && b.priority_override)
                return 1;
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
                // Priority override hooks surface first and log prominently
                if (hook.priority_override) {
                    console.log(`🚨 [InstinctManager] PRIORITY OVERRIDE: ${hook.context} -> ${hook.action}`);
                }
                else {
                    console.log(`[InstinctManager] Instinct triggered: ${hook.context} -> ${hook.action}`);
                }
                // If blocking behavior, stop processing and require acknowledgment
                if (hook.blocking_behavior) {
                    console.log(`⛔ [InstinctManager] ACTION BLOCKED - Acknowledgment required for: ${hook.action}`);
                    break;
                }
            }
        }
        return triggeredHooks;
    }
    /**
     * Mandatory pre-action instinct interception
     */
    async interceptAction(actionType, actionContext) {
        // Detect context from action type
        let context = "";
        let tags = [];
        if (actionType.includes("terminal") || actionType.includes("sendCommand")) {
            context = "terminal_operations";
            tags = ["terminal", "command"];
        }
        else if (actionType.includes("claim") || actionType.includes("fact")) {
            context = "factual_claims";
            tags = ["claim", "fact"];
        }
        else if (actionType.includes("memory")) {
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
    acknowledgeInstincts(instinctIds) {
        console.log(`[InstinctManager] Acknowledged instincts: ${instinctIds.join(", ")}`);
        return true; // In Phase 2, this would validate actual acknowledgment
    }
    /**
     * Enable/disable instinct system (safety toggle)
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`[InstinctManager] System ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Get system status for monitoring
     */
    getStatus() {
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
export const interceptTerminalAction = async (operation, actionContext) => {
    const manager = InstinctManager.getInstance();
    return await manager.interceptAction(`terminal_${operation}`, actionContext);
};
export const checkTerminalInstincts = async (operation) => {
    const manager = InstinctManager.getInstance();
    return await manager.checkInstincts("terminal_operations", ["terminal", operation]);
};
export const checkClaimInstincts = async (claimType) => {
    const manager = InstinctManager.getInstance();
    return await manager.checkInstincts("factual_claims", ["claim", claimType]);
};
export const checkMemoryInstincts = async (operation) => {
    const manager = InstinctManager.getInstance();
    return await manager.checkInstincts("memory_operations", ["memory", operation]);
};
