/**
 * memory_store_enhanced tool — causality tracking + semantic expansion storage.
 *
 * Replaces the `memory_store_enhanced` handler from `simplified-registry.ts:888`.
 * Delegates to the StoreEnhancedMemoryUseCase from `@mnemosyne/core`.
 */

import { z } from 'zod';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { errorResult, textResult } from './format.js';

export class MemoryStoreEnhancedTool implements MCPTool {
    readonly name = 'memory_store_enhanced';
    readonly description =
        '🚀 **Enhanced Memory Storage with Causality Tracking** - Store information with advanced causal relationship tracking and semantic expansion. Tracks Lamport/Vector/Hybrid logical clocks, explicit dependencies, and correlation IDs for cross-system analysis.';

    readonly parameters = {
        content: z.string().describe('The information to store with enhanced causality tracking'),
        dependencies: z.array(z.string()).optional().describe('Explicit dependency memory IDs'),
        causedBy: z.array(z.string()).optional().describe('Memory IDs that caused this entry'),
        tags: z.array(z.string()).optional().describe('Tags for categorization'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        try {
            const output = await this.ctx.storeEnhancedMemory.execute({
                content: String(params.content ?? ''),
                shardKey: this.ctx.shardKey,
                dependencies: (params.dependencies as string[] | undefined) ?? [],
                causedBy: (params.causedBy as string[] | undefined) ?? [],
                tags: (params.tags as string[] | undefined) ?? [],
                metadata: {
                    topics: ['observation'],
                    documentType: 'analysis',
                    task: { taskId: 'store-enhanced', mode: 'write', topics: ['observation'] },
                    agent: { uuad: 'mcp' },
                    confidence: 0.5,
                    importance: 0.5,
                    verificationMethod: 'inference',
                },
            });

            return textResult(
                `✅ Successfully stored enhanced memory.\n` +
                `Memory ID: ${output.id}\n` +
                `Tier: ${output.tier}\n` +
                `Correlation ID: ${output.correlationId}\n` +
                `Causal context: ${JSON.stringify(output.causalContext)}`
            );
        } catch (error) {
            return errorResult(error, 'Enhanced storage failed');
        }
    }
}
