/**
 * Search service — domain service for semantic and full-text search.
 *
 * Uses adaptive thresholds (Foundation v1.5.0 empirical calibration):
 * - exploration: 0.014
 * - recall: 0.036
 * - precision: 0.300
 * - prewarming: 0.05
 *
 * These thresholds are defined HERE (canonical) and nowhere else. Code that
 * previously hardcoded them in comments must link to this source.
 *
 * Phase 2 will extract the real ranking logic from `context-query.ts`.
 */

import type { VectorStoreAdapter } from '../../shared/index.js';
import type { SearchSpec, SearchOptions, RankedResult } from './types.js';

/** Foundation v1.5.0 empirical thresholds — canonical source. */
export const EMPIRICAL_THRESHOLDS = {
    exploration: 0.014,
    recall: 0.036,
    precision: 0.300,
    prewarming: 0.05,
    evidenceRequired: 0.6,
    crossValidation: 0.8,
} as const;

export class SearchService {
    private readonly vectorStore: VectorStoreAdapter;

    constructor(config: { vectorStore: VectorStoreAdapter }) {
        this.vectorStore = config.vectorStore;
    }

    async search(spec: SearchSpec, options?: SearchOptions): Promise<RankedResult[]> {
        const searchType = options?.searchType ?? 'recall';
        const threshold = spec.threshold ?? EMPIRICAL_THRESHOLDS[searchType] ?? EMPIRICAL_THRESHOLDS.recall;
        const limit = spec.limit ?? 8;

        if (!spec.embedding) {
            throw new Error('SearchService.search: embedding is required (call EmbeddingProvider.embed first)');
        }

        const results = await this.vectorStore.query(
            spec.embedding,
            { topK: limit, threshold, filter: spec.shardKey as Record<string, unknown> },
            spec.shardKey,
        );

        return results.map((r) => ({
            id: r.id,
            score: r.score,
            content: (r.metadata.content as string) ?? '',
            metadata: r.metadata,
            tier: (r.metadata.tier as string) ?? 'unknown',
        }));
    }
}
