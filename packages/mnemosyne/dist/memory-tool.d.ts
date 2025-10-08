/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Mnemosyne Memory System - Delegator-based Architecture
 * Version 1.1.0 - Optimized Threshold Implementation
 *
 * This tool provides external scaffolding for AI cognitive enhancement and behavioral consistency using
 * a clean Delegator pattern for module composition and method routing.
 *
 * Enhanced with empirically optimized search thresholds based on similarity clustering analysis.
 */
import { PersistentCoreMemoryOperations } from './modules/persistent-core-memory';
import { BehavioralRuleOperations } from './modules/behavioral-rules';
import type { KeyValueStoreAdapter, VectorStoreAdapter } from './interfaces/storage';
import { EnhancedMemoryEntry } from './modules/enhanced-memory-interfaces';
import { VectorPrewarmingOperations } from './modules/vector-prewarming';
import { CheckpointOperations } from './modules/checkpoint-management';
import { WorkflowAnalysisOperations } from './modules/workflow-analysis';
import { WorkflowIntegrationOperations } from './modules/workflow-integration';
import { PrewarmingOperations } from './modules/prewarming-strategy';
import { PatternAnalysisOperations } from './modules/pattern-analysis';
import { ContextQueryOperations } from './modules/context-query';
import { BehavioralPatternOperations } from './modules/behavioral-patterns';
import type { MemoryEntry, BehavioralRule, ContextQuery, VectorAnalysis, VectorPrewarmingStatus, AdaptivePrewarmingStrategy, UserBehaviorPattern, WorkflowCheckpoint, TriggeredMemorySearch, WorkflowEfficiencyAnalysis, BehaviorPattern, FeedbackPattern, BehaviorAdjustment, FailurePattern, FailureAvoidanceStrategy, OptimizedWorkflow, SpeedThoroughnessBalance, ConsultationValue } from './modules/memory-interfaces';
export interface MnemosyneModuleOverrides {
    vectorPrewarming?: VectorPrewarmingOperations;
    checkpointManager?: CheckpointOperations;
    workflowAnalysis?: WorkflowAnalysisOperations;
    workflowIntegration?: WorkflowIntegrationOperations;
    prewarmingStrategy?: PrewarmingOperations;
    patternAnalysis?: PatternAnalysisOperations;
    contextQuery?: ContextQueryOperations;
    behavioralPatterns?: BehavioralPatternOperations;
}
export interface MnemosyneConfig {
    /** Provide an already constructed persistent memory manager */
    persistentMemoryManager?: PersistentCoreMemoryOperations;
    /** Provide a vector store adapter to back the default persistent memory manager */
    vectorStore?: VectorStoreAdapter;
    /** Optional KV persistence adapter for the default persistent manager */
    kvStore?: KeyValueStoreAdapter;
    /** Override the behavioral rules manager */
    behavioralRules?: BehavioralRuleOperations;
    /** Override core module implementations */
    modules?: MnemosyneModuleOverrides;
}
export declare class MnemosyneMemorySystem {
    private delegator;
    private coreMemory;
    private behavioralRules;
    private vectorStore;
    private kvStore?;
    private currentFoundation?;
    constructor(config?: MnemosyneConfig);
    private handleFallback;
    logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high'): Promise<string>;
    verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
    getUnverifiedClaims(): Promise<MemoryEntry[]>;
    recordViolation(ruleId: string, context: string, correctionPlan?: string, severity?: 'minor' | 'moderate' | 'major' | 'critical'): Promise<void>;
    analyzeQueryForVectorPrewarming(query: string): any;
    generateVectorPrewarmingStrategy(query: string): any;
    startVectorPrewarming(query: string): void;
    getVectorPrewarmingStatus(): any;
    recordQueryPattern(pattern: string, concepts: string[]): void;
    generateAdaptivePrewarmingStrategy(query: string): any;
    recordUserBehaviorPattern(pattern: Record<string, unknown>): void;
    prioritizeVectorPrewarming(context: Record<string, unknown>): any;
    createSessionPrewarmingStrategy(sessionContext: Record<string, unknown>): any;
    recordPrewarmingEffectiveness(attempt: Record<string, unknown>): void;
    storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[], testing?: boolean): Promise<string>;
    storeMemory(entry: MemoryEntry, testing?: boolean): Promise<void>;
    /**
     * Enhanced memory storage with causality tracking and temporal metadata
     * Foundation v1.7.1+ feature for advanced memory systems
     */
    storeEnhancedMemory(entry: Omit<EnhancedMemoryEntry, "id" | "temporal" | "timestamp" | "systemMetadata">, dependencies?: string[], causedBy?: string[], testing?: boolean): Promise<EnhancedMemoryEntry>;
    /**
     * Analyze causal relationships between memory entries
     * Foundation v1.7.1+ feature for advanced memory analysis
     */
    analyzeCausality(entryId1: string, entryId2: string): Promise<{
        relationship: any;
        confidence: number;
        evidence: string[];
    }>;
    searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
    getMemoryStats(): Promise<any>;
    exportMemory(includeTestingData?: boolean): Promise<MemoryEntry[]>;
    addBehavioralRule(rule: BehavioralRule): void;
    getBehavioralRules(): BehavioralRule[];
    checkRuleCompliance(ruleId: string, action: string): boolean;
    recordRuleViolation(ruleId: string, context: string): void;
    getBehavioralStatus(): {
        activeRules: number;
        recentViolations: Array<{
            rule: string;
            context: string;
            timestamp: number;
        }>;
        unverifiedClaims: number;
    };
    getFoundationRules(): BehavioralRule[];
    getFoundationInfo(): {
        version?: string;
        timestamp?: string;
        rulesCount: number;
    };
    updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): void;
    setFoundationMetadata(metadata: {
        version: string;
        timestamp: string;
    }): void;
    recordSuccessfulPattern(interaction: Record<string, unknown>): void;
    processFeedbackPattern(feedback: Record<string, unknown>): void;
    recordFailurePattern(pattern: Record<string, unknown>): void;
    recordConsultationValue(consultationValue: Record<string, unknown>): void;
    getBehaviorAdjustments(): any;
    getFailureAvoidanceStrategies(): any;
    getOptimizedConsultationFrequency(): any;
    checkPrewarmingStatus(): Promise<VectorPrewarmingStatus>;
    pauseVectorPrewarming(): Promise<VectorPrewarmingStatus>;
    resumeVectorPrewarming(): Promise<VectorPrewarmingStatus>;
    getVectorAnalysis(): Promise<VectorAnalysis>;
    adaptPrewarmingStrategy(userBehavior: UserBehaviorPattern): Promise<AdaptivePrewarmingStrategy>;
    createMemoryConsultationCheckpoint(stage: string, context: string, priority?: 'high' | 'medium' | 'low'): Promise<WorkflowCheckpoint>;
    triggerMemorySearchFromCheckpoint(checkpoint: WorkflowCheckpoint): Promise<TriggeredMemorySearch[]>;
    createWorkflowCheckpoint(stage: string, context: Record<string, unknown>, priority?: 'low' | 'medium' | 'high' | 'critical'): WorkflowCheckpoint;
    getTriggeredMemorySearches(checkpointId: string): TriggeredMemorySearch[];
    trackWorkflowExecution(workflowEvents: Array<Record<string, unknown>>): string;
    recordUserInteraction(query: string, context: Record<string, unknown>): void;
    learnFromUserFeedback(feedback: string, behaviorContext: string): Promise<FeedbackPattern>;
    adjustBehaviorBasedOnPattern(pattern: FeedbackPattern): Promise<BehaviorAdjustment>;
    identifyFailurePatterns(interactionHistory: Array<Record<string, unknown>>): Promise<FailurePattern[]>;
    createFailureAvoidanceStrategy(pattern: FailurePattern): Promise<FailureAvoidanceStrategy>;
    optimizeWorkflowIntegration(efficiencyData: WorkflowEfficiencyAnalysis[]): Promise<OptimizedWorkflow>;
    balanceSpeedVsThoroughness(performanceMetrics: Record<string, unknown>): Promise<SpeedThoroughnessBalance>;
    measureConsultationValue(consultationData: Record<string, unknown>): Promise<ConsultationValue>;
    optimizeConsultationFrequency(valueData: ConsultationValue[]): Promise<{
        recommendedFrequency: string;
        reasoning: string;
    }>;
    generatePrewarmingPredictions(userContext?: Record<string, unknown>): any;
    analyzeWorkflowEfficiency(workflowId: string): WorkflowEfficiencyAnalysis;
    logContextQuery(query: string, context?: Record<string, unknown>): string;
    getContextLogs(): ContextQuery[];
    getRecommendedMemorySearches(context: string): string[];
    generateMemorySearchRecommendations(userQuery: string, conversationContext: Record<string, unknown>): string[];
    getProactiveMemoryRecommendations(interactionContext: Record<string, unknown>): string[];
    getLearnedBehaviorPatterns(): BehaviorPattern[];
    getAdaptedPrewarmingStrategy(): {
        preferredMethods: string[];
        confidenceThresholds: number[];
        successRate?: number;
    };
    createOptimizedWorkflow(memoryInsights: Record<string, unknown>): {
        checkpointStrategy: string;
        prewarmingIntensity: string;
        responseStyle: string;
    };
    determineSpeedThoroughnessBalance(context: Record<string, unknown>): {
        approach: string;
        reasoning: string;
    };
    private getHistoricalData;
    private initializeFoundation;
    getDelegationStats(): {
        targets: number;
        methods: number;
        methodsByTarget: Record<string, number>;
    };
    getAvailableMethods(): string[];
    /**
     * Export complete memory system state for analysis, debugging, or persistence
     */
    exportState(includeTestingData?: boolean): Promise<any>;
    /**
     * Restore memory state from encoded snapshots in vector store
     *
     * This method searches for specific snapshot data in the vector store and
     * reconstructs the exact behavioral memory state including claims, rules, and verification status.
     *
     * @returns Restoration results and statistics
     */
    restoreFromSnapshots(): Promise<{
        success: boolean;
        restored: {
            claims: number;
            rules: number;
            snapshots: number;
        };
        summary: string[];
        errors: string[];
    }>;
    /**
     * Backfill memory from vector store when behavioral memory appears empty
     *
     * This method performs intelligent recovery by:
     * 1. Scanning vector store for existing embeddings
     * 2. Reconstructing memory entries from vector metadata
     * 3. Restoring behavioral rules and patterns
     * 4. Re-establishing memory consistency
     *
     * @param options Configuration for backfill operation
     * @returns Recovery statistics and restored content summary
     */
    backfillFromVectorStore(options?: {
        maxItems?: number;
        minSimilarity?: number;
        preserveTimestamps?: boolean;
        restoreFoundation?: boolean;
    }): Promise<{
        success: boolean;
        restored: {
            knowledge: number;
            claims: number;
            rules: number;
        };
        summary: string[];
        errors: string[];
    }>;
    searchTiered(query: string, options?: {
        threshold?: number;
        limit?: number;
        tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
        searchType?: 'exploration' | 'discovery' | 'balanced' | 'focused' | 'precise';
    }): Promise<any>;
    searchKnowledge(query: string, options?: {
        threshold?: number;
        limit?: number;
        searchType?: 'exploration' | 'discovery' | 'balanced' | 'focused' | 'precise';
    }): Promise<any>;
    /**
     * Get optimized threshold for memory search operations
     */
    private getOptimizedThreshold;
}
//# sourceMappingURL=memory-tool.d.ts.map