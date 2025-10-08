import type { ContextQuery } from './memory-interfaces';
import type { KeyValueStoreAdapter, VectorStoreAdapter } from '../interfaces/storage';
/**
 * Context & Query Management Module
 *
 * Handles context storage, query processing, and semantic search operations
 */
export interface ContextQueryOperations {
    logContextQuery(query: string, context?: Record<string, unknown>): string;
    getContextLogs(): ContextQuery[];
    getRecommendedMemorySearches(query: string): string[];
    storeContext(context: Record<string, unknown>): Promise<string>;
    searchKnowledge(query: string, limit?: number, threshold?: number, includeTestingData?: boolean): Promise<any[]>;
    searchTiered(query: string, tierPreference?: 'short' | 'intermediate' | 'long' | 'all', limit?: number, threshold?: number, includeTestingData?: boolean): Promise<any[]>;
    storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[], testing?: boolean): Promise<string>;
    storeTieredKnowledge(content: string, importance?: number, metadata?: Record<string, unknown>, tags?: string[], targetTier?: 'short' | 'intermediate' | 'long', testing?: boolean): Promise<string>;
    getStats(): Promise<any>;
    exportState(filterType?: 'claims' | 'violations' | 'rules' | 'all', format?: 'summary' | 'detailed' | 'raw', includeMetadata?: string): Promise<any>;
}
export declare class ContextQueryManager implements ContextQueryOperations {
    private contexts;
    private queries;
    private knowledgeStore;
    private tieredKnowledge;
    private vectorStore?;
    private kvStore?;
    constructor(vectorStore?: VectorStoreAdapter, kvStore?: KeyValueStoreAdapter);
    logContextQuery(query: string, context?: Record<string, unknown>): string;
    getContextLogs(): ContextQuery[];
    getRecommendedMemorySearches(query: string): string[];
    storeContext(context: Record<string, unknown>): Promise<string>;
    searchKnowledge(query: string, limit?: number, threshold?: number, includeTestingData?: boolean): Promise<any[]>;
    searchTiered(query: string, tierPreference?: 'short' | 'intermediate' | 'long' | 'all', limit?: number, threshold?: number, includeTestingData?: boolean): Promise<any[]>;
    storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[], testing?: boolean): Promise<string>;
    storeTieredKnowledge(content: string, importance?: number, metadata?: Record<string, unknown>, tags?: string[], targetTier?: 'short' | 'intermediate' | 'long', testing?: boolean): Promise<string>;
    getStats(): Promise<any>;
    exportState(filterType?: 'claims' | 'violations' | 'rules' | 'all', format?: 'summary' | 'detailed' | 'raw', includeMetadata?: string): Promise<any>;
    private performSemanticSearch;
    private performTieredSearch;
    private generateEmbeddings;
    private calculateSimilarity;
    private getTierBoost;
    private calculateKnowledgeStats;
    private calculateTieredStats;
    private calculateQueryStats;
    private calculateContextStats;
    private applyFilter;
    private formatSummary;
    private formatDetailed;
    private formatRaw;
    private analyzeQueryPatterns;
    private queriesAreSimilar;
    getContexts(): Map<string, Record<string, unknown>>;
    getQueries(): ContextQuery[];
    getKnowledgeStore(): Map<string, any>;
    getTieredKnowledge(): Map<string, any>;
}
//# sourceMappingURL=context-query.d.ts.map