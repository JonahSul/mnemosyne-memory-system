/**
 * Cloudflare Vectorize Integration
 *
 * Production-ready vector storage using Cloudflare AI Workers for embeddings
 * and Vectorize for vector database operations.
 */
import type { VectorStoreAdapter, VectorStoreRecord, VectorStoreSearchOptions, VectorStoreSearchResult } from '@mnemosyne/core/interfaces/storage';
export interface CloudflareEnv {
    VECTORIZE_INDEX: Vectorize;
    AI: Ai;
}
export interface CloudflareConfig {
    env?: CloudflareEnv;
    indexName?: string;
    accountId?: string;
    apiToken?: string;
    nodeEnv?: string;
    useTestShim?: boolean;
}
export interface VectorizeMetadata {
    content: string;
    timestamp: string;
    tags: string[];
    [key: string]: unknown;
}
export interface CloudflareKnowledgeItem extends VectorStoreRecord {
    id: string;
    embedding: number[];
    metadata: Record<string, unknown>;
    tags: string[];
    timestamp: string;
    vectorizeId: string;
}
export interface CloudflareSearchResult extends VectorStoreSearchResult {
    vectorizeId: string;
}
export declare class CloudflareVectorStore implements VectorStoreAdapter {
    private env;
    private indexName;
    private accountId;
    private apiToken;
    private localKnowledge;
    private useFallbackLocal;
    constructor(config?: CloudflareConfig);
    generateEmbeddings(text: string): Promise<number[]>;
    storeKnowledge(record: VectorStoreRecord): Promise<CloudflareKnowledgeItem>;
    searchSimilar(query: string, options?: VectorStoreSearchOptions): Promise<CloudflareSearchResult[]>;
    getById(id: string): Promise<CloudflareSearchResult[]>;
    isConfigured(): boolean;
    getIndexName(): string;
    getStats(): {
        localItems: number;
        configured: boolean;
        indexName: string;
        embeddingDimensions: number;
    };
    private searchLocal;
    private generateMockEmbeddings;
    private cosineSimilarity;
    private simpleHash;
    private seededRandom;
}
export type { CloudflareEnv as MnemosyneCloudflareEnv };
//# sourceMappingURL=vector-store.d.ts.map