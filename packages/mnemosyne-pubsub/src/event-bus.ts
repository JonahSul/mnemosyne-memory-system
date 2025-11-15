/**
 * In-Memory Event Bus Implementation
 * 
 * Fast, local event bus for single-process deployments.
 * Supports event history, filtering, and replay.
 */

import type {
	EventBus,
	EventType,
	EventHandler,
	EventFilter,
	MnemosyneEvent,
	Subscription,
	SubscriptionOptions,
	EventPriority
} from './types.js';

interface SubscriptionRecord {
	id: string;
	handler: EventHandler;
	filter?: EventFilter;
	priority: number;
	once: boolean;
	paused: boolean;
}

export class InMemoryEventBus implements EventBus {
	private subscriptions: Map<string, SubscriptionRecord> = new Map();
	private eventHistory: MnemosyneEvent[] = [];
	private maxHistorySize: number;
	private subscriptionCounter = 0;

	constructor(options: { maxHistorySize?: number } = {}) {
		this.maxHistorySize = options.maxHistorySize ?? 1000;
	}

	async publish<T = unknown>(event: MnemosyneEvent<T>): Promise<void> {
		// Add to history
		this.eventHistory.push(event);
		if (this.eventHistory.length > this.maxHistorySize) {
			this.eventHistory.shift();
		}

		// Get matching subscriptions
		const matchingSubscriptions = Array.from(this.subscriptions.values())
			.filter(sub => !sub.paused && this.eventMatchesFilter(event, sub.filter))
			.sort((a, b) => b.priority - a.priority);

		// Execute handlers
		const promises: Promise<void>[] = [];
		const toRemove: string[] = [];

		for (const sub of matchingSubscriptions) {
			try {
				const result = sub.handler(event as MnemosyneEvent<unknown>);
				if (result instanceof Promise) {
					promises.push(result);
				}

				if (sub.once) {
					toRemove.push(sub.id);
				}
			} catch (error) {
				console.error(`Error in event handler for subscription ${sub.id}:`, error);
			}
		}

		// Wait for async handlers
		if (promises.length > 0) {
			await Promise.allSettled(promises);
		}

		// Remove one-time subscriptions
		for (const id of toRemove) {
			this.subscriptions.delete(id);
		}
	}

	subscribe<T = unknown>(
		eventType: EventType | EventType[],
		handler: EventHandler<T>,
		options: SubscriptionOptions = {}
	): Subscription {
		const id = `sub_${++this.subscriptionCounter}_${Date.now()}`;
		
		const filter: EventFilter = {
			type: eventType,
			...options.filter
		};

		const record: SubscriptionRecord = {
			id,
			handler: handler as EventHandler,
			filter,
			priority: options.priority ?? 0,
			once: options.once ?? false,
			paused: false
		};

		this.subscriptions.set(id, record);

		// Replay past events if requested
		if (options.replay) {
			const limit = options.replayLimit ?? 100;
			const pastEvents = this.getHistory(filter, limit);
			
			// Replay asynchronously to not block subscription
			setImmediate(async () => {
				for (const event of pastEvents) {
					try {
						await (handler as EventHandler<unknown>)(event);
					} catch (error) {
						console.error(`Error replaying event in subscription ${id}:`, error);
					}
				}
			});
		}

		return {
			id,
			unsubscribe: () => this.unsubscribe(id),
			pause: () => {
				const sub = this.subscriptions.get(id);
				if (sub) sub.paused = true;
			},
			resume: () => {
				const sub = this.subscriptions.get(id);
				if (sub) sub.paused = false;
			},
			isPaused: () => this.subscriptions.get(id)?.paused ?? true
		};
	}

	unsubscribe(subscriptionId: string): void {
		this.subscriptions.delete(subscriptionId);
	}

	getHistory(filter?: EventFilter, limit?: number): MnemosyneEvent[] {
		let events = this.eventHistory;

		if (filter) {
			events = events.filter(event => this.eventMatchesFilter(event, filter));
		}

		if (limit && limit > 0) {
			events = events.slice(-limit);
		}

		return [...events];
	}

	clearHistory(): void {
		this.eventHistory = [];
	}

	getSubscriptionCount(): number {
		return this.subscriptions.size;
	}

	private eventMatchesFilter(event: MnemosyneEvent, filter?: EventFilter): boolean {
		if (!filter) return true;

		// Check type
		if (filter.type) {
			const types = Array.isArray(filter.type) ? filter.type : [filter.type];
			if (!types.includes(event.type)) {
				return false;
			}
		}

		// Check source
		if (filter.source) {
			const sources = Array.isArray(filter.source) ? filter.source : [filter.source];
			if (!sources.includes(event.source)) {
				return false;
			}
		}

		// Check priority
		if (filter.priority) {
			const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
			if (!priorities.includes(event.priority)) {
				return false;
			}
		}

		// Check metadata
		if (filter.metadata) {
			for (const [key, value] of Object.entries(filter.metadata)) {
				if (event.metadata?.[key] !== value) {
					return false;
				}
			}
		}

		// Check custom predicate
		if (filter.predicate && !filter.predicate(event)) {
			return false;
		}

		return true;
	}
}
