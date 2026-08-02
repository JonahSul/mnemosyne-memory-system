/**
 * Store memory use case — replaces the `memory_store` tool handler.
 *
 * Orchestrates: validate metadata → compute embedding (if needed) →
 * place tier → store via Memory aggregate → publish event.
 *
 * Phase 3 will extract the real logic from `simplified-registry.ts:227`.
 */

import type { MemoryAggregate } from '../domain/memory/memory-aggregate.js';
import type { EmbeddingProvider } from '../shared/index.js';
import type { MemoryWriteSpec } from '../domain/memory/types.js';

export interface StoreMemoryInput {
    readonly content: string;
    readonly shardKey: MemoryWriteSpec['shardKey'];
    readonly metadata: MemoryWriteSpec['metadata'];
    readonly tier?: MemoryWriteSpec['tier'];
}

export interface StoreMemoryOutput {
    readonly id: string;
    readonly tier: string;
    readonly stored: true;
}

export class StoreMemoryUseCase {
    private readonly memory: MemoryAggregate;
    private readonly embeddingProvider: EmbeddingProvider;

    constructor(config: { memory: MemoryAggregate; embeddingProvider: EmbeddingProvider }) {
        this.memory = config.memory;
        this.embeddingProvider = config.embeddingProvider;
    }

    async execute(input: StoreMemoryInput): Promise<StoreMemoryOutput> {
        const embedding = await this.embeddingProvider.embed(input.content);
        return this.memory.store({
            content: input.content,
            shardKey: input.shardKey,
            metadata: input.metadata,
            tier: input.tier,
            embedding,
        });
    }
}
