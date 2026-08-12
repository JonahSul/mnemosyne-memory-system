/**
 * Analyze causality use case — replaces the `memory_analyze_causality` tool handler.
 *
 * Orchestrates: retrieve enhanced temporal metadata for both entries →
 * analyze via CausalityService → return relationship + confidence + evidence.
 *
 * Extracted from `memory-tool.ts:analyzeCausality` and
 * `simplified-registry.ts:968` during Phase 3.
 */

import type { CausalityService } from '../domain/causality/causality-service.js';
import type { CausalityAnalysisResult, EnhancedTemporalMetadata } from '../domain/causality/types.js';

export interface AnalyzeCausalityInput {
    readonly entryId1: string;
    readonly entryId2: string;
    readonly method?: 'lamport' | 'vector' | 'hlc' | 'hybrid';
}

export type AnalyzeCausalityOutput = CausalityAnalysisResult;

export class AnalyzeCausalityUseCase {
    private readonly causalityService: CausalityService;

    constructor(config: { causalityService: CausalityService }) {
        this.causalityService = config.causalityService;
    }

    /**
     * Analyze the causal relationship between two memory entries.
     * The caller must provide the enhanced temporal metadata for both entries
     * (retrieved from the memory store). This use case delegates the actual
     * analysis to the CausalityService domain service.
     */
    execute(input: AnalyzeCausalityInput, metadata1: EnhancedTemporalMetadata, metadata2: EnhancedTemporalMetadata): AnalyzeCausalityOutput {
        return this.causalityService.analyzeCausality(metadata1, metadata2, input.method ?? 'hybrid');
    }
}
