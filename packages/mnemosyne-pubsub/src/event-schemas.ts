/**
 * Type-safe event payload schemas
 * 
 * Defines the structure of payloads for each event type.
 */

import type { EventType, MemoryMetadataBase, TaskContext, AgentAttribution, TopicId } from './types.js';

// Storage event payloads
export interface StorageCreatedPayload {
	records: Array<{
		id: string;
		metadata?: Record<string, unknown>;
	}>;
	namespace?: string;
	batchId?: string;
}

export interface StorageUpdatedPayload {
	records: Array<{
		id: string;
		previousMetadata?: Record<string, unknown>;
		newMetadata?: Record<string, unknown>;
		changes: string[];
	}>;
	namespace?: string;
	batchId?: string;
}

export interface StorageDeletedPayload {
	ids: string[];
	namespace?: string;
	reason?: string;
	batchId?: string;
}

export interface StorageSearchedPayload {
	query: {
		vector?: number[];
		text?: string;
		filters?: Record<string, unknown>;
	};
	results: {
		count: number;
		ids: string[];
		topScore?: number;
	};
	duration: number;
	cached?: boolean;
}

// Memory event payloads
export interface MemoryStoredPayload {
	memoryId: string;
	content: string;
	metadata: MemoryMetadataBase;
	timestamp: number;
	tags?: string[];
	entities?: string[];
}

export interface MemoryRecalledPayload {
	memoryId: string;
	query: string;
	score: number;
	accessCount: number;
	lastAccessed: number;
	agent: AgentAttribution;
	task: TaskContext;
	topics: TopicId[];
}

export interface MemoryForgottenPayload {
	memoryId: string;
	reason: 'decay' | 'explicit' | 'capacity' | 'policy';
	finalImportance?: number;
	age: number;
}

export interface MemoryConsolidatedPayload {
	sourceMemories: string[];
	targetMemory: string;
	method: 'similarity' | 'temporal' | 'semantic' | 'manual';
	similarity?: number;
}

export interface MemoryDecayAppliedPayload {
	memoryIds: string[];
	decayFactor: number;
	timestamp: number;
	averageAge: number;
}

export interface MemoryImportanceUpdatedPayload {
	memoryId: string;
	previousImportance: number;
	newImportance: number;
	reason: 'recall' | 'decay' | 'manual' | 'relationship';
}

export interface MemoryRelationshipPayload {
	sourceId: string;
	targetId: string;
	relationshipType: 'similar' | 'causal' | 'temporal' | 'reference' | 'contradicts';
	strength: number;
	bidirectional?: boolean;
}

export interface MemoryClusterPayload {
	clusterId: string;
	memoryIds: string[];
	centroid?: number[];
	cohesion: number;
	label?: string;
}

// Query event payloads
export interface QueryInitiatedPayload {
	queryId: string;
	query: string;
	filters?: Record<string, unknown>;
	userId?: string;
	sessionId?: string;
}

export interface QueryCompletedPayload {
	queryId: string;
	resultCount: number;
	duration: number;
	cached: boolean;
	resultsPreview?: string[];
}

export interface QueryRewrittenPayload {
	queryId: string;
	originalQuery: string;
	rewrittenQuery: string;
	technique: 'expansion' | 'simplification' | 'clarification' | 'correction';
	confidence: number;
}

// Agent event payloads
export interface AgentStartedPayload {
	agentId: string;
	agentType: 'consolidation' | 'forgetting' | 'indexing' | 'monitoring' | 'sync';
	config?: Record<string, unknown>;
	scheduledInterval?: number;
}

export interface AgentTaskPayload {
	taskId: string;
	agentId: string;
	taskType: string;
	priority: number;
	estimatedDuration?: number;
	queuePosition?: number;
}

export interface AgentTaskCompletedPayload {
	taskId: string;
	agentId: string;
	taskType: string;
	duration: number;
	itemsProcessed?: number;
	errors?: number;
	result?: Record<string, unknown>;
}

export interface AgentConsolidationPayload {
	agentId: string;
	candidatesEvaluated: number;
	memoriesConsolidated: number;
	duration: number;
	averageSimilarity: number;
}

export interface AgentForgettingCyclePayload {
	agentId: string;
	memoriesEvaluated: number;
	memoriesForgotten: number;
	duration: number;
	criteria: {
		minImportance?: number;
		maxAge?: number;
		decayThreshold?: number;
	};
}

// Context event payloads
export interface ContextCreatedPayload {
	contextId: string;
	name: string;
	parentContextId?: string;
	metadata?: Record<string, unknown>;
}

export interface ContextActivatedPayload {
	contextId: string;
	sessionId?: string;
	userId?: string;
	previousContextId?: string;
}

export interface ContextMergedPayload {
	sourceContextIds: string[];
	targetContextId: string;
	strategy: 'union' | 'intersection' | 'weighted';
}

// Topic event payloads
export interface TopicCreatedPayload {
	topicId: string;
	name: string;
	keywords: string[];
	initialMemoryCount: number;
	confidence: number;
}

export interface TopicUpdatedPayload {
	topicId: string;
	changes: {
		name?: { from: string; to: string };
		keywords?: { added: string[]; removed: string[] };
		memoryCount?: { from: number; to: number };
	};
}

export interface TopicMergedPayload {
	sourceTopicIds: string[];
	targetTopicId: string;
	reason: string;
	similarity: number;
}

export interface TopicTrendingPayload {
	topicId: string;
	name: string;
	recentActivity: {
		memoriesAdded: number;
		queries: number;
		timeWindow: number;
	};
	trendScore: number;
}

export interface TopicMemoriesPayload {
	topicId: string;
	memoryIds: string[];
	action: 'added' | 'removed';
	reason?: string;
}

export interface TopicAccessedPayload {
	topicIds: TopicId[];
	query: string;
	resultCount: number;
	memoryIds: string[];
	agent?: AgentAttribution;
	task?: TaskContext;
	mode?: 'read' | 'write' | 'read-write';
	source?: string;
	metadata?: Record<string, unknown>;
}

// Entity event payloads
export interface EntityExtractedPayload {
	entityId: string;
	text: string;
	type: 'person' | 'place' | 'organization' | 'concept' | 'event' | 'other';
	memoryId: string;
	confidence: number;
	context?: string;
}

export interface EntityMergedPayload {
	sourceEntityIds: string[];
	targetEntityId: string;
	canonicalName: string;
	aliases: string[];
}

export interface EntityLinkedPayload {
	entityId: string;
	targetEntityId: string;
	linkType: 'same_as' | 'part_of' | 'related_to' | 'opposed_to';
	confidence: number;
}

// Causality event payloads
export interface CausalityChainPayload {
	chainId: string;
	events: Array<{
		eventId: string;
		timestamp: number;
		eventType: string;
	}>;
	length: number;
}

export interface CausalityViolationPayload {
	violationType: 'out_of_order' | 'missing_causation' | 'circular_dependency';
	affectedEvents: string[];
	detected: number;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

// System event payloads
export interface SystemErrorPayload {
	error: string;
	code?: string;
	component: string;
	stack?: string;
	recoverable: boolean;
}

export interface SystemConfigChangedPayload {
	changes: Array<{
		key: string;
		previousValue: unknown;
		newValue: unknown;
	}>;
	source: 'manual' | 'automatic' | 'external';
}

export interface SystemMaintenancePayload {
	maintenanceType: 'backup' | 'compaction' | 'upgrade' | 'cleanup' | 'optimization';
	estimatedDuration?: number;
	affectedComponents?: string[];
}

// Federation event payloads
export interface FederationSyncPayload {
	syncId: string;
	peerId: string;
	direction: 'push' | 'pull' | 'bidirectional';
	itemsToSync?: number;
	itemsSynced?: number;
	errors?: number;
}

export interface FederationConflictPayload {
	conflictId: string;
	peerId: string;
	itemId: string;
	conflictType: 'concurrent_modification' | 'deletion' | 'version_mismatch';
	localVersion: unknown;
	remoteVersion: unknown;
	resolution?: 'local_wins' | 'remote_wins' | 'merged' | 'manual';
}

export interface FederationPeerPayload {
	peerId: string;
	peerName?: string;
	address: string;
	protocol: string;
	capabilities?: string[];
}

// Embedding event payloads
export interface EmbeddingGeneratedPayload {
	itemId: string;
	model: string;
	dimensions: number;
	duration: number;
	cached?: boolean;
}

export interface EmbeddingBatchPayload {
	batchId: string;
	itemCount: number;
	model: string;
	duration?: number;
	itemsProcessed?: number;
	errors?: number;
}

// Index event payloads
export interface IndexBuiltPayload {
	indexId: string;
	indexType: 'flat' | 'ivf' | 'hnsw' | 'pq';
	vectorCount: number;
	dimensions: number;
	duration: number;
}

export interface IndexOptimizedPayload {
	indexId: string;
	previousSize: number;
	newSize: number;
	compressionRatio: number;
	duration: number;
}

// Access event payloads
export interface AccessGrantedPayload {
	userId: string;
	resourceId: string;
	resourceType: string;
	permission: string;
	sessionId?: string;
}

export interface AccessDeniedPayload {
	userId: string;
	resourceId: string;
	resourceType: string;
	requestedPermission: string;
	reason: string;
}

// Performance event payloads
export interface PerformanceSlowQueryPayload {
	queryId: string;
	query: string;
	duration: number;
	threshold: number;
	bottleneck?: string;
}

export interface PerformanceLatencyPayload {
	operation: string;
	latency: number;
	threshold: number;
	p50?: number;
	p95?: number;
	p99?: number;
}

export interface PerformancePressurePayload {
	pressureType: 'memory' | 'disk' | 'cpu' | 'network';
	currentUsage: number;
	threshold: number;
	available: number;
	trend: 'increasing' | 'stable' | 'decreasing';
}

// Type map for event payloads
export type EventPayloadMap = {
	[EventType.STORAGE_CREATED]: StorageCreatedPayload;
	[EventType.STORAGE_UPDATED]: StorageUpdatedPayload;
	[EventType.STORAGE_DELETED]: StorageDeletedPayload;
	[EventType.STORAGE_SEARCHED]: StorageSearchedPayload;
	[EventType.MEMORY_STORED]: MemoryStoredPayload;
	[EventType.MEMORY_RECALLED]: MemoryRecalledPayload;
	[EventType.MEMORY_FORGOTTEN]: MemoryForgottenPayload;
	[EventType.MEMORY_CONSOLIDATED]: MemoryConsolidatedPayload;
	[EventType.MEMORY_DECAY_APPLIED]: MemoryDecayAppliedPayload;
	[EventType.MEMORY_IMPORTANCE_UPDATED]: MemoryImportanceUpdatedPayload;
	[EventType.MEMORY_RELATIONSHIP_CREATED]: MemoryRelationshipPayload;
	[EventType.MEMORY_RELATIONSHIP_REMOVED]: MemoryRelationshipPayload;
	[EventType.MEMORY_CLUSTER_FORMED]: MemoryClusterPayload;
	[EventType.MEMORY_CLUSTER_SPLIT]: MemoryClusterPayload;
	[EventType.QUERY_INITIATED]: QueryInitiatedPayload;
	[EventType.QUERY_COMPLETED]: QueryCompletedPayload;
	[EventType.QUERY_REWRITTEN]: QueryRewrittenPayload;
	[EventType.AGENT_STARTED]: AgentStartedPayload;
	[EventType.AGENT_TASK_QUEUED]: AgentTaskPayload;
	[EventType.AGENT_TASK_STARTED]: AgentTaskPayload;
	[EventType.AGENT_TASK_COMPLETED]: AgentTaskCompletedPayload;
	[EventType.AGENT_CONSOLIDATION_COMPLETED]: AgentConsolidationPayload;
	[EventType.AGENT_FORGETTING_CYCLE]: AgentForgettingCyclePayload;
	[EventType.CONTEXT_CREATED]: ContextCreatedPayload;
	[EventType.CONTEXT_ACTIVATED]: ContextActivatedPayload;
	[EventType.CONTEXT_MERGED]: ContextMergedPayload;
	[EventType.TOPIC_CREATED]: TopicCreatedPayload;
	[EventType.TOPIC_UPDATED]: TopicUpdatedPayload;
	[EventType.TOPIC_MERGED]: TopicMergedPayload;
	[EventType.TOPIC_TRENDING]: TopicTrendingPayload;
	[EventType.TOPIC_MEMORIES_ADDED]: TopicMemoriesPayload;
	[EventType.TOPIC_MEMORIES_REMOVED]: TopicMemoriesPayload;
	[EventType.TOPIC_ACCESSED]: TopicAccessedPayload;
	[EventType.ENTITY_EXTRACTED]: EntityExtractedPayload;
	[EventType.ENTITY_MERGED]: EntityMergedPayload;
	[EventType.ENTITY_LINKED]: EntityLinkedPayload;
	[EventType.CAUSALITY_CHAIN_DETECTED]: CausalityChainPayload;
	[EventType.CAUSALITY_VIOLATION]: CausalityViolationPayload;
	[EventType.SYSTEM_ERROR]: SystemErrorPayload;
	[EventType.SYSTEM_CONFIG_CHANGED]: SystemConfigChangedPayload;
	[EventType.SYSTEM_MAINTENANCE_STARTED]: SystemMaintenancePayload;
	[EventType.SYSTEM_MAINTENANCE_COMPLETED]: SystemMaintenancePayload;
	[EventType.FEDERATION_SYNC_STARTED]: FederationSyncPayload;
	[EventType.FEDERATION_SYNC_COMPLETED]: FederationSyncPayload;
	[EventType.FEDERATION_CONFLICT_DETECTED]: FederationConflictPayload;
	[EventType.FEDERATION_CONFLICT_RESOLVED]: FederationConflictPayload;
	[EventType.FEDERATION_PEER_CONNECTED]: FederationPeerPayload;
	[EventType.FEDERATION_PEER_DISCONNECTED]: FederationPeerPayload;
	[EventType.EMBEDDING_GENERATED]: EmbeddingGeneratedPayload;
	[EventType.EMBEDDING_BATCH_STARTED]: EmbeddingBatchPayload;
	[EventType.EMBEDDING_BATCH_COMPLETED]: EmbeddingBatchPayload;
	[EventType.INDEX_BUILT]: IndexBuiltPayload;
	[EventType.INDEX_OPTIMIZED]: IndexOptimizedPayload;
	[EventType.ACCESS_GRANTED]: AccessGrantedPayload;
	[EventType.ACCESS_DENIED]: AccessDeniedPayload;
	[EventType.PERFORMANCE_SLOW_QUERY]: PerformanceSlowQueryPayload;
	[EventType.PERFORMANCE_HIGH_LATENCY]: PerformanceLatencyPayload;
	[EventType.PERFORMANCE_MEMORY_PRESSURE]: PerformancePressurePayload;
};
