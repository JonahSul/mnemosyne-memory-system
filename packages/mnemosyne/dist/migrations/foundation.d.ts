/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Foundation Migration for Mnemosyne Memory System
 *
 * Established behavioral rules and patterns that should be active immediately
 * when the memory system starts up. These form the foundation for AI cognitive enhancement
 * and behavioral regulation.
 *
 * Note: This foundation can serve as a template for creating your own custom foundations.
 * Consider creating additional migration files for domain-specific behavioral patterns.
 *
 * Runtime Updates: Foundations can be managed using the memory_admin tool for
 * administrative operations and foundation management.
 */
import { MnemosyneMemorySystem } from "../memory-tool.js";
export interface FoundationMigration {
    version: string;
    description: string;
    coreRules: CoreBehavioralRule[];
    essentialPatterns: EssentialPattern[];
    safetyConstraints: SafetyConstraint[];
    metadata?: FoundationMetadata;
}
interface FoundationMetadata {
    author?: string;
    timestamp?: string;
    changelog?: string[];
    compatibleWith?: string[];
    replaces?: string;
    notes?: string;
    empiricalBasis?: string;
}
interface CoreBehavioralRule {
    id: string;
    rule: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    enforcement: 'strict' | 'advisory' | 'tracking';
    examples: string[];
}
interface EssentialPattern {
    pattern: string;
    description: string;
    desiredOutcome: 'positive' | 'negative' | 'neutral';
    interventions: string[];
}
interface SafetyConstraint {
    constraint: string;
    rationale: string;
    enforcement: 'hard-stop' | 'warning' | 'logging';
}
/**
 * Foundation Migration v1.0
 *
 * Core behavioral rules for AI safety and effectiveness. This migration establishes
 * the fundamental cognitive patterns that enable reliable AI behavior.
 *
 * You can create your own foundation migrations by following this structure.
 */
export declare const foundationMigrationV1: FoundationMigration;
/**
 * Foundation Migration v1.2.0 - Crystallized Axioms from User Feedback
 *
 * These axioms were identified and crystallized from recent behavioral patterns:
 * - Memory auto-correction protocol for conversation history search failures
 * - Foundation auto-update requirement for proactive behavioral improvement
 * - Project build awareness for this specific codebase
 */
export declare const foundationMigrationV1_2: FoundationMigration;
/**
 * Foundation Migration v1.4.1 - Integrated Memory + Terminal Protocols
 *
 * Comprehensive foundation combining memory handling protocols from v1.3.0
 * with terminal handling protocols from v1.4.0. Addresses the gap where v1.4.0
 * overlooked critical memory patterns.
 */
export declare const foundationMigrationV1_4_1: FoundationMigration;
/**
 * Apply foundation migration to memory system
 *
 * This function demonstrates how to apply a foundation migration.
 * Use this pattern to create your own custom migrations.
 */
export declare function applyFoundationMigration(memory: MnemosyneMemorySystem, migration: FoundationMigration): Promise<void>;
/**
 * Foundation v1.5.0: Evidence-Based Accountability & Atomic Memory Architecture
 *
 * This foundation establishes rigorous standards for evidence-based memory storage,
 * accountability mechanisms, and optimal usage patterns for the memory system.
 */
export declare const foundationMigrationV15: FoundationMigration;
export {};
//# sourceMappingURL=foundation.d.ts.map