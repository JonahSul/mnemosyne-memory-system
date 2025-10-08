/**
 * Foundation Migration v1.4.0 - Terminal Handling Protocols
 *
 * Formalizes terminal handling (ephemeral lifecycle, safe naming, no interference,
 * cleanup discipline, and preference for sendCommand) as foundation rules.
 */
import { MnemosyneMemorySystem } from "../memory-tool.js";
export declare const foundationMigrationV14: {
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
    essentialPatterns: {
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
        changelog: string[];
        compatibleWith: string[];
        replaces: string;
        notes: string;
    };
};
export declare function applyFoundationMigrationV14(memory: MnemosyneMemorySystem): Promise<void>;
//# sourceMappingURL=foundation-v1.4.0.d.ts.map