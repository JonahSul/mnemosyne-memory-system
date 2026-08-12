/**
 * Application services — use-case orchestration.
 *
 * Each use case coordinates domain aggregates and services to fulfill a single
 * user/agent request. These replace the 1229-line `memory-tool.ts` god class
 * and the inline handlers in `simplified-registry.ts` (1035 lines).
 *
 * Application services are the ONLY layer that coordinates multiple domain
 * objects. They do NOT contain domain logic — they orchestrate it.
 */

export type { StoreMemoryInput, StoreMemoryOutput } from './store-memory.js';
export { StoreMemoryUseCase } from './store-memory.js';

export type { SearchMemoryInput, SearchMemoryOutput } from './search-memory.js';
export { SearchMemoryUseCase } from './search-memory.js';

export type { GetSystemStatsInput, GetSystemStatsOutput } from './get-system-stats.js';
export { GetSystemStatsUseCase } from './get-system-stats.js';

export type { AdministerFoundationInput, AdministerFoundationOutput, AdminOperation } from './administer-foundation.js';
export { AdministerFoundationUseCase } from './administer-foundation.js';

export type { StoreEnhancedMemoryInput, StoreEnhancedMemoryOutput } from './store-enhanced-memory.js';
export { StoreEnhancedMemoryUseCase } from './store-enhanced-memory.js';

export type { AnalyzeCausalityInput, AnalyzeCausalityOutput } from './analyze-causality.js';
export { AnalyzeCausalityUseCase } from './analyze-causality.js';
