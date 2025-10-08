/**
 * Foundation v1.5.0: Evidence-Based Accountability & Atomic Memory Architecture
 *
 * This foundation establishes rigorous standards for evidence-based memory storage,
 * accountability mechanisms, and optimal usage patterns for the memory system.
 */
export declare const foundationMigrationV15: {
    version: string;
    description: string;
    coreRules: ({
        id: string;
        rule: string;
        description: string;
        priority: "critical";
        enforcement: "strict";
        examples: string[];
    } | {
        id: string;
        rule: string;
        description: string;
        priority: "high";
        enforcement: "advisory";
        examples: string[];
    })[];
    essentialPatterns: ({
        pattern: string;
        description: string;
        desiredOutcome: "positive";
    } | {
        pattern: string;
        description: string;
        desiredOutcome: "neutral";
    })[];
    safetyConstraints: ({
        constraint: string;
        description: string;
        enforcement: "strict";
    } | {
        constraint: string;
        description: string;
        enforcement: "advisory";
    } | {
        constraint: string;
        description: string;
        enforcement: "tracking";
    })[];
    metadata: {
        author: string;
        timestamp: string;
        changelog: string[];
        compatibleWith: string[];
        replaces: string;
        notes: string;
        empiricalBasis: string;
    };
};
/**
 * Apply foundation migration to memory system
 *
 * This function applies Foundation v1.5.0 migration to the memory system.
 */
export declare function applyFoundationMigration(memory: any, migration: any): Promise<void>;
//# sourceMappingURL=foundation-v1.5.0-fixed.d.ts.map