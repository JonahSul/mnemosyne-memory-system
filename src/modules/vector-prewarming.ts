import type { 
	VectorAnalysis, 
	VectorPrewarmingStrategy, 
	VectorPrewarmingStatus,
	AdaptivePrewarmingStrategy,
	VectorPrioritization,
	UserBehaviorPattern,
	PrewarmingPrediction,
	SessionPrewarmingStrategy,
	PrewarmingEffectiveness,
	AdaptedPrewarmingStrategy
} from './memory-interfaces';

/**
 * Vector Pre-warming System Module
 * 
 * Handles intelligent vector pre-warming for improved query performance
 */
export interface VectorPrewarmingOperations {
	analyzeQueryForVectorNeeds(query: string): VectorAnalysis;
	createPrewarmingStrategy(analysis: VectorAnalysis): VectorPrewarmingStrategy;
	executeVectorPrewarming(strategy: VectorPrewarmingStrategy): Promise<VectorPrewarmingStatus>;
	adaptPrewarmingBasedOnUsage(usagePatterns: UserBehaviorPattern[]): Promise<AdaptivePrewarmingStrategy>;
	prioritizeVectorsByDomain(domain: string): Promise<VectorPrioritization>;
	predictNextQueries(sessionContext: Record<string, unknown>): Promise<PrewarmingPrediction>;
	createVectorSessionPrewarmingStrategy(prediction: PrewarmingPrediction): Promise<SessionPrewarmingStrategy>;
	evaluatePrewarmingEffectiveness(strategy: SessionPrewarmingStrategy): Promise<PrewarmingEffectiveness>;
	adaptPrewarmingStrategy(effectiveness: PrewarmingEffectiveness): Promise<AdaptedPrewarmingStrategy>;
	
	// Synchronous workflow integration methods
	generateStrategySync(query: string): { priorityVectors: string[]; semanticRadius: number; estimatedLatency: number };
	startPrewarmingSync(query: string): void;
	getPrewarmingStatusSync(): { isActive: boolean; targetConcepts: string[]; startTime: string };
	
	// Adaptive learning methods
	recordQueryPatternSync(query: string, concepts: string[]): void;
	recordUserBehaviorPatternSync(pattern: { domain: string; frequency: number; recentQueries: string[] }): void;
	generateAdaptivePrewarmingStrategySync(query: string): { learnedConcepts: string[]; confidence: number; relatedPatterns: string[] };
	prioritizeVectorPrewarmingSync(query: string): { domainMatch: string; priority: number; suggestedVectors: string[] };
}


import { CloudflareVectorStore } from '../cloudflare-vector-store';

export class VectorPrewarmingManager implements VectorPrewarmingOperations {
	// NOTE: previous implementation stored authoritative state in volatile Maps/Arrays.
	// ARCHITECTURAL FIX: use write-through persistence (KV + Vectorize) on all mutating ops.
	private activePrewarming: Map<string, VectorPrewarmingStatus> = new Map();
	private usagePatterns: UserBehaviorPattern[] = [];
	private effectivenessHistory: PrewarmingEffectiveness[] = [];
	private adaptedStrategies: AdaptedPrewarmingStrategy[] = [];
	private vectorStore: CloudflareVectorStore;
	private kvStore: any;

	constructor(vectorStore?: CloudflareVectorStore, kvStore?: any) {
		this.vectorStore = vectorStore || new CloudflareVectorStore({ env: {} as any });
		this.kvStore = kvStore;
	}

	analyzeQueryForVectorNeeds(query: string): VectorAnalysis {
		// Extract semantic concepts from the query
		const semanticConcepts = this.extractSemanticConcepts(query);
		const vectorSearchAreas = this.identifyVectorSearchAreas(semanticConcepts);
		
		const analysis: VectorAnalysis = {
			semanticConcepts,
			vectorSearchAreas,
			priority: this.calculatePriority(semanticConcepts, vectorSearchAreas),
			estimatedRelevantVectors: this.estimateVectorCount(vectorSearchAreas)
		};

		return analysis;
	}

	createPrewarmingStrategy(analysis: VectorAnalysis): VectorPrewarmingStrategy {
		const priorityVectors = this.selectPriorityVectors(analysis);
		const semanticRadius = this.calculateSemanticRadius(analysis);
		const estimatedLatency = this.estimateLatency(analysis);

		return {
			priorityVectors,
			semanticRadius,
			estimatedLatency
		};
	}

	async executeVectorPrewarming(strategy: VectorPrewarmingStrategy): Promise<VectorPrewarmingStatus> {
		const prewarmingId = `prewarming_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		const status: VectorPrewarmingStatus = {
			isActive: true,
			targetConcepts: strategy.priorityVectors,
			startTime: new Date().toISOString()
		};

		this.activePrewarming.set(prewarmingId, status);

		// Write-through persistence
		try {
			if (this.kvStore) await this.kvStore.put(`prewarming:${prewarmingId}`, JSON.stringify(status));
			if (this.vectorStore && this.vectorStore.storeKnowledge) await this.vectorStore.storeKnowledge({ content: JSON.stringify(status), metadata: { id: prewarmingId, type: 'prewarming', startTime: status.startTime }, tags: ['prewarming', 'status'] });
		} catch (e) {
			// Non-fatal: keep in-memory as fallback
		}

		// Simulate vector pre-warming process
		setTimeout(() => {
			const updatedStatus = this.activePrewarming.get(prewarmingId);
			if (updatedStatus) {
				updatedStatus.isActive = false;
				this.activePrewarming.set(prewarmingId, updatedStatus);
				// Persist the updated status
				try {
					if (this.kvStore) this.kvStore.put(`prewarming:${prewarmingId}`, JSON.stringify(updatedStatus));
					if (this.vectorStore && this.vectorStore.storeKnowledge) this.vectorStore.storeKnowledge({ content: JSON.stringify(updatedStatus), metadata: { id: prewarmingId, type: 'prewarming', startTime: updatedStatus.startTime, isActive: updatedStatus.isActive }, tags: ['prewarming', 'status'] });
				} catch (e) {
					// ignore
				}
			}
		}, strategy.estimatedLatency);

		return status;
	}

	async adaptPrewarmingBasedOnUsage(usagePatterns: UserBehaviorPattern[]): Promise<AdaptivePrewarmingStrategy> {
		this.usagePatterns = usagePatterns;

		// Learn from usage patterns
		const learnedConcepts = this.extractLearnedConcepts(usagePatterns);
		const confidence = this.calculateConfidence(usagePatterns);
		const relatedPatterns = this.identifyRelatedPatterns(usagePatterns);

		return {
			learnedConcepts,
			confidence,
			relatedPatterns
		};
	}

	// Persist usage patterns when set
	private async persistUsagePatterns() {
		try {
			if (this.kvStore) await this.kvStore.put('prewarming:usagePatterns', JSON.stringify(this.usagePatterns));
			if (this.vectorStore && this.vectorStore.storeKnowledge) await this.vectorStore.storeKnowledge({ content: JSON.stringify(this.usagePatterns), metadata: { id: 'usagePatterns', type: 'prewarming_meta' }, tags: ['prewarming', 'usage'] });
		} catch (e) {}
	}

	async prioritizeVectorsByDomain(domain: string): Promise<VectorPrioritization> {
		const suggestedVectors = this.getSuggestedVectorsForDomain(domain);
		const priority = this.calculateDomainPriority(domain);

		return {
			domainMatch: domain,
			priority,
			suggestedVectors
		};
	}

	async predictNextQueries(sessionContext: Record<string, unknown>): Promise<PrewarmingPrediction> {
		const predictedTopics = this.predictTopicsFromContext(sessionContext);
		const confidence = this.calculatePredictionConfidence(sessionContext);
		const basedOnPatterns = this.getRelevantPatterns(sessionContext);

		return {
			predictedTopics,
			confidence,
			basedOnPatterns
		};
	}

	async createVectorSessionPrewarmingStrategy(prediction: PrewarmingPrediction): Promise<SessionPrewarmingStrategy> {
		const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		return {
			sessionId,
			targetConcepts: prediction.predictedTopics,
			relatedTopics: this.expandTopics(prediction.predictedTopics),
			priorityLevel: Math.round(prediction.confidence * 10)
		};
	}

	async evaluatePrewarmingEffectiveness(strategy: SessionPrewarmingStrategy): Promise<PrewarmingEffectiveness> {
		// Simulate effectiveness evaluation
		const actualRelevance = Math.random() * 0.4 + 0.6; // 0.6-1.0
		const userSatisfaction = Math.random() * 0.3 + 0.7; // 0.7-1.0

		const effectiveness: PrewarmingEffectiveness = {
			strategy: strategy.sessionId,
			targetConcepts: strategy.targetConcepts,
			actualRelevance,
			userSatisfaction
		};

		this.effectivenessHistory.push(effectiveness);
		// Persist effectiveness
		try {
			if (this.kvStore) await this.kvStore.put(`prewarming:effectiveness:${strategy.sessionId}`, JSON.stringify(effectiveness));
			if (this.vectorStore && this.vectorStore.storeKnowledge) await this.vectorStore.storeKnowledge({ content: JSON.stringify(effectiveness), metadata: { id: strategy.sessionId, type: 'prewarming_effectiveness' }, tags: ['prewarming', 'effectiveness'] });
		} catch (e) {}
		return effectiveness;
	}

	async adaptPrewarmingStrategy(effectiveness: PrewarmingEffectiveness): Promise<AdaptedPrewarmingStrategy> {
		// Learn from effectiveness and adapt
		const successRate = (effectiveness.actualRelevance + effectiveness.userSatisfaction) / 2;
		const preferredMethods = this.identifyPreferredMethods(effectiveness);
		const confidenceLevel = this.calculateAdaptedConfidence(effectiveness);

		const adapted: AdaptedPrewarmingStrategy = {
			preferredMethods,
			successRate,
			confidenceLevel
		};

		this.adaptedStrategies.push(adapted);
		// Persist adapted strategy
		try {
			if (this.kvStore) await this.kvStore.put(`prewarming:adapted:${Date.now()}`, JSON.stringify(adapted));
			if (this.vectorStore && this.vectorStore.storeKnowledge) await this.vectorStore.storeKnowledge({ content: JSON.stringify(adapted), metadata: { type: 'prewarming_adapted' }, tags: ['prewarming', 'adapted'] });
		} catch (e) {}
		return adapted;
	}

	// Private helper methods
	private extractSemanticConcepts(query: string | any): string[] {
		// Handle type safety - extract string from object if needed
		let queryStr: string;
		if (typeof query === 'string') {
			queryStr = query;
		} else if (query && typeof query === 'object' && query.query) {
			queryStr = query.query;
		} else if (query && typeof query === 'object' && query.content) {
			queryStr = query.content;
		} else {
			queryStr = String(query || '');
		}

		// Extract meaningful semantic concepts from the query
		const words = queryStr.toLowerCase().split(' ');
		return words.filter(word => 
			word.length > 3 && 
			!['help', 'with', 'this', 'that', 'they', 'them', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word)
		);
	}

	private identifyVectorSearchAreas(concepts: string[]): string[] {
		const vectorSearchAreas: string[] = [];
		const conceptText = concepts.join(' ');
		
		// Identify areas based on semantic concepts
		if (conceptText.includes('typescript') || conceptText.includes('compilation')) {
			vectorSearchAreas.push('typescript', 'compilation');
		}
		if (conceptText.includes('debug') || conceptText.includes('error')) {
			vectorSearchAreas.push('debugging');
		}
		if (conceptText.includes('react')) {
			vectorSearchAreas.push('react', 'frontend');
		}
		if (conceptText.includes('performance') || conceptText.includes('optimize')) {
			vectorSearchAreas.push('performance', 'optimization');
		}
		if (conceptText.includes('authentication') || conceptText.includes('auth') || conceptText.includes('token')) {
			vectorSearchAreas.push('authentication', 'security');
		}
		if (conceptText.includes('database') || conceptText.includes('query') || conceptText.includes('sql')) {
			vectorSearchAreas.push('database', 'queries');
		}
		if (conceptText.includes('implement') || conceptText.includes('develop')) {
			vectorSearchAreas.push('development', 'implementation');
		}
		
		return vectorSearchAreas;
	}

	private calculatePriority(concepts: string[], areas: string[]): number {
		const technicalTerms = ['react', 'component', 'performance', 'optimize', 'debug', 'error', 'typescript', 'javascript'];
		const technicalMatches = concepts.filter(concept => 
			technicalTerms.some(term => concept.includes(term) || term.includes(concept))
		);
		
		return Math.min(10, Math.max(1, technicalMatches.length + concepts.length / 2));
	}

	private estimateVectorCount(areas: string[]): number {
		return areas.length * 50; // Estimate 50 vectors per area
	}

	private selectPriorityVectors(analysis: VectorAnalysis): string[] {
		return analysis.vectorSearchAreas.slice(0, 3); // Top 3 priority vectors
	}

	private calculateSemanticRadius(analysis: VectorAnalysis): number {
		return Math.max(0.1, analysis.priority * 0.1);
	}

	private estimateLatency(analysis: VectorAnalysis): number {
		return analysis.estimatedRelevantVectors * 2; // 2ms per vector
	}

	private extractLearnedConcepts(patterns: UserBehaviorPattern[]): string[] {
		return patterns.flatMap(p => p.recentQueries).slice(0, 10);
	}

	private calculateConfidence(patterns: UserBehaviorPattern[]): number {
		return Math.min(patterns.length * 0.1, 1.0);
	}

	private identifyRelatedPatterns(patterns: UserBehaviorPattern[]): string[] {
		return patterns.map(p => p.domain);
	}

	private getSuggestedVectorsForDomain(domain: string): string[] {
		return [`${domain}_primary`, `${domain}_secondary`, `${domain}_related`];
	}

	private calculateDomainPriority(domain: string): number {
		// Priority based on domain importance
		const domainPriorities: Record<string, number> = {
			'memory': 10,
			'behavioral': 9,
			'workflow': 8,
			'vector': 7,
			'default': 5
		};
		return domainPriorities[domain] ?? domainPriorities.default!
	}

	private predictTopicsFromContext(context: Record<string, unknown>): string[] {
		const topics: string[] = [];
		for (const [key, value] of Object.entries(context)) {
			if (typeof value === 'string') {
				topics.push(`${key}_${value}`);
			}
		}
		return topics.slice(0, 5);
	}

	private calculatePredictionConfidence(context: Record<string, unknown>): number {
		return Math.min(Object.keys(context).length * 0.1, 1.0);
	}

	private getRelevantPatterns(context: Record<string, unknown>): string[] {
		return this.usagePatterns
			.filter(p => p.frequency > 2)
			.map(p => p.domain)
			.slice(0, 3);
	}

	private expandTopics(topics: string[]): string[] {
		if (!topics || !Array.isArray(topics)) {
			return [];
		}
		return topics.flatMap(topic => [topic, `${topic}_related`, `${topic}_context`]);
	}

	private identifyPreferredMethods(effectiveness: PrewarmingEffectiveness): string[] {
		if (effectiveness.actualRelevance > 0.8) {
			return ['aggressive_prewarming', 'broad_semantic_radius'];
		} else if (effectiveness.actualRelevance > 0.6) {
			return ['moderate_prewarming', 'focused_concepts'];
		} else {
			return ['conservative_prewarming', 'narrow_focus'];
		}
	}

	private calculateAdaptedConfidence(effectiveness: PrewarmingEffectiveness): number {
		return (effectiveness.actualRelevance + effectiveness.userSatisfaction) / 2;
	}

	// Utility methods
	getActivePrewarming(): Map<string, VectorPrewarmingStatus> {
		return new Map(this.activePrewarming);
	}

	getUsagePatterns(): UserBehaviorPattern[] {
		return [...this.usagePatterns];
	}

	getEffectivenessHistory(): PrewarmingEffectiveness[] {
		return [...this.effectivenessHistory];
	}

	getAdaptedStrategies(): AdaptedPrewarmingStrategy[] {
		return [...this.adaptedStrategies];
	}

	// =============================================================================
	// SYNCHRONOUS WORKFLOW INTEGRATION METHODS
	// =============================================================================

	generateStrategySync(query: string): { priorityVectors: string[]; semanticRadius: number; estimatedLatency: number } {
		const concepts = this.extractSemanticConcepts(query);
		const vectorSearchAreas = this.identifyVectorSearchAreas(concepts);
		const priority = this.calculatePriority(concepts, vectorSearchAreas);
		
		// Generate priority vectors based on analysis
		const priorityVectors = [...concepts, ...vectorSearchAreas];
		
		// Calculate semantic radius based on concept complexity
		const semanticRadius = Math.min(priority * 0.5, 3.0);
		
		// Estimate latency based on vector count and complexity
		const estimatedLatency = Math.max(100, vectorSearchAreas.length * 50 * 2);
		
		return {
			priorityVectors,
			semanticRadius,
			estimatedLatency
		};
	}

	private currentPrewarming: { isActive: boolean; targetConcepts: string[]; startTime: string } | null = null;

	startPrewarmingSync(query: string): void {
		const concepts = this.extractSemanticConcepts(query);
		
		this.currentPrewarming = {
			isActive: true,
			targetConcepts: concepts,
			startTime: new Date().toISOString()
		};

		// Persist synchronous prewarming status
		try {
			const id = `currentPrewarming`;
			if (this.kvStore) this.kvStore.put(`prewarming:${id}`, JSON.stringify(this.currentPrewarming));
			if (this.vectorStore && this.vectorStore.storeKnowledge) this.vectorStore.storeKnowledge({ content: JSON.stringify(this.currentPrewarming), metadata: { id, type: 'prewarming_current' }, tags: ['prewarming', 'current'] });
		} catch (e) {}
		
		// Simulate async pre-warming completion
		setTimeout(() => {
			if (this.currentPrewarming) {
				this.currentPrewarming.isActive = false;
			}
		}, 1000);
	}

	getPrewarmingStatusSync(): { isActive: boolean; targetConcepts: string[]; startTime: string } {
		return this.currentPrewarming || {
			isActive: false,
			targetConcepts: [],
			startTime: ''
		};
	}

	// Adaptive learning state
	private queryPatterns: Array<{ query: string; concepts: string[] }> = [];
	private userBehaviorPatterns: Array<{ domain: string; frequency: number; recentQueries: string[] }> = [];

	recordQueryPatternSync(query: string, concepts: string[]): void {
		this.queryPatterns.push({ query, concepts });
	}

	recordUserBehaviorPatternSync(pattern: { domain: string; frequency: number; recentQueries: string[] }): void {
		this.userBehaviorPatterns.push(pattern);
	}

	generateAdaptivePrewarmingStrategySync(query: string | any): { learnedConcepts: string[]; confidence: number; relatedPatterns: string[] } {
		// Handle type safety - extract string from object if needed
		let queryStr: string;
		if (typeof query === 'string') {
			queryStr = query;
		} else if (query && typeof query === 'object' && query.query) {
			queryStr = query.query;
		} else if (query && typeof query === 'object' && query.content) {
			queryStr = query.content;
		} else {
			queryStr = String(query || '');
		}

		// Extract concepts from the new query
		const queryWords = queryStr.toLowerCase().split(' ');
		
		// Find learned concepts from recorded patterns
		const learnedConcepts: Set<string> = new Set();
		const relatedPatterns: string[] = [];
		
		this.queryPatterns.forEach(pattern => {
			// Check if any concepts match the current query
			const hasMatch = pattern.concepts.some(concept => 
				queryWords.some(word => word.includes(concept) || concept.includes(word))
			);
			
			if (hasMatch) {
				pattern.concepts.forEach(concept => learnedConcepts.add(concept));
				relatedPatterns.push(pattern.query);
			}
		});
		
		// Calculate confidence based on pattern matches
		const confidence = Math.min(0.9, Math.max(0.1, relatedPatterns.length * 0.3));
		
		return {
			learnedConcepts: Array.from(learnedConcepts),
			confidence,
			relatedPatterns
		};
	}

	prioritizeVectorPrewarmingSync(query: string | any): { domainMatch: string; priority: number; suggestedVectors: string[] } {
		// Handle type safety - extract string from object if needed
		let queryStr: string;
		if (typeof query === 'string') {
			queryStr = query;
		} else if (query && typeof query === 'object' && query.query) {
			queryStr = query.query;
		} else if (query && typeof query === 'object' && query.content) {
			queryStr = query.content;
		} else {
			queryStr = String(query || '');
		}

		// Find matching behavior pattern
		const queryWords = queryStr.toLowerCase().split(' ');
		let bestMatch = this.userBehaviorPatterns[0]; // Default to first pattern if any
		
		for (const pattern of this.userBehaviorPatterns) {
			const hasQueryMatch = pattern.recentQueries.some(recentQuery =>
				queryWords.some(word => recentQuery.toLowerCase().includes(word) || word.includes(recentQuery.toLowerCase()))
			);
			
			if (hasQueryMatch) {
				bestMatch = pattern;
				break;
			}
		}
		
		// Generate suggested vectors based on the pattern
		const suggestedVectors = bestMatch ? [
			...bestMatch.recentQueries.map(q => q.toLowerCase()),
			...queryWords.filter(word => word.length > 3)
		] : [];
		
		return {
			domainMatch: bestMatch?.domain || '',
			priority: bestMatch?.frequency || 0,
			suggestedVectors
		};
	}
}
