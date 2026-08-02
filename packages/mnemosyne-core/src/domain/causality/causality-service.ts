/**
 * Causality service — domain service for causal relationship analysis.
 *
 * Uses Lamport logical clocks, vector clocks, and hybrid logical clocks to
 * determine if events have happens-before, happens-after, concurrent, or
 * unknown relationships.
 *
 * Extracted from the legacy `modules/causality-analyzer.ts` during Phase 2.
 * The algorithm is preserved exactly; only the wrapper changes from static
 * methods + static state to instance methods + instance state.
 */

import type {
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

export class CausalityService {
    private readonly nodeId: string;
    private lamportTime = 0;
    private vectorClock: Record<string, number> = {};
    private readonly eventHistory: Map<string, EnhancedTemporalMetadata> = new Map();

    constructor() {
        this.nodeId = crypto.randomUUID();
    }

    generateCausalContext(dependencies: string[] = [], causedBy: string[] = []): CausalContext {
        this.updateClocksFromDependencies(dependencies);
        const nodeId = this.nodeId;
        const lamportClock: LamportClock = { logicalTime: ++this.lamportTime, nodeId };
        const vectorClock: VectorClock = { clock: { ...this.vectorClock, [nodeId]: this.lamportTime }, nodeId };
        const hybridClock: HybridLogicalClock = { physicalTime: this.generateMicrosecondTimestamp(), logicalTime: this.lamportTime, nodeId };
        return { lamportClock, vectorClock, hybridClock, dependencies, causedBy, causalDepth: this.calculateCausalDepth(dependencies), branchingFactor: this.calculateBranchingFactor(dependencies) };
    }

    analyzeCausality(eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata, _method: CausalityMethod = 'hybrid'): CausalityAnalysisResult {
        const methods: CausalityMethod[] = ['lamport', 'vector', 'hlc'];
        const results: CausalRelationship[] = [];
        for (const method of methods) results.push(this.analyzeWithMethod(eventA, eventB, method));
        const combined = this.combineCausalAnalysis(results, eventA, eventB);
        return { relationship: combined.type, confidence: combined.confidence, evidence: combined.evidence, method: combined.method };
    }

    determineRelationship(clockA: unknown, clockB: unknown, method: CausalityMethod): CausalRelationshipType {
        if (method === 'lamport') {
            const a = clockA as LamportClock;
            const b = clockB as LamportClock;
            if (a.logicalTime < b.logicalTime) return 'happens_before';
            if (a.logicalTime > b.logicalTime) return 'happens_after';
            return 'concurrent';
        }
        if (method === 'vector') {
            const a = (clockA as VectorClock).clock;
            const b = (clockB as VectorClock).clock;
            let aBeforeB = true, aBeforeBStrict = false, bBeforeA = true, bBeforeAStrict = false;
            for (const nodeId of Object.keys({ ...a, ...b })) {
                const timeA = a[nodeId] || 0;
                const timeB = b[nodeId] || 0;
                if (timeA > timeB) aBeforeB = false;
                else if (timeA < timeB) aBeforeBStrict = true;
                if (timeB > timeA) bBeforeA = false;
                else if (timeB < timeA) bBeforeAStrict = true;
            }
            if (aBeforeB && aBeforeBStrict) return 'happens_before';
            if (bBeforeA && bBeforeAStrict) return 'happens_after';
            return 'concurrent';
        }
        if (method === 'hlc') {
            const a = clockA as HybridLogicalClock;
            const b = clockB as HybridLogicalClock;
            const physicalDiff = b.physicalTime - a.physicalTime;
            const logicalDiff = b.logicalTime - a.logicalTime;
            const PHYSICAL_THRESHOLD = 1000;
            if (Math.abs(physicalDiff) > PHYSICAL_THRESHOLD) return physicalDiff > 0 ? 'happens_before' : 'happens_after';
            if (logicalDiff > 0) return 'happens_before';
            if (logicalDiff < 0) return 'happens_after';
            return 'concurrent';
        }
        return 'unknown';
    }

    recordEvent(id: string, metadata: EnhancedTemporalMetadata): void {
        this.eventHistory.set(id, metadata);
    }

    getEventId(event: EnhancedTemporalMetadata): string {
        return `${event.causalContext.hybridClock.nodeId}-${event.causalContext.hybridClock.logicalTime}`;
    }

    private analyzeWithMethod(eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata, method: CausalityMethod): CausalRelationship {
        switch (method) {
            case 'lamport': return this.analyzeLamportCausality(eventA, eventB);
            case 'vector': return this.analyzeVectorCausality(eventA, eventB);
            case 'hlc': return this.analyzeHLCCausality(eventA, eventB);
            default: throw new Error(`Unknown causality method: ${method}`);
        }
    }

    private analyzeLamportCausality(eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata): CausalRelationship {
        const clockA = eventA.causalContext.lamportClock;
        const clockB = eventB.causalContext.lamportClock;
        if (clockA.logicalTime < clockB.logicalTime) return { type: 'happens_before', confidence: 0.7, evidence: [`Lamport: ${clockA.logicalTime} < ${clockB.logicalTime}`], method: 'lamport' };
        if (clockA.logicalTime > clockB.logicalTime) return { type: 'happens_after', confidence: 0.7, evidence: [`Lamport: ${clockA.logicalTime} > ${clockB.logicalTime}`], method: 'lamport' };
        return { type: 'concurrent', confidence: 0.5, evidence: [`Lamport: ${clockA.logicalTime} = ${clockB.logicalTime}`], method: 'lamport' };
    }

    private analyzeVectorCausality(eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata): CausalRelationship {
        const clockA = eventA.causalContext.vectorClock.clock;
        const clockB = eventB.causalContext.vectorClock.clock;
        let aBeforeB = true, aBeforeBStrict = false, bBeforeA = true, bBeforeAStrict = false;
        for (const nodeId of Object.keys({ ...clockA, ...clockB })) {
            const timeA = clockA[nodeId] || 0;
            const timeB = clockB[nodeId] || 0;
            if (timeA > timeB) aBeforeB = false;
            else if (timeA < timeB) aBeforeBStrict = true;
            if (timeB > timeA) bBeforeA = false;
            else if (timeB < timeA) bBeforeAStrict = true;
        }
        if (aBeforeB && aBeforeBStrict) return { type: 'happens_before', confidence: 0.95, evidence: ['Vector: A < B', `Clock A: ${JSON.stringify(clockA)}`, `Clock B: ${JSON.stringify(clockB)}`], method: 'vector' };
        if (bBeforeA && bBeforeAStrict) return { type: 'happens_after', confidence: 0.95, evidence: ['Vector: B < A', `Clock A: ${JSON.stringify(clockA)}`, `Clock B: ${JSON.stringify(clockB)}`], method: 'vector' };
        return { type: 'concurrent', confidence: 0.9, evidence: ['Vector: A || B (concurrent)', `Clock A: ${JSON.stringify(clockA)}`, `Clock B: ${JSON.stringify(clockB)}`], method: 'vector' };
    }

    private analyzeHLCCausality(eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata): CausalRelationship {
        const hlcA = eventA.causalContext.hybridClock;
        const hlcB = eventB.causalContext.hybridClock;
        const physicalDiff = hlcB.physicalTime - hlcA.physicalTime;
        const logicalDiff = hlcB.logicalTime - hlcA.logicalTime;
        const PHYSICAL_THRESHOLD = 1000;
        if (Math.abs(physicalDiff) > PHYSICAL_THRESHOLD) {
            if (physicalDiff > 0) return { type: 'happens_before', confidence: 0.85, evidence: [`HLC: Physical time diff ${physicalDiff}μs > threshold`], method: 'hlc' };
            return { type: 'happens_after', confidence: 0.85, evidence: [`HLC: Physical time diff ${physicalDiff}μs < -threshold`], method: 'hlc' };
        }
        if (logicalDiff > 0) return { type: 'happens_before', confidence: 0.8, evidence: [`HLC: Logical time diff ${logicalDiff}, physical diff ${physicalDiff}μs`], method: 'hlc' };
        if (logicalDiff < 0) return { type: 'happens_after', confidence: 0.8, evidence: [`HLC: Logical time diff ${logicalDiff}, physical diff ${physicalDiff}μs`], method: 'hlc' };
        return { type: 'concurrent', confidence: 0.75, evidence: [`HLC: Same logical time, physical diff ${physicalDiff}μs within threshold`], method: 'hlc' };
    }

    private combineCausalAnalysis(results: CausalRelationship[], eventA: EnhancedTemporalMetadata, eventB: EnhancedTemporalMetadata): CausalRelationship {
        const weights: Record<CausalityMethod, number> = { lamport: 0.2, vector: 0.5, hlc: 0.3, hybrid: 0.4 };
        const typeCounts = new Map<CausalRelationshipType, number>();
        let totalConfidence = 0;
        const combinedEvidence: string[] = [];
        for (const result of results) {
            const weight = weights[result.method] || 0.1;
            typeCounts.set(result.type, (typeCounts.get(result.type) || 0) + weight);
            totalConfidence += result.confidence * weight;
            combinedEvidence.push(...result.evidence);
        }
        let consensusType: CausalRelationshipType = 'unknown';
        let maxWeight = 0;
        for (const [type, weight] of typeCounts) {
            if (weight > maxWeight) { maxWeight = weight; consensusType = type; }
        }
        const aId = this.getEventId(eventA);
        if (eventB.causalContext.dependencies.includes(aId) || eventB.causalContext.causedBy.includes(aId)) {
            consensusType = 'happens_before';
            totalConfidence = Math.max(totalConfidence, 0.95);
            combinedEvidence.push('Explicit dependency relationship');
        }
        return { type: consensusType, confidence: Math.min(totalConfidence, 1.0), evidence: combinedEvidence, method: 'hybrid' };
    }

    private updateClocksFromDependencies(dependencies: string[]): void {
        for (const depId of dependencies) {
            const depEvent = this.eventHistory.get(depId);
            if (depEvent) {
                const depVectorClock = depEvent.causalContext.vectorClock.clock;
                for (const nodeId of Object.keys(depVectorClock)) {
                    this.vectorClock[nodeId] = Math.max(this.vectorClock[nodeId] || 0, depVectorClock[nodeId] || 0);
                }
                this.lamportTime = Math.max(this.lamportTime, depEvent.causalContext.lamportClock.logicalTime);
            }
        }
    }

    private calculateCausalDepth(dependencies: string[]): number {
        if (dependencies.length === 0) return 0;
        let maxDepth = 0;
        for (const depId of dependencies) {
            const depEvent = this.eventHistory.get(depId);
            if (depEvent) maxDepth = Math.max(maxDepth, depEvent.causalContext.causalDepth);
        }
        return maxDepth + 1;
    }

    private calculateBranchingFactor(dependencies: string[]): number {
        return dependencies.length;
    }

    private generateMicrosecondTimestamp(): number {
        return Date.now() * 1000 + Math.floor(performance.now() % 1000);
    }
}
