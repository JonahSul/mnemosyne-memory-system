/**
 * VectorizeAdapter — real Cloudflare Vectorize + Workers AI vector store.
 *
 * Phase 4 will move the real implementation from
 * `packages/mnemosyne-cloudflare/src/vector-store.ts` here. The mock
 * embedding fallback (`generateMockEmbeddings`) will NOT be carried forward
 * into this package — it belongs in test fixtures only.
 */

import type { VectorStoreAdapter, VectorEntry, SearchResult, QueryOptions, ShardKey } from '@mnemosyne/core';

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
        // Phase 4: real implementation from vector-store.ts
        throw new Error('VectorizeAdapter.store: not yet implemented (Phase 4)');
    }

    async query(embedding: number[], options: QueryOptions, shardKey?: Partial<ShardKey>): Promise<SearchResult[]> {
        // Phase 4: real implementation
        throw new Error('VectorizeAdapter.query: not yet implemented (Phase 4)');
    }

    async delete(ids: string[], shardKey?: Partial<ShardKey>): Promise<void> {
        // Phase 4: real implementation
        throw new Error('VectorizeAdapter.delete: not yet implemented (Phase 4)');
    }

    async count(shardKey?: Partial<ShardKey>): Promise<number> {
        // Phase 4: real implementation (NOT the 4-search hack)
        throw new Error('VectorizeAdapter.count: not yet implemented (Phase 4)');
    }
}
