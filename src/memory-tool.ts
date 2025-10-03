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

// Core Memory Operations
import { PersistentCoreMemoryOperations, PersistentCoreMemoryManager } from './modules/persistent-core-memory';
import { CloudflareVectorStore } from './cloudflare-vector-store';
import { BehavioralRuleOperations, BehavioralRuleManager } from './modules/behavioral-rules';

// Enhanced Memory Interfaces and Causality Analysis
import { 
	EnhancedMemoryEntry, 
	TemporalUtils, 
	AgentPersonality,
	TemporalMetadata,
	CausalContext,
	EnhancedTemporalMetadata
} from './modules/enhanced-memory-interfaces';
import { CausalityAnalyzer } from './modules/causality-analyzer';

// Specialized Operations
import { VectorPrewarmingOperations, VectorPrewarmingManager } from './modules/vector-prewarming';
import { CheckpointOperations, CheckpointManager } from './modules/checkpoint-management';
import { WorkflowAnalysisOperations, WorkflowAnalysisManager } from './modules/workflow-analysis';
import { WorkflowIntegrationOperations, WorkflowIntegrationManager } from './modules/workflow-integration';
import { PrewarmingOperations, PrewarmingManager } from './modules/prewarming-strategy';
import { PatternAnalysisOperations, PatternAnalysisManager } from './modules/pattern-analysis';
import { ContextQueryOperations, ContextQueryManager } from './modules/context-query';
import { BehavioralPatternOperations, BehavioralPatternLearner } from './modules/behavioral-patterns';

// Delegator Pattern
import { Delegator, DelegationTarget, autodiscoverMethods } from './modules/delegator';

// Import types
import type {
	MemoryEntry,
	BehavioralRule,
	InteractionPattern,
	ContextQuery,
	VectorAnalysis,
	VectorPrewarmingStrategy,
	VectorPrewarmingStatus,
	AdaptivePrewarmingStrategy,
	VectorPrioritization,
	UserBehaviorPattern,
	WorkflowCheckpoint,
	TriggeredMemorySearch,
	WorkflowEfficiencyAnalysis,
	PrewarmingPrediction,
	SessionPrewarmingStrategy,
	PrewarmingEffectiveness,
	AdaptedPrewarmingStrategy,
	BehaviorPattern,
	FeedbackPattern,
	BehaviorAdjustment,
	FailurePattern,
	FailureAvoidanceStrategy,
	OptimizedWorkflow,
	SpeedThoroughnessBalance,
	ConsultationValue
} from './modules/memory-interfaces';

/**
 * Empirically optimized thresholds based on similarity clustering analysis
 * Version 1.1.0 findings: Content clusters at 14%, 37%, and 62% similarity ranges
 */
const OPTIMIZED_MEMORY_THRESHOLDS = {
	// Search method defaults
	search_tiered: 0.15,        // Multi-tier searches with tier boosting
	search_knowledge: 0.20,     // Standard knowledge searches  
	search_behavioral: 0.10,    // Behavioral pattern searches
	
	// Context-specific thresholds
	exploration: 0.05,          // Maximum discovery mode
	discovery: 0.10,            // High recall searches
	balanced: 0.20,             // Balanced precision/recall
	focused: 0.35,              // Higher precision searches
	precise: 0.40,              // Maximum precision mode
	
	// Specialized searches
	claim_verification: 0.25,   // Claim and evidence searches
	pattern_analysis: 0.15,     // Pattern and workflow analysis
	debugging: 0.08,            // Error and issue investigation
};

export class MnemosyneMemorySystem {
	private delegator: Delegator;
	
	// Core modules (direct access when needed)
	private coreMemory: PersistentCoreMemoryOperations;
	private behavioralRules: BehavioralRuleOperations;
	
	// Foundation tracking
	private currentFoundation?: { version: string; timestamp: string };

	constructor(config: { persistentMemoryManager?: PersistentCoreMemoryOperations } = {}) {
		// Initialize all modular components
		// CRITICAL FIX: Use properly initialized vector store instead of creating new one with empty env
		let vectorStore: CloudflareVectorStore;

		if (config.persistentMemoryManager) {
			this.coreMemory = config.persistentMemoryManager;
		} else {
			// Try to get properly initialized vector store from global scope
			if ((globalThis as any).getVectorStoreInstance) {
				try {
					vectorStore = (globalThis as any).getVectorStoreInstance();
				} catch (error) {
					// ADR-001 COMPLIANCE: Fail-closed behavior - do not create empty env fallback
					const isDevOrTest = (globalThis as any).FORCE_DEV_MODE || (globalThis as any).NODE_ENV === 'test';
					if (isDevOrTest) {
						vectorStore = new CloudflareVectorStore({ env: {} as any });
					} else {
						throw new Error('Production vector store initialization failed - cannot proceed with volatile storage');
					}
				}
			} else {
				// Fallback: Try to get Worker environment from global scope
				const workerEnv = (globalThis as any).getWorkerEnvironment?.();
				if (workerEnv && workerEnv.VECTORIZE_INDEX && workerEnv.AI) {
					vectorStore = new CloudflareVectorStore({ env: workerEnv });
				} else {
					// ADR-001 COMPLIANCE: Fail-closed behavior - do not create empty env fallback
					const isDevOrTest = (globalThis as any).FORCE_DEV_MODE || (globalThis as any).NODE_ENV === 'test';
					if (isDevOrTest) {
						vectorStore = new CloudflareVectorStore({ env: {} as any });
					} else {
						throw new Error('Production vector store initialization failed - cannot proceed with volatile storage');
					}
				}
			}
			
			this.coreMemory = new PersistentCoreMemoryManager(vectorStore, (globalThis as any).MEMORY_KV);
		}
		this.behavioralRules = new BehavioralRuleManager();


		// Initialize specialized modules
		const vectorPrewarming = new VectorPrewarmingManager();
		const checkpointManager = new CheckpointManager();
		const workflowAnalysis = new WorkflowAnalysisManager();
		const workflowIntegration = new WorkflowIntegrationManager();
		const prewarmingStrategy = new PrewarmingManager();
		const patternAnalysis = new PatternAnalysisManager();
		const contextQuery = new ContextQueryManager();
		const behavioralPatterns = new BehavioralPatternLearner();

		// Set up delegation targets
		const delegationTargets: DelegationTarget[] = [
			{
				name: 'vectorPrewarming',
				module: vectorPrewarming,
				methods: autodiscoverMethods(vectorPrewarming)
			},
			{
				name: 'checkpointManager',
				module: checkpointManager,
				methods: autodiscoverMethods(checkpointManager)
			},
			{
				name: 'workflowAnalysis',
				module: workflowAnalysis,
				methods: autodiscoverMethods(workflowAnalysis)
			},
			{
				name: 'workflowIntegration',
				module: workflowIntegration,
				methods: autodiscoverMethods(workflowIntegration)
			},
			{
				name: 'prewarmingStrategy',
				module: prewarmingStrategy,
				methods: autodiscoverMethods(prewarmingStrategy)
			},
			{
				name: 'patternAnalysis',
				module: patternAnalysis,
				methods: autodiscoverMethods(patternAnalysis)
			},
			{
				name: 'contextQuery',
				module: contextQuery,
				methods: autodiscoverMethods(contextQuery)
			},
			{
				name: 'behavioralPatterns',
				module: behavioralPatterns,
				methods: autodiscoverMethods(behavioralPatterns)
			}
		];

		// Initialize delegator
		this.delegator = new Delegator({
			targets: delegationTargets,
			fallbackHandler: this.handleFallback.bind(this)
		});

		// Foundation will be applied by agent.ts - no hardcoded initialization
	}

	private handleFallback(methodName: string, args: any[]): any {
		throw new Error(`Method '${methodName}' not found in any delegation target. Available methods: ${this.delegator.getAvailableMethods().join(', ')}`);
	}

	// =============================================================================
	// CORE MEMORY OPERATIONS (Direct delegation to maintain interface compatibility)
	// =============================================================================

	// Core memory operations - direct delegation
	async logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high'): Promise<string> {
		return this.coreMemory.logClaim(claim, context, source, confidence);
	}

	async verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean> {
		return this.coreMemory.verifyClaim(claimId, success, evidence, notes);
	}

	async getUnverifiedClaims(): Promise<MemoryEntry[]> {
		return await this.coreMemory.getUnverifiedClaims();
	}

	async recordViolation(ruleId: string, context: string, correctionPlan?: string, severity?: 'minor' | 'moderate' | 'major' | 'critical'): Promise<void> {
		return this.behavioralRules.recordViolation(ruleId, context, correctionPlan, severity);
	}

	// Vector Prewarming Operations - delegate to vector prewarming module
	analyzeQueryForVectorPrewarming(query: string): any {
		return this.delegator.delegateSync('analyzeQueryForVectorNeeds', query);
	}

	generateVectorPrewarmingStrategy(query: string): any {
		// First analyze the query to get VectorAnalysis
		const analysis = this.delegator.delegateSync('analyzeQueryForVectorNeeds', query);
		// Then create strategy from the analysis
		return this.delegator.delegateSync('createPrewarmingStrategy', analysis);
	}

	startVectorPrewarming(query: string): void {
		this.delegator.delegateSync('startPrewarmingSync', query);
	}

	getVectorPrewarmingStatus(): any {
		return this.delegator.delegateSync('getPrewarmingStatusSync');
	}

	recordQueryPattern(pattern: string, concepts: string[]): void {
		this.delegator.delegateSync('recordQueryPatternSync', pattern, concepts);
	}

	generateAdaptivePrewarmingStrategy(query: string): any {
		return this.delegator.delegateSync('generateAdaptivePrewarmingStrategySync', query);
	}

	recordUserBehaviorPattern(pattern: Record<string, unknown>): void {
		this.delegator.delegateSync('recordUserBehaviorPatternSync', pattern);
	}

	prioritizeVectorPrewarming(context: Record<string, unknown>): any {
		const queryString = context.query as string || 'default query';
		return this.delegator.delegateSync('prioritizeVectorPrewarmingSync', queryString);
	}

	// Workflow Integration Operations - delegate to prewarming module  
	createSessionPrewarmingStrategy(sessionContext: Record<string, unknown>): any {
		return this.delegator.delegateSync('createPrewarmingSessionStrategy', sessionContext);
	}

	recordPrewarmingEffectiveness(attempt: Record<string, unknown>): void {
		this.delegator.delegate('evaluatePrewarmingEffectiveness', attempt);
	}

	// Memory Management Operations
	async storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[], testing?: boolean): Promise<string> {
		const enhancedMetadata = {
			...(metadata || {}),
			...(testing && { testing: true })
		};
		return this.delegator.delegate('storeKnowledge', content, enhancedMetadata, tags, testing);
	}

	async storeMemory(entry: MemoryEntry, testing?: boolean): Promise<void> {
		if (testing) {
			entry.context = { ...(entry.context || {}), testing: true };
		}
		await this.coreMemory.storeMemory(entry, testing);
	}

	/**
	 * Enhanced memory storage with causality tracking and temporal metadata
	 * Foundation v1.7.1+ feature for advanced memory systems
	 */
	async storeEnhancedMemory(
		entry: Omit<EnhancedMemoryEntry, "id" | "temporal" | "timestamp" | "systemMetadata">,
		dependencies: string[] = [],
		causedBy: string[] = [],
		testing?: boolean
	): Promise<EnhancedMemoryEntry> {
		// Generate enhanced temporal metadata with causality
		const temporal = TemporalUtils.createTemporalMetadata();
		const causalContext = CausalityAnalyzer.generateCausalContext(dependencies, causedBy);
		
		const enhancedTemporal: EnhancedTemporalMetadata = {
			...temporal,
			causalContext,
			correlationId: crypto.randomUUID(),
			sessionId: (globalThis as any).sessionId || crypto.randomUUID(),
			traceId: (globalThis as any).traceId || crypto.randomUUID()
		};

		const enhancedEntry: EnhancedMemoryEntry = {
			...entry,
			id: crypto.randomUUID(),
			temporal: enhancedTemporal,
			timestamp: TemporalUtils.microsToISOString(enhancedTemporal.serverTimestamp),
			systemMetadata: {
				tier: "intermediate", // Default tier, can be adjusted by importance
				importance: entry.confidence || 0.5,
				accessCount: 0,
				lastAccessed: enhancedTemporal.serverTimestamp,
				relationshipCount: dependencies.length + causedBy.length,
				storageBackend: "both", // Store in both KV and vector for full persistence
				createdAt: enhancedTemporal.serverTimestamp,
				lastModified: enhancedTemporal.serverTimestamp,
				accessHistory: []
			}
		};

		// Store in both enhanced format and legacy format for compatibility
		const legacyEntry: MemoryEntry = {
			id: enhancedEntry.id,
			timestamp: enhancedEntry.timestamp,
			type: "pattern", // Default type for enhanced entries
			content: enhancedEntry.content,
			status: "verified",
			evidence: enhancedEntry.evidence.join("; "),
			context: {
				enhanced: true,
				temporal: enhancedTemporal,
				...(testing && { testing: true })
			}
		};

		await this.coreMemory.storeMemory(legacyEntry, testing);
		return enhancedEntry;
	}

	/**
	 * Analyze causal relationships between memory entries
	 * Foundation v1.7.1+ feature for advanced memory analysis
	 */
	async analyzeCausality(entryId1: string, entryId2: string): Promise<{
		relationship: any; // CausalRelationship type
		confidence: number;
		evidence: string[];
	}> {
		// Retrieve enhanced temporal metadata from entries
		const entry1Data = await this.coreMemory.searchMemory(entryId1, true);
		const entry2Data = await this.coreMemory.searchMemory(entryId2, true);
		
		if (!entry1Data.length || !entry2Data.length) {
			throw new Error(`Memory entries not found: ${entryId1}, ${entryId2}`);
		}

		const entry1Enhanced = entry1Data[0]?.context?.temporal as EnhancedTemporalMetadata;
		const entry2Enhanced = entry2Data[0]?.context?.temporal as EnhancedTemporalMetadata;

		if (!entry1Enhanced || !entry2Enhanced) {
			throw new Error("Entries do not contain enhanced temporal metadata for causality analysis");
		}

		// Perform causality analysis
		const relationship = CausalityAnalyzer.analyzeCausalRelationship(entry1Enhanced, entry2Enhanced);
		
		return {
			relationship: relationship.type,
			confidence: relationship.confidence,
			evidence: relationship.evidence
		};
	}

	async searchMemory(query: string, includeTestingData: boolean = false): Promise<MemoryEntry[]> {
		return await this.coreMemory.searchMemory(query, includeTestingData) as any;
	}

	async getMemoryStats(): Promise<any> {
		return await this.coreMemory.getMemoryStats();
	}

	async exportMemory(includeTestingData: boolean = false): Promise<MemoryEntry[]> {
		return await this.coreMemory.exportMemory(includeTestingData) as any;
	}

	// =============================================================================
	// BEHAVIORAL RULE OPERATIONS (Direct delegation)
	// =============================================================================

	addBehavioralRule(rule: BehavioralRule): void {
		return this.behavioralRules.addBehavioralRule(rule);
	}

	getBehavioralRules(): BehavioralRule[] {
		// Get rules synchronously for interface compatibility
		return this.behavioralRules.getFoundationRules();
	}

	checkRuleCompliance(ruleId: string, action: string): boolean {
		return this.behavioralRules.checkRuleCompliance(ruleId, action);
	}

	recordRuleViolation(ruleId: string, context: string): void {
		return this.behavioralRules.recordRuleViolation(ruleId, context);
	}

	getBehavioralStatus(): { 
		activeRules: number; 
		recentViolations: Array<{ rule: string; context: string; timestamp: number }>;
		unverifiedClaims: number;
	} {
		const status = this.behavioralRules.getBehavioralStatus();
		const unverifiedClaims = this.coreMemory.getUnverifiedClaimsCount();
		return {
			...status,
			unverifiedClaims
		};
	}

	getFoundationRules(): BehavioralRule[] {
		return this.behavioralRules.getFoundationRules();
	}

	getFoundationInfo(): { version?: string; timestamp?: string; rulesCount: number } {
		const foundationRules = this.behavioralRules.getFoundationRules();
		
		const result: { version?: string; timestamp?: string; rulesCount: number } = {
			rulesCount: foundationRules.length
		};
		
		if (this.currentFoundation?.version) {
			result.version = this.currentFoundation.version;
		}
		
		if (this.currentFoundation?.timestamp) {
			result.timestamp = this.currentFoundation.timestamp;
		}
		
		return result;
	}

	updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): void {
		this.behavioralRules.updateFoundation(migration, options);
		
		// Set foundation metadata after successful update
		if (migration.version && typeof migration.version === 'string') {
			this.currentFoundation = {
				version: migration.version,
				timestamp: new Date().toISOString()
			};
		}
	}

	setFoundationMetadata(metadata: { version: string; timestamp: string }): void {
		this.currentFoundation = {
			version: metadata.version,
			timestamp: metadata.timestamp
		};
	}

	// Public API Methods for Tests
	recordSuccessfulPattern(interaction: Record<string, unknown>): void {
		const feedbackPattern: FeedbackPattern = {
			userFeedback: 'positive',
			behaviorContext: interaction.context as string || 'general',
			adjustment: 'improve-accuracy'
		};
		this.delegator.delegateSync('processFeedbackPattern', feedbackPattern);
	}

	processFeedbackPattern(feedback: Record<string, unknown>): void {
		const feedbackPattern: FeedbackPattern = {
			userFeedback: feedback.feedback as string || 'neutral',
			behaviorContext: feedback.context as string || 'general',
			adjustment: feedback.adjustment as string || 'maintain-current'
		};
		this.delegator.delegateSync('processFeedbackPattern', feedbackPattern);
	}

	recordFailurePattern(pattern: Record<string, unknown>): void {
		// Pass pattern directly without transformation
		this.delegator.delegateSync('recordFailurePattern', pattern);
	}

	recordConsultationValue(consultationValue: Record<string, unknown>): void {
		this.delegator.delegateSync('recordConsultationValue', consultationValue);
	}

	getBehaviorAdjustments(): any {
		return this.delegator.delegateSync('getBehaviorAdjustments');
	}

	getFailureAvoidanceStrategies(): any {
		return this.delegator.delegateSync('getFailureAvoidanceStrategies');
	}

	getOptimizedConsultationFrequency(): any {
		return this.delegator.delegateSync('getOptimizedConsultationFrequency');
	}	// =============================================================================
	// DELEGATED OPERATIONS (Automatic delegation through Delegator)
	// =============================================================================

	async checkPrewarmingStatus(): Promise<VectorPrewarmingStatus> {
		return this.delegator.delegate('checkPrewarmingStatus');
	}

	async pauseVectorPrewarming(): Promise<VectorPrewarmingStatus> {
		return this.delegator.delegate('pauseVectorPrewarming');
	}

	async resumeVectorPrewarming(): Promise<VectorPrewarmingStatus> {
		return this.delegator.delegate('resumeVectorPrewarming');
	}

	async getVectorAnalysis(): Promise<VectorAnalysis> {
		return this.delegator.delegate('getVectorAnalysis');
	}

	async adaptPrewarmingStrategy(userBehavior: UserBehaviorPattern): Promise<AdaptivePrewarmingStrategy> {
		return this.delegator.delegate('adaptPrewarmingStrategy', userBehavior);
	}

	// Checkpoint Management
	async createMemoryConsultationCheckpoint(stage: string, context: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<WorkflowCheckpoint> {
		return this.delegator.delegate('createMemoryConsultationCheckpoint', stage, context, priority);
	}

	async triggerMemorySearchFromCheckpoint(checkpoint: WorkflowCheckpoint): Promise<TriggeredMemorySearch[]> {
		return this.delegator.delegate('triggerMemorySearchFromCheckpoint', checkpoint);
	}

	createWorkflowCheckpoint(stage: string, context: Record<string, unknown>, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): WorkflowCheckpoint {
		return this.delegator.getTarget('createWorkflowCheckpoint').createWorkflowCheckpoint(stage, context, priority);
	}

	getTriggeredMemorySearches(checkpointId: string): TriggeredMemorySearch[] {
		return this.delegator.getTarget('getTriggeredMemorySearches').getTriggeredMemorySearches(checkpointId);
	}

	trackWorkflowExecution(workflowEvents: Array<Record<string, unknown>>): void {
		return this.delegator.getTarget('trackWorkflowExecution').trackWorkflowExecution(workflowEvents);
	}

	recordUserInteraction(query: string, context: Record<string, unknown>): void {
		// Delegate to pattern analysis for successful pattern recording
		this.delegator.getTarget('recordSuccessfulPattern').recordSuccessfulPattern({ query, context, timestamp: Date.now() });
	}

	// Pattern Analysis
	async learnFromUserFeedback(feedback: string, behaviorContext: string): Promise<FeedbackPattern> {
		// Convert feedback to the proper format and delegate to pattern analysis
		const feedbackRecord = { feedback, context: behaviorContext, timestamp: Date.now() };
		this.delegator.getTarget('processFeedbackPattern').processFeedbackPattern(feedbackRecord);
		
		return {
			userFeedback: feedback,
			behaviorContext: behaviorContext,
			adjustment: 'improve-accuracy'
		};
	}

	async adjustBehaviorBasedOnPattern(pattern: FeedbackPattern): Promise<BehaviorAdjustment> {
		return this.delegator.getTarget('getBehaviorAdjustments').getBehaviorAdjustments();
	}

	async identifyFailurePatterns(interactionHistory: Array<Record<string, unknown>>): Promise<FailurePattern[]> {
		// Record multiple failure patterns and return analysis
		interactionHistory.forEach(record => {
			this.delegator.getTarget('recordFailurePattern').recordFailurePattern(record);
		});
		
		return [{
			pattern: 'interaction_failure',
			indicators: ['low_confidence', 'multiple_attempts'],
			consequences: ['decreased_efficiency', 'user_frustration'],
			frequency: interactionHistory.length
		}];
	}

	async createFailureAvoidanceStrategy(pattern: FailurePattern): Promise<FailureAvoidanceStrategy> {
		return this.delegator.getTarget('getFailureAvoidanceStrategies').getFailureAvoidanceStrategies()[0] || {
			targetPattern: pattern.pattern,
			preventionMethods: ['systematic-verification', 'evidence-gathering'],
			earlyWarningSignals: ['confidence_drop', 'repeated_failures']
		};
	}

	// Workflow Analysis
	async optimizeWorkflowIntegration(efficiencyData: WorkflowEfficiencyAnalysis[]): Promise<OptimizedWorkflow> {
		return this.delegator.delegate('optimizeWorkflow', efficiencyData);
	}

	async balanceSpeedVsThoroughness(performanceMetrics: Record<string, unknown>): Promise<SpeedThoroughnessBalance> {
		return this.delegator.delegate('balanceSpeedVsThoroughness', performanceMetrics);
	}

	async measureConsultationValue(consultationData: Record<string, unknown>): Promise<ConsultationValue> {
		// Stub implementation for now
		return {
			consulted: true,
			valueAdded: 0.8,
			responseTime: 150
		};
	}

	async optimizeConsultationFrequency(valueData: ConsultationValue[]): Promise<{ recommendedFrequency: string; reasoning: string }> {
		// Stub implementation for now
		return {
			recommendedFrequency: 'moderate',
			reasoning: 'Balanced approach based on consultation value analysis'
		};
	}

	// Prewarming Strategy
	generatePrewarmingPredictions(userContext?: Record<string, unknown>): any {
		return this.delegator.delegateSync('generatePrewarmingPredictions', userContext);
	}

	analyzeWorkflowEfficiency(workflowId: string): WorkflowEfficiencyAnalysis {
		return this.delegator.delegateSync('analyzeWorkflowEfficiency', workflowId);
	}

	// =============================================================================
	// CONTEXT & QUERY OPERATIONS
	// =============================================================================

	logContextQuery(query: string, context?: Record<string, unknown>): string {
		return this.delegator.delegateSync('logContextQuery', query, context);
	}

	getContextLogs(): ContextQuery[] {
		return this.delegator.delegateSync('getContextLogs');
	}

	getRecommendedMemorySearches(context: string): string[] {
		return this.delegator.delegateSync('getRecommendedMemorySearches', context);
	}

	generateMemorySearchRecommendations(userQuery: string, conversationContext: Record<string, unknown>): string[] {
		return this.delegator.getTarget('generateMemorySearchRecommendations').generateMemorySearchRecommendations(userQuery, conversationContext);
	}

	getProactiveMemoryRecommendations(interactionContext: Record<string, unknown>): string[] {
		return this.delegator.getTarget('getProactiveMemoryRecommendations').getProactiveMemoryRecommendations(interactionContext);
	}

	// =============================================================================
	// BEHAVIORAL PATTERN LEARNING
	// =============================================================================

	getLearnedBehaviorPatterns(): BehaviorPattern[] {
		return this.delegator.delegateSync('getLearnedBehaviorPatterns');
	}

	getAdaptedPrewarmingStrategy(): { preferredMethods: string[]; confidenceThresholds: number[]; successRate?: number } {
		return this.delegator.getTarget('getAdaptedPrewarmingStrategy').getAdaptedPrewarmingStrategy();
	}

	createOptimizedWorkflow(memoryInsights: Record<string, unknown>): { checkpointStrategy: string; prewarmingIntensity: string; responseStyle: string } {
		const workflow = this.delegator.delegateSync('optimizeWorkflow', memoryInsights);
		
		// Add responseStyle based on preference
		const responsePatterns = (memoryInsights as any).responsePatterns || {};
		const preferredStyle = (memoryInsights as any).preferredInteractionStyle;
		
		let responseStyle = 'balanced-explanations';
		if (preferredStyle === 'detailed-explanations' || responsePatterns.preferredDepth === 'thorough') {
			responseStyle = 'detailed-explanations';
		} else if (responsePatterns.preferredDepth === 'brief') {
			responseStyle = 'concise-explanations';
		}
		
		return {
			...workflow,
			responseStyle
		};
	}

	determineSpeedThoroughnessBalance(context: Record<string, unknown>): { approach: string; reasoning: string } {
		const result = this.delegator.delegateSync('balanceSpeedVsThoroughness', context);
		return {
			...result,
			reasoning: `Determined ${result.approach} approach based on urgency: ${context.urgency}, complexity: ${context.complexity}`
		};
	}

	// =============================================================================
	// INTERNAL METHODS
	// =============================================================================

	private async getHistoricalData(): Promise<any> {
		return this.coreMemory.exportMemory();
	}

	private initializeFoundation(): void {
		// Initialize foundation behavioral rules
		const foundationRules: BehavioralRule[] = [
			{
				id: 'no-unverified-claims',
				rule: 'Never claim something is "fixed" without verification',
				description: 'Ensure all claims are backed by evidence or proper verification',
				priority: 'critical',
				violations: 0
			},
			{
				id: 'systematic-approach',
				rule: 'Break down complex problems systematically',
				description: 'Use systematic approaches to solve complex problems',
				priority: 'high',
				violations: 0
			},
			{
				id: 'consult-memory-before-response',
				rule: 'Always consult memory before responding to user queries',
				description: 'Check relevant memories and patterns before providing responses',
				priority: 'critical',
				violations: 0,
				examples: [
					'✅ User asks about debugging → Check memory for similar debugging patterns',
					'❌ User asks about React → Respond immediately without checking React-related memories'
				]
			}
		];

		foundationRules.forEach(rule => this.behavioralRules.addBehavioralRule(rule));
		
		// Foundation metadata will be set by Foundation migration during initialization
	}

	// =============================================================================
	// DELEGATOR INTROSPECTION
	// =============================================================================

	getDelegationStats() {
		return this.delegator.getDelegationStats();
	}

	getAvailableMethods(): string[] {
		return this.delegator.getAvailableMethods();
	}

	/**
	 * Export complete memory system state for analysis, debugging, or persistence
	 */
	async exportState(includeTestingData: boolean = false): Promise<any> {
		const memoryData = await this.coreMemory.exportMemory(includeTestingData);
		const rules = await this.behavioralRules.getBehavioralRules();
		const patterns = await this.behavioralRules.analyzePatterns();
		
		// Extract claims, violations, and patterns from the proper data structure
		const memories = memoryData.memories || [];
		const claims = Object.fromEntries(
			memories.filter(([id, memory]: [string, any]) => memory.type === 'claim')
		);
		const violations = {}; // Would need to implement violation tracking
		const behavioralPatterns = Object.fromEntries(
			memories.filter(([id, memory]: [string, any]) => memory.type === 'pattern')
		);
		
		return {
			// Original structure for backward compatibility
			entries: memoryData.memories || [],
			rules: rules || [],
			patterns: patterns || [],
			
			// Proper structure that matches memory_export_state expectations
			claims,
			violations,
			behavioralPatterns,
			
			// Metadata
			timestamp: new Date().toISOString(),
			testingDataIncluded: includeTestingData,
			delegationStats: this.delegator.getDelegationStats(),
			availableMethods: this.delegator.getAvailableMethods(),
			memoryStats: memoryData.stats
		};
	}

	/**
	 * Restore memory state from encoded snapshots in vector store
	 * 
	 * This method searches for specific snapshot data in the vector store and
	 * reconstructs the exact behavioral memory state including claims, rules, and verification status.
	 * 
	 * @returns Restoration results and statistics
	 */
	async restoreFromSnapshots(): Promise<{
		success: boolean;
		restored: { claims: number; rules: number; snapshots: number };
		summary: string[];
		errors: string[];
	}> {
		const restored = { claims: 0, rules: 0, snapshots: 0 };
		const summary: string[] = [];
		const errors: string[] = [];

		try {
			// Search for snapshot data
			const snapshotResults = await this.delegator.delegate('searchKnowledge', 'MNEMOSYNE_STATE_SNAPSHOT MNEMOSYNE_BEHAVIORAL_RESTORATION_DATA', 10, 0.1);
			const tieredSnapshots = await this.delegator.delegate('searchTiered', 'MNEMOSYNE_STATE_SNAPSHOT behavioral memory export', 10, 0.1, 'all');

			// Process knowledge snapshots
			for (const result of snapshotResults.results || []) {
				if (result.content.includes('MNEMOSYNE_BEHAVIORAL_RESTORATION_DATA')) {
					try {
						// Extract JSON data from the content
						const jsonMatch = result.content.match(/\[{.*}\]/s);
						if (jsonMatch) {
							const claimsData = JSON.parse(jsonMatch[0]);
							
							// Restore each claim with exact state
							for (const claimData of claimsData) {
								const restoredEntry: MemoryEntry = {
									id: claimData.id,
									timestamp: claimData.timestamp,
									type: claimData.type,
									content: claimData.content,
									status: claimData.status,
									context: claimData.context,
									...(claimData.evidence && { evidence: claimData.evidence })
								};
								
								this.storeMemory(restoredEntry, false);
								restored.claims++;
							}
							
							restored.snapshots++;
							summary.push(`Restored ${claimsData.length} behavioral claims from snapshot`);
						}
					} catch (error) {
						errors.push(`Failed to parse behavioral restoration data: ${error instanceof Error ? error.message : 'Unknown error'}`);
					}
				}
			}

			// Process tiered snapshots for rule information
			for (const result of tieredSnapshots.results || []) {
				if (result.content.includes('MNEMOSYNE_STATE_SNAPSHOT')) {
					restored.snapshots++;
					
					// Extract rule count from snapshot summary
					const rulesMatch = result.content.match(/RULES: (\d+) foundation rules/);
					if (rulesMatch) {
						const expectedRules = parseInt(rulesMatch[1]);
						const currentRules = await this.behavioralRules.getBehavioralRules();
						
						if (currentRules.length < expectedRules) {
							// Restore foundation rules
							try {
								const { foundationMigrationV1_2 } = await import('../migrations/foundation.js');
								if (foundationMigrationV1_2) {
									foundationMigrationV1_2.coreRules.forEach(rule => {
										this.addBehavioralRule({
											id: rule.id,
											rule: rule.rule,
											description: rule.description,
											priority: rule.priority,
											violations: 0
										});
										restored.rules++;
									});
								}
							} catch (error) {
								errors.push(`Failed to restore foundation rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
							}
						}
					}
					
					summary.push(`Processed snapshot: ${result.content.substring(0, 100)}...`);
				}
			}

			return {
				success: restored.snapshots > 0,
				restored,
				summary,
				errors
			};

		} catch (error) {
			errors.push(`Critical snapshot restoration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
			return {
				success: false,
				restored,
				summary,
				errors
			};
		}
	}

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
	async backfillFromVectorStore(options: {
		maxItems?: number;
		minSimilarity?: number;
		preserveTimestamps?: boolean;
		restoreFoundation?: boolean;
	} = {}): Promise<{
		success: boolean;
		restored: {
			knowledge: number;
			claims: number;
			rules: number;
		};
		summary: string[];
		errors: string[];
	}> {
		const {
			maxItems = 1000,
			minSimilarity = 0.1,
			preserveTimestamps = true,
			restoreFoundation = true
		} = options;

		const restored = { knowledge: 0, claims: 0, rules: 0 };
		const summary: string[] = [];
		const errors: string[] = [];

		try {
			// 1. Check if we need backfill (empty behavioral memory)
				const currentMemory = await this.coreMemory.getMemories();
			const currentRules = await this.behavioralRules.getBehavioralRules();
			
			const memoryCount = Array.isArray(currentMemory) ? currentMemory.length : 0;
			const ruleCount = currentRules.length;
			
			summary.push(`Current state: ${memoryCount} memories, ${ruleCount} rules`);

			// 2. PRIORITY: Try snapshot-based restoration first
			if (memoryCount === 0 || ruleCount < 3) {
				summary.push(`Attempting snapshot-based restoration...`);
				const snapshotResult = await this.restoreFromSnapshots();
				
				if (snapshotResult.success) {
					restored.claims += snapshotResult.restored.claims;
					restored.rules += snapshotResult.restored.rules;
					summary.push(`✅ Snapshot restoration: ${snapshotResult.restored.claims} claims, ${snapshotResult.restored.rules} rules`);
					summary.push(...snapshotResult.summary);
					
					// If snapshot restoration was successful, we may not need general backfill
					const updatedMemory = await this.coreMemory.getMemories();
					if (Array.isArray(updatedMemory) && updatedMemory.length > 0) {
						summary.push(`Snapshot restoration complete - skipping general backfill`);
						return {
							success: true,
							restored,
							summary,
							errors: [...errors, ...snapshotResult.errors]
						};
					}
				} else {
					summary.push(`⚠️ No snapshots found - proceeding with general backfill`);
					errors.push(...snapshotResult.errors);
				}
			}

			// 3. Restore foundation rules if needed and requested (fallback)
			if (restoreFoundation && ruleCount < 3) {
				try {
					const { foundationMigrationV1_2 } = await import('../migrations/foundation.js');
					if (foundationMigrationV1_2) {
						foundationMigrationV1_2.coreRules.forEach(rule => {
							this.addBehavioralRule({
								id: rule.id,
								rule: rule.rule,
								description: rule.description,
								priority: rule.priority,
								violations: 0
							});
							restored.rules++;
						});
						summary.push(`Restored ${foundationMigrationV1_2.coreRules.length} foundation rules`);
					}
				} catch (error) {
					errors.push(`Failed to restore foundation: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			// 3. Perform broad semantic search to find existing vector store content
			const searchTerms = [
				"memory knowledge information data",
				"claims assumptions verification evidence", 
				"behavioral rules patterns violations",
				"context queries interactions workflow",
				"technical implementation code debugging"
			];

			let totalRestored = 0;
			for (const searchTerm of searchTerms) {
				if (totalRestored >= maxItems) break;

				try {
					// Search both knowledge and tiered memory using delegated methods
					const knowledgeResults = await this.delegator.delegate('searchKnowledge', searchTerm, Math.min(50, maxItems - totalRestored), minSimilarity);
					const tieredResults = await this.delegator.delegate('searchTiered', searchTerm, Math.min(50, maxItems - totalRestored), minSimilarity, 'all');

					// Process knowledge results
					for (const result of knowledgeResults.results || []) {
						if (totalRestored >= maxItems) break;
						
						// Check if this knowledge is already in behavioral memory
						const alreadyExists = Array.isArray(currentMemory)
							? currentMemory.some((mem: MemoryEntry) => mem.content && mem.content.includes(result.content.substring(0, 100)))
							: false;

						if (!alreadyExists) {
							// Reconstruct as knowledge/context entry
							const memoryId = `backfill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
							const reconstructedMemory: MemoryEntry = {
								id: memoryId,
								timestamp: preserveTimestamps && result.metadata?.timestamp 
									? result.metadata.timestamp 
									: new Date().toISOString(),
								type: 'assumption', // Safe default type for recovered content
								content: `[BACKFILLED] ${result.content}`,
								status: 'pending',
								context: {
									backfilled: true,
									originalScore: result.score,
									backfillTimestamp: new Date().toISOString(),
									...result.metadata
								}
							};

							this.storeMemory(reconstructedMemory, false);
							restored.knowledge++;
							totalRestored++;
						}
					}

					// Process tiered results similarly
					for (const result of tieredResults.results || []) {
						if (totalRestored >= maxItems) break;
						
						const alreadyExists = Array.from(currentMemory.values()).some((mem: MemoryEntry) => 
							mem.content && mem.content.includes(result.content.substring(0, 100))
						);

						if (!alreadyExists) {
							const memoryId = `backfill_tier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
							const reconstructedMemory: MemoryEntry = {
								id: memoryId,
								timestamp: preserveTimestamps && result.metadata?.timestamp 
									? result.metadata.timestamp 
									: new Date().toISOString(),
								type: 'assumption',
								content: `[BACKFILLED FROM ${result.tier?.toUpperCase() || 'TIER'}] ${result.content}`,
								status: 'pending',
								context: {
									backfilled: true,
									tier: result.tier,
									originalScore: result.score,
									backfillTimestamp: new Date().toISOString(),
									...result.metadata
								}
							};

							this.storeMemory(reconstructedMemory, false);
							restored.knowledge++;
							totalRestored++;
						}
					}

				} catch (error) {
					errors.push(`Error searching for "${searchTerm}": ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			summary.push(`Backfilled ${totalRestored} items from vector store`);
			summary.push(`Total restored: ${restored.knowledge} knowledge, ${restored.claims} claims, ${restored.rules} rules`);

			// 4. Log the backfill operation as a memory entry
			const backfillSummary = `Memory backfill completed: restored ${totalRestored} items from vector store. Foundation rules: ${restored.rules}, Knowledge items: ${restored.knowledge}`;
			await this.logClaim(backfillSummary, {
				backfillOperation: true,
				restoredCounts: restored,
				timestamp: new Date().toISOString()
			}, 'vector store recovery', 'medium');

			return {
				success: errors.length === 0 || totalRestored > 0,
				restored,
				summary,
				errors
			};

		} catch (error) {
			errors.push(`Critical backfill error: ${error instanceof Error ? error.message : 'Unknown error'}`);
			return {
				success: false,
				restored,
				summary,
				errors
			};
		}
	}

	// Search Methods for Pre-Violation Assessment with Optimized Thresholds
	async searchTiered(query: string, options?: { 
		threshold?: number; 
		limit?: number; 
		tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
		searchType?: 'exploration' | 'discovery' | 'balanced' | 'focused' | 'precise';
	}): Promise<any> {
		const { 
			limit = 8, 
			tierPreference = 'all',
			searchType = 'balanced'
		} = options || {};
		
		// Use optimized threshold if not provided
		const threshold = options?.threshold ?? this.getOptimizedThreshold('search_tiered', query, searchType, limit);
		
		return this.delegator.delegate('searchTiered', query, limit, threshold, tierPreference);
	}

	async searchKnowledge(query: string, options?: { 
		threshold?: number; 
		limit?: number;
		searchType?: 'exploration' | 'discovery' | 'balanced' | 'focused' | 'precise';
	}): Promise<any> {
		const { 
			limit = 8,
			searchType = 'balanced'
		} = options || {};
		
		// Use optimized threshold if not provided
		const threshold = options?.threshold ?? this.getOptimizedThreshold('search_knowledge', query, searchType, limit);
		
		return this.delegator.delegate('searchKnowledge', query, limit, threshold);
	}
	
	/**
	 * Get optimized threshold for memory search operations
	 */
	private getOptimizedThreshold(
		searchMethod: string, 
		query: string, 
		searchType: string = 'balanced', 
		expectedResults: number = 8
	): number {
		// Start with method-specific base threshold
		let baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.balanced;
		
		switch (searchMethod) {
			case 'search_tiered':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.search_tiered;
				break;
			case 'search_knowledge':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.search_knowledge;
				break;
			case 'search_behavioral':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.search_behavioral;
				break;
		}
		
		// Apply search type adjustments
		switch (searchType) {
			case 'exploration':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.exploration;
				break;
			case 'discovery':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.discovery;
				break;
			case 'focused':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.focused;
				break;
			case 'precise':
				baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.precise;
				break;
		}
		
		// Query-based adjustments
		if (query.includes('debug') || query.includes('error') || query.includes('issue') || query.includes('problem')) {
			baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.debugging;
		} else if (query.includes('claim') || query.includes('verify') || query.includes('evidence')) {
			baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.claim_verification;
		} else if (query.includes('pattern') || query.includes('workflow') || query.includes('behavior')) {
			baseThreshold = OPTIMIZED_MEMORY_THRESHOLDS.pattern_analysis;
		}
		
		// Results-based fine-tuning
		if (expectedResults <= 3) {
			baseThreshold += 0.05; // More selective for fewer results
		} else if (expectedResults >= 12) {
			baseThreshold -= 0.05; // More inclusive for more results
		}
		
		// Query complexity adjustments
		if (query.length > 100) {
			baseThreshold -= 0.03; // Complex queries need broader search
		} else if (query.length < 20) {
			baseThreshold += 0.03; // Simple queries can be more precise
		}
		
		// Ensure threshold stays within empirically validated bounds
		return Math.max(0.01, Math.min(0.50, baseThreshold));
	}
}
