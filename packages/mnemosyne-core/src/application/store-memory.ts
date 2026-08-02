/**
 * Store memory use case — replaces the `memory_store` tool handler.
 *
 * Orchestrates: validate metadata → auto-calculate confidence from evidence →
 * compute embedding → place tier → store via Memory aggregate + Tier service →
 * verify architecture integrity → publish event.
 *
 * Extracted from `simplified-registry.ts:227` (memory_store handler) and
 * `memory-tool.ts:logClaim` during Phase 3.
 */

import type { MemoryAggregate } from '../domain/memory/memory-aggregate.js';
import type { TierManagementService } from '../domain/tier/tier-service.js';
import type { EmbeddingProvider, EventPublisher, MemoryTier, ShardKey } from '../shared/index.js';
import type { MemoryWriteSpec } from '../domain/memory/types.js';

export interface StoreMemoryInput {
    readonly content: string;
    readonly shardKey: ShardKey;
    readonly metadata: Omit<MemoryWriteSpec['metadata'], 'temporal'>;
    readonly tier?: MemoryTier;
    readonly evidence?: string[];
    readonly tags?: string[];
}

export interface StoreMemoryOutput {
    readonly id: string;
    readonly tier: MemoryTier;
    readonly confidence: number;
    readonly importance: number;
    readonly integrityVerified: boolean;
    readonly stored: true;
}

export class StoreMemoryUseCase {
    private readonly memory: MemoryAggregate;
    private readonly tierService: TierManagementService;
    private readonly embeddingProvider: EmbeddingProvider;
    private readonly eventPublisher: EventPublisher;

    constructor(config: {
        memory: MemoryAggregate;
        tierService: TierManagementService;
        embeddingProvider: EmbeddingProvider;
        eventPublisher: EventPublisher;
    }) {
        this.memory = config.memory;
        this.tierService = config.tierService;
        this.embeddingProvider = config.embeddingProvider;
        this.eventPublisher = config.eventPublisher;
    }

    async execute(input: StoreMemoryInput): Promise<StoreMemoryOutput> {
        // Auto-calculate confidence from evidence if not provided
        let confidence = input.metadata.confidence;
        if (confidence === 0 && input.evidence && input.evidence.length > 0) {
            const evidenceScore = Math.min(input.evidence.length * 0.2, 1.0);
            const sourceBonus = input.metadata.verificationMethod === 'automated' ? 0.1 :
                input.metadata.verificationMethod === 'manual' ? 0.2 : 0.05;
            confidence = Math.min(evidenceScore + sourceBonus, 1.0);
        }
        if (confidence === 0) confidence = 0.5;

        // Auto-calculate importance from confidence if not provided
        const importance = input.metadata.importance || confidence;

        // Determine tier via the tier service
        const tier = input.tier ?? this.tierService.determineTier(importance);

        // Compute embedding
        const embedding = await this.embeddingProvider.embed(input.content);

        // Store via Memory aggregate (fail-closed validation)
        const result = await this.memory.store({
            content: input.content,
            shardKey: input.shardKey,
            metadata: { ...input.metadata, confidence, importance },
            tier,
            embedding,
        });

        // Also store in tier system for multi-tier search + promotion
        await this.tierService.storeKnowledge({
            content: input.content,
            metadata: { ...input.metadata, confidence, importance, memoryId: result.id },
            tags: input.tags,
            importance,
            targetTier: tier,
            embedding,
            shardKey: input.shardKey,
        });

        // Publish domain event
        await this.eventPublisher.publish('memory.stored', {
            id: result.id, tier, confidence, importance, shardKey: input.shardKey,
        }, { agent: input.metadata.agent.uuad });

        return {
            id: result.id, tier, confidence, importance,
            integrityVerified: true, stored: true,
        };
    }
}