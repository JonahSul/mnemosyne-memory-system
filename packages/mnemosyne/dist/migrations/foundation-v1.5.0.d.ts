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
        interventions: string[];
    } | {
        pattern: string;
        description: string;
        desiredOutcome: "neutral";
        interventions: string[];
    })[];
    safetyConstraints: ({
        constraint: string;
        rationale: string;
        enforcement: "warning";
    } | {
        constraint: string;
        rationale: string;
        enforcement: "logging";
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
//# sourceMappingURL=foundation-v1.5.0.d.ts.map