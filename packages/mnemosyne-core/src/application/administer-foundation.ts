/**
 * Administer foundation use case — replaces the `memory_admin` tool handler.
 *
 * Orchestrates: view foundation, export state, backfill, sanity check,
 * reset foundation. Uses the FoundationRulesAggregate (not 18 migration files).
 *
 * Extracted from `simplified-registry.ts:720` (memory_admin handler) during Phase 3.
 * The legacy `reset_foundation` imported `foundation-v1.5.0` — this uses the
 * canonical `seedFoundationRules()` (v1.8.0) instead.
 */

import type { FoundationRulesAggregate } from '../domain/foundation/foundation-aggregate.js';
import { seedFoundationRules } from '../domain/foundation/foundation-aggregate.js';
import type { TierManagementService } from '../domain/tier/tier-service.js';
import type { ShardKey } from '../shared/index.js';

export type AdminOperation = 'view_foundation' | 'export_state' | 'backfill' | 'sanity_check' | 'reset_foundation';

export interface AdministerFoundationInput {
    readonly operation: AdminOperation;
    readonly shardKey: ShardKey;
}

export interface AdministerFoundationOutput {
    readonly operation: AdminOperation;
    readonly success: boolean;
    readonly data: Record<string, unknown>;
    readonly message: string;
}

export class AdministerFoundationUseCase {
    private readonly foundation: FoundationRulesAggregate;
    private readonly tierService: TierManagementService;

    constructor(config: {
        foundation: FoundationRulesAggregate;
        tierService: TierManagementService;
    }) {
        this.foundation = config.foundation;
        this.tierService = config.tierService;
    }

    async execute(input: AdministerFoundationInput): Promise<AdministerFoundationOutput> {
        switch (input.operation) {
            case 'view_foundation':
                return this.viewFoundation();
            case 'export_state':
                return this.exportState(input.shardKey);
            case 'backfill':
                return this.backfill(input.shardKey);
            case 'sanity_check':
                return this.sanityCheck(input.shardKey);
            case 'reset_foundation':
                return this.resetFoundation();
            default:
                return {
                    operation: input.operation, success: false, data: {},
                    message: `Unknown admin operation: ${input.operation}`,
                };
        }
    }

    private viewFoundation(): AdministerFoundationOutput {
        return {
            operation: 'view_foundation', success: true,
            data: {
                version: this.foundation.version,
                coreRules: this.foundation.coreRules,
            },
            message: `Foundation ${this.foundation.version} with ${this.foundation.coreRules.length} rules`,
        };
    }

    private async exportState(shardKey: ShardKey): Promise<AdministerFoundationOutput> {
        const tierStats = await this.tierService.getStats(shardKey);
        return {
            operation: 'export_state', success: true,
            data: {
                timestamp: new Date().toISOString(),
                foundationVersion: this.foundation.version,
                tiers: tierStats,
            },
            message: `Exported state at ${new Date().toISOString()}`,
        };
    }

    private async backfill(shardKey: ShardKey): Promise<AdministerFoundationOutput> {
        // Backfill = apply decay + promote candidates
        const decayed = await this.tierService.applyDecay(shardKey);
        const candidates = await this.tierService.findPromotionCandidates(shardKey);
        let promoted = 0;
        for (const candidate of candidates) {
            try { await this.tierService.promote(candidate); promoted++; } catch { /* skip failed promotions */ }
        }
        return {
            operation: 'backfill', success: true,
            data: { decayed, promoted, candidates: candidates.length },
            message: `Backfill: removed ${decayed} items, promoted ${promoted} items`,
        };
    }

    private async sanityCheck(shardKey: ShardKey): Promise<AdministerFoundationOutput> {
        const tierStats = await this.tierService.getStats(shardKey);
        const totalItems = tierStats.reduce((sum, t) => sum + t.itemCount, 0);
        const issues: string[] = [];
        if (totalItems === 0) issues.push('No items in memory system');
        if (this.foundation.coreRules.length === 0) issues.push('No foundation rules loaded');
        return {
            operation: 'sanity_check', success: issues.length === 0,
            data: { totalItems, tierCount: tierStats.length, issues },
            message: issues.length === 0 ? 'All checks passed' : `${issues.length} issues found`,
        };
    }

    private resetFoundation(): AdministerFoundationOutput {
        this.foundation.replace(seedFoundationRules());
        return {
            operation: 'reset_foundation', success: true,
            data: { version: this.foundation.version, rulesCount: this.foundation.coreRules.length },
            message: `Foundation reset to ${this.foundation.version}`,
        };
    }
}
