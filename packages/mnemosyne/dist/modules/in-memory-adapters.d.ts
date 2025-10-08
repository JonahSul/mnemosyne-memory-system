import type { KeyValueStoreAdapter, VectorStoreAdapter, VectorStoreRecord, VectorStoreSearchOptions, VectorStoreSearchResult } from '../interfaces/storage';
/**
 * Lightweight in-memory KeyValue store for testing and local development.
 */
export declare class InMemoryKeyValueStore implements KeyValueStoreAdapter {
    private store;
    put(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    delete(key: string): Promise<void>;
    list(): Promise<string[]>;
    getSize(): number;
    clear(): void;
}
/**
 * Simple in-memory VectorStore adapter used to satisfy Mnemosyne dependencies during tests.
 */
export declare class InMemoryVectorStoreAdapter implements VectorStoreAdapter {
    private records;
    storeKnowledge(record: VectorStoreRecord): Promise<VectorStoreRecord>;
    searchSimilar(query: string, options?: VectorStoreSearchOptions): Promise<VectorStoreSearchResult[]>;
    getById(id: string): Promise<VectorStoreSearchResult[]>;
    getCount(): number;
    clear(): void;
    private generateId;
}
//# sourceMappingURL=in-memory-adapters.d.ts.map