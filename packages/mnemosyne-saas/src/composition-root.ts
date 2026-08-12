/**
 * Composition root — binds Cloudflare infrastructure adapters to the domain
 * model and application services.
 *
 * This is the ONLY place in the SaaS package that constructs concrete
 * adapters and wires them into the `@mnemosyne/core` domain. The Durable
 * Object and Worker consume the resulting `MemoryToolContext` and `McpServer`.
 */

import {
    AdministerFoundationUseCase,
    AnalyzeCausalityUseCase,
    CausalityService,
    FoundationRulesAggregate,
    GetSystemStatsUseCase,
    MemoryAggregate,
    SearchMemoryUseCase,
    SearchService,
    StoreEnhancedMemoryUseCase,
    StoreMemoryUseCase,
    TierManagementService,
} from '@mnemosyne/core';
import type { ShardKey } from '@mnemosyne/core';
import { KVAdapter, VectorizeAdapter, WorkersAIEmbeddingAdapter } from '@mnemosyne/infra-cloudflare';
import { InMemoryEventBus } from '@mnemosyne/pubsub';
import { EventRouter, SSEEndpoint } from '@mnemosyne/streaming';
import { registerMemoryTools, ToolRegistry } from '@mnemosyne/mcp-server';
import type { MemoryToolContext } from '@mnemosyne/mcp-server';
import { EventBusPublisher } from './event-bus-publisher.js';

export interface SaasEnv {
    AI: Ai;
    VECTORIZE_INDEX: VectorizeIndex;
    MEMORY_KV: KVNamespace;
    R2_BUCKET?: R2Bucket;
}

export interface SaasComposition {
    readonly registry: ToolRegistry;
    readonly context: MemoryToolContext;
    readonly eventBus: InMemoryEventBus;
    readonly eventRouter: EventRouter;
    readonly sseEndpoint: SSEEndpoint;
    readonly shardKey: ShardKey;
}

/**
 * Build the full composition root from Cloudflare bindings.
 * Fail-closed: throws if required bindings are missing.
 */
export function composeSaas(env: SaasEnv, shardKey: ShardKey): SaasComposition {
    if (!env.MEMORY_KV) {
        throw new Error('composeSaas: MEMORY_KV binding is required.');
    }
    if (!env.VECTORIZE_INDEX || !env.AI) {
        throw new Error('composeSaas: VECTORIZE_INDEX and AI bindings are required.');
    }

    // Infrastructure adapters
    const kvStore = new KVAdapter({ namespace: env.MEMORY_KV });
    const vectorStore = new VectorizeAdapter({ vectorizeIndex: env.VECTORIZE_INDEX });
    const embeddingProvider = new WorkersAIEmbeddingAdapter({ ai: env.AI });

    // Event bus + publisher bridge
    const eventBus = new InMemoryEventBus({ maxHistorySize: 1000 });
    const eventPublisher = new EventBusPublisher(eventBus);

    // Domain services
    const memory = new MemoryAggregate({
        vectorStore,
        kvStore,
        eventPublisher,
        keyPrefix: 'mem',
    });
    const tierService = new TierManagementService({
        kvStore,
        vectorStore,
        keyPrefix: 'tier:',
    });
    const searchService = new SearchService({ vectorStore });
    const foundation = new FoundationRulesAggregate();
    const causalityService = new CausalityService();

    // Application services (use cases)
    const storeMemory = new StoreMemoryUseCase({ memory, tierService, embeddingProvider, eventPublisher });
    const searchMemory = new SearchMemoryUseCase({ searchService, embeddingProvider, eventPublisher });
    const getSystemStats = new GetSystemStatsUseCase({ tierService, foundation, vectorStore });
    const administerFoundation = new AdministerFoundationUseCase({ foundation, tierService });
    const storeEnhancedMemory = new StoreEnhancedMemoryUseCase({ memory, causalityService, embeddingProvider, eventPublisher });
    const analyzeCausality = new AnalyzeCausalityUseCase({ causalityService });

    const context: MemoryToolContext = {
        storeMemory,
        searchMemory,
        getSystemStats,
        administerFoundation,
        storeEnhancedMemory,
        analyzeCausality,
        shardKey,
    };

    const registry = new ToolRegistry();
    registerMemoryTools(registry, context);

    // Streaming: route domain events from the bus to SSE clients.
    const eventRouter = new EventRouter(eventBus);
    const sseEndpoint = new SSEEndpoint();

    return { registry, context, eventBus, eventRouter, sseEndpoint, shardKey };
}
