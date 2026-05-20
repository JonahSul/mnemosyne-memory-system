/**
 * Topic Tracker - Monitors topics and notifies clients of mutations
 * 
 * Tracks topic changes and provides real-time notifications to subscribed clients.
 */

import type { EventBus, MnemosyneEvent, EventPriority } from './types.js';
import { EventType } from './types.js';
import type {
	TopicCreatedPayload,
	TopicUpdatedPayload,
	TopicMemoriesPayload,
	TopicTrendingPayload
} from './event-schemas.js';

interface TopicState {
	topicId: string;
	name: string;
	keywords: string[];
	memoryIds: Set<string>;
	createdAt: number;
	lastUpdated: number;
	activityWindow: Array<{ type: string; timestamp: number }>;
	subscribers: Set<string>;
}

interface TopicSubscription {
	clientId: string;
	topicIds: string[];
	includeRelated?: boolean;
	callback: (event: MnemosyneEvent) => void;
}

export class TopicTracker {
	private topics: Map<string, TopicState> = new Map();
	private subscriptions: Map<string, TopicSubscription> = new Map();
	private eventBus: EventBus;
	private trendingThreshold: number;
	private activityWindowSize: number;

	constructor(
		eventBus: EventBus,
		options: {
			trendingThreshold?: number;
			activityWindowSize?: number;
		} = {}
	) {
		this.eventBus = eventBus;
		this.trendingThreshold = options.trendingThreshold ?? 10;
		this.activityWindowSize = options.activityWindowSize ?? 100;

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// Listen for topic events
		this.eventBus.subscribe<TopicCreatedPayload>(
			EventType.TOPIC_CREATED,
			(event) => this.handleTopicCreated(event)
		);

		this.eventBus.subscribe<TopicUpdatedPayload>(
			EventType.TOPIC_UPDATED,
			(event) => this.handleTopicUpdated(event)
		);

		this.eventBus.subscribe<TopicMemoriesPayload>(
			EventType.TOPIC_MEMORIES_ADDED,
			(event) => this.handleMemoriesAdded(event)
		);

		this.eventBus.subscribe<TopicMemoriesPayload>(
			EventType.TOPIC_MEMORIES_REMOVED,
			(event) => this.handleMemoriesRemoved(event)
		);

		// Listen for memory events that affect topics
		this.eventBus.subscribe(
			EventType.MEMORY_STORED,
			(event) => this.updateTopicActivity(event)
		);

		this.eventBus.subscribe(
			EventType.QUERY_COMPLETED,
			(event) => this.updateTopicActivity(event)
		);
	}

	/**
	 * Subscribe to topic updates
	 */
	subscribeToTopics(
		clientId: string,
		topicIds: string[],
		options: {
			includeRelated?: boolean;
			callback: (event: MnemosyneEvent) => void;
		}
	): void {
		this.subscriptions.set(clientId, {
			clientId,
			topicIds,
			includeRelated: options.includeRelated,
			callback: options.callback
		});

		// Mark client as subscriber for these topics
		for (const topicId of topicIds) {
			const topic = this.topics.get(topicId);
			if (topic) {
				topic.subscribers.add(clientId);
			}
		}
	}

	/**
	 * Unsubscribe from topics
	 */
	unsubscribeFromTopics(clientId: string): void {
		const subscription = this.subscriptions.get(clientId);
		if (!subscription) return;

		// Remove from topic subscribers
		for (const topicId of subscription.topicIds) {
			const topic = this.topics.get(topicId);
			if (topic) {
				topic.subscribers.delete(clientId);
			}
		}

		this.subscriptions.delete(clientId);
	}

	/**
	 * Get current state of a topic
	 */
	getTopicState(topicId: string): TopicState | undefined {
		return this.topics.get(topicId);
	}

	/**
	 * Get all active topics
	 */
	getAllTopics(): TopicState[] {
		return Array.from(this.topics.values());
	}

	/**
	 * Get trending topics
	 */
	getTrendingTopics(limit: number = 10): TopicState[] {
		const now = Date.now();
		const windowMs = 3600000; // 1 hour

		return Array.from(this.topics.values())
			.map(topic => {
				const recentActivity = topic.activityWindow.filter(
					a => now - a.timestamp < windowMs
				);
				return { topic, activityScore: recentActivity.length };
			})
			.filter(({ activityScore }) => activityScore >= this.trendingThreshold)
			.sort((a, b) => b.activityScore - a.activityScore)
			.slice(0, limit)
			.map(({ topic }) => topic);
	}

	private handleTopicCreated(event: MnemosyneEvent<TopicCreatedPayload>): void {
		const { topicId, name, keywords, initialMemoryCount } = event.payload;

		const topic: TopicState = {
			topicId,
			name,
			keywords,
			memoryIds: new Set(),
			createdAt: event.timestamp,
			lastUpdated: event.timestamp,
			activityWindow: [],
			subscribers: new Set()
		};

		this.topics.set(topicId, topic);
		this.notifySubscribers(topicId, event);
	}

	private handleTopicUpdated(event: MnemosyneEvent<TopicUpdatedPayload>): void {
		const { topicId, changes } = event.payload;
		const topic = this.topics.get(topicId);

		if (!topic) return;

		// Apply changes
		if (changes.name) {
			topic.name = changes.name.to;
		}
		if (changes.keywords) {
			topic.keywords = topic.keywords
				.filter(k => !changes.keywords!.removed.includes(k))
				.concat(changes.keywords.added);
		}

		topic.lastUpdated = event.timestamp;
		this.recordActivity(topicId, 'updated', event.timestamp);
		this.notifySubscribers(topicId, event);
	}

	private handleMemoriesAdded(event: MnemosyneEvent<TopicMemoriesPayload>): void {
		const { topicId, memoryIds } = event.payload;
		const topic = this.topics.get(topicId);

		if (!topic) return;

		for (const memoryId of memoryIds) {
			topic.memoryIds.add(memoryId);
		}

		topic.lastUpdated = event.timestamp;
		this.recordActivity(topicId, 'memories_added', event.timestamp);
		this.notifySubscribers(topicId, event);
		this.checkTrendingStatus(topicId);
	}

	private handleMemoriesRemoved(event: MnemosyneEvent<TopicMemoriesPayload>): void {
		const { topicId, memoryIds } = event.payload;
		const topic = this.topics.get(topicId);

		if (!topic) return;

		for (const memoryId of memoryIds) {
			topic.memoryIds.delete(memoryId);
		}

		topic.lastUpdated = event.timestamp;
		this.recordActivity(topicId, 'memories_removed', event.timestamp);
		this.notifySubscribers(topicId, event);
	}

	private updateTopicActivity(event: MnemosyneEvent): void {
		// Extract topic information from event metadata
		const topicIds = event.metadata?.topicIds as string[] | undefined;
		if (!topicIds) return;

		for (const topicId of topicIds) {
			this.recordActivity(topicId, event.type, event.timestamp);
			this.checkTrendingStatus(topicId);
		}
	}

	private recordActivity(topicId: string, type: string, timestamp: number): void {
		const topic = this.topics.get(topicId);
		if (!topic) return;

		topic.activityWindow.push({ type, timestamp });

		// Keep window size manageable
		if (topic.activityWindow.length > this.activityWindowSize) {
			topic.activityWindow.shift();
		}
	}

	private checkTrendingStatus(topicId: string): void {
		const topic = this.topics.get(topicId);
		if (!topic) return;

		const now = Date.now();
		const windowMs = 3600000; // 1 hour

		const recentActivity = topic.activityWindow.filter(
			a => now - a.timestamp < windowMs
		);

		if (recentActivity.length >= this.trendingThreshold) {
			const memoriesAdded = recentActivity.filter(
				a => a.type === 'memories_added'
			).length;
			const queries = recentActivity.filter(
				a => a.type === EventType.QUERY_COMPLETED
			).length;

			const trendingPayload: TopicTrendingPayload = {
				topicId,
				name: topic.name,
				recentActivity: {
					memoriesAdded,
					queries,
					timeWindow: windowMs
				},
				trendScore: recentActivity.length / this.trendingThreshold
			};

			const trendingEvent: MnemosyneEvent<TopicTrendingPayload> = {
				id: `evt_trending_${topicId}_${now}`,
				type: EventType.TOPIC_TRENDING,
				timestamp: now,
				payload: trendingPayload,
				source: 'topic-tracker',
				priority: 5 as EventPriority,
				retryable: true
			};

			this.eventBus.publish(trendingEvent);
			this.notifySubscribers(topicId, trendingEvent);
		}
	}

	private notifySubscribers(topicId: string, event: MnemosyneEvent): void {
		const topic = this.topics.get(topicId);
		if (!topic) return;

		for (const clientId of topic.subscribers) {
			const subscription = this.subscriptions.get(clientId);
			if (subscription && subscription.topicIds.includes(topicId)) {
				try {
					subscription.callback(event);
				} catch (error) {
					console.error(`Error notifying subscriber ${clientId}:`, error);
				}
			}
		}
	}

	/**
	 * Get subscribers for a topic
	 */
	getTopicSubscribers(topicId: string): string[] {
		const topic = this.topics.get(topicId);
		return topic ? Array.from(topic.subscribers) : [];
	}

	/**
	 * Get subscription info for a client
	 */
	getClientSubscription(clientId: string): TopicSubscription | undefined {
		return this.subscriptions.get(clientId);
	}
}
