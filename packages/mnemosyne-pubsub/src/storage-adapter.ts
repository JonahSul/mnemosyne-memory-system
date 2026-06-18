/**
 * Storage Adapter Wrapper with Event Publishing
 * 
 * Wraps existing VectorStore adapters to automatically publish events
 * for all storage operations.
 */

import type { 
	VectorStoreAdapter,
	VectorStoreRecord,
	VectorStoreSearchOptions,
	VectorStoreSearchResult
} from '@mnemosyne/core/interfaces/storage';

import { EventType } from './types.js';
import type {
	EventBus,
	MnemosyneEvent,
	EventPriority,
	StorageCreatedEvent,
	StorageUpdatedEvent,
	StorageDeletedEvent,
	StorageSearchedEvent,
	MemoryMetadataBase
} from './types.js';
import { assertValidMemoryMetadata } from './memory-validation.js';

export interface EventPublishingAdapterOptions {
	source?: string;
	publishReads?: boolean;    // Publish read operations (search, getById)
	publishWrites?: boolean;   // Publish write operations (store, delete)
	priority?: EventPriority;
	causalContext?: any;       // Optional causality tracking
}

/**
 * Wraps a VectorStoreAdapter to publish events for all operations
 */
export class EventPublishingVectorStore implements VectorStoreAdapter {
	private adapter: VectorStoreAdapter;
	private eventBus: EventBus;
	private options: Required<EventPublishingAdapterOptions>;
	private recordCache: Map<string, VectorStoreRecord> = new Map();

	constructor(
		adapter: VectorStoreAdapter,
		eventBus: EventBus,
		options: EventPublishingAdapterOptions = {}
	) {
		this.adapter = adapter;
		this.eventBus = eventBus;
		this.options = {
			source: options.source ?? 'vector-store',
			publishReads: options.publishReads ?? false,
			publishWrites: options.publishWrites ?? true,
			priority: options.priority ?? 1 as EventPriority,
			causalContext: options.causalContext
		};
	}

	async storeKnowledge(record: VectorStoreRecord): Promise<VectorStoreRecord> {
		assertValidMemoryMetadata(record.metadata as MemoryMetadataBase | undefined);

		const result = await this.adapter.storeKnowledge(record);

		if (this.options.publishWrites) {
			const isUpdate = record.id && this.recordCache.has(record.id);
			
			if (isUpdate) {
				const previous = this.recordCache.get(record.id!)!;
				await this.publishEvent<StorageUpdatedEvent>({
					id: this.generateEventId(),
					type: EventType.STORAGE_UPDATED,
					timestamp: Date.now(),
					payload: {
						previous,
						current: result
					},
					source: this.options.source,
					priority: this.options.priority,
					retryable: true,
					causalContext: this.options.causalContext
				});
			} else {
				await this.publishEvent<StorageCreatedEvent>({
					id: this.generateEventId(),
					type: EventType.STORAGE_CREATED,
					timestamp: Date.now(),
					payload: result,
					source: this.options.source,
					priority: this.options.priority,
					retryable: true,
					causalContext: this.options.causalContext
				});
			}

			// Update cache
			if (result.id) {
				this.recordCache.set(result.id, result);
			}
		}

		return result;
	}

	async searchSimilar(
		query: string,
		options?: VectorStoreSearchOptions
	): Promise<VectorStoreSearchResult[]> {
		const results = await this.adapter.searchSimilar(query, options);

		if (this.options.publishReads) {
			await this.publishEvent<StorageSearchedEvent>({
				id: this.generateEventId(),
				type: EventType.STORAGE_SEARCHED,
				timestamp: Date.now(),
				payload: {
					query,
					results,
					resultCount: results.length
				},
				source: this.options.source,
				priority: this.options.priority,
				retryable: false,
				causalContext: this.options.causalContext
			});
		}

		return results;
	}

	async getById(id: string): Promise<VectorStoreSearchResult[]> {
		if (!this.adapter.getById) {
			return [];
		}

		const results = await this.adapter.getById(id);

		// Note: getById is a read operation - events not published to reduce noise

		return results;
	}

	/**
	 * Delete operation (if adapter supports it)
	 */
	async delete(id: string): Promise<boolean> {
		// Check if adapter has delete method
		const adapter = this.adapter as any;
		if (typeof adapter.deleteById === 'function') {
			const deleted = await adapter.deleteById(id);

			if (deleted && this.options.publishWrites) {
				const record = this.recordCache.get(id);
				
				await this.publishEvent<StorageDeletedEvent>({
					id: this.generateEventId(),
					type: EventType.STORAGE_DELETED,
					timestamp: Date.now(),
					payload: {
						id,
						record
					},
					source: this.options.source,
					priority: this.options.priority,
					retryable: true,
					causalContext: this.options.causalContext
				});

				this.recordCache.delete(id);
			}

			return deleted;
		}

		return false;
	}

	private async publishEvent<T extends MnemosyneEvent>(
		event: T
	): Promise<void> {
		try {
			await this.eventBus.publish(event);
		} catch (error) {
			// Log error but don't fail the operation
			console.error('Failed to publish event:', error);
		}
	}

	private generateEventId(): string {
		return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
