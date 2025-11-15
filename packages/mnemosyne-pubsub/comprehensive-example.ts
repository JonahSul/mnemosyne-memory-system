/**
 * Comprehensive Event System Example
 * 
 * Demonstrates all event types and real-time client synchronization.
 */

import {
	InMemoryEventBus,
	SSEManager,
	TopicTracker,
	EventFactory,
	EventType
} from '../src/index.js';

import type {
	MemoryStoredPayload,
	AgentTaskCompletedPayload,
	TopicTrendingPayload,
	QueryCompletedPayload,
	MemoryConsolidatedPayload,
	EntityExtractedPayload
} from '../src/event-schemas.js';

console.log('\n=== Comprehensive Event System Demo ===\n');

// 1. Setup Event Bus
const eventBus = new InMemoryEventBus({ maxHistorySize: 500 });
console.log('✅ Event bus initialized\n');

// 2. Setup Topic Tracker
const topicTracker = new TopicTracker(eventBus, {
	trendingThreshold: 5,
	activityWindowSize: 50
});
console.log('✅ Topic tracker initialized\n');

// 3. Setup Client State Manager
class ClientStateManager {
	private memories = new Map();
	private topics = new Map();
	private agents = new Map();
	private entities = new Map();
	private queries: any[] = [];
	
	constructor(eventBus: any) {
		this.setupSubscriptions(eventBus);
	}

	private setupSubscriptions(eventBus: any) {
		// Memory operations
		eventBus.subscribe<MemoryStoredPayload>(
			EventType.MEMORY_STORED,
			(event: any) => {
				const { memoryId, content, importance } = event.payload;
				this.memories.set(memoryId, { id: memoryId, content, importance, timestamp: event.timestamp });
				console.log(`  📝 Memory stored: ${memoryId} (importance: ${importance})`);
			}
		);

		eventBus.subscribe(EventType.MEMORY_FORGOTTEN, (event: any) => {
			this.memories.delete(event.payload.memoryId);
			console.log(`  🗑️  Memory forgotten: ${event.payload.memoryId} (reason: ${event.payload.reason})`);
		});

		eventBus.subscribe<MemoryConsolidatedPayload>(
			EventType.MEMORY_CONSOLIDATED,
			(event: any) => {
				const { sourceMemories, targetMemory, method } = event.payload;
				console.log(`  🔗 Memories consolidated: ${sourceMemories.length} → ${targetMemory} (${method})`);
			}
		);

		eventBus.subscribe(EventType.MEMORY_IMPORTANCE_UPDATED, (event: any) => {
			const memory = this.memories.get(event.payload.memoryId);
			if (memory) {
				memory.importance = event.payload.newImportance;
				console.log(`  ⬆️  Importance updated: ${event.payload.memoryId} (${event.payload.previousImportance} → ${event.payload.newImportance})`);
			}
		});

		// Query operations
		eventBus.subscribe<QueryCompletedPayload>(
			EventType.QUERY_COMPLETED,
			(event: any) => {
				this.queries.push(event.payload);
				console.log(`  🔍 Query completed: ${event.payload.resultCount} results in ${event.payload.duration}ms`);
			}
		);

		eventBus.subscribe(EventType.QUERY_REWRITTEN, (event: any) => {
			console.log(`  ✏️  Query rewritten: "${event.payload.originalQuery}" → "${event.payload.rewrittenQuery}"`);
		});

		// Agent activities
		eventBus.subscribe(EventType.AGENT_STARTED, (event: any) => {
			const { agentId, agentType } = event.payload;
			this.agents.set(agentId, { id: agentId, type: agentType, status: 'running' });
			console.log(`  🤖 Agent started: ${agentId} (${agentType})`);
		});

		eventBus.subscribe<AgentTaskCompletedPayload>(
			EventType.AGENT_TASK_COMPLETED,
			(event: any) => {
				const { agentId, taskType, duration, itemsProcessed } = event.payload;
				console.log(`  ✅ Agent task completed: ${agentId} - ${taskType} (${itemsProcessed} items in ${duration}ms)`);
			}
		);

		eventBus.subscribe(EventType.AGENT_CONSOLIDATION_COMPLETED, (event: any) => {
			const { memoriesConsolidated, duration, averageSimilarity } = event.payload;
			console.log(`  🔄 Background consolidation: ${memoriesConsolidated} memories in ${duration}ms (avg similarity: ${averageSimilarity.toFixed(2)})`);
		});

		eventBus.subscribe(EventType.AGENT_FORGETTING_CYCLE, (event: any) => {
			const { memoriesForgotten, memoriesEvaluated } = event.payload;
			console.log(`  🧹 Forgetting cycle: ${memoriesForgotten}/${memoriesEvaluated} memories forgotten`);
		});

		// Topic tracking
		eventBus.subscribe(EventType.TOPIC_CREATED, (event: any) => {
			const { topicId, name, initialMemoryCount } = event.payload;
			this.topics.set(topicId, { id: topicId, name, memoryCount: initialMemoryCount });
			console.log(`  📂 Topic created: ${name} (${initialMemoryCount} memories)`);
		});

		eventBus.subscribe(EventType.TOPIC_UPDATED, (event: any) => {
			console.log(`  📝 Topic updated: ${event.payload.topicId}`);
		});

		eventBus.subscribe<TopicTrendingPayload>(
			EventType.TOPIC_TRENDING,
			(event: any) => {
				const { name, trendScore } = event.payload;
				console.log(`  🔥 Trending topic: ${name} (score: ${trendScore.toFixed(2)})`);
			}
		);

		// Entity tracking
		eventBus.subscribe<EntityExtractedPayload>(
			EventType.ENTITY_EXTRACTED,
			(event: any) => {
				const { entityId, text, type, confidence } = event.payload;
				this.entities.set(entityId, { id: entityId, text, type, confidence });
				console.log(`  🏷️  Entity extracted: ${text} (${type}, confidence: ${confidence.toFixed(2)})`);
			}
		);

		eventBus.subscribe(EventType.ENTITY_MERGED, (event: any) => {
			const { sourceEntityIds, canonicalName } = event.payload;
			console.log(`  🔗 Entities merged: ${sourceEntityIds.length} → ${canonicalName}`);
		});

		// System events
		eventBus.subscribe(EventType.SYSTEM_ERROR, (event: any) => {
			console.log(`  ❌ System error: ${event.payload.error} (component: ${event.payload.component})`);
		});

		eventBus.subscribe(EventType.SYSTEM_WARNING, (event: any) => {
			console.log(`  ⚠️  Warning: ${event.payload.message}`);
		});

		// Performance monitoring
		eventBus.subscribe(EventType.PERFORMANCE_SLOW_QUERY, (event: any) => {
			const { duration, threshold } = event.payload;
			console.log(`  🐌 Slow query detected: ${duration}ms (threshold: ${threshold}ms)`);
		});

		eventBus.subscribe(EventType.PERFORMANCE_MEMORY_PRESSURE, (event: any) => {
			const { currentUsage, threshold, trend } = event.payload;
			console.log(`  💾 Memory pressure: ${currentUsage}% (threshold: ${threshold}%, ${trend})`);
		});
	}

	getState() {
		return {
			memories: this.memories.size,
			topics: this.topics.size,
			agents: this.agents.size,
			entities: this.entities.size,
			queries: this.queries.length
		};
	}
}

const clientState = new ClientStateManager(eventBus);
console.log('✅ Client state manager initialized\n');

// 4. Simulate Memory Operations
console.log('=== Simulating Memory Operations ===\n');

await eventBus.publish(EventFactory.createMemoryEvent('stored', {
	memoryId: 'mem-001',
	content: 'User discussed implementing event-driven architecture',
	context: 'technical-discussion',
	importance: 8,
	timestamp: Date.now(),
	tags: ['architecture', 'events', 'pubsub'],
	entities: ['event-bus', 'SSE']
} as MemoryStoredPayload));

await eventBus.publish(EventFactory.createMemoryEvent('stored', {
	memoryId: 'mem-002',
	content: 'Need to add real-time synchronization to client',
	context: 'feature-request',
	importance: 7,
	timestamp: Date.now(),
	tags: ['real-time', 'sync', 'client'],
	entities: ['client-state', 'SSE']
} as MemoryStoredPayload));

await eventBus.publish(EventFactory.createMemoryEvent('stored', {
	memoryId: 'mem-003',
	content: 'SSE provides low-latency event streaming',
	context: 'technical-knowledge',
	importance: 6,
	timestamp: Date.now(),
	tags: ['SSE', 'streaming', 'performance']
} as MemoryStoredPayload));

// 5. Simulate Query Operations
console.log('\n=== Simulating Query Operations ===\n');

await eventBus.publish({
	id: EventFactory['generateEventId']?.() || 'evt-query-1',
	type: EventType.QUERY_INITIATED,
	timestamp: Date.now(),
	source: 'client',
	priority: 5,
	retryable: true,
	payload: {
		queryId: 'query-001',
		query: 'event-driven architecture',
		userId: 'user-123',
		sessionId: 'session-456'
	}
});

await new Promise(resolve => setTimeout(resolve, 50));

await eventBus.publish({
	id: 'evt-query-2',
	type: EventType.QUERY_COMPLETED,
	timestamp: Date.now(),
	source: 'search-engine',
	priority: 5,
	retryable: false,
	payload: {
		queryId: 'query-001',
		resultCount: 3,
		duration: 45,
		cached: false,
		resultsPreview: ['mem-001', 'mem-002', 'mem-003']
	}
});

// 6. Simulate Agent Background Tasks
console.log('\n=== Simulating Agent Background Tasks ===\n');

await eventBus.publish({
	id: 'evt-agent-1',
	type: EventType.AGENT_STARTED,
	timestamp: Date.now(),
	source: 'agent-manager',
	priority: 3,
	retryable: false,
	payload: {
		agentId: 'agent-consolidation-1',
		agentType: 'consolidation',
		scheduledInterval: 300000
	}
});

await new Promise(resolve => setTimeout(resolve, 100));

await eventBus.publish({
	id: 'evt-agent-2',
	type: EventType.AGENT_CONSOLIDATION_COMPLETED,
	timestamp: Date.now(),
	source: 'agent-consolidation-1',
	priority: 5,
	retryable: false,
	payload: {
		agentId: 'agent-consolidation-1',
		candidatesEvaluated: 10,
		memoriesConsolidated: 2,
		duration: 85,
		averageSimilarity: 0.87
	}
});

await eventBus.publish(EventFactory.createMemoryEvent('consolidated', {
	sourceMemories: ['mem-002', 'mem-003'],
	targetMemory: 'mem-004',
	method: 'similarity',
	similarity: 0.87
} as MemoryConsolidatedPayload));

// 7. Simulate Forgetting Cycle
console.log('\n=== Simulating Forgetting Cycle ===\n');

await eventBus.publish({
	id: 'evt-forgetting-1',
	type: EventType.AGENT_FORGETTING_CYCLE,
	timestamp: Date.now(),
	source: 'agent-forgetting-1',
	priority: 3,
	retryable: false,
	payload: {
		agentId: 'agent-forgetting-1',
		memoriesEvaluated: 100,
		memoriesForgotten: 5,
		duration: 120,
		criteria: {
			minImportance: 3,
			maxAge: 2592000000,
			decayThreshold: 0.1
		}
	}
});

await eventBus.publish(EventFactory.createMemoryEvent('forgotten', {
	memoryId: 'mem-002',
	reason: 'decay',
	age: 2592000000,
	finalImportance: 2
}));

// 8. Simulate Topic Creation and Trending
console.log('\n=== Simulating Topic Tracking ===\n');

await eventBus.publish({
	id: 'evt-topic-1',
	type: EventType.TOPIC_CREATED,
	timestamp: Date.now(),
	source: 'topic-extractor',
	priority: 5,
	retryable: true,
	payload: {
		topicId: 'topic-architecture',
		name: 'Event-Driven Architecture',
		keywords: ['events', 'pubsub', 'architecture', 'real-time'],
		initialMemoryCount: 3,
		confidence: 0.92
	}
});

// Simulate topic activity to trigger trending
for (let i = 0; i < 6; i++) {
	await eventBus.publish({
		id: `evt-topic-activity-${i}`,
		type: EventType.TOPIC_MEMORIES_ADDED,
		timestamp: Date.now(),
		source: 'topic-tracker',
		priority: 3,
		retryable: false,
		payload: {
			topicId: 'topic-architecture',
			memoryIds: [`mem-new-${i}`],
			action: 'added'
		},
		metadata: { topicIds: ['topic-architecture'] }
	});
	await new Promise(resolve => setTimeout(resolve, 10));
}

// 9. Simulate Entity Extraction
console.log('\n=== Simulating Entity Extraction ===\n');

await eventBus.publish({
	id: 'evt-entity-1',
	type: EventType.ENTITY_EXTRACTED,
	timestamp: Date.now(),
	source: 'entity-extractor',
	priority: 5,
	retryable: true,
	payload: {
		entityId: 'entity-001',
		text: 'Server-Sent Events',
		type: 'concept',
		memoryId: 'mem-003',
		confidence: 0.95,
		context: 'discussed as streaming technology'
	}
});

await eventBus.publish({
	id: 'evt-entity-2',
	type: EventType.ENTITY_EXTRACTED,
	timestamp: Date.now(),
	source: 'entity-extractor',
	priority: 5,
	retryable: true,
	payload: {
		entityId: 'entity-002',
		text: 'Event Bus',
		type: 'concept',
		memoryId: 'mem-001',
		confidence: 0.98,
		context: 'core component of event-driven architecture'
	}
});

// 10. Simulate Performance Events
console.log('\n=== Simulating Performance Monitoring ===\n');

await eventBus.publish({
	id: 'evt-perf-1',
	type: EventType.PERFORMANCE_SLOW_QUERY,
	timestamp: Date.now(),
	source: 'performance-monitor',
	priority: 7,
	retryable: false,
	payload: {
		queryId: 'query-slow-1',
		query: 'complex vector search',
		duration: 450,
		threshold: 200,
		bottleneck: 'vector-index'
	}
});

await eventBus.publish({
	id: 'evt-perf-2',
	type: EventType.PERFORMANCE_MEMORY_PRESSURE,
	timestamp: Date.now(),
	source: 'system-monitor',
	priority: 8,
	retryable: false,
	payload: {
		pressureType: 'memory',
		currentUsage: 85,
		threshold: 80,
		available: 1024,
		trend: 'increasing'
	}
});

// 11. Show Final State
console.log('\n=== Final State ===\n');
const state = clientState.getState();
console.log('Client synchronized state:');
console.log(`  - Memories: ${state.memories}`);
console.log(`  - Topics: ${state.topics}`);
console.log(`  - Agents: ${state.agents}`);
console.log(`  - Entities: ${state.entities}`);
console.log(`  - Queries: ${state.queries}`);

// 12. Show Event History
console.log('\n=== Event History ===\n');
const history = eventBus.getHistory();
console.log(`Total events in history: ${history.length}`);

const eventCounts = history.reduce((acc, event) => {
	const category = event.type.split('.')[0];
	acc[category] = (acc[category] || 0) + 1;
	return acc;
}, {} as Record<string, number>);

console.log('\nEvents by category:');
Object.entries(eventCounts)
	.sort((a, b) => b[1] - a[1])
	.forEach(([category, count]) => {
		console.log(`  - ${category}: ${count}`);
	});

// 13. Show Trending Topics
console.log('\n=== Trending Topics ===\n');
const trending = topicTracker.getTrendingTopics(5);
console.log(`${trending.length} trending topic(s):`);
for (const topic of trending) {
	console.log(`  - ${topic.name} (${topic.memoryIds.size} memories)`);
}

console.log('\n=== Demo Complete ===\n');
