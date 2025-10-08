/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Memory Service
 *
 * High-level service orchestrating memory operations across domains
 * Implements dependency injection and service composition patterns
 */
import { BaseManager, ManagerDependencies, PersistenceLayer } from '../core/base';
import { CoreMemoryConfig, TieredKnowledgeItem, MemorySearchResult, MemorySearchOptions } from '../domains/memory';
export interface MemoryServiceConfig {
    persistenceLayer: PersistenceLayer;
    vectorDimensions: number;
    enableCaching: boolean;
    cacheTTL: number;
    maxCacheSize: number;
    coreMemoryConfig: CoreMemoryConfig;
}
export interface MemoryServiceDependencies extends ManagerDependencies {
    config: MemoryServiceConfig;
}
export interface MemoryOperationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        operationId: string;
        timestamp: number;
        duration: number;
    };
}
/**
 * Main memory service coordinating all memory operations
 */
export declare class MemoryService extends BaseManager {
    private readonly persistenceLayer;
    private readonly vectorDimensions;
    private readonly enableCaching;
    private readonly cacheTTL;
    private readonly maxCacheSize;
    private readonly coreMemoryManager;
    private cache;
    constructor(dependencies: MemoryServiceDependencies);
    /**
     * Initialize the memory service
     */
    initialize(): Promise<void>;
    /**
     * Store a memory entry with semantic processing
     */
    storeMemory(content: string, metadata?: Record<string, any>, options?: {
        tier?: string;
        confidence?: number;
        tags?: string[];
    }): Promise<MemoryOperationResult<TieredKnowledgeItem>>;
    /**
     * Retrieve a memory entry by ID
     */
    get(id: string): Promise<TieredKnowledgeItem | null>;
    /**
     * Create a new memory entry
     */
    create(data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem>;
    /**
     * Update an existing memory entry
     */
    update(id: string, data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem>;
    /**
     * Delete a memory entry
     */
    delete(id: string): Promise<boolean>;
    /**
     * Search memory entries using semantic similarity
     */
    searchSimilar(query: string, options?: MemorySearchOptions): Promise<MemorySearchResult[]>;
    /**
     * List memory entries
     */
    list(filter?: Record<string, any>): Promise<TieredKnowledgeItem[]>;
    /**
     * Validate memory entry data
     */
    validate(data: Partial<any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Get service health status
     */
    health(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, any>;
    }>;
    /**
     * Clean up service resources
     */
    cleanup(): Promise<void>;
    private validateConfig;
    private setupCacheCleanup;
    private cleanupExpiredCache;
    private updateCache;
    private getFromCache;
    private generateOperationId;
    private generateMemoryId;
    private matchesFilter;
}
//# sourceMappingURL=MemoryService.d.ts.map