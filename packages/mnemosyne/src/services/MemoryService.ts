/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Memory Service
 * 
 * High-level service orchestrating memory operations across domains
 * Implements dependency injection and service composition patterns
 */

import { BaseManager, ManagerDependencies, PersistenceLayer, VectorUtil } from '../core/base';
import { CoreMemoryManager, CoreMemoryConfig, CoreMemoryDependencies, TieredKnowledgeItem, MemorySearchResult, MemorySearchOptions } from '../domains/memory';
import type { EventStream } from '@mnemosyne/pubsub';

export interface MemoryServiceConfig {
	persistenceLayer: PersistenceLayer;
	vectorDimensions: number;
	enableCaching: boolean;
	cacheTTL: number;
	maxCacheSize: number;
	coreMemoryConfig: CoreMemoryConfig;
 	eventStream?: EventStream;
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
export class MemoryService extends BaseManager {
	private readonly persistenceLayer: PersistenceLayer;
	private readonly vectorDimensions: number;
	private readonly enableCaching: boolean;
	private readonly cacheTTL: number;
	private readonly maxCacheSize: number;
	private readonly coreMemoryManager: CoreMemoryManager;
	private readonly eventStream?: EventStream;
	private cache: Map<string, { data: any; timestamp: number }> = new Map();

	constructor(dependencies: MemoryServiceDependencies) {
		super(dependencies);
		
		this.persistenceLayer = dependencies.config.persistenceLayer;
		this.vectorDimensions = dependencies.config.vectorDimensions;
		this.enableCaching = dependencies.config.enableCaching;
		this.cacheTTL = dependencies.config.cacheTTL;
		this.maxCacheSize = dependencies.config.maxCacheSize;
		this.eventStream = dependencies.config.eventStream;

		// Initialize core memory manager
		const coreMemoryDeps: CoreMemoryDependencies = {
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
	public async initialize(): Promise<void> {
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
		} catch (error) {
			this.log('error', 'Failed to initialize MemoryService', error);
			throw error;
		}
	}

	/**
	 * Store a memory entry with semantic processing
	 */
	public async storeMemory(
		content: string,
		metadata: Record<string, any> = {},
		options: { tier?: string; confidence?: number; tags?: string[] } = {}
	): Promise<MemoryOperationResult<TieredKnowledgeItem>> {
		const operationId = this.generateOperationId();
		const start = Date.now();

		try {
			this.ensureInitialized();
			this.recordMetric('increment', 'store_memory_requested');

			// Delegate to CoreMemoryManager
			const createData: Partial<TieredKnowledgeItem> = {
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
		} catch (error) {
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
	public async get(id: string): Promise<TieredKnowledgeItem | null> {
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
		} catch (error) {
			const duration = Date.now() - start;
			this.recordMetric('timing', 'get_memory', duration, { status: 'error' });
			this.log('error', 'Failed to get memory', error);
			return null;
		}
	}

	/**
	 * Create a new memory entry
	 */
	public async create(data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem> {
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
		} catch (error) {
			const duration = Date.now() - start;
			this.recordMetric('timing', 'create_memory', duration, { status: 'error' });
			this.log('error', 'Failed to create memory', error);
			throw error;
		}
	}

	/**
	 * Update an existing memory entry
	 */
	public async update(id: string, data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem> {
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
		} catch (error) {
			const duration = Date.now() - start;
			this.recordMetric('timing', 'update_memory', duration, { status: 'error' });
			this.log('error', 'Failed to update memory', error);
			throw error;
		}
	}

	/**
	 * Delete a memory entry
	 */
	public async delete(id: string): Promise<boolean> {
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
		} catch (error) {
			const duration = Date.now() - start;
			this.recordMetric('timing', 'delete_memory', duration, { status: 'error' });
			this.log('error', 'Failed to delete memory', error);
			return false;
		}
	}

	/**
	 * Search memory entries using semantic similarity
	 */
	public async searchSimilar(
		query: string,
		options: MemorySearchOptions = {}
	): Promise<MemorySearchResult[]> {
		const operationId = this.generateOperationId();
		const start = Date.now();

		try {
			this.ensureInitialized();
			this.recordMetric('increment', 'search_requested');

			// Delegate to CoreMemoryManager
			const results = await this.coreMemoryManager.searchSimilar(query, options);

			// Emit topic access event if stream configured
			if (this.eventStream && Array.isArray(results) && results.length > 0) {
				try {
					const topicIds = new Set<string>();
					const memoryIds: string[] = [];

					for (const item of results) {
						memoryIds.push(item.id);
						const meta = item.metadata as any;
						const topics = Array.isArray(meta?.topics) ? meta.topics : [];
						for (const t of topics) {
							if (typeof t === 'string') {
								topicIds.add(t);
							}
						}
					}

					if (topicIds.size > 0) {
						await this.eventStream.publish({
							id: `evt_topic_access_${operationId}`,
							type: 'topic.accessed' as any,
							timestamp: Date.now(),
							payload: {
								topicIds: Array.from(topicIds) as any,
								query,
								resultCount: results.length,
								memoryIds,
								mode: options.tier ? 'read' : 'read',
								source: 'memory-service'
							},
							source: 'memory-service',
							priority: 1 as any,
							retryable: false
						});
					}
				} catch (eventError) {
					this.log('warn', 'Failed to emit topic access event', eventError);
				}
			}

			const duration = Date.now() - start;
			this.recordMetric('timing', 'search_memory', duration);

			return results;
		} catch (error) {
			const duration = Date.now() - start;
			this.recordMetric('timing', 'search_memory', duration, { status: 'error' });
			this.log('error', 'Failed to search memory', error);
			return [];
		}
	}

	/**
	 * List memory entries
	 */
	public async list(filter?: Record<string, any>): Promise<TieredKnowledgeItem[]> {
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
		} catch (error) {
			const duration = Date.now() - start;
			this.recordMetric('timing', 'list_memory', duration, { status: 'error' });
			this.log('error', 'Failed to list memory', error);
			return [];
		}
	}

	/**
	 * Validate memory entry data
	 */
	public async validate(data: Partial<any>): Promise<{ valid: boolean; errors: string[] }> {
		const errors: string[] = [];

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
	public async health(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, any> }> {
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
	public async cleanup(): Promise<void> {
		this.log('log', 'Cleaning up MemoryService');
		
		if (this.enableCaching) {
			this.cache.clear();
		}

		await super.cleanup();
	}

	// Private helper methods

	private validateConfig(): void {
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

	private setupCacheCleanup(): void {
		// Set up periodic cache cleanup
		setInterval(() => {
			this.cleanupExpiredCache();
		}, this.cacheTTL / 2);
	}

	private cleanupExpiredCache(): void {
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

	private updateCache(key: string, data: any): void {
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

	private getFromCache(key: string): any | null {
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

	private generateOperationId(): string {
		return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateMemoryId(): string {
		return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private matchesFilter(entry: any, filter?: Record<string, any>): boolean {
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
