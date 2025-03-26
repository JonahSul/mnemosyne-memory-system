/**
 * Mnemosyne Memory System - Delegator-based Architecture
 * 
 * This tool provides external scaffolding for AI cognitive enhancement and behavioral consistency using
 * a clean Delegator pattern for module composition and method routing.
 */

// Core Memory Operations
import { CoreMemoryOperations, CoreMemoryManager } from './modules/core-memory';
import { BehavioralRuleOperations, BehavioralRuleManager } from './modules/behavioral-rules';

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

export class MnemosyneMemorySystem {
	private delegator: Delegator;
	
	// Core modules (direct access when needed)
	private coreMemory: CoreMemoryOperations;
	private behavioralRules: BehavioralRuleOperations;

	constructor() {
		// Initialize all modular components
		this.coreMemory = new CoreMemoryManager();
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

		// Initialize foundational behavioral rules
		this.initializeFoundation();
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

	getUnverifiedClaims(): MemoryEntry[] {
		return this.coreMemory.getUnverifiedClaims();
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
		this.delegator.delegate('evaluatePrewarmingEffectiveness', [attempt]);
	}

	// Memory Management Operations
	async storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[]): Promise<string> {
		return this.delegator.delegate('storeKnowledge', [content, metadata, tags]);
	}

	storeMemory(entry: MemoryEntry): void {
		this.coreMemory.storeMemory(entry);
	}

	searchMemory(query: string): MemoryEntry[] {
		return this.coreMemory.searchMemory(query) as any;
	}

	getMemoryStats(): { total: number; recentEntries: number } {
		return this.coreMemory.getMemoryStats();
	}

	exportMemory(): MemoryEntry[] {
		return this.coreMemory.exportMemory() as any;
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

	updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): void {
		this.behavioralRules.updateFoundation(migration, options);
	}

	// Public API Methods for Tests
	recordSuccessfulPattern(interaction: Record<string, unknown>): void {
		const feedbackPattern: FeedbackPattern = {
			userFeedback: 'positive',
			behaviorContext: interaction.context as string || 'general',
			adjustment: 'improve-accuracy'
		};
		this.delegator.delegateSync('processFeedbackPattern', [feedbackPattern]);
	}

	processFeedbackPattern(feedback: Record<string, unknown>): void {
		const feedbackPattern: FeedbackPattern = {
			userFeedback: feedback.feedback as string || 'neutral',
			behaviorContext: feedback.context as string || 'general',
			adjustment: feedback.adjustment as string || 'maintain-current'
		};
		this.delegator.delegateSync('processFeedbackPattern', [feedbackPattern]);
	}

	recordFailurePattern(pattern: Record<string, unknown>): void {
		// Pass pattern directly without transformation
		this.delegator.delegateSync('recordFailurePattern', pattern);
	}

	recordConsultationValue(consultationValue: Record<string, unknown>): void {
		this.delegator.delegateSync('recordConsultationValue', [consultationValue]);
	}

	getBehaviorAdjustments(): any {
		return this.delegator.delegateSync('getBehaviorAdjustments', []);
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
}
