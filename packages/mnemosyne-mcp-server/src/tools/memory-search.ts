/**
 * memory_search tool — semantic search with empirical thresholds.
 *
 * Replaces the `memory_search` handler from `simplified-registry.ts:365`.
 * Delegates to the SearchMemoryUseCase from `@mnemosyne/core`.
 */

import { z } from 'zod';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { errorResult, textResult } from './format.js';

export class MemorySearchTool implements MCPTool {
    readonly name = 'memory_search';
    readonly description =
        '🔍 **Intelligent Semantic Search with Foundation Optimization** - Perform sophisticated searches across the memory system using empirically-tuned thresholds. Features confidence-based ranking, evidence filtering, and provenance-aware results. Supports exploration, recall, precision, and prewarming search modes.';

    readonly parameters = {
        query: z.string().describe('The search query to find related information - supports natural language and keywords'),
        threshold: z.number().optional().describe('Similarity threshold (empirical defaults used if not specified)'),
        limit: z.number().optional().describe('Maximum number of results to return (default: 8)'),
        tierPreference: z.enum(['short', 'intermediate', 'long', 'all']).optional().describe('Which memory tier(s) to search'),
        searchType: z.enum(['exploration', 'recall', 'precision', 'prewarming']).optional().describe('Search mode'),
        minConfidence: z.number().min(0).max(1).optional().describe('Minimum confidence score for results'),
        requireEvidence: z.boolean().optional().describe('Only return results that have supporting evidence'),
        verificationMethod: z.enum(['manual', 'automated', 'cross_reference', 'inference', 'any']).optional().describe('Filter by verification method'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        try {
            const output = await this.ctx.searchMemory.execute({
                query: String(params.query ?? ''),
                shardKey: { tenant: this.ctx.shardKey.tenant, tier: this.ctx.shardKey.tier },
                limit: typeof params.limit === 'number' ? params.limit : undefined,
                threshold: typeof params.threshold === 'number' ? params.threshold : undefined,
                tierPreference: params.tierPreference === 'all' ? undefined : (params.tierPreference as 'short' | 'intermediate' | 'long' | undefined),
                searchType: params.searchType as 'exploration' | 'recall' | 'precision' | 'prewarming' | undefined,
                minConfidence: typeof params.minConfidence === 'number' ? params.minConfidence : undefined,
                requireEvidence: typeof params.requireEvidence === 'boolean' ? params.requireEvidence : undefined,
                verificationMethod: params.verificationMethod && params.verificationMethod !== 'any'
                    ? (params.verificationMethod as 'manual' | 'automated' | 'cross_reference' | 'inference')
                    : undefined,
            });

            let text = `Found ${output.total} results for "${params.query}" (threshold: ${output.threshold})\n`;
            if (output.total < output.filteredFrom) {
                text += `[filtered from ${output.filteredFrom} total]\n`;
            }
            text += `\n`;

            output.results.forEach((result, index) => {
                text += `${index + 1}. [${result.tier.toUpperCase()}] ${result.content}\n`;
                text += `   score: ${result.score.toFixed(4)}, id: ${result.id}\n`;
            });

            if (output.results.length === 0) {
                text += `No results found.`;
            }

            return textResult(text);
        } catch (error) {
            return errorResult(error, 'Search failed');
        }
    }
}
