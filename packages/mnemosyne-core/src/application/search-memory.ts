/**
 * Search memory use case — replaces the `memory_search` tool handler.
 *
 * Orchestrates: compute query embedding → search via SearchService →
 * rank results → publish topic-accessed event.
 *
 * Phase 3 will extract the real logic from `simplified-registry.ts:367`.
 */

import type { SearchService } from '../domain/search/search-service.js';
import type { EmbeddingProvider } from '../shared/index.js';
import type { SearchSpec, RankedResult } from '../domain/search/types.js';

export interface SearchMemoryInput {
    readonly query: string;
    readonly shardKey?: SearchSpec['shardKey'];
    readonly tierPreference?: SearchSpec['tierPreference'];
    readonly threshold?: SearchSpec['threshold'];
    readonly limit?: SearchSpec['limit'];
    readonly requireEvidence?: SearchSpec['requireEvidence'];
    readonly searchType?: 'exploration' | 'recall' | 'precision' | 'prewarming';
}

export interface SearchMemoryOutput {
    readonly results: RankedResult[];
    readonly total: number;
}

export class SearchMemoryUseCase {
    private readonly searchService: SearchService;
    private readonly embeddingProvider: EmbeddingProvider;

    constructor(config: { searchService: SearchService; embeddingProvider: EmbeddingProvider }) {
        this.searchService = config.searchService;
        this.embeddingProvider = config.embeddingProvider;
    }

    async execute(input: SearchMemoryInput): Promise<SearchMemoryOutput> {
        const embedding = await this.embeddingProvider.embed(input.query);
        const results = await this.searchService.search(
            {
                query: input.query,
                embedding,
                shardKey: input.shardKey,
                tierPreference: input.tierPreference,
                threshold: input.threshold,
                limit: input.limit,
                requireEvidence: input.requireEvidence,
            },
            { searchType: input.searchType ?? 'recall' },
        );
        return { results, total: results.length };
    }
}
