/**
 * MemoryToolContext — the dependency bundle injected into every memory tool.
 *
 * Holds the application services (from `@mnemosyne/core`) plus the default
 * shard key and event publisher. Tools are pure classes that delegate to the
 * use cases — no business logic lives in the MCP layer.
 */

import type {
    AdministerFoundationUseCase,
    AnalyzeCausalityUseCase,
    GetSystemStatsUseCase,
    SearchMemoryUseCase,
    ShardKey,
    StoreEnhancedMemoryUseCase,
    StoreMemoryUseCase,
} from '@mnemosyne/core';

export interface MemoryToolContext {
    readonly storeMemory: StoreMemoryUseCase;
    readonly searchMemory: SearchMemoryUseCase;
    readonly getSystemStats: GetSystemStatsUseCase;
    readonly administerFoundation: AdministerFoundationUseCase;
    readonly storeEnhancedMemory: StoreEnhancedMemoryUseCase;
    readonly analyzeCausality: AnalyzeCausalityUseCase;
    readonly shardKey: ShardKey;
}
