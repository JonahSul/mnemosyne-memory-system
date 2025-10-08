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
export declare class InstinctManager {
    private static instance;
    private hooks;
    private enabled;
    private constructor();
    static getInstance(): InstinctManager;
    /**
     * Reset singleton instance for testing (test use only)
     */
    static resetInstance(): void;
    /**
     * Bootstrap seed instincts (enhanced with priority override)
     */
    private initializeBootstrapInstincts;
    /**
     * Safe hook registration (Phase 1: logging only)
     */
    registerHook(hook: InstinctHook): void;
    /**
     * Enhanced instinct check with mandatory surfacing and blocking behavior
     */
    checkInstincts(context: string, tags: string[]): Promise<InstinctHook[]>;
    /**
     * Mandatory pre-action instinct interception
     */
    interceptAction(actionType: string, actionContext: any): Promise<{
        allowed: boolean;
        instincts_triggered: InstinctHook[];
        blocking_reason?: string;
        acknowledgment_required: boolean;
    }>;
    /**
     * Acknowledge instinct requirements to proceed with action
     */
    acknowledgeInstincts(instinctIds: string[]): boolean;
    /**
     * Enable/disable instinct system (safety toggle)
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get system status for monitoring
     */
    getStatus(): {
        enabled: boolean;
        hooks_registered: number;
        contexts: string[];
        last_triggered?: string | undefined;
    };
}
/**
 * Enhanced convenience functions with mandatory pre-action checking
 */
export declare const interceptTerminalAction: (operation: string, actionContext?: any) => Promise<{
    allowed: boolean;
    instincts_triggered: InstinctHook[];
    blocking_reason?: string;
    acknowledgment_required: boolean;
}>;
export declare const checkTerminalInstincts: (operation: string) => Promise<InstinctHook[]>;
export declare const checkClaimInstincts: (claimType: string) => Promise<InstinctHook[]>;
export declare const checkMemoryInstincts: (operation: string) => Promise<InstinctHook[]>;
//# sourceMappingURL=instinct-manager.d.ts.map