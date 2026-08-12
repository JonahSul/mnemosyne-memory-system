/**
 * memory_store tool — semantic memory storage with intelligent tier placement.
 *
 * Replaces the `memory_store` handler from `simplified-registry.ts:226`.
 * Delegates to the StoreMemoryUseCase from `@mnemosyne/core`.
 */

import { z } from 'zod';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { errorResult, textResult } from './format.js';

const DEFAULT_SHARD_KEY = { tenant: 'default', tier: 'intermediate' as const };

export class MemoryStoreTool implements MCPTool {
    readonly name = 'memory_store';
    readonly description =
        '🧠 **Semantic Memory Storage with Intelligent Tier Placement** - Store information in the persistent memory system using advanced semantic confidence analysis. Automatically evaluates importance and reliability, placing content in the optimal memory tier (short/intermediate/long). Features evidence-based storage, KV-first write-through persistence, and full provenance tracking.';

    readonly parameters = {
        content: z.string().describe('The information to store in memory - facts, observations, patterns, rules, or knowledge worth preserving'),
        confidence: z.number().min(0).max(1).optional().describe('Confidence score 0-1 based on evidence quality (auto-calculated if not provided)'),
        evidence: z.array(z.string()).optional().describe('Supporting evidence justifying the content and confidence score'),
        source: z.string().optional().describe('How this information was obtained'),
        verification_method: z.enum(['manual', 'automated', 'cross_reference', 'inference']).optional().describe('Verification method used'),
        tier: z.enum(['short', 'intermediate', 'long', 'auto']).optional().describe('Memory tier (auto-detected if not specified)'),
        importance: z.number().min(0).max(1).optional().describe('Importance score for tier placement (derived from confidence if not provided)'),
        tags: z.array(z.string()).optional().describe('Tags for categorization and semantic clustering'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        try {
            const result = await this.ctx.storeMemory.execute({
                content: String(params.content ?? ''),
                shardKey: DEFAULT_SHARD_KEY,
                tier: params.tier && params.tier !== 'auto' ? (params.tier as 'short' | 'intermediate' | 'long') : undefined,
                evidence: (params.evidence as string[] | undefined) ?? [],
                tags: (params.tags as string[] | undefined) ?? [],
                metadata: {
                    topics: ['observation'],
                    documentType: 'note',
                    task: { taskId: 'store', mode: 'write', topics: ['observation'] },
                    agent: { uuad: 'mcp' },
                    confidence: typeof params.confidence === 'number' ? params.confidence : 0,
                    importance: typeof params.importance === 'number' ? params.importance : 0,
                    source: params.source as string | undefined,
                    verificationMethod: (params.verification_method as 'manual' | 'automated' | 'cross_reference' | 'inference') ?? 'inference',
                },
            });

            let text = `✅ Successfully stored content.\n`;
            text += `Memory ID: ${result.id}\n`;
            text += `Tier: ${result.tier}\n`;
            text += `Confidence: ${result.confidence.toFixed(2)}\n`;
            text += `Importance: ${result.importance.toFixed(2)}\n`;
            text += `Architecture integrity verified: ${result.integrityVerified}\n`;
            text += `Evidence: ${(params.evidence as string[] | undefined)?.length ?? 0} items\n`;

            if (Array.isArray(params.evidence) && params.evidence.length > 0) {
                text += `\nSupporting Evidence:\n`;
                (params.evidence as string[]).forEach((evidence, i) => {
                    text += `${i + 1}. ${evidence}\n`;
                });
            }

            return textResult(text);
        } catch (error) {
            return errorResult(error, 'Storage failed');
        }
    }
}
