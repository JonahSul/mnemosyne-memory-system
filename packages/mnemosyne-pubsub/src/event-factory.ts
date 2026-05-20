/**
 * Event creation helpers and utilities
 */

import type {
	MnemosyneEvent,
	EventType,
	EventPriority
} from './types.js';

export class EventFactory {
	private static nodeId: string | null = null;
	private static eventCounter = 0;

	/**
	 * Get or generate node ID
	 */
	private static getNodeId(): string {
		if (!this.nodeId) {
			this.nodeId = crypto.randomUUID();
		}
		return this.nodeId!;
	}

	/**
	 * Create a new event with defaults
	 */
	static createEvent<T = unknown>(
		type: EventType,
		payload: T,
		options: {
			source?: string;
			priority?: EventPriority;
			correlationId?: string;
			causationId?: string;
			metadata?: Record<string, unknown>;
			ttl?: number;
			retryable?: boolean;
		} = {}
	): MnemosyneEvent<T> {
		return {
			id: this.generateEventId(),
			type,
			timestamp: Date.now(),
			payload,
			source: options.source ?? this.getNodeId(),
			correlationId: options.correlationId,
			causationId: options.causationId,
			priority: options.priority ?? 1 as EventPriority,
			ttl: options.ttl,
			retryable: options.retryable ?? true,
			metadata: options.metadata
		};
	}

	/**
	 * Create a storage event
	 */
	static createStorageEvent<T = unknown>(
		eventType: 'created' | 'updated' | 'deleted' | 'searched',
		payload: T,
		options: Parameters<typeof EventFactory.createEvent>[2] = {}
	): MnemosyneEvent<T> {
		return this.createEvent(
			`storage.${eventType}` as EventType,
			payload,
			{
				...options,
				source: options.source ?? 'storage'
			}
		);
	}

	/**
	 * Create a memory event
	 */
	static createMemoryEvent<T = unknown>(
		eventType: 'stored' | 'recalled' | 'forgotten' | 'consolidated',
		payload: T,
		options: Parameters<typeof EventFactory.createEvent>[2] = {}
	): MnemosyneEvent<T> {
		return this.createEvent(
			`memory.${eventType}` as EventType,
			payload,
			{
				...options,
				source: options.source ?? 'memory'
			}
		);
	}

	/**
	 * Generate unique event ID
	 */
	private static generateEventId(): string {
		return `evt_${this.getNodeId()}_${Date.now()}_${++this.eventCounter}`;
	}
}
