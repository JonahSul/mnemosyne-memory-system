/**
 * Memory domain types — the value objects and specs for the Memory aggregate.
 *
 * These are extracted from the legacy `modules/memory-interfaces.ts` and
 * `modules/enhanced-memory-interfaces.ts` during the DDD restructuring
 * (Phase 2). They live here, in the domain, not in a modules/ layer.
 */

import type {
    AgentId,
    AssertionId,
    Confidence,
    DocumentType,
    Embedding,
    Importance,
    MemoryId,
    MemoryTier,
    ShardKey,
    TaskId,
    TopicId,
    VerificationMethod,
} from '../../shared/index.js';

// Re-export identifiers that the memory domain owns (for convenience)
export type { MemoryId, MemoryTier };

// ── Temporal metadata ─────────────────────────────────────────────────────

export interface TemporalMetadata {
    readonly timestamp: number; // microseconds
    readonly lamportClock: number;
    readonly vectorClock?: Record<string, number>;
    readonly hybridLogicalClock?: { physical: number; logical: number };
}

// ── Semantic expansion (Foundation v1.7.0+) ──────────────────────────────

export type SemanticAxis = 'nearSemanticNeighbor' | 'relatedConcept' | 'analogicalPattern';

export interface SemanticExpansion {
    readonly axis: SemanticAxis;
    readonly terms: string[];
    readonly precisionRange: { min: number; max: number };
}

// ── Causality ─────────────────────────────────────────────────────────────

export interface CausalContext {
    readonly assertionId?: AssertionId;
    readonly precedentMemoryIds?: MemoryId[];
    readonly causedBy?: MemoryId[];
    readonly dependencies?: MemoryId[];
}

// ── Agent attribution ─────────────────────────────────────────────────────

export interface AgentAttribution {
    readonly uuad: AgentId;
    readonly agentRole?: string;
    readonly federationNodeId?: string;
}

// ── Task context ──────────────────────────────────────────────────────────

export interface TaskContext {
    readonly taskId: TaskId;
    readonly taskLabel?: string;
    readonly mode: 'read' | 'write' | 'read-write';
    readonly topics: TopicId[];
}

// ── Memory entry (the aggregate's entity) ────────────────────────────────

export interface MemoryMetadata {
    readonly topics: TopicId[];
    readonly documentType: DocumentType;
    readonly task: TaskContext;
    readonly agent: AgentAttribution;
    readonly confidence: Confidence;
    readonly importance: Importance;
    readonly evidence?: string[];
    readonly source?: string;
    readonly verificationMethod: VerificationMethod;
    readonly temporal: TemporalMetadata;
    readonly semanticExpansion?: SemanticExpansion[];
    readonly causality?: CausalContext;
    readonly tags?: string[];
}

export interface MemoryEntry {
    readonly id: MemoryId;
    readonly content: string;
    readonly embedding?: Embedding;
    readonly shardKey: ShardKey;
    readonly tier: MemoryTier;
    readonly metadata: MemoryMetadata;
    readonly createdAt: string;
    readonly updatedAt: string;
}

// ── Write specification (input to the aggregate) ─────────────────────────

export interface MemoryWriteSpec {
    readonly content: string;
    readonly shardKey: ShardKey;
    readonly metadata: Omit<MemoryMetadata, 'temporal'>;
    readonly tier?: MemoryTier; // override auto-placement
    readonly embedding?: Embedding; // pre-computed, or provider will be called
}
