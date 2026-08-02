/**
 * Memory bounded context — the core domain.
 *
 * The Memory aggregate root is the consistency boundary for all memory
 * operations. It enforces:
 * - Fail-closed metadata validation (topics, documentType, task, agent)
 * - Shard key enforcement (tenant isolation)
 * - Tier placement rules
 * - Causality linking (precedent memories, assertion IDs)
 *
 * @see FOUNDATION.md for the behavioral protocol this aggregate enforces.
 */

export type { MemoryEntry, MemoryMetadata, MemoryWriteSpec, MemoryId, MemoryTier } from './types.js';
export { MemoryAggregate, MemoryValidationError } from './memory-aggregate.js';
