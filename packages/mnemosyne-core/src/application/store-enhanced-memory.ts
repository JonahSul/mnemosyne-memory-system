/**
 * Store enhanced memory use case — replaces the `memory_store_enhanced` tool handler.
 *
 * Orchestrates: generate causal context → compute embedding → store with
 * causality tracking and semantic expansion → publish event.
 *
 * Extracted from `memory-tool.ts:storeEnhancedMemory` and
 * `simplified-registry.ts:890` during Phase 3.
 */

import type { MemoryAggregate } from '../domain/memory/memory-aggregate.js';
import type { CausalityService } from '../domain/causality/causality-service.js';
import type { EmbeddingProvider, EventPublisher, ShardKey } from '../shared/index.js';
import type { MemoryWriteSpec } from '../domain/memory/types.js';
import type { EnhancedTemporalMetadata } from '../domain/causality/types.js';

export interface StoreEnhancedMemoryInput {
    readonly content: string;
    readonly shardKey: ShardKey;
    readonly metadata: Omit<MemoryWriteSpec['metadata'], 'temporal'>;
    readonly dependencies?: string[];
    readonly causedBy?: string[];
    readonly tags?: string[];
}

export interface StoreEnhancedMemoryOutput {
    readonly id: string;
    readonly tier: string;
    readonly causalContext: unknown;
    readonly correlationId: string;
    readonly stored: true;
}

export class StoreEnhancedMemoryUseCase {
    private readonly memory: MemoryAggregate;
    private readonly causalityService: CausalityService;
    private readonly embeddingProvider: EmbeddingProvider;
    private readonly eventPublisher: EventPublisher;

    constructor(config: {
        memory: MemoryAggregate;
        causalityService: CausalityService;
        embeddingProvider: EmbeddingProvider;
        eventPublisher: EventPublisher;
    }) {
        this.memory = config.memory;
        this.causalityService = config.causalityService;
        this.embeddingProvider = config.embeddingProvider;
        this.eventPublisher = config.eventPublisher;
    }

    async execute(input: StoreEnhancedMemoryInput): Promise<StoreEnhancedMemoryOutput> {
        // Generate causal context for this memory
        const causalContext = this.causalityService.generateCausalContext(
            input.dependencies ?? [],
            input.causedBy ?? [],
        );

        // Record the event for future dependency lookups
        const correlationId = crypto.randomUUID();

        // Compute embedding
        const embedding = await this.embeddingProvider.embed(input.content);

        // Store via Memory aggregate with causal metadata
        const result = await this.memory.store({
            content: input.content,
            shardKey: input.shardKey,
            metadata: {
                ...input.metadata,
                temporal: {
                    timestamp: Date.now() * 1000,
                    lamportClock: causalContext.lamportClock.logicalTime,
                },
            } as MemoryWriteSpec['metadata'],
            embedding,
        });

        // Record the enhanced temporal metadata for causality analysis
        const enhancedTemporal: EnhancedTemporalMetadata = {
            serverTimestamp: causalContext.hybridClock.physicalTime,
            clockSource: 'server',
            timezone: 'UTC',
            sequenceNumber: causalContext.lamportClock.logicalTime,
            causalContext,
            correlationId,
        };
        this.causalityService.recordEvent(result.id, enhancedTemporal);

        // Publish domain event
        await this.eventPublisher.publish('memory.stored_enhanced', {
            id: result.id, correlationId, dependencies: input.dependencies, causedBy: input.causedBy,
        }, { agent: input.metadata.agent.uuad });

        return {
            id: result.id, tier: result.tier, causalContext, correlationId, stored: true,
        };
    }
}
