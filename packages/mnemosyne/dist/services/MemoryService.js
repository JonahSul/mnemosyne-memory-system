/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Memory Service
 *
 * High-level service orchestrating memory operations across domains
 * Implements dependency injection and service composition patterns
 */
import { BaseManager } from '../core/base';
import { CoreMemoryManager } from '../domains/memory';
/**
 * Main memory service coordinating all memory operations
 */
export class MemoryService extends BaseManager {
    persistenceLayer;
    vectorDimensions;
    enableCaching;
    cacheTTL;
    maxCacheSize;
    coreMemoryManager;
    cache = new Map();
    constructor(dependencies) {
        super(dependencies);
        this.persistenceLayer = dependencies.config.persistenceLayer;
        this.vectorDimensions = dependencies.config.vectorDimensions;
        this.enableCaching = dependencies.config.enableCaching;
        this.cacheTTL = dependencies.config.cacheTTL;
        this.maxCacheSize = dependencies.config.maxCacheSize;
        // Initialize core memory manager
        const coreMemoryDeps = {
            config: dependencies.config.coreMemoryConfig,
            persistenceLayer: this.persistenceLayer
        };
        if (dependencies.logger) {
            coreMemoryDeps.logger = dependencies.logger;
        }
        if (dependencies.metrics) {
            coreMemoryDeps.metrics = dependencies.metrics;
        }
        this.coreMemoryManager = new CoreMemoryManager(coreMemoryDeps);
    }
    /**
     * Initialize the memory service
     */
    async initialize() {
        this.log('log', 'Initializing MemoryService');
        try {
            // Validate configuration
            this.validateConfig();
            // Initialize core memory manager
            await this.coreMemoryManager.initialize();
            // Initialize cache if enabled
            if (this.enableCaching) {
                this.setupCacheCleanup();
            }
            this.initialized = true;
            this.recordMetric('increment', 'initialized');
            this.log('log', 'MemoryService initialized successfully');
        }
        catch (error) {
            this.log('error', 'Failed to initialize MemoryService', error);
            throw error;
        }
    }
    /**
     * Store a memory entry with semantic processing
     */
    async storeMemory(content, metadata = {}, options = {}) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'store_memory_requested');
            // Delegate to CoreMemoryManager
            const createData = {
                content,
                metadata,
                importance: options.confidence || 0.5,
                tags: options.tags || []
            };
            if (options.tier) {
                createData.tier = options.tier;
            }
            const memoryItem = await this.coreMemoryManager.create(createData);
            // Update cache if enabled
            if (this.enableCaching) {
                this.updateCache(memoryItem.id, memoryItem);
            }
            const duration = Date.now() - start;
            this.recordMetric('timing', 'store_memory', duration);
            return {
                success: true,
                data: memoryItem,
                metadata: { operationId, timestamp: Date.now(), duration }
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'store_memory', duration, { status: 'error' });
            this.log('error', 'Failed to store memory', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                metadata: { operationId, timestamp: Date.now(), duration }
            };
        }
    }
    /**
     * Retrieve a memory entry by ID
     */
    async get(id) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'get_requested');
            // Check cache first
            if (this.enableCaching) {
                const cached = this.getFromCache(id);
                if (cached) {
                    this.recordMetric('increment', 'cache_hit');
                    return cached;
                }
                this.recordMetric('increment', 'cache_miss');
            }
            // Delegate to CoreMemoryManager
            const result = await this.coreMemoryManager.get(id);
            if (result && this.enableCaching) {
                this.updateCache(id, result);
            }
            const duration = Date.now() - start;
            this.recordMetric('timing', 'get_memory', duration);
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'get_memory', duration, { status: 'error' });
            this.log('error', 'Failed to get memory', error);
            return null;
        }
    }
    /**
     * Create a new memory entry
     */
    async create(data) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'create_requested');
            // Delegate to CoreMemoryManager
            const result = await this.coreMemoryManager.create(data);
            if (this.enableCaching) {
                this.updateCache(result.id, result);
            }
            const duration = Date.now() - start;
            this.recordMetric('timing', 'create_memory', duration);
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'create_memory', duration, { status: 'error' });
            this.log('error', 'Failed to create memory', error);
            throw error;
        }
    }
    /**
     * Update an existing memory entry
     */
    async update(id, data) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'update_requested');
            // Delegate to CoreMemoryManager
            const result = await this.coreMemoryManager.update(id, data);
            if (this.enableCaching) {
                this.updateCache(id, result);
            }
            const duration = Date.now() - start;
            this.recordMetric('timing', 'update_memory', duration);
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'update_memory', duration, { status: 'error' });
            this.log('error', 'Failed to update memory', error);
            throw error;
        }
    }
    /**
     * Delete a memory entry
     */
    async delete(id) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'delete_requested');
            // Delegate to CoreMemoryManager
            const success = await this.coreMemoryManager.delete(id);
            if (success && this.enableCaching) {
                this.cache.delete(id);
            }
            const duration = Date.now() - start;
            this.recordMetric('timing', 'delete_memory', duration);
            return success;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'delete_memory', duration, { status: 'error' });
            this.log('error', 'Failed to delete memory', error);
            return false;
        }
    }
    /**
     * Search memory entries using semantic similarity
     */
    async searchSimilar(query, options = {}) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'search_requested');
            // Delegate to CoreMemoryManager
            const results = await this.coreMemoryManager.searchSimilar(query, options);
            const duration = Date.now() - start;
            this.recordMetric('timing', 'search_memory', duration);
            return results;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'search_memory', duration, { status: 'error' });
            this.log('error', 'Failed to search memory', error);
            return [];
        }
    }
    /**
     * List memory entries
     */
    async list(filter) {
        const operationId = this.generateOperationId();
        const start = Date.now();
        try {
            this.ensureInitialized();
            this.recordMetric('increment', 'list_requested');
            // Delegate to CoreMemoryManager
            const results = await this.coreMemoryManager.list(filter);
            const duration = Date.now() - start;
            this.recordMetric('timing', 'list_memory', duration);
            return results;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordMetric('timing', 'list_memory', duration, { status: 'error' });
            this.log('error', 'Failed to list memory', error);
            return [];
        }
    }
    /**
     * Validate memory entry data
     */
    async validate(data) {
        const errors = [];
        if (!data.content || typeof data.content !== 'string') {
            errors.push('Content is required and must be a string');
        }
        if (data.metadata && typeof data.metadata !== 'object') {
            errors.push('Metadata must be an object');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Get service health status
     */
    async health() {
        const baseHealth = await super.health();
        const details = {
            ...baseHealth.details,
            cacheEnabled: this.enableCaching,
            cacheSize: this.cache.size,
            vectorDimensions: this.vectorDimensions
        };
        return { ...baseHealth, details };
    }
    /**
     * Clean up service resources
     */
    async cleanup() {
        this.log('log', 'Cleaning up MemoryService');
        if (this.enableCaching) {
            this.cache.clear();
        }
        await super.cleanup();
    }
    // Private helper methods
    validateConfig() {
        if (!this.persistenceLayer) {
            throw new Error('Persistence layer is required');
        }
        if (this.vectorDimensions <= 0) {
            throw new Error('Vector dimensions must be positive');
        }
        if (this.cacheTTL <= 0) {
            throw new Error('Cache TTL must be positive');
        }
    }
    setupCacheCleanup() {
        // Set up periodic cache cleanup
        setInterval(() => {
            this.cleanupExpiredCache();
        }, this.cacheTTL / 2);
    }
    cleanupExpiredCache() {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.cacheTTL) {
                this.cache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            this.log('log', `Cleaned up ${removed} expired cache entries`);
        }
        // Also enforce max cache size
        if (this.cache.size > this.maxCacheSize) {
            const excess = this.cache.size - this.maxCacheSize;
            const keys = Array.from(this.cache.keys()).slice(0, excess);
            for (const key of keys) {
                this.cache.delete(key);
            }
            this.log('log', `Removed ${excess} entries to enforce cache size limit`);
        }
    }
    updateCache(key, data) {
        if (this.cache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (Date.now() - entry.timestamp > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateMemoryId() {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    matchesFilter(entry, filter) {
        if (!filter) {
            return true;
        }
        for (const [key, value] of Object.entries(filter)) {
            if (entry[key] !== value) {
                return false;
            }
        }
        return true;
    }
}
