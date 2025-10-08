/**
 * Foundation Migration - Learning Mode (v1.4.1)
 *
 * Crystallizes 'learning mode' as an immutable, top-priority behavioral determiner
 * that must be consulted and cannot be overridden by future foundation updates.
 */
import { MnemosyneMemorySystem } from "../memory-tool.js";
export declare const foundationMigrationLearningMode: {
    version: string;
    description: string;
    coreRules: {
        id: string;
        rule: string;
        description: string;
        priority: string;
        enforcement: string;
        examples: string[];
    }[];
    enessentialPatterns: {
        pattern: string;
        description: string;
        desiredOutcome: string;
        interventions: string[];
    }[];
    safetyConstraints: {
        constraint: string;
        rationale: string;
        enforcement: string;
    }[];
    metadata: {
        author: string;
        timestamp: string;
        notes: string;
    };
};
export declare function applyFoundationMigrationLearningMode(memory: MnemosyneMemorySystem): Promise<void>;
//# sourceMappingURL=foundation-learning-mode.d.ts.map