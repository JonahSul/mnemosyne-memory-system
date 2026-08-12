/**
 * Storage types — local definitions decoupled from `@mnemosyne/legacy-core`.
 *
 * The pubsub package previously imported these from
 * `@mnemosyne/legacy-core/interfaces/storage`. To allow the legacy package to
 * be deleted (Phase 7), these Delegator-style storage types are now defined
 * here. They describe the vector-store adapter contract that pubsub wraps.
 */

export interface VectorStoreRecord {
    id?: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
    tags?: string[];
    timestamp?: string;
}

export interface VectorStoreSearchOptions {
    limit?: number;
    threshold?: number;
}

export interface VectorStoreSearchResult {
    id: string;
    content: string;
    embedding?: number[];
    metadata: Record<string, unknown>;
    tags: string[];
    timestamp?: string;
    similarity: number;
}

export interface VectorStoreAdapter {
    storeKnowledge(record: VectorStoreRecord): Promise<VectorStoreRecord>;
    searchSimilar(query: string, options?: VectorStoreSearchOptions): Promise<VectorStoreSearchResult[]>;
    getById?(id: string): Promise<VectorStoreSearchResult[]>;
}
