/**
 * Application services — use-case orchestration.
 *
 * Each use case coordinates domain aggregates and services to fulfill a single
 * user/agent request. These replace the 928-line `memory-tool.ts` god class
 * and the inline handlers in `simplified-registry.ts`.
 *
 * Application services are the ONLY layer that coordinates multiple domain
 * objects. They do NOT contain domain logic — they orchestrate it.
 *
 * Phase 3 will extract the real use-case logic from `memory-tool.ts` and
 * `simplified-registry.ts`.
 */

export type { StoreMemoryInput, StoreMemoryOutput } from './store-memory.js';
export { StoreMemoryUseCase } from './store-memory.js';

export type { SearchMemoryInput, SearchMemoryOutput } from './search-memory.js';
export { SearchMemoryUseCase } from './search-memory.js';
