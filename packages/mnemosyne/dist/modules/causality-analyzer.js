/**
 * Advanced Causality Tracking for Foundation v1.7.1
 *
 * Implements robust causality determination using multiple approaches:
 * - Lamport Logical Clocks for event ordering
 * - Vector Clocks for distributed causality
 * - Hybrid Logical Clocks (HLC) for real-time ordering
 * - Causal graphs for complex relationship analysis
 */
// CAUSALITY ANALYSIS ENGINE
export class CausalityAnalyzer {
    static nodeId = null;
    static lamportTime = 0;
    static vectorClock = {};
    static eventHistory = new Map();
    /**
     * Get or initialize node ID (lazy initialization for Cloudflare Workers compatibility)
     */
    static getNodeId() {
        if (!this.nodeId) {
            this.nodeId = crypto.randomUUID();
        }
        return this.nodeId;
    }
    /**
     * Generate causal context for a new event
     */
    static generateCausalContext(dependencies = [], causedBy = []) {
        // Update clocks based on dependencies
        this.updateClocksFromDependencies(dependencies);
        const nodeId = this.getNodeId();
        const lamportClock = {
            logicalTime: ++this.lamportTime,
            nodeId: nodeId
        };
        const vectorClock = {
            clock: { ...this.vectorClock, [nodeId]: this.lamportTime },
            nodeId: nodeId
        };
        const hybridClock = {
            physicalTime: this.generateMicrosecondTimestamp(),
            logicalTime: this.lamportTime,
            nodeId: nodeId
        };
        return {
            lamportClock,
            vectorClock,
            hybridClock,
            dependencies,
            causedBy,
            causalDepth: this.calculateCausalDepth(dependencies),
            branchingFactor: this.calculateBranchingFactor(dependencies)
        };
    }
    /**
     * Determine causal relationship between two events
     */
    static analyzeCausalRelationship(eventA, eventB) {
        const methods = ["lamport", "vector", "hlc"];
        const results = [];
        // Analyze using multiple methods
        for (const method of methods) {
            const result = this.analyzeWithMethod(eventA, eventB, method);
            results.push(result);
        }
        // Combine results for robust determination
        return this.combineCausalAnalysis(results, eventA, eventB);
    }
    /**
     * Analyze using specific causality method
     */
    static analyzeWithMethod(eventA, eventB, method) {
        switch (method) {
            case "lamport":
                return this.analyzeLamportCausality(eventA, eventB);
            case "vector":
                return this.analyzeVectorCausality(eventA, eventB);
            case "hlc":
                return this.analyzeHLCCausality(eventA, eventB);
            default:
                throw new Error(`Unknown causality method: ${method}`);
        }
    }
    /**
     * Lamport clock causality analysis
     */
    static analyzeLamportCausality(eventA, eventB) {
        const clockA = eventA.causalContext.lamportClock;
        const clockB = eventB.causalContext.lamportClock;
        if (clockA.logicalTime < clockB.logicalTime) {
            return {
                type: "happens_before",
                confidence: 0.7, // Lamport only shows possible causality
                evidence: [`Lamport: ${clockA.logicalTime} < ${clockB.logicalTime}`],
                method: "lamport"
            };
        }
        else if (clockA.logicalTime > clockB.logicalTime) {
            return {
                type: "happens_after",
                confidence: 0.7,
                evidence: [`Lamport: ${clockA.logicalTime} > ${clockB.logicalTime}`],
                method: "lamport"
            };
        }
        else {
            return {
                type: "concurrent",
                confidence: 0.5, // Low confidence - could be causally related
                evidence: [`Lamport: ${clockA.logicalTime} = ${clockB.logicalTime}`],
                method: "lamport"
            };
        }
    }
    /**
     * Vector clock causality analysis (most robust)
     */
    static analyzeVectorCausality(eventA, eventB) {
        const clockA = eventA.causalContext.vectorClock.clock;
        const clockB = eventB.causalContext.vectorClock.clock;
        // Check if A happens before B (A < B)
        let aBeforeB = true;
        let aBefoBStrict = false;
        // Check if B happens before A (B < A)
        let bBeforeA = true;
        let bBeforeAStrict = false;
        for (const nodeId in { ...clockA, ...clockB }) {
            const timeA = clockA[nodeId] || 0;
            const timeB = clockB[nodeId] || 0;
            if (timeA > timeB) {
                aBeforeB = false;
            }
            else if (timeA < timeB) {
                aBefoBStrict = true;
            }
            if (timeB > timeA) {
                bBeforeA = false;
            }
            else if (timeB < timeA) {
                bBeforeAStrict = true;
            }
        }
        if (aBeforeB && aBefoBStrict) {
            return {
                type: "happens_before",
                confidence: 0.95, // High confidence with vector clocks
                evidence: [`Vector: A < B`, `Clock A: ${JSON.stringify(clockA)}`, `Clock B: ${JSON.stringify(clockB)}`],
                method: "vector"
            };
        }
        else if (bBeforeA && bBeforeAStrict) {
            return {
                type: "happens_after",
                confidence: 0.95,
                evidence: [`Vector: B < A`, `Clock A: ${JSON.stringify(clockA)}`, `Clock B: ${JSON.stringify(clockB)}`],
                method: "vector"
            };
        }
        else {
            return {
                type: "concurrent",
                confidence: 0.9, // High confidence in concurrency
                evidence: [`Vector: A || B (concurrent)`, `Clock A: ${JSON.stringify(clockA)}`, `Clock B: ${JSON.stringify(clockB)}`],
                method: "vector"
            };
        }
    }
    /**
     * Hybrid Logical Clock analysis (real-time aware)
     */
    static analyzeHLCCausality(eventA, eventB) {
        const hlcA = eventA.causalContext.hybridClock;
        const hlcB = eventB.causalContext.hybridClock;
        // Compare physical time first
        const physicalDiff = hlcB.physicalTime - hlcA.physicalTime;
        const logicalDiff = hlcB.logicalTime - hlcA.logicalTime;
        // If physical times are significantly different, trust physical time
        const PHYSICAL_THRESHOLD = 1000; // 1ms in microseconds
        if (Math.abs(physicalDiff) > PHYSICAL_THRESHOLD) {
            if (physicalDiff > 0) {
                return {
                    type: "happens_before",
                    confidence: 0.85,
                    evidence: [`HLC: Physical time diff ${physicalDiff}μs > threshold`],
                    method: "hlc"
                };
            }
            else {
                return {
                    type: "happens_after",
                    confidence: 0.85,
                    evidence: [`HLC: Physical time diff ${physicalDiff}μs < -threshold`],
                    method: "hlc"
                };
            }
        }
        else {
            // Physical times close, use logical time
            if (logicalDiff > 0) {
                return {
                    type: "happens_before",
                    confidence: 0.8,
                    evidence: [`HLC: Logical time diff ${logicalDiff}, physical diff ${physicalDiff}μs`],
                    method: "hlc"
                };
            }
            else if (logicalDiff < 0) {
                return {
                    type: "happens_after",
                    confidence: 0.8,
                    evidence: [`HLC: Logical time diff ${logicalDiff}, physical diff ${physicalDiff}μs`],
                    method: "hlc"
                };
            }
            else {
                return {
                    type: "concurrent",
                    confidence: 0.75,
                    evidence: [`HLC: Same logical time, physical diff ${physicalDiff}μs within threshold`],
                    method: "hlc"
                };
            }
        }
    }
    /**
     * Combine multiple causality analyses for robust determination
     */
    static combineCausalAnalysis(results, eventA, eventB) {
        // Weight the results by method reliability
        const weights = {
            lamport: 0.2,
            vector: 0.5,
            hlc: 0.3,
            hybrid: 0.4
        };
        // Count consensus
        const typeCounts = new Map();
        let totalConfidence = 0;
        let combinedEvidence = [];
        for (const result of results) {
            const weight = weights[result.method] || 0.1;
            const currentCount = typeCounts.get(result.type) || 0;
            typeCounts.set(result.type, currentCount + weight);
            totalConfidence += result.confidence * weight;
            combinedEvidence.push(...result.evidence);
        }
        // Find consensus type
        let consensusType = "unknown";
        let maxWeight = 0;
        for (const [type, weight] of typeCounts) {
            if (weight > maxWeight) {
                maxWeight = weight;
                consensusType = type;
            }
        }
        // Check for explicit dependencies
        const aId = this.getEventId(eventA);
        const bId = this.getEventId(eventB);
        if (eventB.causalContext.dependencies.includes(aId) ||
            eventB.causalContext.causedBy.includes(aId)) {
            consensusType = "happens_before";
            totalConfidence = Math.max(totalConfidence, 0.95);
            combinedEvidence.push("Explicit dependency relationship");
        }
        return {
            type: consensusType,
            confidence: Math.min(totalConfidence, 1.0),
            evidence: combinedEvidence,
            method: "hybrid"
        };
    }
    // Helper methods
    static updateClocksFromDependencies(dependencies) {
        for (const depId of dependencies) {
            const depEvent = this.eventHistory.get(depId);
            if (depEvent) {
                const depVectorClock = depEvent.causalContext.vectorClock.clock;
                for (const nodeId in depVectorClock) {
                    this.vectorClock[nodeId] = Math.max(this.vectorClock[nodeId] || 0, depVectorClock[nodeId] || 0);
                }
                this.lamportTime = Math.max(this.lamportTime, depEvent.causalContext.lamportClock.logicalTime);
            }
        }
    }
    static calculateCausalDepth(dependencies) {
        if (dependencies.length === 0)
            return 0;
        let maxDepth = 0;
        for (const depId of dependencies) {
            const depEvent = this.eventHistory.get(depId);
            if (depEvent) {
                maxDepth = Math.max(maxDepth, depEvent.causalContext.causalDepth);
            }
        }
        return maxDepth + 1;
    }
    static calculateBranchingFactor(dependencies) {
        // Calculate how many concurrent events exist at this causal level
        // This is a simplified calculation - could be enhanced
        return dependencies.length;
    }
    static generateMicrosecondTimestamp() {
        return Date.now() * 1000 + Math.floor(performance.now() % 1000);
    }
    static getEventId(event) {
        // Extract event ID from metadata - implementation dependent
        return `${event.causalContext.hybridClock.nodeId}-${event.causalContext.hybridClock.logicalTime}`;
    }
}
// CAUSAL GRAPH ANALYSIS
export class CausalGraphAnalyzer {
    /**
     * Build causal graph from a set of events
     */
    static buildCausalGraph(events) {
        const graph = new Map();
        // Analyze all pairs of events
        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {
                const eventA = events[i];
                const eventB = events[j];
                if (!eventA || !eventB)
                    continue;
                const relationship = CausalityAnalyzer.analyzeCausalRelationship(eventA, eventB);
                const idA = this.getEventId(eventA);
                const idB = this.getEventId(eventB);
                if (!graph.has(idA))
                    graph.set(idA, []);
                if (!graph.has(idB))
                    graph.set(idB, []);
                graph.get(idA).push({ ...relationship, type: relationship.type });
                graph.get(idB).push({
                    ...relationship,
                    type: this.invertRelationshipType(relationship.type)
                });
            }
        }
        return graph;
    }
    /**
     * Find causal chains in the graph
     */
    static findCausalChains(graph) {
        const chains = [];
        const visited = new Set();
        for (const [nodeId] of graph) {
            if (!visited.has(nodeId)) {
                const chain = this.traceCausalChain(nodeId, graph, visited);
                if (chain.length > 1) {
                    chains.push(chain);
                }
            }
        }
        return chains;
    }
    static traceCausalChain(startNode, graph, visited) {
        const chain = [startNode];
        visited.add(startNode);
        const relationships = graph.get(startNode) || [];
        for (const rel of relationships) {
            if (rel.type === "happens_before" && rel.confidence > 0.8) {
                // Find the target node - this is simplified
                // In practice, you'd need to track which event this relationship points to
            }
        }
        return chain;
    }
    static invertRelationshipType(type) {
        switch (type) {
            case "happens_before": return "happens_after";
            case "happens_after": return "happens_before";
            case "concurrent": return "concurrent";
            default: return "unknown";
        }
    }
    static getEventId(event) {
        return `${event.causalContext.hybridClock.nodeId}-${event.causalContext.hybridClock.logicalTime}`;
    }
}
