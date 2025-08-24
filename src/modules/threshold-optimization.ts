/**
 * Memory System Threshold Optimization Configuration
 * Version 1.1.0 - Optimized Threshold Implementation
 * 
 * Based on systematic threshold testing findings:
 * - Content similarity clusters around 14%, 37%, and 62% ranges
 * - Filtering boundaries: 0.14-0.145 and 0.37-0.38
 * - Natural semantic groupings require targeted threshold selection
 */

export interface ThresholdBoundary {
	lower: number;
	upper: number;
	description: string;
	contentType: 'low_relevance' | 'moderate_relevance' | 'high_relevance';
}

export interface ThresholdProfile {
	name: string;
	threshold: number;
	description: string;
	useCase: string[];
	expectedRecall: 'very_high' | 'high' | 'moderate' | 'low';
	expectedPrecision: 'very_high' | 'high' | 'moderate' | 'low';
}

/**
 * Discovered similarity clustering boundaries from testing
 */
export const SIMILARITY_BOUNDARIES: ThresholdBoundary[] = [
	{
		lower: 0.0,
		upper: 0.145,
		description: 'Low relevance content - often includes noise',
		contentType: 'low_relevance'
	},
	{
		lower: 0.145,
		upper: 0.38,
		description: 'Moderate relevance - mixed quality, may include unrelated but semantically similar content',
		contentType: 'moderate_relevance'
	},
	{
		lower: 0.38,
		upper: 1.0,
		description: 'High relevance - semantically related and contextually appropriate',
		contentType: 'high_relevance'
	}
];

/**
 * Optimized threshold profiles based on empirical testing
 */
export const THRESHOLD_PROFILES: ThresholdProfile[] = [
	{
		name: 'exploration',
		threshold: 0.05,
		description: 'Maximum discovery - includes all potentially relevant content',
		useCase: ['debugging', 'discovery', 'brainstorming', 'initial_research'],
		expectedRecall: 'very_high',
		expectedPrecision: 'low'
	},
	{
		name: 'discovery',
		threshold: 0.10,
		description: 'High recall - good for finding connections and patterns',
		useCase: ['pattern_analysis', 'broad_search', 'context_gathering'],
		expectedRecall: 'very_high', 
		expectedPrecision: 'moderate'
	},
	{
		name: 'balanced',
		threshold: 0.20,
		description: 'Balanced recall and precision - optimal for general use',
		useCase: ['general_search', 'knowledge_retrieval', 'standard_queries'],
		expectedRecall: 'high',
		expectedPrecision: 'high'
	},
	{
		name: 'focused',
		threshold: 0.35,
		description: 'Higher precision - filters moderate relevance content',
		useCase: ['specific_queries', 'targeted_search', 'expert_knowledge'],
		expectedRecall: 'moderate',
		expectedPrecision: 'very_high'
	},
	{
		name: 'precise',
		threshold: 0.40,
		description: 'Maximum precision - only highly relevant semantic matches',
		useCase: ['exact_matches', 'technical_lookup', 'fact_verification'],
		expectedRecall: 'low',
		expectedPrecision: 'very_high'
	}
];

/**
 * Default thresholds by memory system component
 */
export const DEFAULT_THRESHOLDS = {
	// Vector store searches
	vector_store: 0.20,
	
	// Multi-tier memory 
	multi_tier: 0.15,
	
	// Knowledge search
	knowledge_search: 0.20,
	
	// Tiered search  
	tiered_search: 0.15,
	
	// Behavioral memory search
	behavioral_search: 0.10,
	
	// Claim verification
	claim_verification: 0.25,
	
	// Pattern analysis
	pattern_analysis: 0.15
};

/**
 * Context-aware threshold selection
 */
export class ThresholdOptimizer {
	private static instance: ThresholdOptimizer;
	private currentContext: string = 'balanced';
	
	static getInstance(): ThresholdOptimizer {
		if (!ThresholdOptimizer.instance) {
			ThresholdOptimizer.instance = new ThresholdOptimizer();
		}
		return ThresholdOptimizer.instance;
	}
	
	/**
	 * Get optimal threshold for context and expected result count
	 */
	getOptimalThreshold(context: {
		searchType: string;
		expectedResults?: number;
		prioritizePrecision?: boolean;
		prioritizeRecall?: boolean;
		complexity?: 'simple' | 'moderate' | 'complex';
	}): number {
		const { searchType, expectedResults = 5, prioritizePrecision = false, prioritizeRecall = false, complexity = 'moderate' } = context;
		
		// Start with component default
		let baseThreshold = this.getComponentDefault(searchType);
		
		// Adjust based on expected results
		if (expectedResults <= 3) {
			// Few results wanted - increase precision
			baseThreshold += 0.05;
		} else if (expectedResults >= 10) {
			// Many results wanted - increase recall  
			baseThreshold -= 0.05;
		}
		
		// Adjust based on explicit priorities
		if (prioritizePrecision) {
			baseThreshold += 0.10;
		} else if (prioritizeRecall) {
			baseThreshold -= 0.10;
		}
		
		// Adjust based on complexity
		if (complexity === 'complex') {
			// Complex topics need broader search
			baseThreshold -= 0.05;
		} else if (complexity === 'simple') {
			// Simple topics can be more precise
			baseThreshold += 0.05;
		}
		
		// Ensure threshold stays within reasonable bounds
		return Math.max(0.01, Math.min(0.50, baseThreshold));
	}
	
	/**
	 * Get profile-based threshold
	 */
	getProfileThreshold(profileName: string): number {
		const profile = THRESHOLD_PROFILES.find(p => p.name === profileName);
		return profile?.threshold || DEFAULT_THRESHOLDS.knowledge_search;
	}
	
	/**
	 * Get component-specific default threshold
	 */
	private getComponentDefault(searchType: string): number {
		switch (searchType) {
			case 'vector_store':
			case 'vector_search':
				return DEFAULT_THRESHOLDS.vector_store;
			case 'multi_tier':
			case 'tiered_search':
				return DEFAULT_THRESHOLDS.multi_tier;
			case 'knowledge_search':
				return DEFAULT_THRESHOLDS.knowledge_search;
			case 'behavioral_search':
				return DEFAULT_THRESHOLDS.behavioral_search;
			case 'claim_verification':
				return DEFAULT_THRESHOLDS.claim_verification;
			case 'pattern_analysis':
				return DEFAULT_THRESHOLDS.pattern_analysis;
			default:
				return DEFAULT_THRESHOLDS.knowledge_search; // Balanced default
		}
	}
	
	/**
	 * Update current search context for dynamic optimization
	 */
	setContext(context: string): void {
		this.currentContext = context;
	}
	
	/**
	 * Get threshold recommendation with explanation
	 */
	recommend(context: {
		searchType: string;
		query: string;
		expectedResults?: number;
		workloadType?: string;
	}): { threshold: number; profile: string; reasoning: string } {
		const { searchType, query, expectedResults = 5, workloadType = 'balanced' } = context;
		
		// Determine appropriate profile based on workload
		let profileName = workloadType;
		
		// Query analysis for automatic profile selection
		if (query.includes('debug') || query.includes('error') || query.includes('issue')) {
			profileName = 'exploration'; // Debugging needs high recall
		} else if (query.includes('exact') || query.includes('specific') || query.includes('precise')) {
			profileName = 'precise'; // Explicit precision request
		} else if (query.length < 20) {
			profileName = 'focused'; // Short queries often need precision
		} else if (query.length > 100) {
			profileName = 'discovery'; // Long queries suggest exploration
		}
		
		const threshold = this.getProfileThreshold(profileName);
		const profile = THRESHOLD_PROFILES.find(p => p.name === profileName);
		
		return {
			threshold,
			profile: profileName,
			reasoning: `Selected '${profileName}' profile (${threshold}) - ${profile?.description || 'balanced approach'}`
		};
	}
}

/**
 * Version information for threshold optimization
 */
export const THRESHOLD_OPTIMIZATION_VERSION = {
	version: '1.1.0',
	timestamp: '2025-08-24T04:20:00.000Z',
	description: 'Empirically optimized thresholds based on similarity clustering analysis',
	testingFindings: {
		boundaries: SIMILARITY_BOUNDARIES,
		naturalClustering: 'Content similarity clusters around 14%, 37%, and 62% ranges',
		filteringBoundaries: ['0.14-0.145', '0.37-0.38'],
		optimalDefaults: DEFAULT_THRESHOLDS
	}
};
