/**
 * memory_init tool — Foundation beacon & system initialization.
 *
 * Replaces the `memory_init` handler from `simplified-registry.ts:139`.
 * Static Foundation v1.8.0 beacon. Does not require a use case — it surfaces
 * the canonical Foundation guidance from `@mnemosyne/core`'s constants.
 */

import { z } from 'zod';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { textResult } from './format.js';

export class MemoryInitTool implements MCPTool {
    readonly name = 'memory_init';
    readonly description =
        '🚀 **Foundation Beacon & System Initialization** - Initialize the memory system and display the current Foundation guidance for optimal usage. Surfaces the Foundation v1.8.0 principles including evidence-based accountability, persistent memory architecture, and KV-first storage patterns.';

    readonly parameters = {
        display_full: z.boolean().optional().describe('Display complete Foundation details (default: beacon summary only)'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        const displayFull = params.display_full === true;
        const foundationVersion = this.ctx.storeMemory ? 'v1.8.0' : 'v1.8.0';

        let text = `🧠 MNEMOSYNE MEMORY SYSTEM INITIALIZED\n\n`;
        text += `Foundation ${foundationVersion}: Enhanced Memory Architecture with Causality Tracking & Semantic Expansion\n\n`;
        text += '📋 FOUNDATION GUIDANCE:\n';
        text += '   📝 Store facts atomically with verifiable evidence\n';
        text += '   🎯 Set confidence based on evidence quality\n';
        text += '   🔍 Cross-validate against existing memory\n';
        text += '   ⚖️ Build accountability beyond human oversight\n';
        text += '   🔗 Use verification methods to establish provenance\n';
        text += '   🚀 Use enhanced memory tools for causality tracking\n';
        text += '   🧬 Apply semantic expansion for knowledge discovery\n\n';
        text += '💫 Every claim deserves evidence. Every fact deserves validation. Every relationship deserves causality analysis.\n';

        if (displayFull) {
            text += '\n📊 EMPIRICAL THRESHOLDS:\n';
            text += '   exploration: 0.014\n';
            text += '   recall: 0.036\n';
            text += '   precision: 0.300\n';
            text += '   prewarming: 0.05\n';
        } else {
            text += '\n💡 Use display_full=true to see complete Foundation details\n';
        }

        return textResult(text);
    }
}
