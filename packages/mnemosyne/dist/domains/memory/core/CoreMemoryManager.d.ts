/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Core Memory Manager
 *
 * Domain-specific implementation for core memory operations
 * Integrates with existing multi-tier memory and vector store systems
 */
import { BaseManager, ManagerDependencies, PersistenceLayer } from '../../../core/base/index';
export interface TieredKnowledgeItem {
    id: string;
    content: string;
    embedding: number[];
    metadata: Record<string, unknown>;
    tags: string[];
    timestamp: string;
    tier: string;
    accessCount: number;
    importance: number;
    lastAccessed: string;
}
export interface MemorySearchOptions {
    tier?: string;
    limit?: number;
    threshold?: number;
    includeEmbedding?: boolean;
    tags?: string[];
}
export interface MemorySearchResult extends TieredKnowledgeItem {
    similarity: number;
    rank: number;
}
export interface CoreMemoryConfig {
    enableTiering: boolean;
    vectorDimensions: number;
    defaultTier: string;
    maxShortTermItems: number;
    maxIntermediateItems: number;
    embeddingModel: string;
}
export interface CoreMemoryDependencies extends ManagerDependencies {
    config: CoreMemoryConfig;
    persistenceLayer: PersistenceLayer;
    vectorStore?: any;
    multiTierMemory?: any;
}
/**
 * Core memory manager implementing domain-specific memory operations
 */
export declare class CoreMemoryManager extends BaseManager<TieredKnowledgeItem, string> {
    protected readonly memoryConfig: CoreMemoryConfig;
    private readonly persistenceLayer;
    private readonly vectorStore?;
    private readonly multiTierMemory?;
    constructor(dependencies: CoreMemoryDependencies);
    /**
     * Initialize the core memory manager
     */
    initialize(): Promise<void>;
    /**
     * Get a memory item by ID
     */
    get(id: string): Promise<TieredKnowledgeItem | null>;
    /**
     * Create a new memory item
     */
    create(data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem>;
    /**
     * Update an existing memory item
     */
    update(id: string, data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem>;
    /**
     * Delete a memory item
     */
    delete(id: string): Promise<boolean>;
    /**
     * List memory items with optional filtering
     */
    list(filter?: Record<string, any>): Promise<TieredKnowledgeItem[]>;
    /**
     * Validate memory item data
     */
    validate(data: Partial<TieredKnowledgeItem>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Search memory items using semantic similarity
     */
    searchSimilar(query: string, options?: MemorySearchOptions): Promise<MemorySearchResult[]>;
    private validateConfig;
    private generateMemoryId;
    private calculateImportance;
    private normalizeVectorResult;
    private applyFilter;
    private matchesFilter;
    private calculateTextSimilarity;
}
//# sourceMappingURL=CoreMemoryManager.d.ts.map