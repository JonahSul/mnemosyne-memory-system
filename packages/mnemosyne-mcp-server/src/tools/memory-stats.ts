/**
 * memory_stats tool — comprehensive system analytics & health monitoring.
 *
 * Replaces the `memory_stats` handler from `simplified-registry.ts:543`.
 * Delegates to the GetSystemStatsUseCase from `@mnemosyne/core`.
 */

import { z } from 'zod';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { errorResult, textResult } from './format.js';

export class MemoryStatsTool implements MCPTool {
    readonly name = 'memory_stats';
    readonly description =
        '📊 **Comprehensive Memory System Analytics & Health Monitoring** - Provide detailed statistics and health diagnostics for the entire memory ecosystem. Features tier-by-tier analytics, foundation version reporting, vector count, and system health assessment.';

    readonly parameters = {
        includeTestingData: z.boolean().optional().describe('Whether to include testing data in statistics for development'),
        healthCheck: z.boolean().optional().describe('Perform comprehensive health check'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        try {
            const stats = await this.ctx.getSystemStats.execute({
                shardKey: this.ctx.shardKey,
                includeTestingData: params.includeTestingData === true,
                healthCheck: params.healthCheck === true,
            });

            let text = `📊 MEMORY SYSTEM STATISTICS\n\n`;
            text += `Total items: ${stats.totalItems}\n`;
            text += `Foundation version: ${stats.foundationVersion}\n`;
            text += `Foundation rules: ${stats.foundationRulesCount}\n`;
            text += `Vector count: ${stats.vectorCount}\n`;
            text += `System health: ${stats.systemHealth}\n\n`;

            text += `=== TIER DISTRIBUTION ===\n`;
            stats.tiers.forEach((tier) => {
                text += `${tier.name}: ${tier.itemCount} items\n`;
            });

            return textResult(text);
        } catch (error) {
            return errorResult(error, 'Stats retrieval failed');
        }
    }
}
