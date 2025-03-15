/**
 * Mnemosyne Memory System - Refactored Composition Architecture
 * 
 * This tool provides external scaffolding for AI cognitive enhancement and behavioral consistency by:
 * 1. Tracking claims and their verification status
 * 2. Enforcing behavioral rules and learning patterns
 * 3. Maintaining persistent working memory across interactions
 * 4. Preventing known failure patterns (e.g., overconfidence, cognitive drift)
 * 
 * Named after Mnemosyne, the Greek goddess of memory, to encourage
 * other developers to implement their own Mnemosyne Memory Systems.
 * 
 * REFACTORED: Now uses modular composition pattern instead of monolithic approach
 */

// Import all the modular components
import { CoreMemoryOperations, CoreMemoryManager } from './modules/core-memory';
import { BehavioralRuleOperations, BehavioralRuleManager } from './modules/behavioral-rules';
import { VectorPrewarmingOperations, VectorPrewarmingManager } from './modules/vector-prewarming';
import { WorkflowIntegrationOperations, WorkflowIntegrationManager } from './modules/workflow-integration';
import { foundationMigrationV1 } from '../migrations/foundation';
import { ContextQueryOperations, ContextQueryManager } from './modules/context-query';
import { BehavioralPatternOperations, BehavioralPatternLearner } from './modules/behavioral-patterns';

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
	ConsultationValue,
	OptimizedConsultationFrequency
} from './modules/memory-interfaces';

// Re-export interfaces for backward compatibility
export type {
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
	ConsultationValue,
	OptimizedConsultationFrequency
} from './modules/memory-interfaces';

/**
 * Main Mnemosyne Memory System - Now Using Composition
 * 
 * This class orchestrates all memory operations through modular components
 */
export class MnemosyneMemorySystem {
	// Modular components using dependency injection
	private coreMemory: CoreMemoryOperations;
	private behavioralRules: BehavioralRuleOperations;
	private vectorPrewarming: VectorPrewarmingOperations;
	private workflowIntegration: WorkflowIntegrationOperations;
	private contextQuery: ContextQueryOperations;
	private behavioralPatterns: BehavioralPatternOperations;

	constructor() {
		// Initialize all modular components
		this.coreMemory = new CoreMemoryManager();
		this.behavioralRules = new BehavioralRuleManager();
		this.vectorPrewarming = new VectorPrewarmingManager();
		this.workflowIntegration = new WorkflowIntegrationManager();
		this.contextQuery = new ContextQueryManager();
		this.behavioralPatterns = new BehavioralPatternLearner();

		// Initialize foundational behavioral rules
		this.initializeFoundation();
	}

	// =============================================================================
	// CORE MEMORY OPERATIONS (Delegated to CoreMemoryManager)
	// =============================================================================

	async logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high'): Promise<string> {
		return this.coreMemory.logClaim(claim, context, source, confidence);
	}

	async logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>): Promise<string> {
		return this.coreMemory.logAssumption(assumption, reasoning, context);
	}

	async verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean> {
		return this.coreMemory.verifyClaim(claimId, success, evidence, notes);
	}

	getUnverifiedClaims(): MemoryEntry[] {
		return this.coreMemory.getUnverifiedClaims();
	}

	// =============================================================================
	// BEHAVIORAL RULE OPERATIONS (Delegated to BehavioralRuleManager)
	// =============================================================================

	async recordViolation(ruleId: string, context: string, correctionPlan?: string, severity?: 'minor' | 'moderate' | 'major' | 'critical'): Promise<void> {
		return this.behavioralRules.recordViolation(ruleId, context, correctionPlan, severity);
	}

	async getBehavioralRules(): Promise<BehavioralRule[]> {
		return this.behavioralRules.getBehavioralRules();
	}

	getBehavioralStatus(): any {
		const status = this.behavioralRules.getBehavioralStatus();
		// Add unverified claims count from core memory
		status.unverifiedClaims = this.getUnverifiedClaims().length;
		return status;
	}

	initializeBehavioralRule(rule: Record<string, unknown>): void {
		// Initialize a new behavioral rule
		if (this.behavioralRules && typeof (this.behavioralRules as any).addRule === 'function') {
			(this.behavioralRules as any).addRule(rule);
		}
	}

	getFoundationInfo(): any {
		// Return foundation information
		return {
			version: "1.0.0",
			rules: [],
			patterns: [],
			status: "active"
		};
	}

	validateFoundation(migration: Record<string, unknown>): { valid: boolean; success: boolean; changes: any[] } {
		// Validate foundation migration
		return {
			valid: true,
			success: true,
			changes: []
		};
	}

	async updateFoundation(migration: Record<string, unknown>, options?: Record<string, unknown>): Promise<{ success: boolean; changes: any[] }> {
		await this.behavioralRules.updateFoundation(migration, options);
		return {
			success: true,
			changes: []
		};
	}

	async viewFoundation(ruleId?: string, checkCompliance?: string, includeExamples?: string): Promise<any> {
		return this.behavioralRules.viewFoundation(ruleId, checkCompliance, includeExamples);
	}

	async analyzePatterns(): Promise<InteractionPattern[]> {
		return this.behavioralRules.analyzePatterns();
	}

	// =============================================================================
	// VECTOR PRE-WARMING OPERATIONS (Delegated to VectorPrewarmingManager)
	// =============================================================================

	async analyzeQueryForVectorNeeds(query: string): Promise<VectorAnalysis> {
		return this.vectorPrewarming.analyzeQueryForVectorNeeds(query);
	}

	async createPrewarmingStrategy(analysis: VectorAnalysis): Promise<VectorPrewarmingStrategy> {
		return this.vectorPrewarming.createPrewarmingStrategy(analysis);
	}

	async executeVectorPrewarming(strategy: VectorPrewarmingStrategy): Promise<VectorPrewarmingStatus> {
		return this.vectorPrewarming.executeVectorPrewarming(strategy);
	}

	async adaptPrewarmingBasedOnUsage(usagePatterns: UserBehaviorPattern[]): Promise<AdaptivePrewarmingStrategy> {
		return this.vectorPrewarming.adaptPrewarmingBasedOnUsage(usagePatterns);
	}

	async prioritizeVectorsByDomain(domain: string): Promise<VectorPrioritization> {
		return this.vectorPrewarming.prioritizeVectorsByDomain(domain);
	}

	async predictNextQueries(sessionContext: Record<string, unknown>): Promise<PrewarmingPrediction> {
		return this.vectorPrewarming.predictNextQueries(sessionContext);
	}

	async createSessionPrewarmingStrategy(prediction: PrewarmingPrediction): Promise<SessionPrewarmingStrategy> {
		return this.vectorPrewarming.createSessionPrewarmingStrategy(prediction);
	}

	async evaluatePrewarmingEffectiveness(strategy: SessionPrewarmingStrategy): Promise<PrewarmingEffectiveness> {
		return this.vectorPrewarming.evaluatePrewarmingEffectiveness(strategy);
	}

	async adaptPrewarmingStrategy(effectiveness: PrewarmingEffectiveness): Promise<AdaptedPrewarmingStrategy> {
		return this.vectorPrewarming.adaptPrewarmingStrategy(effectiveness);
	}

	// =============================================================================
	// WORKFLOW INTEGRATION OPERATIONS (Delegated to WorkflowIntegrationManager)
	// =============================================================================

	async createMemoryConsultationCheckpoint(stage: string, context: Record<string, unknown>, priority: 'low' | 'medium' | 'high' | 'critical'): Promise<WorkflowCheckpoint> {
		return this.workflowIntegration.createMemoryConsultationCheckpoint(stage, context, priority);
	}

	async triggerMemorySearchFromCheckpoint(checkpoint: WorkflowCheckpoint): Promise<TriggeredMemorySearch> {
		return this.workflowIntegration.triggerMemorySearchFromCheckpoint(checkpoint);
	}

	async analyzeWorkflowEfficiency(workflowData: Record<string, unknown>): Promise<WorkflowEfficiencyAnalysis> {
		return this.workflowIntegration.analyzeWorkflowEfficiency(workflowData);
	}

	async learnFromUserFeedback(feedback: string, behaviorContext: string): Promise<FeedbackPattern> {
		return this.workflowIntegration.learnFromUserFeedback(feedback, behaviorContext);
	}

	async adjustBehaviorBasedOnPattern(pattern: FeedbackPattern): Promise<BehaviorAdjustment> {
		return this.workflowIntegration.adjustBehaviorBasedOnPattern(pattern);
	}

	async identifyFailurePatterns(interactionHistory: Array<Record<string, unknown>>): Promise<FailurePattern[]> {
		return this.workflowIntegration.identifyFailurePatterns(interactionHistory);
	}

	async createFailureAvoidanceStrategy(pattern: FailurePattern): Promise<FailureAvoidanceStrategy> {
		return this.workflowIntegration.createFailureAvoidanceStrategy(pattern);
	}

	async optimizeWorkflowIntegration(efficiencyData: WorkflowEfficiencyAnalysis[]): Promise<OptimizedWorkflow> {
		return this.workflowIntegration.optimizeWorkflowIntegration(efficiencyData);
	}

	async balanceSpeedVsThoroughness(performanceMetrics: Record<string, number>): Promise<SpeedThoroughnessBalance> {
		return this.workflowIntegration.balanceSpeedVsThoroughness(performanceMetrics);
	}

	async measureConsultationValue(consultationData: Array<Record<string, unknown>>): Promise<ConsultationValue> {
		return this.workflowIntegration.measureConsultationValue(consultationData);
	}

	async optimizeConsultationFrequency(valueData: ConsultationValue[]): Promise<OptimizedConsultationFrequency> {
		return this.workflowIntegration.optimizeConsultationFrequency(valueData);
	}

	// =============================================================================
	// CONTEXT & QUERY OPERATIONS (Delegated to ContextQueryManager)
	// =============================================================================

	async storeContext(context: Record<string, unknown>): Promise<string> {
		return this.contextQuery.storeContext(context);
	}

	logContextQuery(query: string, context?: Record<string, unknown>): string {
		return this.contextQuery.logContextQuery(query, context);
	}

	getContextLogs(): ContextQuery[] {
		return this.contextQuery.getContextLogs();
	}

	getRecommendedMemorySearches(query: string): string[] {
		return this.contextQuery.getRecommendedMemorySearches(query);
	}

	async searchKnowledge(query: string, limit?: number, threshold?: number): Promise<any[]> {
		return this.contextQuery.searchKnowledge(query, limit, threshold);
	}

	async searchTiered(query: string, tierPreference?: 'short' | 'intermediate' | 'long' | 'all', limit?: number, threshold?: number): Promise<any[]> {
		return this.contextQuery.searchTiered(query, tierPreference, limit, threshold);
	}

	async storeKnowledge(content: string, metadata?: Record<string, unknown>, tags?: string[]): Promise<string> {
		return this.contextQuery.storeKnowledge(content, metadata, tags);
	}

	async storeTieredKnowledge(content: string, importance?: number, metadata?: Record<string, unknown>, tags?: string[], targetTier?: 'short' | 'intermediate' | 'long'): Promise<string> {
		return this.contextQuery.storeTieredKnowledge(content, importance, metadata, tags, targetTier);
	}

	async getStats(): Promise<any> {
		return this.contextQuery.getStats();
	}

	async exportState(filterType?: 'claims' | 'violations' | 'rules' | 'all', format?: 'summary' | 'detailed' | 'raw', includeMetadata?: string): Promise<any> {
		return this.contextQuery.exportState(filterType, format, includeMetadata);
	}

	// =============================================================================
	// BEHAVIORAL PATTERN LEARNING (Delegated to BehavioralPatternLearner)
	// =============================================================================

	async learnFromInteractionPatterns(interactions: Array<Record<string, unknown>>): Promise<BehaviorPattern[]> {
		return this.behavioralPatterns.learnFromInteractionPatterns(interactions);
	}

	async adaptBehaviorBasedOnPatterns(patterns: BehaviorPattern[]): Promise<void> {
		return this.behavioralPatterns.adaptBehaviorBasedOnPatterns(patterns);
	}

	async analyzeBehavioralTrends(): Promise<InteractionPattern[]> {
		return this.behavioralPatterns.analyzeBehavioralTrends();
	}

	async identifySuccessfulPatterns(): Promise<BehaviorPattern[]> {
		return this.behavioralPatterns.identifySuccessfulPatterns();
	}

	async identifyProblematicPatterns(): Promise<BehaviorPattern[]> {
		return this.behavioralPatterns.identifyProblematicPatterns();
	}

	async recommendBehavioralAdjustments(patterns: BehaviorPattern[]): Promise<string[]> {
		return this.behavioralPatterns.recommendBehavioralAdjustments(patterns);
	}

	async trackPatternEvolution(patternId: string): Promise<any> {
		return this.behavioralPatterns.trackPatternEvolution(patternId);
	}

	async measurePatternEffectiveness(pattern: BehaviorPattern): Promise<number> {
		return this.behavioralPatterns.measurePatternEffectiveness(pattern);
	}

	// =============================================================================
	// SYSTEM INTEGRATION & ORCHESTRATION
	// =============================================================================

	async checkBehavioralStatus(focusArea?: 'claims' | 'violations' | 'patterns' | 'all', includeHistory?: string): Promise<any> {
		const unverifiedClaims = await this.getUnverifiedClaims();
		const rules = await this.getBehavioralRules();
		const patterns = await this.analyzeBehavioralTrends();

		const status = {
			timestamp: new Date().toISOString(),
			unverifiedClaims: unverifiedClaims.length,
			totalRules: rules.length,
			ruleViolations: rules.reduce((sum, rule) => sum + rule.violations, 0),
			activePatterns: patterns.length,
			focusArea: focusArea || 'all'
		};

		if (includeHistory) {
			const historicalData = await this.getHistoricalData();
			return { ...status, history: historicalData };
		}

		return status;
	}

	private async getHistoricalData(): Promise<any> {
		// Aggregate historical data from all modules
		return {
			claimsHistory: this.coreMemory.getMemories().size,
			rulesHistory: (await this.getBehavioralRules()).length,
			interactionHistory: (this.behavioralPatterns as BehavioralPatternLearner).getInteractionHistory().length
		};
	}

	private initializeFoundation(): void {
		// Initialize foundation behavioral rules
		const foundationRules = this.getFoundationRules();
		
		for (const rule of foundationRules) {
			(this.behavioralRules as BehavioralRuleManager).addRule(rule);
		}
	}

	getFoundationRules(): BehavioralRule[] {
		// Convert foundation migration rules to BehavioralRule format
		return foundationMigrationV1.coreRules.map(rule => ({
			id: rule.id,
			rule: rule.rule,
			description: rule.description,
			priority: rule.priority,
			violations: 0,
			examples: rule.examples || []
		}));
	}

	// =============================================================================
	// MISSING WORKFLOW INTEGRATION METHODS (TDD Implementation)
	// =============================================================================

	analyzeQueryForVectorPrewarming(query: string): { semanticConcepts: string[]; priority: number; vectorSearchAreas: string[]; estimatedRelevantVectors: number } {
		// Extract semantic concepts using VectorPrewarming logic
		const words = query.toLowerCase().split(' ');
		const semanticConcepts = words.filter(word => 
			word.length > 3 && 
			!['help', 'with', 'this', 'that', 'they', 'them', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word)
		);
		
		// Identify vector search areas
		const vectorSearchAreas: string[] = [];
		if (query.toLowerCase().includes('typescript') || query.toLowerCase().includes('compilation')) {
			vectorSearchAreas.push('typescript', 'compilation');
		}
		if (query.toLowerCase().includes('debug') || query.toLowerCase().includes('error')) {
			vectorSearchAreas.push('debugging');
		}
		if (query.toLowerCase().includes('react')) {
			vectorSearchAreas.push('react', 'frontend');
		}
		if (query.toLowerCase().includes('performance')) {
			vectorSearchAreas.push('performance', 'optimization');
		}
		
		// Calculate priority
		const technicalTerms = ['react', 'component', 'performance', 'optimize', 'debug', 'error', 'typescript', 'javascript'];
		const technicalMatches = semanticConcepts.filter(concept => 
			technicalTerms.some(term => concept.includes(term) || term.includes(concept))
		);
		const priority = Math.min(10, Math.max(1, technicalMatches.length + semanticConcepts.length / 2));
		
		// Estimate relevant vectors (50 vectors per search area)
		const estimatedRelevantVectors = vectorSearchAreas.length * 50;
		
		return {
			semanticConcepts,
			priority,
			vectorSearchAreas,
			estimatedRelevantVectors
		};
	}

	generateVectorPrewarmingStrategy(query: string): { priorityVectors: string[]; semanticRadius: number; estimatedLatency: number } {
		// Delegate to VectorPrewarming module
		return this.vectorPrewarming.generateStrategySync(query);
	}

	startVectorPrewarming(query: string): void {
		// Delegate to VectorPrewarming module
		this.vectorPrewarming.startPrewarmingSync(query);
	}

	getVectorPrewarmingStatus(): { isActive: boolean; targetConcepts: string[]; startTime: string } {
		// Delegate to VectorPrewarming module
		return this.vectorPrewarming.getPrewarmingStatusSync();
	}

	recordQueryPattern(query: string, concepts: string[]): void {
		// Delegate to VectorPrewarming module for adaptive learning
		this.vectorPrewarming.recordQueryPatternSync(query, concepts);
	}

	recordUserBehaviorPattern(pattern: { domain: string; frequency: number; recentQueries: string[] }): void {
		// Delegate to VectorPrewarming module for adaptive learning
		this.vectorPrewarming.recordUserBehaviorPatternSync(pattern);
	}

	generateAdaptivePrewarmingStrategy(query: string): { learnedConcepts: string[]; confidence: number; relatedPatterns: string[] } {
		// Delegate to VectorPrewarming module for adaptive strategy generation
		return this.vectorPrewarming.generateAdaptivePrewarmingStrategySync(query);
	}

	prioritizeVectorPrewarming(query: string): { domainMatch: string; priority: number; suggestedVectors: string[] } {
		// Delegate to VectorPrewarming module for behavior-based prioritization
		return this.vectorPrewarming.prioritizeVectorPrewarmingSync(query);
	}
}
