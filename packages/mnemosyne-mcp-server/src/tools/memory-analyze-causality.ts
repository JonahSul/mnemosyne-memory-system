/**
 * memory_analyze_causality tool — causal relationship analysis.
 *
 * Replaces the `memory_analyze_causality` handler from `simplified-registry.ts:966`.
 * Delegates to the AnalyzeCausalityUseCase from `@mnemosyne/core`.
 * The caller must supply both entries' enhanced temporal metadata.
 */

import { z } from 'zod';
import type { EnhancedTemporalMetadata } from '@mnemosyne/core';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { errorResult, textResult } from './format.js';

export class MemoryAnalyzeCausalityTool implements MCPTool {
    readonly name = 'memory_analyze_causality';
    readonly description =
        '⏱️ **Causal Relationship Analysis** - Analyze the causal relationship between two memory entries using Lamport, Vector, Hybrid, or Hybrid logical clocks. Returns relationship type, confidence score, and evidence.';

    readonly parameters = {
        entryId1: z.string().describe('First memory entry ID'),
        entryId2: z.string().describe('Second memory entry ID'),
        method: z.enum(['lamport', 'vector', 'hlc', 'hybrid']).optional().describe('Causality algorithm to use (default: hybrid)'),
        metadata1: z.unknown().describe('Enhanced temporal metadata for entry 1 (Lamport/Vector/HLC clocks)'),
        metadata2: z.unknown().describe('Enhanced temporal metadata for entry 2 (Lamport/Vector/HLC clocks)'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        try {
            const metadata1 = params.metadata1 as EnhancedTemporalMetadata | undefined;
            const metadata2 = params.metadata2 as EnhancedTemporalMetadata | undefined;
            if (!metadata1 || !metadata2) {
                return textResult('Error: both metadata1 and metadata2 are required.');
            }

            const output = this.ctx.analyzeCausality.execute(
                {
                    entryId1: String(params.entryId1 ?? ''),
                    entryId2: String(params.entryId2 ?? ''),
                    method: params.method as 'lamport' | 'vector' | 'hlc' | 'hybrid' | undefined,
                },
                metadata1,
                metadata2
            );

            return textResult(
                `⏱️ CAUSALITY ANALYSIS\n\n` +
                `Relationship: ${output.relationship}\n` +
                `Method: ${output.method}\n` +
                `Confidence: ${output.confidence}\n` +
                `Evidence: ${JSON.stringify(output.evidence)}`
            );
        } catch (error) {
            return errorResult(error, 'Causality analysis failed');
        }
    }
}
