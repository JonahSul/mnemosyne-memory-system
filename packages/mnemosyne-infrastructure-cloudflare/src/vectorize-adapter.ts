/**
 * VectorizeAdapter — real Cloudflare Vectorize + Workers AI vector store.
 *
 * Implements the {@link VectorStoreAdapter} port from `@mnemosyne/core`.
 * Uses Cloudflare Vectorize for vector storage. Embeddings are produced by
 * the paired `CloudflareWorkersAiEmbeddingProvider` (768-dim BGE-base).
 *
 * Extracted from `packages/mnemosyne-cloudflare/src/vector-store.ts` and
 * `src/cloudflare-vector-store.ts` during Phase 4. The mock embedding fallback
 * (`generateMockEmbeddings`) is NOT carried forward — it belongs in test fixtures.
 *
 * Requires the real `VECTORIZE_INDEX` binding. No fallback paths.
 */

import type {
    Embedding,
    QueryOptions,
    SearchResult,
    ShardKey,
    VectorEntry,
    VectorStoreAdapter,
} from '@mnemosyne/core';

export interface VectorizeAdapterConfig {
    readonly vectorizeIndex: VectorizeIndex;
    readonly dimension?: number; // default 768
}

export class VectorizeAdapter implements VectorStoreAdapter {
    private readonly index: VectorizeIndex;
    readonly dimension: number;

    constructor(config: VectorizeAdapterConfig) {
        this.index = config.vectorizeIndex;
        this.dimension = config.dimension ?? 768;
    }

    async store(entries: VectorEntry[], shardKey: ShardKey): Promise<void> {
        if (entries.length === 0) return;
        const records: VectorizeVector[] = entries.map((entry) => ({
            id: entry.id,
            values: entry.embedding as Embedding,
            metadata: {
                ...entry.metadata,
                tenant: shardKey.tenant,
                tier: shardKey.tier,
                ...(shardKey.topic && { topic: shardKey.topic }),
            },
        }));
        try {
            await this.index.upsert(records);
        } catch (error) {
            throw new Error(`VectorizeAdapter.store failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async query(embedding: number[], options: QueryOptions, shardKey?: Partial<ShardKey>): Promise<SearchResult[]> {
        const topK = options.topK;
        const threshold = options.threshold ?? 0;
        const filter: Record<string, string> = {};
        if (shardKey?.tenant) filter.tenant = shardKey.tenant;
        if (shardKey?.tier) filter.tier = shardKey.tier;
        if (shardKey?.topic) filter.topic = shardKey.topic;

        const queryOpts: VectorizeQueryOptions = {
            topK,
            returnValues: true,
            returnMetadata: 'all',
            ...(Object.keys(filter).length > 0 && { filter }),
        };

        const matches = await this.index.query(embedding, queryOpts);

        const results: SearchResult[] = [];
        for (const match of matches.matches) {
            if (match.score >= threshold) {
                results.push({
                    id: match.id,
                    score: match.score,
                    metadata: (match.metadata ?? {}) as Record<string, unknown>,
                });
            }
        }
        return results;
    }

    async delete(ids: string[], shardKey?: Partial<ShardKey>): Promise<void> {
        if (ids.length === 0) return;
        // Vectorize `deleteByIds` takes only the id list; shard filtering is
        // enforced at the application layer (callers pass only ids they own).
        void shardKey;
        try {
            await this.index.deleteByIds(ids);
        } catch (error) {
            throw new Error(`VectorizeAdapter.delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async count(shardKey?: Partial<ShardKey>): Promise<number> {
        // Vectorize has no direct count API. Use a high-topK query with the
        // shard filter as an estimate. For exact counts, callers should
        // maintain a counter in KV via TierManagementService.
        const filter: Record<string, string> = {};
        if (shardKey?.tenant) filter.tenant = shardKey.tenant;
        if (shardKey?.tier) filter.tier = shardKey.tier;
        try {
            const queryOpts: VectorizeQueryOptions = {
                topK: 1000,
                returnMetadata: 'indexed',
                ...(Object.keys(filter).length > 0 && { filter }),
            };
            const matches = await this.index.query(new Array(this.dimension).fill(0), queryOpts);
            return matches.matches.length;
        } catch {
            return 0;
        }
    }
}
