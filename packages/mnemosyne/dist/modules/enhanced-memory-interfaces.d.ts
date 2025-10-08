/**
 * Enhanced Memory Interfaces for Foundation v1.7.1
 *
 * Structured semantic expansion with reduced cognitive complexity
 */
export type AgentPersonality = "security_focused" | "architecture_specialist" | "development_generalist" | "innovation_explorer";
export interface FieldContext {
    domain: "security" | "architecture" | "development" | "operations" | "innovation";
    criticalityLevel: "critical" | "high" | "medium" | "low";
    taskType: "debugging" | "documentation" | "learning" | "exploration" | "implementation";
    assessmentConfidence: number;
}
export interface ExpansionStrategy {
    selectedPersonality: AgentPersonality;
    precisionCoefficient: number;
    overrideReason?: string;
    qualityValidation: boolean;
    generationTimestamp: string;
}
export interface SemanticAxis {
    tags: string[];
    confidence: number;
    generationMethod: "automatic" | "manual" | "hybrid";
    validationStatus: "validated" | "pending" | "rejected";
}
export interface SemanticAxes {
    nearSemanticNeighbor: SemanticAxis;
    relatedConcept: SemanticAxis & {
        conceptualDistance: number;
    };
    analogicalPattern: SemanticAxis & {
        crossDomainJustification: string;
        transferabilityScore: number;
    };
}
export interface QualityMetrics {
    overallSemanticQuality: number;
    discoverabilityEnhancement: number;
    noiseReduction: number;
    crossAxisCoherence: number;
    usageAnalytics: {
        searchHits: number;
        patternMatches: number;
        crossDomainConnections: number;
        lastAnalyzed: string;
    };
}
export interface CausalContext {
    lamportClock: {
        logicalTime: number;
        nodeId: string;
    };
    vectorClock: {
        clock: Record<string, number>;
        nodeId: string;
    };
    hybridClock: {
        physicalTime: number;
        logicalTime: number;
        nodeId: string;
    };
    dependencies: string[];
    causedBy: string[];
    causalDepth: number;
    branchingFactor: number;
    associatedPlans?: string[];
    planMilestone?: string;
    planDeviation?: {
        planId: string;
        expectedOutcome: string;
        actualOutcome: string;
        deviationSeverity: 'minor' | 'moderate' | 'major';
    };
}
export interface SemanticExpansion {
    fieldContext: FieldContext;
    expansionStrategy: ExpansionStrategy;
    semanticAxes: SemanticAxes;
    qualityMetrics: QualityMetrics;
}
export interface EnhancedTemporalMetadata extends TemporalMetadata {
    causalContext: CausalContext;
    correlationId?: string;
    sessionId?: string;
    traceId?: string;
}
export interface TemporalMetadata {
    serverTimestamp: number;
    clientTimestamp?: number;
    processingLatency?: number;
    clockSource: "server" | "ntp" | "atomic" | "local";
    timezone: string;
    sequenceNumber: number;
}
export interface EnhancedMemoryEntry {
    id: string;
    content: string;
    evidence: string[];
    confidence: number;
    temporal: TemporalMetadata;
    timestamp: string;
    source: string;
    verificationMethod: "manual" | "automated" | "cross_reference" | "inference";
    semanticExpansion: SemanticExpansion;
    systemMetadata: {
        tier: "short" | "intermediate" | "long";
        importance: number;
        accessCount: number;
        lastAccessed: number;
        relationshipCount: number;
        storageBackend: "kv" | "vector" | "both";
        createdAt: number;
        lastModified: number;
        accessHistory: number[];
    };
}
export interface AgentPersonalityConfig {
    personality: AgentPersonality;
    defaultPrecision: number;
    mandatoryAxes: ("nearSemanticNeighbor" | "relatedConcept" | "analogicalPattern")[];
    optionalAxes: ("nearSemanticNeighbor" | "relatedConcept" | "analogicalPattern")[];
    analogicalExpansion: "minimal" | "moderate" | "full" | "maximum";
    taskOverride: "rare" | "allowed_with_justification" | "encouraged" | "automatic";
}
export interface MemoryOperationContext {
    agentPersonality: AgentPersonality;
    taskType: FieldContext["taskType"];
    precisionOverride?: number;
    overrideReason?: string;
    qualityRequirements?: {
        minimumConfidence: number;
        maximumNoiseLevel: number;
        crossDomainValidation: boolean;
    };
}
export interface EnhancedMemorySystem {
    setAgentPersonality(personality: AgentPersonality): void;
    getAgentPersonality(): AgentPersonality;
    getPersonalityConfig(): AgentPersonalityConfig;
    storeMemory(entry: Omit<EnhancedMemoryEntry, "id" | "semanticExpansion" | "systemMetadata">, operationContext?: MemoryOperationContext): Promise<EnhancedMemoryEntry>;
    searchMemory(query: string, options?: {
        axisWeighting?: {
            nearSemanticNeighbor: number;
            relatedConcept: number;
            analogicalPattern: number;
        };
        minConfidence?: number;
        fieldFilter?: FieldContext["domain"];
        personalityFilter?: AgentPersonality;
    }): Promise<EnhancedMemoryEntry[]>;
    analyzeSemanticQuality(entryId: string): Promise<QualityMetrics>;
    getSystemSemanticHealth(): Promise<{
        averageQuality: number;
        totalRelationships: number;
        axisDistribution: Record<string, number>;
        personalityUsage: Record<AgentPersonality, number>;
    }>;
    createEnhancedPlan(plan: EnhancedPlanEntry): Promise<EnhancedPlanEntry>;
    updatePlanProgress(planId: string, progress: number, vectorUpdate?: number[]): Promise<boolean>;
    analyzePlanCausality(planId: string): Promise<CausalAnalysisResult>;
    detectPlanConversationFork(planId: string, currentContext: string): Promise<ConversationForkAnalysis>;
}
export interface EnhancedPlanEntry {
    id: string;
    title: string;
    description: string;
    objectives: string[];
    status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled' | 'derailed';
    priority: 'critical' | 'high' | 'medium' | 'low';
    progress: number;
    temporal: EnhancedTemporalMetadata;
    semanticExpansion: SemanticExpansion & {
        planSpecificAxes: {
            goalAlignment: SemanticAxis;
            executionPattern: SemanticAxis;
            domainExpertise: SemanticAxis;
        };
    };
    vectorTrajectory: {
        currentPosition: number[];
        plannedTrajectory: number[];
        actualTrajectory: number[];
        deviationVector: number[];
        convergenceMetrics: {
            onTrack: boolean;
            projectedCompletion: number;
            confidenceInterval: number;
        };
    };
    causalContext: CausalContext & {
        planSpecificCausality: {
            triggeringEvents: string[];
            dependentEvents: string[];
            milestoneEvents: string[];
            blockingEvents: string[];
        };
    };
    accountability: {
        commitmentLevel: number;
        trackingMetrics: string[];
        deviationThreshold: number;
        lastCheck: number;
        checkFrequency: number;
        alertsEnabled: boolean;
    };
    conversationContinuity: {
        originalContext: string;
        conversationId: string;
        forkDetection: {
            enabled: boolean;
            threshold: number;
            reminderStrategy: 'gentle' | 'assertive' | 'urgent';
        };
        contextBridging: {
            bridgePoints: string[];
            bridgeConfidence: number;
        };
    };
    systemMetadata: {
        tier: "short" | "intermediate" | "long";
        importance: number;
        accessCount: number;
        lastAccessed: number;
        relationshipCount: number;
        storageBackend: "kv" | "vector" | "both";
        creationMethod: "user_initiated" | "agent_suggested" | "collaborative";
        executionStyle: "sequential" | "parallel" | "adaptive";
        monitoringLevel: "passive" | "active" | "intensive";
    };
}
export interface ConversationForkAnalysis {
    isFork: boolean;
    forkSeverity: 'minor' | 'moderate' | 'major' | 'complete_derailment';
    semanticDistance: number;
    timeSinceFork: number;
    forkCharacteristics: {
        triggerTopic: string;
        distractionType: 'related' | 'tangential' | 'unrelated';
        returnProbability: number;
    };
    interventionRecommendation: {
        shouldIntervene: boolean;
        interventionType: 'reminder' | 'bridging' | 'choice_presentation';
        urgency: 'low' | 'medium' | 'high' | 'critical';
        suggestedMessage: string;
        bridgingStrategy?: string;
    };
    vectorAnalysis: {
        currentVector: number[];
        planVector: number[];
        distanceMetric: number;
        trajectoryAnalysis: {
            diverging: boolean;
            convergenceTime?: number;
        };
    };
}
export interface CausalAnalysisResult {
    planId: string;
    causalChain: {
        depth: number;
        dependencies: string[];
        influences: string[];
        criticalPath: string[];
    };
    executionCausality: {
        blockers: Array<{
            eventId: string;
            blockingSeverity: number;
            resolutionProbability: number;
        }>;
        accelerators: Array<{
            eventId: string;
            accelerationPotential: number;
        }>;
    };
    temporalCorrelations: {
        timeVsCausalityAlignment: number;
        predictiveAccuracy: number;
    };
}
export interface LegacyMemoryEntry {
    id: string;
    content: string;
    tags: string[];
    metadata: Record<string, unknown>;
    timestamp: string;
}
export interface MemoryMigrationUtil {
    upgradeLegacyEntry(legacy: LegacyMemoryEntry): EnhancedMemoryEntry;
    downgradeEnhancedEntry(enhanced: EnhancedMemoryEntry): LegacyMemoryEntry;
    migrateSemanticExpansion(tags: string[], personality: AgentPersonality): SemanticExpansion;
}
export declare class TemporalUtils {
    private static sequenceCounter;
    private static lastTimestamp;
    /**
     * Generate high-precision UNIX timestamp with microsecond resolution
     * Ensures monotonic ordering even for same-microsecond events
     */
    static generateServerTimestamp(): number;
    /**
     * Create complete temporal metadata for memory entry
     */
    static createTemporalMetadata(clientTimestamp?: number): TemporalMetadata;
    /**
     * Convert microsecond timestamp to ISO string for backward compatibility
     */
    static microsToISOString(microseconds: number): string;
    /**
     * Parse ISO string back to microsecond timestamp
     */
    static isoStringToMicros(isoString: string): number;
    /**
     * Calculate time difference in microseconds
     */
    static timeDifferenceMicros(timestamp1: number, timestamp2: number): number;
    /**
     * Format microsecond timestamp for human readability
     */
    static formatHumanReadable(microseconds: number, includeMs?: boolean): string;
}
//# sourceMappingURL=enhanced-memory-interfaces.d.ts.map