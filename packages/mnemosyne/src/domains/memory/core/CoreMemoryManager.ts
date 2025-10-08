/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Core Memory Manager
 * 
 * Domain-specific implementation for core memory operations
 * Integrates with existing multi-tier memory and vector store systems
 */

import { BaseManager, ManagerDependencies, PersistenceLayer } from '../../../core/base/index';

// Import existing memory interfaces and classes
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
	vectorStore?: any; // CloudflareVectorStore or compatible
	multiTierMemory?: any; // Existing MultiTierMemorySystem
}

/**
 * Core memory manager implementing domain-specific memory operations
 */
export class CoreMemoryManager extends BaseManager<TieredKnowledgeItem, string> {
	protected readonly memoryConfig: CoreMemoryConfig;
	private readonly persistenceLayer: PersistenceLayer;
	private readonly vectorStore?: any;
	private readonly multiTierMemory?: any;

	constructor(dependencies: CoreMemoryDependencies) {
		super(dependencies);
		
		this.memoryConfig = dependencies.config;
		this.persistenceLayer = dependencies.persistenceLayer;
		this.vectorStore = dependencies.vectorStore;
		this.multiTierMemory = dependencies.multiTierMemory;
	}

	/**
	 * Initialize the core memory manager
	 */
	public async initialize(): Promise<void> {
		this.log('log', 'Initializing CoreMemoryManager');

		try {
			// Validate configuration
			this.validateConfig();

			// Initialize vector store if provided
			if (this.vectorStore && typeof this.vectorStore.initialize === 'function') {
				await this.vectorStore.initialize();
			}

			// Initialize multi-tier memory if provided
			if (this.multiTierMemory && typeof this.multiTierMemory.initialize === 'function') {
				await this.multiTierMemory.initialize();
			}

			this.initialized = true;
			this.recordMetric('increment', 'initialized');
			this.log('log', 'CoreMemoryManager initialized successfully');
		} catch (error) {
			this.log('error', 'Failed to initialize CoreMemoryManager', error);
			throw error;
		}
	}

	/**
	 * Get a memory item by ID
	 */
	public async get(id: string): Promise<TieredKnowledgeItem | null> {
		this.ensureInitialized();
		this.recordMetric('increment', 'get_requested');

		try {
			return await this.withTiming('get_operation', async (): Promise<TieredKnowledgeItem | null> => {
				// Try vector store first if available
				if (this.vectorStore) {
					const result = await this.vectorStore.get(id);
					if (result) {
						this.recordMetric('increment', 'get_vector_hit');
						return this.normalizeVectorResult(result);
					}
				}

				// Fall back to persistence layer
				const persistedResult = await this.persistenceLayer.get<TieredKnowledgeItem>(id);
				if (persistedResult) {
					this.recordMetric('increment', 'get_persistence_hit');
					return persistedResult.data;
				}

				this.recordMetric('increment', 'get_miss');
				return null;
			});
		} catch (error) {
			this.log('error', 'Failed to get memory item', error);
			this.recordMetric('increment', 'get_error');
			return null;
		}
	}

	/**
	 * Create a new memory item
	 */
	public async create(data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem> {
		this.ensureInitialized();
		this.recordMetric('increment', 'create_requested');

		try {
			return await this.withTiming('create_operation', async (): Promise<TieredKnowledgeItem> => {
				// Validate input data
				const validationResult = await this.validate(data);
				if (!validationResult.valid) {
					throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
				}

				// Generate ID if not provided
				const id = data.id || this.generateMemoryId();
				
				// Create complete memory item
				const memoryItem: TieredKnowledgeItem = {
					id,
					content: data.content || '',
					embedding: data.embedding || [],
					metadata: data.metadata || {},
					tags: data.tags || [],
					timestamp: new Date().toISOString(),
					tier: data.tier || this.memoryConfig.defaultTier,
					accessCount: 0,
					importance: this.calculateImportance(data),
					lastAccessed: new Date().toISOString()
				};

				// Store in vector store if available
				if (this.vectorStore && this.vectorStore.add) {
					try {
						await this.vectorStore.add(memoryItem);
						this.recordMetric('increment', 'create_vector_success');
					} catch (error) {
						this.log('warn', 'Failed to store in vector store', error);
					}
				}

				// Store in persistence layer
				await this.persistenceLayer.put(id, memoryItem);

				// Add to multi-tier memory if available
				if (this.multiTierMemory && this.multiTierMemory.addKnowledge) {
					try {
						await this.multiTierMemory.addKnowledge(memoryItem);
						this.recordMetric('increment', 'create_tier_success');
					} catch (error) {
						this.log('warn', 'Failed to add to multi-tier memory', error);
					}
				}

				this.recordMetric('increment', 'create_success');
				this.log('log', `Created memory item: ${id}`);
				
				return memoryItem;
			});
		} catch (error) {
			this.log('error', 'Failed to create memory item', error);
			this.recordMetric('increment', 'create_error');
			throw error;
		}
	}

	/**
	 * Update an existing memory item
	 */
	public async update(id: string, data: Partial<TieredKnowledgeItem>): Promise<TieredKnowledgeItem> {
		this.ensureInitialized();
		this.recordMetric('increment', 'update_requested');

		try {
			return await this.withTiming('update_operation', async (): Promise<TieredKnowledgeItem> => {
				// Get existing item
				const existing = await this.get(id);
				if (!existing) {
					throw new Error(`Memory item not found: ${id}`);
				}

				// Merge updates
				const updated: TieredKnowledgeItem = {
					...existing,
					...data,
					id, // Preserve ID
					lastAccessed: new Date().toISOString()
				};

				// Recalculate importance if content changed
				if (data.content && data.content !== existing.content) {
					updated.importance = this.calculateImportance(updated);
				}

				// Update in vector store
				if (this.vectorStore && this.vectorStore.update) {
					try {
						await this.vectorStore.update(id, updated);
						this.recordMetric('increment', 'update_vector_success');
					} catch (error) {
						this.log('warn', 'Failed to update in vector store', error);
					}
				}

				// Update in persistence layer
				await this.persistenceLayer.put(id, updated);

				// Update in multi-tier memory
				if (this.multiTierMemory && this.multiTierMemory.updateKnowledge) {
					try {
						await this.multiTierMemory.updateKnowledge(updated);
						this.recordMetric('increment', 'update_tier_success');
					} catch (error) {
						this.log('warn', 'Failed to update in multi-tier memory', error);
					}
				}

				this.recordMetric('increment', 'update_success');
				this.log('log', `Updated memory item: ${id}`);

				return updated;
			});
		} catch (error) {
			this.log('error', 'Failed to update memory item', error);
			this.recordMetric('increment', 'update_error');
			throw error;
		}
	}

	/**
	 * Delete a memory item
	 */
	public async delete(id: string): Promise<boolean> {
		this.ensureInitialized();
		this.recordMetric('increment', 'delete_requested');

		try {
			return await this.withTiming('delete_operation', async (): Promise<boolean> => {
				let success = true;

				// Delete from vector store
				if (this.vectorStore && this.vectorStore.delete) {
					try {
						await this.vectorStore.delete(id);
						this.recordMetric('increment', 'delete_vector_success');
					} catch (error) {
						this.log('warn', 'Failed to delete from vector store', error);
						success = false;
					}
				}

				// Delete from persistence layer
				try {
					const persistenceResult = await this.persistenceLayer.delete(id);
					if (!persistenceResult) {
						success = false;
					}
				} catch (error) {
					this.log('warn', 'Failed to delete from persistence layer', error);
					success = false;
				}

				// Delete from multi-tier memory
				if (this.multiTierMemory && this.multiTierMemory.removeKnowledge) {
					try {
						await this.multiTierMemory.removeKnowledge(id);
						this.recordMetric('increment', 'delete_tier_success');
					} catch (error) {
						this.log('warn', 'Failed to delete from multi-tier memory', error);
					}
				}

				if (success) {
					this.recordMetric('increment', 'delete_success');
					this.log('log', `Deleted memory item: ${id}`);
				} else {
					this.recordMetric('increment', 'delete_partial');
					this.log('warn', `Partial deletion of memory item: ${id}`);
				}

				return success;
			});
		} catch (error) {
			this.log('error', 'Failed to delete memory item', error);
			this.recordMetric('increment', 'delete_error');
			return false;
		}
	}

	/**
	 * List memory items with optional filtering
	 */
	public async list(filter?: Record<string, any>): Promise<TieredKnowledgeItem[]> {
		this.ensureInitialized();
		this.recordMetric('increment', 'list_requested');

		try {
			return await this.withTiming('list_operation', async (): Promise<TieredKnowledgeItem[]> => {
				// Try multi-tier memory first if available
				if (this.multiTierMemory && this.multiTierMemory.getAllKnowledge) {
					try {
						const tierResults = await this.multiTierMemory.getAllKnowledge();
						if (tierResults && Array.isArray(tierResults)) {
							const filtered = this.applyFilter(tierResults, filter);
							this.recordMetric('increment', 'list_tier_success');
							return filtered;
						}
					} catch (error) {
						this.log('warn', 'Failed to list from multi-tier memory', error);
					}
				}

				// Fall back to persistence layer
				const keys = await this.persistenceLayer.list();
				const items: TieredKnowledgeItem[] = [];

				for (const key of keys) {
					try {
						const item = await this.get(key);
						if (item && this.matchesFilter(item, filter)) {
							items.push(item);
						}
					} catch (error) {
						this.log('warn', `Failed to load item ${key}`, error);
					}
				}

				this.recordMetric('increment', 'list_success');
				return items;
			});
		} catch (error) {
			this.log('error', 'Failed to list memory items', error);
			this.recordMetric('increment', 'list_error');
			return [];
		}
	}

	/**
	 * Validate memory item data
	 */
	public async validate(data: Partial<TieredKnowledgeItem>): Promise<{ valid: boolean; errors: string[] }> {
		const errors: string[] = [];

		if (!data.content || typeof data.content !== 'string') {
			errors.push('Content is required and must be a string');
		}

		if (data.embedding && !Array.isArray(data.embedding)) {
			errors.push('Embedding must be an array');
		}

		if (data.embedding && data.embedding.length > 0 && data.embedding.length !== this.memoryConfig.vectorDimensions) {
			errors.push(`Embedding must have ${this.memoryConfig.vectorDimensions} dimensions`);
		}

		if (data.tags && !Array.isArray(data.tags)) {
			errors.push('Tags must be an array');
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
	 * Search memory items using semantic similarity
	 */
	public async searchSimilar(
		query: string,
		options: MemorySearchOptions = {}
	): Promise<MemorySearchResult[]> {
		this.ensureInitialized();
		this.recordMetric('increment', 'search_requested');

		try {
			return await this.withTiming('search_operation', async (): Promise<MemorySearchResult[]> => {
				// Use multi-tier memory for search if available
				if (this.multiTierMemory && this.multiTierMemory.search) {
					try {
						const results = await this.multiTierMemory.search(query, {
							limit: options.limit || 10,
							threshold: options.threshold || 0.2,
							tier: options.tier
						});

						if (results && Array.isArray(results)) {
							this.recordMetric('increment', 'search_tier_success');
							return results.map((item: any, index: number) => ({
								...item,
								rank: index + 1
							}));
						}
					} catch (error) {
						this.log('warn', 'Failed to search multi-tier memory', error);
					}
				}

				// Fall back to basic text search
				const allItems = await this.list();
				const results = allItems
					.filter(item => 
						item.content.toLowerCase().includes(query.toLowerCase()) &&
						(!options.tier || item.tier === options.tier) &&
						(!options.tags || options.tags.some(tag => item.tags.includes(tag)))
					)
					.slice(0, options.limit || 10)
					.map((item, index) => ({
						...item,
						similarity: this.calculateTextSimilarity(query, item.content),
						rank: index + 1
					}));

				this.recordMetric('increment', 'search_fallback_success');
				return results;
			});
		} catch (error) {
			this.log('error', 'Failed to search memory items', error);
			this.recordMetric('increment', 'search_error');
			return [];
		}
	}

	// Private helper methods

	private validateConfig(): void {
		if (!this.persistenceLayer) {
			throw new Error('Persistence layer is required');
		}

		if (this.memoryConfig.vectorDimensions <= 0) {
			throw new Error('Vector dimensions must be positive');
		}

		if (!this.memoryConfig.defaultTier) {
			throw new Error('Default tier must be specified');
		}
	}

	private generateMemoryId(): string {
		return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private calculateImportance(data: Partial<TieredKnowledgeItem>): number {
		// Basic importance calculation - can be enhanced
		let importance = 0.5;

		if (data.tags && data.tags.length > 0) {
			importance += 0.1 * Math.min(data.tags.length, 3);
		}

		if (data.content && data.content.length > 100) {
			importance += 0.1;
		}

		if (data.metadata && Object.keys(data.metadata).length > 0) {
			importance += 0.1;
		}

		return Math.min(importance, 1.0);
	}

	private normalizeVectorResult(result: any): TieredKnowledgeItem {
		return {
			id: result.id || '',
			content: result.content || '',
			embedding: result.embedding || [],
			metadata: result.metadata || {},
			tags: result.tags || [],
			timestamp: result.timestamp || new Date().toISOString(),
			tier: result.tier || this.memoryConfig.defaultTier,
			accessCount: result.accessCount || 0,
			importance: result.importance || 0.5,
			lastAccessed: result.lastAccessed || new Date().toISOString()
		};
	}

	private applyFilter(items: TieredKnowledgeItem[], filter?: Record<string, any>): TieredKnowledgeItem[] {
		if (!filter) {
			return items;
		}

		return items.filter(item => this.matchesFilter(item, filter));
	}

	private matchesFilter(item: TieredKnowledgeItem, filter?: Record<string, any>): boolean {
		if (!filter) {
			return true;
		}

		for (const [key, value] of Object.entries(filter)) {
			if (key === 'tags' && Array.isArray(value)) {
				const hasMatchingTag = value.some(tag => item.tags.includes(tag));
				if (!hasMatchingTag) {
					return false;
				}
			} else if ((item as any)[key] !== value) {
				return false;
			}
		}

		return true;
	}

	private calculateTextSimilarity(query: string, content: string): number {
		// Simple text similarity calculation
		const queryWords = query.toLowerCase().split(/\s+/);
		const contentWords = content.toLowerCase().split(/\s+/);
		
		const querySet = new Set(queryWords);
		const contentSet = new Set(contentWords);
		
		const intersection = new Set([...querySet].filter(word => contentSet.has(word)));
		const union = new Set([...querySet, ...contentSet]);
		
		return union.size > 0 ? intersection.size / union.size : 0;
	}
}
