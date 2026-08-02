/**
 * Causality bounded context.
 *
 * Tracks causal relationships between memory entries using Lamport clocks,
 * vector clocks, and hybrid logical clocks. Determines happens-before,
 * happens-after, concurrent, or unknown relationships.
 *
 * Extracted from the legacy `modules/causality-analyzer.ts` during Phase 2.
 * The algorithm is sophisticated and preserved; only the wrapper changes.
 */

export type {
    CausalContext,
    CausalRelationship,
    CausalRelationshipType,
    CausalityAnalysisResult,
    CausalityMethod,
    EnhancedTemporalMetadata,
    HybridLogicalClock,
    LamportClock,
    VectorClock,
} from './types.js';
export { CausalityService } from './causality-service.js';
