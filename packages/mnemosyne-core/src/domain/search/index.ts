/**
 * Search bounded context.
 *
 * Semantic search with adaptive thresholds and field-aware axis weighting.
 * Includes vector prewarming for cold-start optimization.
 *
 * Extracted from the legacy `modules/context-query.ts` and
 * `modules/vector-prewarming.ts` during Phase 2.
 */

export type { SearchSpec, SearchOptions, RankedResult } from './types.js';
export { SearchService } from './search-service.js';
