/**
 * Get system stats use case — replaces the `memory_stats` tool handler.
 *
 * Orchestrates: gather tier stats + foundation info + system health →
 * return comprehensive analytics.
 *
 * Extracted from `simplified-registry.ts:545` (memory_stats handler) during Phase 3.
 */

import type { TierManagementService } from '../domain/tier/tier-service.js';
import type { FoundationRulesAggregate } from '../domain/foundation/foundation-aggregate.js';
import type { ShardKey, VectorStoreAdapter } from '../shared/index.js';

export interface GetSystemStatsInput {
	readonly shardKey: ShardKey;
	readonly includeTestingData?: boolean;
	readonly healthCheck?: boolean;
}

export interface GetSystemStatsOutput {
	readonly tiers: Array<{
		name: string;
		itemCount: number;
		averageImportance?: number;
		oldestItem?: string;
		newestItem?: string;
	}>;
	readonly totalItems: number;
	readonly foundationVersion: string;
	readonly foundationRulesCount: number;
	readonly systemHealth: 'healthy' | 'degraded' | 'critical';
	readonly vectorCount: number;
}

export class GetSystemStatsUseCase {
	private readonly tierService: TierManagementService;
	private readonly foundation: FoundationRulesAggregate;
	private readonly vectorStore: VectorStoreAdapter;

	constructor(config: {
		tierService: TierManagementService;
		foundation: FoundationRulesAggregate;
		vectorStore: VectorStoreAdapter;
	}) {
		this.tierService = config.tierService;
		this.foundation = config.foundation;
		this.vectorStore = config.vectorStore;
	}

	async execute(input: GetSystemStatsInput): Promise<GetSystemStatsOutput> {
		const tierStats = await this.tierService.getStats(input.shardKey);
		const totalItems = tierStats.reduce((sum, t) => sum + t.itemCount, 0);
		const vectorCount = await this.vectorStore.count({ tenant: input.shardKey.tenant });

		const systemHealth = totalItems > 0 ? 'healthy' : 'degraded';

		return {
			tiers: tierStats.map((t) => ({
				name: t.name,
				itemCount: t.itemCount,
				averageImportance: t.averageImportance,
				oldestItem: t.oldestItem,
				newestItem: t.newestItem,
			})),
			totalItems,
			foundationVersion: this.foundation.version,
			foundationRulesCount: this.foundation.coreRules.length,
			systemHealth,
			vectorCount,
		};
	}
}
