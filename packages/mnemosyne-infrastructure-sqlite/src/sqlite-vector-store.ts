/**
 * SqliteVectorStore — real vector store backed by better-sqlite3 + sqlite-vec.
 *
 * Phase 4 will move the real implementation from
 * `packages/mnemosyne-sqlite/src/sqlite-vector-store.ts` here.
 * The `generateMockEmbedding` fallback will NOT be carried forward.
 */

import type { VectorStoreAdapter, VectorEntry, SearchResult, QueryOptions, ShardKey } from '@mnemosyne/core';

export interface SqliteVectorStoreConfig {
    readonly dbPath: string;
    readonly dimension?: number;
    readonly embeddingFn?: (text: string) => Promise<number[]>;
}

export class SqliteVectorStore implements VectorStoreAdapter {
    readonly dimension: number;

    constructor(config: SqliteVectorStoreConfig) {
        this.dimension = config.dimension ?? 768;
        // Phase 4: real implementation from sqlite-vector-store.ts
        throw new Error('SqliteVectorStore: not yet implemented (Phase 4)');
    }

    async store(entries: VectorEntry[], shardKey: ShardKey): Promise<void> {
        throw new Error('SqliteVectorStore.store: not yet implemented (Phase 4)');
    }

    async query(embedding: number[], options: QueryOptions, shardKey?: Partial<ShardKey>): Promise<SearchResult[]> {
        throw new Error('SqliteVectorStore.query: not yet implemented (Phase 4)');
    }

    async delete(ids: string[], shardKey?: Partial<ShardKey>): Promise<void> {
        throw new Error('SqliteVectorStore.delete: not yet implemented (Phase 4)');
    }

    async count(shardKey?: Partial<ShardKey>): Promise<number> {
        throw new Error('SqliteVectorStore.count: not yet implemented (Phase 4)');
    }
}
