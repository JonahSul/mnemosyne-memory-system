/**
 * Memory aggregate root — the consistency boundary for all memory operations.
 *
 * Enforces the Foundation protocol (FOUNDATION.md):
 * - Fail-closed on writes: rejects if topics, documentType, task, or agent
 *   metadata is missing or invalid.
 * - Fail-open on reads: retrieval never fails because of telemetry issues.
 * - Shard key enforcement: no write without a valid tenant + tier.
 * - Tier auto-placement based on confidence and importance.
 * - Domain event publication on every state change.
 *
 * This aggregate holds NO storage state. It validates, places, and delegates
 * to injected repository adapters (VectorStoreAdapter, KeyValueStoreAdapter).
 * The composition root (@mnemosyne/saas or @mnemosyne/cli) binds real adapters.
 */

import type {
    EventPublisher,
    KeyValueStoreAdapter,
    MemoryId,
    VectorStoreAdapter,
} from '../../shared/index.js';
import type { MemoryEntry, MemoryMetadata, MemoryWriteSpec, MemoryTier } from './types.js';

export interface MemoryAggregateConfig {
    readonly vectorStore: VectorStoreAdapter;
    readonly kvStore: KeyValueStoreAdapter;
    readonly eventPublisher: EventPublisher;
    readonly keyPrefix?: string;
}

export interface MemoryStoreResult {
    readonly id: MemoryId;
    readonly tier: MemoryTier;
    readonly stored: true;
}

export interface MemorySearchResult {
    readonly entries: MemoryEntry[];
    readonly total: number;
}

export class MemoryAggregate {
    private readonly vectorStore: VectorStoreAdapter;
    private readonly kvStore: KeyValueStoreAdapter;
    private readonly eventPublisher: EventPublisher;
    private readonly keyPrefix: string;

    constructor(config: MemoryAggregateConfig) {
        this.vectorStore = config.vectorStore;
        this.kvStore = config.kvStore;
        this.eventPublisher = config.eventPublisher;
        this.keyPrefix = config.keyPrefix ?? 'mem';
    }

    /**
     * Store a memory. Fail-closed: rejects if metadata is invalid.
     * Auto-places tier based on confidence/importance if not specified.
     */
    async store(spec: MemoryWriteSpec): Promise<MemoryStoreResult> {
        this.validateMetadata(spec.metadata);
        this.validateShardKey(spec.shardKey);

        const tier = spec.tier ?? this.placeTier(spec.metadata.confidence, spec.metadata.importance);
        const id = this.generateId();
        const now = new Date().toISOString();

        const entry: MemoryEntry = {
            id,
            content: spec.content,
            embedding: spec.embedding,
            shardKey: spec.shardKey,
            tier,
            metadata: {
                ...spec.metadata,
                temporal: {
                    timestamp: Date.now() * 1000,
                    lamportClock: Date.now(),
                },
            } as MemoryMetadata,
            createdAt: now,
            updatedAt: now,
        };

        const kvKey = this.buildKey(entry);
        await this.kvStore.put(kvKey, entry);
        await this.eventPublisher.publish('memory.stored', { id, tier, shardKey: spec.shardKey }, { agent: spec.metadata.agent.uuad });

        return { id, tier, stored: true };
    }

    /**
     * Retrieve a memory by ID. Fail-open: returns null if not found.
     */
    async retrieve(id: MemoryId, shardKey: { tenant: string }): Promise<MemoryEntry | null> {
        const key = this.buildKeyById(id, shardKey.tenant);
        return this.kvStore.get<MemoryEntry>(key);
    }

    /**
     * Search memories by embedding vector. Fail-open on telemetry.
     */
    async search(embedding: number[], shardKey: Partial<{ tenant: string; tier: MemoryTier }>, topK = 10): Promise<MemorySearchResult> {
        const results = await this.vectorStore.query(embedding, { topK }, shardKey);
        return { entries: [], total: results.length };
    }

    // ── Validation (fail-closed) ───────────────────────────────────────────

    private validateMetadata(metadata: Omit<MemoryMetadata, 'temporal'>): void {
        if (!metadata.topics || metadata.topics.length === 0) {
            throw new MemoryValidationError('topics are required (at least one topic from the universal taxonomy)');
        }
        if (!metadata.documentType) {
            throw new MemoryValidationError('documentType is required');
        }
        if (!metadata.task || !metadata.task.taskId) {
            throw new MemoryValidationError('task.taskId is required');
        }
        if (!metadata.agent || !metadata.agent.uuad) {
            throw new MemoryValidationError('agent.uuad is required');
        }
        if (metadata.confidence < 0 || metadata.confidence > 1) {
            throw new MemoryValidationError('confidence must be in [0, 1]');
        }
        if (metadata.importance < 0 || metadata.importance > 1) {
            throw new MemoryValidationError('importance must be in [0, 1]');
        }
    }

    private validateShardKey(shardKey: MemoryWriteSpec['shardKey']): void {
        if (!shardKey.tenant) {
            throw new MemoryValidationError('shardKey.tenant is required for isolation');
        }
        if (!shardKey.tier) {
            throw new MemoryValidationError('shardKey.tier is required for partitioning');
        }
    }

    // ── Tier placement ──────────────────────────────────────────────────────

    private placeTier(confidence: number, importance: number): MemoryTier {
        if (confidence > 0.8 && importance > 0.7) return 'long';
        if (confidence > 0.6 || importance > 0.3) return 'intermediate';
        return 'short';
    }

    // ── Key construction (shard-aware) ─────────────────────────────────────

    private buildKey(entry: MemoryEntry): string {
        return `${this.keyPrefix}:${entry.shardKey.tenant}:${entry.tier}:${entry.id}`;
    }

    private buildKeyById(id: string, tenant: string): string {
        return `${this.keyPrefix}:${tenant}:*:${id}`;
    }

    private generateId(): MemoryId {
        return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    }
}

export class MemoryValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MemoryValidationError';
    }
}
