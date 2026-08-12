/**
 * Mnemosyne PubSub - Event Bus and Real-time Update System
 * 
 * Core event types and interfaces for the pub/sub system.
 * Integrates with Mnemosyne's causality tracking and storage operations.
 */

import type {
	VectorStoreRecord,
	VectorStoreSearchResult
} from './storage-types.js';

/**
 * Canonical Mnemosyne topic identifiers (25-term vocabulary)
 */
export type TopicId =
	| 'structure'
	| 'flow'
	| 'state'
	| 'transformation'
	| 'pattern'
	| 'abstraction'
	| 'identity'
	| 'relationship'
	| 'boundary'
	| 'composition'
	| 'time'
	| 'space'
	| 'scale'
	| 'constraint'
	| 'uncertainty'
	| 'control'
	| 'concurrency'
	| 'persistence'
	| 'communication'
	| 'semantics'
	| 'performance'
	| 'security'
	| 'observation'
	| 'intent'
	| 'agent';

export type DocumentType =
	| 'raw_memory'
	| 'note'
	| 'todo_list'
	| 'request_for_assistance'
	| 'analysis'
	| 'summary'
	| 'observation'
	| 'plan'
	| 'log'
	| 'config'
	| 'semaphore';

export interface AgentAttribution {
	uuad: string;
	agentRole?: string;
	federationNodeId?: string;
}

export interface TaskContext {
	taskId: string;
	taskLabel?: string;
	mode: 'read' | 'write' | 'read-write';
	topics: TopicId[];
}

export interface MemoryMetadataBase {
	topics: TopicId[];
	documentType: DocumentType;
	task: TaskContext;
	agent: AgentAttribution;
	importance?: number;
	context?: string;
}

export const MIN_TOPICS_REQUIRED = 3;

// Import causality types if available
type CausalContext = {
	lamportClock: { logicalTime: number; nodeId: string };
	vectorClock: { clock: Record<string, number>; nodeId: string };
	hybridClock: { physicalTime: number; logicalTime: number; nodeId: string };
	dependencies: string[];
	causedBy: string[];
	causalDepth: number;
	branchingFactor: number;
};

/**
 * Event types in the Mnemosyne system
 */
export enum EventType {
	// Storage events - Low-level CRUD operations
	STORAGE_CREATED = 'storage.created',
	STORAGE_UPDATED = 'storage.updated',
	STORAGE_DELETED = 'storage.deleted',
	STORAGE_SEARCHED = 'storage.searched',
	STORAGE_BATCH_OPERATION = 'storage.batch_operation',
	STORAGE_COMPACTION = 'storage.compaction',
	STORAGE_MIGRATION = 'storage.migration',

	// Memory events - High-level memory operations
	MEMORY_STORED = 'memory.stored',
	MEMORY_RECALLED = 'memory.recalled',
	MEMORY_FORGOTTEN = 'memory.forgotten',
	MEMORY_CONSOLIDATED = 'memory.consolidated',
	MEMORY_RERANKED = 'memory.reranked',
	MEMORY_EMBEDDED = 'memory.embedded',
	MEMORY_INDEXED = 'memory.indexed',
	MEMORY_DECAY_APPLIED = 'memory.decay_applied',
	MEMORY_IMPORTANCE_UPDATED = 'memory.importance_updated',
	MEMORY_RELATIONSHIP_CREATED = 'memory.relationship_created',
	MEMORY_RELATIONSHIP_REMOVED = 'memory.relationship_removed',
	MEMORY_CLUSTER_FORMED = 'memory.cluster_formed',
	MEMORY_CLUSTER_SPLIT = 'memory.cluster_split',

	// Query events - Search and retrieval operations
	QUERY_INITIATED = 'query.initiated',
	QUERY_COMPLETED = 'query.completed',
	QUERY_FAILED = 'query.failed',
	QUERY_REWRITTEN = 'query.rewritten',
	QUERY_EXPANDED = 'query.expanded',
	QUERY_CACHED = 'query.cached',
	QUERY_CACHE_HIT = 'query.cache_hit',
	QUERY_CACHE_MISS = 'query.cache_miss',

	// Agent events - Background agent activities
	AGENT_STARTED = 'agent.started',
	AGENT_STOPPED = 'agent.stopped',
	AGENT_TASK_QUEUED = 'agent.task_queued',
	AGENT_TASK_STARTED = 'agent.task_started',
	AGENT_TASK_COMPLETED = 'agent.task_completed',
	AGENT_TASK_FAILED = 'agent.task_failed',
	AGENT_CONSOLIDATION_STARTED = 'agent.consolidation_started',
	AGENT_CONSOLIDATION_COMPLETED = 'agent.consolidation_completed',
	AGENT_FORGETTING_CYCLE = 'agent.forgetting_cycle',
	AGENT_REINDEXING = 'agent.reindexing',
	AGENT_HEALTH_CHECK = 'agent.health_check',

	// Context events - Contextual changes and updates
	CONTEXT_CREATED = 'context.created',
	CONTEXT_UPDATED = 'context.updated',
	CONTEXT_DELETED = 'context.deleted',
	CONTEXT_ACTIVATED = 'context.activated',
	CONTEXT_DEACTIVATED = 'context.deactivated',
	CONTEXT_MERGED = 'context.merged',
	CONTEXT_SPLIT = 'context.split',

	// Topic events - Topic tracking and mutations
	TOPIC_CREATED = 'topic.created',
	TOPIC_UPDATED = 'topic.updated',
	TOPIC_MERGED = 'topic.merged',
	TOPIC_TRENDING = 'topic.trending',
	TOPIC_MEMORIES_ADDED = 'topic.memories_added',
	TOPIC_MEMORIES_REMOVED = 'topic.memories_removed',
	TOPIC_RELATED_DISCOVERED = 'topic.related_discovered',
	TOPIC_ACCESSED = 'topic.accessed',

	// Entity events - Named entities and relationships
	ENTITY_EXTRACTED = 'entity.extracted',
	ENTITY_MERGED = 'entity.merged',
	ENTITY_UPDATED = 'entity.updated',
	ENTITY_LINKED = 'entity.linked',
	ENTITY_DISAMBIGUATION = 'entity.disambiguation',

	// Causality events - Event ordering and relationships
	CAUSALITY_CHAIN_DETECTED = 'causality.chain_detected',
	CAUSALITY_VIOLATION = 'causality.violation',
	CAUSALITY_REPAIRED = 'causality.repaired',

	// System events
	SYSTEM_INITIALIZED = 'system.initialized',
	SYSTEM_SHUTDOWN = 'system.shutdown',
	SYSTEM_ERROR = 'system.error',
	SYSTEM_WARNING = 'system.warning',
	SYSTEM_CONFIG_CHANGED = 'system.config_changed',
	SYSTEM_MAINTENANCE_STARTED = 'system.maintenance_started',
	SYSTEM_MAINTENANCE_COMPLETED = 'system.maintenance_completed',

	// Federation events
	FEDERATION_SYNC_STARTED = 'federation.sync_started',
	FEDERATION_SYNC_COMPLETED = 'federation.sync_completed',
	FEDERATION_SYNC_FAILED = 'federation.sync_failed',
	FEDERATION_CONFLICT_DETECTED = 'federation.conflict_detected',
	FEDERATION_CONFLICT_RESOLVED = 'federation.conflict_resolved',
	FEDERATION_PEER_CONNECTED = 'federation.peer_connected',
	FEDERATION_PEER_DISCONNECTED = 'federation.peer_disconnected',
	FEDERATION_DATA_RECEIVED = 'federation.data_received',
	FEDERATION_DATA_SENT = 'federation.data_sent',

	// Embedding events - Vector operations
	EMBEDDING_GENERATED = 'embedding.generated',
	EMBEDDING_BATCH_STARTED = 'embedding.batch_started',
	EMBEDDING_BATCH_COMPLETED = 'embedding.batch_completed',
	EMBEDDING_MODEL_CHANGED = 'embedding.model_changed',

	// Index events - Vector index operations
	INDEX_BUILT = 'index.built',
	INDEX_UPDATED = 'index.updated',
	INDEX_OPTIMIZED = 'index.optimized',
	INDEX_CORRUPTED = 'index.corrupted',
	INDEX_REBUILT = 'index.rebuilt',

	// Access events - Security and permissions
	ACCESS_GRANTED = 'access.granted',
	ACCESS_DENIED = 'access.denied',
	ACCESS_POLICY_CHANGED = 'access.policy_changed',

	// Performance events - Monitoring and metrics
	PERFORMANCE_SLOW_QUERY = 'performance.slow_query',
	PERFORMANCE_HIGH_LATENCY = 'performance.high_latency',
	PERFORMANCE_MEMORY_PRESSURE = 'performance.memory_pressure',
	PERFORMANCE_DISK_PRESSURE = 'performance.disk_pressure'
}

/**
 * Event priority levels
 */
export enum EventPriority {
	LOW = 0,
	NORMAL = 1,
	HIGH = 2,
	CRITICAL = 3
}

/**
 * Base event structure
 */
export interface MnemosyneEvent<T = unknown> {
	// Event identity
	id: string;
	type: EventType;
	timestamp: number;

	// Event payload
	payload: T;

	// Event metadata
	source: string;          // Origin of the event (node ID, service name, etc.)
	correlationId?: string;  // For tracking related events
	causationId?: string;    // ID of the event that caused this event

	// Causality tracking
	causalContext?: CausalContext;

	// Event properties
	priority: EventPriority;
	ttl?: number;            // Time-to-live in milliseconds
	retryable: boolean;      // Can this event be retried if processing fails

	// Additional metadata
	metadata?: Record<string, unknown>;
}

/**
 * Storage operation events
 */
export interface StorageCreatedEvent extends MnemosyneEvent<VectorStoreRecord> {
	type: EventType.STORAGE_CREATED;
}

export interface StorageUpdatedEvent extends MnemosyneEvent<{
	previous: VectorStoreRecord;
	current: VectorStoreRecord;
}> {
	type: EventType.STORAGE_UPDATED;
}

export interface StorageDeletedEvent extends MnemosyneEvent<{
	id: string;
	record?: VectorStoreRecord;
}> {
	type: EventType.STORAGE_DELETED;
}

export interface StorageSearchedEvent extends MnemosyneEvent<{
	query: string;
	results: VectorStoreSearchResult[];
	resultCount: number;
}> {
	type: EventType.STORAGE_SEARCHED;
}

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (event: MnemosyneEvent<T>) => void | Promise<void>;

/**
 * Event filter for subscriptions
 */
export interface EventFilter {
	type?: EventType | EventType[];
	source?: string | string[];
	priority?: EventPriority | EventPriority[];
	metadata?: Record<string, unknown>;
	predicate?: (event: MnemosyneEvent) => boolean;
}

/**
 * Subscription options
 */
export interface SubscriptionOptions {
	filter?: EventFilter;
	priority?: number;
	once?: boolean;           // Unsubscribe after first event
	replay?: boolean;         // Replay past events matching filter
	replayLimit?: number;     // How many past events to replay
}

/**
 * Subscription handle
 */
export interface Subscription {
	id: string;
	unsubscribe(): void;
	pause(): void;
	resume(): void;
	isPaused(): boolean;
}

/**
 * Event bus interface
 */
export interface EventBus {
	/**
	 * Publish an event to the bus
	 */
	publish<T = unknown>(event: MnemosyneEvent<T>): Promise<void>;

	/**
	 * Subscribe to events
	 */
	subscribe<T = unknown>(
		eventType: EventType | EventType[],
		handler: EventHandler<T>,
		options?: SubscriptionOptions
	): Subscription;

	/**
	 * Unsubscribe from events
	 */
	unsubscribe(subscriptionId: string): void;

	/**
	 * Get event history
	 */
	getHistory(filter?: EventFilter, limit?: number): MnemosyneEvent[];

	/**
	 * Clear event history
	 */
	clearHistory(): void;

	/**
	 * Get active subscription count
	 */
	getSubscriptionCount(): number;
}

/**
 * SSE (Server-Sent Events) channel interface
 */
export interface SSEChannel {
	/**
	 * Send event to all connected clients
	 */
	broadcast(event: MnemosyneEvent): Promise<void>;

	/**
	 * Send event to specific client
	 */
	send(clientId: string, event: MnemosyneEvent): Promise<void>;

	/**
	 * Get connected client count
	 */
	getClientCount(): number;

	/**
	 * Close the channel
	 */
	close(): Promise<void>;
}

/**
 * SSE client connection
 */
export interface SSEClient {
	id: string;
	connectedAt: number;
	lastActivity: number;
	filter?: EventFilter;
	metadata?: Record<string, unknown>;
}

/**
 * Pub/Sub adapter interface for different backends
 */
export interface PubSubAdapter {
	/**
	 * Publish event to backend
	 */
	publish(channel: string, event: MnemosyneEvent): Promise<void>;

	/**
	 * Subscribe to events from backend
	 */
	subscribe(channel: string, handler: EventHandler): Promise<void>;

	/**
	 * Unsubscribe from channel
	 */
	unsubscribe(channel: string): Promise<void>;

	/**
	 * Close adapter connection
	 */
	close(): Promise<void>;
}

/**
 * Minimal stream-like publisher for Mnemosyne events
 *
 * This is intentionally small so different transports (in-memory,
 * Cloudflare, Kafka, Firestore, etc.) can be adapted easily.
 */
export interface EventStream {
	publish<T = unknown>(event: MnemosyneEvent<T>): Promise<void>;
}
