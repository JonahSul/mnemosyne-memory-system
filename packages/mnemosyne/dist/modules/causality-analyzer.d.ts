/**
 * Advanced Causality Tracking for Foundation v1.7.1
 *
 * Implements robust causality determination using multiple approaches:
 * - Lamport Logical Clocks for event ordering
 * - Vector Clocks for distributed causality
 * - Hybrid Logical Clocks (HLC) for real-time ordering
 * - Causal graphs for complex relationship analysis
 */
export type CausalityMethod = "lamport" | "vector" | "hlc" | "hybrid";
export interface LamportClock {
    logicalTime: number;
    nodeId: string;
}
export interface VectorClock {
    clock: Record<string, number>;
    nodeId: string;
}
export interface HybridLogicalClock {
    physicalTime: number;
    logicalTime: number;
    nodeId: string;
}
export interface CausalRelationship {
    type: "happens_before" | "concurrent" | "happens_after" | "unknown";
    confidence: number;
    evidence: string[];
    method: CausalityMethod;
}
export interface CausalContext {
    lamportClock: LamportClock;
    vectorClock: VectorClock;
    hybridClock: HybridLogicalClock;
    dependencies: string[];
    causedBy: string[];
    causalDepth: number;
    branchingFactor: number;
}
export interface EnhancedTemporalMetadata {
    serverTimestamp: number;
    clientTimestamp?: number;
    processingLatency?: number;
    clockSource: "server" | "ntp" | "atomic" | "local";
    timezone: string;
    sequenceNumber: number;
    causalContext: CausalContext;
    correlationId?: string;
    sessionId?: string;
    traceId?: string;
}
export declare class CausalityAnalyzer {
    private static nodeId;
    private static lamportTime;
    private static vectorClock;
    private static eventHistory;
    /**
     * Get or initialize node ID (lazy initialization for Cloudflare Workers compatibility)
     */
    private static getNodeId;
    /**
     * Generate causal context for a new event
     */
    static generateCausalContext(dependencies?: string[], causedBy?: string[]): CausalContext;
    /**
     * Determine causal relationship between two events
     */
    static analyzeCausalRelationship(eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata): CausalRelationship;
    /**
     * Analyze using specific causality method
     */
    private static analyzeWithMethod;
    /**
     * Lamport clock causality analysis
     */
    private static analyzeLamportCausality;
    /**
     * Vector clock causality analysis (most robust)
     */
    private static analyzeVectorCausality;
    /**
     * Hybrid Logical Clock analysis (real-time aware)
     */
    private static analyzeHLCCausality;
    /**
     * Combine multiple causality analyses for robust determination
     */
    private static combineCausalAnalysis;
    private static updateClocksFromDependencies;
    private static calculateCausalDepth;
    private static calculateBranchingFactor;
    private static generateMicrosecondTimestamp;
    private static getEventId;
}
export declare class CausalGraphAnalyzer {
    /**
     * Build causal graph from a set of events
     */
    static buildCausalGraph(events: EnhancedTemporalMetadata[]): Map<string, CausalRelationship[]>;
    /**
     * Find causal chains in the graph
     */
    static findCausalChains(graph: Map<string, CausalRelationship[]>): string[][];
    private static traceCausalChain;
    private static invertRelationshipType;
    private static getEventId;
}
//# sourceMappingURL=causality-analyzer.d.ts.map