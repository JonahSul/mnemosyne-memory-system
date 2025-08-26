/**
 * Enhanced Memory Interfaces for Foundation v1.7.1
 * 
 * Structured semantic expansion with reduced cognitive complexity
 */

// AGENT PERSONALITY TYPES
export type AgentPersonality = 
	| "security_focused" 
	| "architecture_specialist"
	| "development_generalist" 
	| "innovation_explorer";

// FIELD CONTEXT ASSESSMENT
export interface FieldContext {
	domain: "security" | "architecture" | "development" | "operations" | "innovation";
	criticalityLevel: "critical" | "high" | "medium" | "low";
	taskType: "debugging" | "documentation" | "learning" | "exploration" | "implementation";
	assessmentConfidence: number; // 0-1 confidence in field classification
}

// EXPANSION STRATEGY METADATA
export interface ExpansionStrategy {
	selectedPersonality: AgentPersonality;
	precisionCoefficient: number; // actual precision applied
	overrideReason?: string; // if personality default was overridden
	qualityValidation: boolean; // whether validation passed
	generationTimestamp: string;
}

// SEMANTIC AXIS STRUCTURE
export interface SemanticAxis {
	tags: string[];
	confidence: number; // 0-1 confidence in relationships
	generationMethod: "automatic" | "manual" | "hybrid";
	validationStatus: "validated" | "pending" | "rejected";
}

// ENHANCED SEMANTIC AXES
export interface SemanticAxes {
	nearSemanticNeighbor: SemanticAxis;
	relatedConcept: SemanticAxis & {
		conceptualDistance: number; // how conceptually distant
	};
	analogicalPattern: SemanticAxis & {
		crossDomainJustification: string; // why this analogy is valid
		transferabilityScore: number; // how transferable the lesson is
	};
}

// QUALITY METRICS TRACKING
export interface QualityMetrics {
	overallSemanticQuality: number; // 0-1 overall quality score
	discoverabilityEnhancement: number; // measured improvement in findability
	noiseReduction: number; // false positive reduction
	crossAxisCoherence: number; // how well axes work together
	usageAnalytics: {
		searchHits: number;
		patternMatches: number;
		crossDomainConnections: number;
		lastAnalyzed: string;
	};
}

// CAUSAL CONTEXT (exported for causality analysis)
export interface CausalContext {
	// Multiple clock types for robustness
	lamportClock: {
		logicalTime: number;
		nodeId: string;
	};
	vectorClock: {
		clock: Record<string, number>; // nodeId -> logical time
		nodeId: string;
	};
	hybridClock: {
		physicalTime: number; // UNIX timestamp in microseconds
		logicalTime: number;  // Logical counter
		nodeId: string;
	};
	
	// Causal dependencies
	dependencies: string[]; // IDs of events this event depends on
	causedBy: string[];     // IDs of events that directly caused this event
	
	// Causal graph position
	causalDepth: number;    // Depth in the causal chain
	branchingFactor: number; // Number of concurrent events at this level
	
	// Plan Integration
	associatedPlans?: string[]; // Plan IDs this event relates to
	planMilestone?: string;     // Milestone ID if this event completes one
	planDeviation?: {
		planId: string;
		expectedOutcome: string;
		actualOutcome: string;
		deviationSeverity: 'minor' | 'moderate' | 'major';
	};
}

// SEMANTIC EXPANSION SUBDOCUMENT
export interface SemanticExpansion {
	fieldContext: FieldContext;
	expansionStrategy: ExpansionStrategy;
	semanticAxes: SemanticAxes;
	qualityMetrics: QualityMetrics;
}

// ENHANCED TEMPORAL METADATA WITH CAUSALITY
export interface EnhancedTemporalMetadata extends TemporalMetadata {
	// Advanced causality tracking
	causalContext: CausalContext;
	
	// Correlation tracking
	correlationId?: string;    // For tracking related operations
	sessionId?: string;        // For session-based causality
	traceId?: string;          // For distributed tracing
}

// TEMPORAL METADATA WITH MICROSECOND PRECISION
export interface TemporalMetadata {
	serverTimestamp: number; // UNIX timestamp with microsecond precision (Number.MAX_SAFE_INTEGER supports up to 2^53-1)
	clientTimestamp?: number; // Optional client-provided timestamp for comparison
	processingLatency?: number; // Microseconds between client request and server processing
	clockSource: "server" | "ntp" | "atomic" | "local"; // Source of timestamp for accuracy tracking
	timezone: string; // ISO timezone string for human readability
	sequenceNumber: number; // Monotonic sequence for same-microsecond events
}

// ENHANCED MEMORY ENTRY
export interface EnhancedMemoryEntry {
	// Core content (clean and focused)
	id: string;
	content: string;
	evidence: string[];
	confidence: number;
	
	// Enhanced temporal tracking
	temporal: TemporalMetadata;
	
	// Legacy timestamp for backward compatibility
	timestamp: string; // ISO string derived from serverTimestamp
	
	source: string;
	verificationMethod: "manual" | "automated" | "cross_reference" | "inference";
	
	// Semantic expansion (structured subdocument)
	semanticExpansion: SemanticExpansion;
	
	// System metadata
	systemMetadata: {
		tier: "short" | "intermediate" | "long";
		importance: number;
		accessCount: number;
		lastAccessed: number; // UNIX timestamp with microseconds
		relationshipCount: number; // number of semantic connections
		storageBackend: "kv" | "vector" | "both";
		
		// Enhanced temporal tracking
		createdAt: number; // UNIX timestamp when entry was first created
		lastModified: number; // UNIX timestamp when entry was last modified
		accessHistory: number[]; // Array of access timestamps (limited to last N accesses)
	};
}

// AGENT PERSONALITY CONFIGURATION
export interface AgentPersonalityConfig {
	personality: AgentPersonality;
	defaultPrecision: number;
	mandatoryAxes: ("nearSemanticNeighbor" | "relatedConcept" | "analogicalPattern")[];
	optionalAxes: ("nearSemanticNeighbor" | "relatedConcept" | "analogicalPattern")[];
	analogicalExpansion: "minimal" | "moderate" | "full" | "maximum";
	taskOverride: "rare" | "allowed_with_justification" | "encouraged" | "automatic";
}

// MEMORY OPERATION CONTEXT
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

// ENHANCED MEMORY SYSTEM INTERFACE
export interface EnhancedMemorySystem {
	// Agent personality management
	setAgentPersonality(personality: AgentPersonality): void;
	getAgentPersonality(): AgentPersonality;
	getPersonalityConfig(): AgentPersonalityConfig;
	
	// Memory operations with semantic expansion
	storeMemory(
		entry: Omit<EnhancedMemoryEntry, "id" | "semanticExpansion" | "systemMetadata">,
		operationContext?: MemoryOperationContext
	): Promise<EnhancedMemoryEntry>;
	
	// Semantic search across axes
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
	
	// Quality analytics
	analyzeSemanticQuality(entryId: string): Promise<QualityMetrics>;
	getSystemSemanticHealth(): Promise<{
		averageQuality: number;
		totalRelationships: number;
		axisDistribution: Record<string, number>;
		personalityUsage: Record<AgentPersonality, number>;
	}>;
	
	// Plan Management Integration
	createEnhancedPlan(plan: EnhancedPlanEntry): Promise<EnhancedPlanEntry>;
	updatePlanProgress(planId: string, progress: number, vectorUpdate?: number[]): Promise<boolean>;
	analyzePlanCausality(planId: string): Promise<CausalAnalysisResult>;
	detectPlanConversationFork(planId: string, currentContext: string): Promise<ConversationForkAnalysis>;
}

// ENHANCED PLAN MEMORY ENTRY
export interface EnhancedPlanEntry {
	// Core plan data (from PlanMemoryEntry)
	id: string;
	title: string;
	description: string;
	objectives: string[];
	status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled' | 'derailed';
	priority: 'critical' | 'high' | 'medium' | 'low';
	progress: number;
	
	// Enhanced temporal tracking with causality
	temporal: EnhancedTemporalMetadata;
	
	// Semantic expansion for plan discoverability
	semanticExpansion: SemanticExpansion & {
		planSpecificAxes: {
			goalAlignment: SemanticAxis; // how this plan aligns with user goals
			executionPattern: SemanticAxis; // similar execution approaches
			domainExpertise: SemanticAxis; // required knowledge domains
		};
	};
	
	// Vector space coordinates and trajectory
	vectorTrajectory: {
		currentPosition: number[];
		plannedTrajectory: number[];
		actualTrajectory: number[];
		deviationVector: number[];
		convergenceMetrics: {
			onTrack: boolean;
			projectedCompletion: number; // microsecond timestamp
			confidenceInterval: number; // 0-1
		};
	};
	
	// Causal relationship tracking
	causalContext: CausalContext & {
		planSpecificCausality: {
			triggeringEvents: string[]; // what caused this plan to be created
			dependentEvents: string[];  // events that depend on this plan
			milestoneEvents: string[];  // events that represent milestone completion
			blockingEvents: string[];  // events that are blocking progress
		};
	};
	
	// Accountability and conversation continuity
	accountability: {
		commitmentLevel: number;
		trackingMetrics: string[];
		deviationThreshold: number;
		lastCheck: number; // microsecond timestamp
		checkFrequency: number; // microseconds between checks
		alertsEnabled: boolean;
	};
	
	conversationContinuity: {
		originalContext: string;
		conversationId: string;
		forkDetection: {
			enabled: boolean;
			threshold: number; // semantic distance threshold
			reminderStrategy: 'gentle' | 'assertive' | 'urgent';
		};
		contextBridging: {
			bridgePoints: string[]; // topics that can bridge back to plan
			bridgeConfidence: number; // 0-1 confidence in bridge effectiveness
		};
	};
	
	// System metadata
	systemMetadata: {
		tier: "short" | "intermediate" | "long";
		importance: number;
		accessCount: number;
		lastAccessed: number;
		relationshipCount: number;
		storageBackend: "kv" | "vector" | "both";
		
		// Plan-specific metadata
		creationMethod: "user_initiated" | "agent_suggested" | "collaborative";
		executionStyle: "sequential" | "parallel" | "adaptive";
		monitoringLevel: "passive" | "active" | "intensive";
	};
}

// CONVERSATION FORK ANALYSIS
export interface ConversationForkAnalysis {
	isFork: boolean;
	forkSeverity: 'minor' | 'moderate' | 'major' | 'complete_derailment';
	semanticDistance: number; // distance from original plan context
	timeSinceFork: number; // microseconds since fork occurred
	
	forkCharacteristics: {
		triggerTopic: string;
		distractionType: 'related' | 'tangential' | 'unrelated';
		returnProbability: number; // 0-1 likelihood user will return naturally
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
			convergenceTime?: number; // estimated microseconds to converge naturally
		};
	};
}

// CAUSAL ANALYSIS RESULT
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
		timeVsCausalityAlignment: number; // how well temporal and causal order align
		predictiveAccuracy: number; // how well past causality predicts future events
	};
}

// BACKWARD COMPATIBILITY
export interface LegacyMemoryEntry {
	id: string;
	content: string;
	tags: string[];
	metadata: Record<string, unknown>;
	timestamp: string;
}

// MIGRATION UTILITIES
export interface MemoryMigrationUtil {
	upgradeLegacyEntry(legacy: LegacyMemoryEntry): EnhancedMemoryEntry;
	downgradeEnhancedEntry(enhanced: EnhancedMemoryEntry): LegacyMemoryEntry;
	migrateSemanticExpansion(
		tags: string[], 
		personality: AgentPersonality
	): SemanticExpansion;
}

// TEMPORAL UTILITIES FOR SERVER-SIDE TIMESTAMP GENERATION
export class TemporalUtils {
	private static sequenceCounter = 0;
	private static lastTimestamp = 0;
	
	/**
	 * Generate high-precision UNIX timestamp with microsecond resolution
	 * Ensures monotonic ordering even for same-microsecond events
	 */
	static generateServerTimestamp(): number {
		// Get current time in microseconds
		const now = Date.now() * 1000 + Math.floor(performance.now() % 1000);
		
		// Ensure monotonic ordering
		if (now <= this.lastTimestamp) {
			this.sequenceCounter++;
			return this.lastTimestamp + this.sequenceCounter;
		} else {
			this.lastTimestamp = now;
			this.sequenceCounter = 0;
			return now;
		}
	}
	
	/**
	 * Create complete temporal metadata for memory entry
	 */
	static createTemporalMetadata(clientTimestamp?: number): TemporalMetadata {
		const serverTimestamp = this.generateServerTimestamp();
		const processingLatency = clientTimestamp 
			? Math.abs(serverTimestamp - clientTimestamp * 1000) // Convert client ms to microseconds
			: undefined;
		
		return {
			serverTimestamp,
			clientTimestamp: clientTimestamp ? clientTimestamp * 1000 : undefined,
			processingLatency,
			clockSource: "server", // Could be enhanced to detect NTP/atomic clock availability
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			sequenceNumber: this.sequenceCounter
		} as TemporalMetadata;
	}
	
	/**
	 * Convert microsecond timestamp to ISO string for backward compatibility
	 */
	static microsToISOString(microseconds: number): string {
		const milliseconds = Math.floor(microseconds / 1000);
		const microPart = microseconds % 1000;
		const date = new Date(milliseconds);
		const isoString = date.toISOString();
		
		// Insert microseconds before the 'Z'
		return isoString.slice(0, -1) + microPart.toString().padStart(3, '0') + 'Z';
	}
	
	/**
	 * Parse ISO string back to microsecond timestamp
	 */
	static isoStringToMicros(isoString: string): number {
		// Extract microseconds if present
		const microMatch = isoString.match(/\.(\d{6})Z$/);
		const microseconds = microMatch ? parseInt(microMatch[1] || "0") : 0;
		
		// Parse main timestamp
		const cleanIso = isoString.replace(/\.\d{6}Z$/, '.000Z');
		const milliseconds = new Date(cleanIso).getTime();
		
		return milliseconds * 1000 + microseconds;
	}
	
	/**
	 * Calculate time difference in microseconds
	 */
	static timeDifferenceMicros(timestamp1: number, timestamp2: number): number {
		return Math.abs(timestamp1 - timestamp2);
	}
	
	/**
	 * Format microsecond timestamp for human readability
	 */
	static formatHumanReadable(microseconds: number, includeMs = true): string {
		const date = new Date(Math.floor(microseconds / 1000));
		const microPart = microseconds % 1000;
		
		if (includeMs) {
			return `${date.toISOString().slice(0, -1)}${microPart.toString().padStart(3, '0')}Z`;
		} else {
			return date.toISOString();
		}
	}
}
