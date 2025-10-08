/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Example Foundation Migrations for Mnemosyne Memory System
 *
 * This file demonstrates how to create custom foundation migrations
 * and deploy them at runtime using the hot-deployment system.
 */
import type { FoundationMigration } from './foundation.js';
export { systemAxiomsMigrationV1_0 } from './system-axioms.js';
export { userAxiomsMigrationV1_1 } from './user-axioms.js';
/**
 * Example: Enhanced Foundation v1.1.0
 * Adds additional safety rules and refines existing ones
 */
export declare const enhancedFoundationV1_1: FoundationMigration;
/**
 * Example: Domain-Specific Foundation for Web Development
 * Specialized behavioral rules for web development projects
 */
export declare const webDevFoundationV2_0: FoundationMigration;
/**
 * Example usage of runtime foundation deployment:
 *
 * // Deploy enhanced foundation
 * await memorySystemClient.updateFoundation({
 *   migration: enhancedFoundationV1_1,
 *   options: {
 *     mergeRules: true,
 *     preserveViolations: true
 *   }
 * });
 *
 * // Deploy domain-specific foundation
 * await memorySystemClient.updateFoundation({
 *   migration: webDevFoundationV2_0,
 *   options: {
 *     force: true,
 *     mergeRules: false // Replace foundation entirely
 *   }
 * });
 */
//# sourceMappingURL=examples.d.ts.map