/**
 * Mnemosyne shared kernel — types and interfaces shared across all bounded
 * contexts. This is the only module that infrastructure packages may import
 * directly from the core package.
 *
 * Everything here is a pure type or interface. No runtime logic, no I/O.
 */

// ── Identifiers ───────────────────────────────────────────────────────────

/**
 * Unique identifier for a stored memory.
 * Format: `mem_<ulid>` (26-char ULID prefixed with `mem_`).
 */
export type MemoryId = string;

/**
 * Unique identifier for an agent (Universal Unique Agent Descriptor).
 */
export type AgentId = string;

/**
 * Unique identifier for a task within an agent session.
 */
export type TaskId = string;

/**
 * Stable identifier binding a family of causally-linked memories
 * (hypothesis → decision → result).
 */
export type AssertionId = string;

// ── Memory tiers ──────────────────────────────────────────────────────────

export type MemoryTier = 'axiom' | 'long' | 'intermediate' | 'short';

// ── Shard key ─────────────────────────────────────────────────────────────

/**
 * Shard key for tenant-isolated, tier-partitioned, topic-filtered storage.
 *
 * - `tenant` — SaaS customer isolation (required, never empty).
 * - `tier` — memory tier partition.
 * - `topic` — optional topic partition for finer-grained sharding.
 *
 * Shard keys are enforced by the Memory aggregate. Writes without a valid
 * ShardKey are rejected (fail-closed, per FOUNDATION.md).
 */
export interface ShardKey {
    readonly tenant: string;
    readonly tier: MemoryTier;
    readonly topic?: TopicId;
}

// ── Topics ────────────────────────────────────────────────────────────────

/**
 * Topic identifier from the 25-term universal taxonomy.
 * @see @mnemosyne/pubsub for the full TopicId vocabulary.
 */
export type TopicId = string;

// ── Document types ────────────────────────────────────────────────────────

export type DocumentType =
    | 'raw_memory'
    | 'note'
    | 'plan'
    | 'analysis'
    | 'log'
    | 'hypothesis'
    | 'decision'
    | 'task_plan'
    | 'task_execution'
    | 'result'
    | 'fact';

// ── Verification ──────────────────────────────────────────────────────────

export type VerificationMethod = 'manual' | 'automated' | 'cross_reference' | 'inference';

// ── Confidence & importance ───────────────────────────────────────────────

/**
 * Confidence score in [0, 1]. Derived from evidence quality and verification
 * strength. See FOUNDATION.md §3 (Metadata Contract for Writes).
 */
export type Confidence = number;

/**
 * Importance score in [0, 1]. Drives tier placement and retention priority.
 */
export type Importance = number;

// ── Vector embedding ───────────────────────────────────────────────────────

/**
 * Vector embedding (768-dimensional, BGE-base-en-v1.5).
 */
export type Embedding = number[];

export interface VectorEntry {
    readonly id: string;
    readonly embedding: Embedding;
    readonly metadata: Record<string, unknown>;
}

export interface SearchResult {
    readonly id: string;
    readonly score: number;
    readonly metadata: Record<string, unknown>;
}

// ── Repository interfaces (ports) ──────────────────────────────────────────

/**
 * Vector store adapter — the repository port for vector similarity search.
 * Infrastructure packages provide real implementations (Vectorize, sqlite-vec).
 * Test fixtures provide shims; published packages must not.
 */
export interface VectorStoreAdapter {
    readonly dimension: number;

    /**
     * Store vectors with metadata. The shard key is encoded into metadata for
     * tenant/tier/topic filtering at query time.
     */
    store(entries: VectorEntry[], shardKey: ShardKey): Promise<void>;

    /**
     * Query by embedding vector with optional shard-key filter.
     */
    query(embedding: Embedding, options: QueryOptions, shardKey?: Partial<ShardKey>): Promise<SearchResult[]>;

    /**
     * Delete by ID.
     */
    delete(ids: string[], shardKey?: Partial<ShardKey>): Promise<void>;

    /**
     * Count vectors matching an optional shard key.
     */
    count(shardKey?: Partial<ShardKey>): Promise<number>;
}

export interface QueryOptions {
    readonly topK: number;
    readonly threshold?: number;
    readonly filter?: Record<string, unknown>;
}

/**
 * Key-value store adapter — the repository port for persistent memory storage.
 * Infrastructure packages provide real implementations (Cloudflare KV, SQLite).
 */
export interface KeyValueStoreAdapter {
    get<T>(key: string): Promise<T | null>;
    put<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
    list(prefix: string, options?: { limit?: number; cursor?: string }): Promise<{ keys: string[]; cursor?: string }>;
}

// ── Event publishing (port) ───────────────────────────────────────────────

/**
 * Event publisher port. The domain publishes domain events through this
 * interface; infrastructure wires it to a real event bus (@mnemosyne/pubsub).
 */
export interface EventPublisher {
    publish<T>(eventType: string, payload: T, metadata?: Record<string, unknown>): Promise<void>;
}

// ── Embedding provider (port) ──────────────────────────────────────────────

/**
 * Embedding provider port. Infrastructure provides real implementations
 * (Workers AI, Ollama, sentence-transformers). No mock implementations ship.
 */
export interface EmbeddingProvider {
    readonly dimension: number;
    embed(text: string): Promise<Embedding>;
    embedBatch(texts: string[]): Promise<Embedding[]>;
}
