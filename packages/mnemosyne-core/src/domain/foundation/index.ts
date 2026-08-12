/**
 * Foundation bounded context — behavioral rules aggregate.
 *
 * The canonical Foundation version is v1.8.0 (see FOUNDATION.md). This
 * aggregate holds the current rule set. Historical migrations (v1.0.0–v1.7.1)
 * are collapsed into `seedFoundationRules()` — no 18 migration files.
 *
 * Extracted from the legacy `modules/behavioral-rules.ts` and the
 * `migrations/foundation-v*.ts` files during Phase 2.
 */

export type { FoundationRule, FoundationRules, RuleSeverity, RuleCategory } from './types.js';
export { FoundationRulesAggregate, seedFoundationRules } from './foundation-aggregate.js';
