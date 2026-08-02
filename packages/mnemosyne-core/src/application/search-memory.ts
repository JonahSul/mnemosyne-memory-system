/**
 * Search memory use case — replaces the `memory_search` tool handler.
 *
 * Orchestrates: compute query embedding → search via SearchService →
 * apply confidence/evidence/verification filters → rank results →
 * publish topic-accessed event.
 *
 * Extracted from `simplified-registry.ts:367` (memory_search handler) during Phase 3.
 */

import type { SearchService } from '../domain/search/search-service.js';
import type { EmbeddingProvider, EventPublisher, ShardKey } from '../shared/index.js';
import type { SearchSpec, RankedResult } from '../domain/search/types.js';

export interface SearchMemoryInput {
	readonly query: string;
	readonly shardKey: ShardKey;
	readonly tierPreference?: SearchSpec['tierPreference'];
	readonly threshold?: SearchSpec['threshold'];
	readonly limit?: SearchSpec['limit'];
	readonly requireEvidence?: SearchSpec['requireEvidence'];
	readonly verificationMethod?: SearchSpec['verificationMethod'];
	readonly minConfidence?: number;
	readonly searchType?: 'exploration' | 'recall' | 'precision' | 'prewarming';
}

export interface SearchMemoryOutput {
	readonly results: RankedResult[];
	readonly total: number;
	readonly filteredFrom: number;
	readonly threshold: number;
}

export class SearchMemoryUseCase {
	private readonly searchService: SearchService;
	private readonly embeddingProvider: EmbeddingProvider;
	private readonly eventPublisher: EventPublisher;

	constructor(config: {
		searchService: SearchService;
		embeddingProvider: EmbeddingProvider;
		eventPublisher: EventPublisher;
	}) {
		this.searchService = config.searchService;
		this.embeddingProvider = config.embeddingProvider;
		this.eventPublisher = config.eventPublisher;
	}

	async execute(input: SearchMemoryInput): Promise<SearchMemoryOutput> {
		const embedding = await this.embeddingProvider.embed(input.query);

		// Search with 2x limit for post-filtering
		const searchLimit = (input.limit ?? 8) * 2;
		const results = await this.searchService.search(
			{
				query: input.query,
				embedding,
				shardKey: input.shardKey,
				tierPreference: input.tierPreference,
				threshold: input.threshold,
				limit: searchLimit,
				requireEvidence: input.requireEvidence,
				verificationMethod: input.verificationMethod,
			},
			{ searchType: input.searchType ?? 'recall' },
		);

		const originalTotal = results.length;

		// Apply confidence filtering
		const filtered = results.filter((result) => {
			const metadata = result.metadata;
			const confidence = metadata.confidence;
			if (input.minConfidence !== undefined && typeof confidence === 'number' && confidence < input.minConfidence) return false;
			if (input.requireEvidence && (!Array.isArray(metadata.evidence) || metadata.evidence.length === 0)) return false;
			if (input.verificationMethod && input.verificationMethod !== 'any' && metadata.verification_method !== input.verificationMethod) return false;
			return true;
		}).slice(0, input.limit ?? 8);

		// Publish topic-accessed event
		await this.eventPublisher.publish('topic.accessed', {
			query: input.query, resultCount: filtered.length, shardKey: input.shardKey,
		});

		return {
			results: filtered,
			total: filtered.length,
			filteredFrom: originalTotal,
			threshold: input.threshold ?? 0.036,
		};
	}
}
