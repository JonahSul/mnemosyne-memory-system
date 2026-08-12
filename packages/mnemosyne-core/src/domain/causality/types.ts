/**
 * Causality domain types.
 *
 * Tracks causal relationships between memory entries using Lamport clocks,
 * vector clocks, and hybrid logical clocks (HLC). Determines happens-before,
 * happens-after, concurrent, or unknown relationships.
 *
 * Extracted from the legacy `modules/causality-analyzer.ts` during Phase 2.
 */

export type CausalityMethod = 'lamport' | 'vector' | 'hlc' | 'hybrid';

export interface LamportClock {
    logicalTime: number;
    nodeId: string;
}

export interface VectorClock {
    /** nodeId -> logical time */
    clock: Record<string, number>;
    nodeId: string;
}

export interface HybridLogicalClock {
    /** UNIX timestamp in microseconds */
    physicalTime: number;
    /** Logical counter */
    logicalTime: number;
    nodeId: string;
}

export type CausalRelationshipType = 'happens_before' | 'concurrent' | 'happens_after' | 'unknown';

export interface CausalRelationship {
    type: CausalRelationshipType;
    /** 0-1 confidence in the relationship */
    confidence: number;
    /** Evidence supporting the relationship */
    evidence: string[];
    method: CausalityMethod;
}

export interface CausalContext {
    lamportClock: LamportClock;
    vectorClock: VectorClock;
    hybridClock: HybridLogicalClock;
    /** IDs of events this event depends on */
    dependencies: string[];
    /** IDs of events that directly caused this event */
    causedBy: string[];
    /** Depth in the causal chain */
    causalDepth: number;
    /** Number of concurrent events at this level */
    branchingFactor: number;
}

export interface EnhancedTemporalMetadata {
    serverTimestamp: number;
    clientTimestamp?: number;
    processingLatency?: number;
    clockSource: 'server' | 'ntp' | 'atomic' | 'local';
    timezone: string;
    sequenceNumber: number;
    causalContext: CausalContext;
    correlationId?: string;
    sessionId?: string;
    traceId?: string;
}

export interface CausalityAnalysisResult {
    relationship: CausalRelationshipType;
    confidence: number;
    evidence: string[];
    method: CausalityMethod;
}
