/**
 * Foundation v1.7.1 - Refined Multi-Axis Semantic Architecture
 * 
 * REFINEMENTS FROM v1.7.0:
 * - Reduced cognitive load through agent personality defaults
 * - Structured semantic expansion as separate subdocuments
 * - Simplified field context assessment
 * - Enhanced object model for better queryability
 * 
 * FOUNDATION EVOLUTION:
 * - v1.5.0: Evidence-based accountability, atomic memory patterns
 * - v1.6.0: Instinctual Behavioral Priority System (disabled scaffold)
 * - v1.7.0: Multi-Axis Semantic Expansion Architecture 
 * - v1.7.1: Refined semantic architecture with reduced complexity
 */

export const foundationMigrationV171 = {
	version: "1.7.1",
	description: "Refined Multi-Axis Semantic Architecture with Reduced Cognitive Complexity",
	
	// INHERITED FOUNDATION PRINCIPLES (v1.5.0 + v1.6.0 + v1.7.0 base)
	coreRules: [
		{
			id: "evidence_based_accountability",
			name: "Evidence-Based Accountability",
			description: "All memory entries must include supporting evidence and verification methods",
			threshold: 0.8,
			enabled: true,
			inherited_from: "v1.5.0"
		},
		{
			id: "atomic_memory_patterns",
			name: "Atomic Memory Patterns", 
			description: "Memory entries should be atomic, focused, and independently verifiable",
			threshold: 0.7,
			enabled: true,
			inherited_from: "v1.5.0"
		},
		{
			id: "persistence_guarantees",
			name: "Persistence Architecture Guarantees",
			description: "Critical system state must use persistent storage (KV/Vector), never volatile memory",
			threshold: 0.9,
			enabled: true,
			inherited_from: "v1.5.0"
		},
		{
			id: "instinctual_behavioral_priority",
			name: "Instinctual Behavioral Priority System",
			description: "Priority-based behavioral response system for memory operations",
			threshold: 0.6,
			enabled: false,
			inherited_from: "v1.6.0"
		}
	],

	// REFINED SEMANTIC EXPANSION ARCHITECTURE
	semanticExpansionFramework: {
		enabled: true,
		description: "Multi-axis semantic expansion with agent personality defaults and structured subdocuments",
		
		// SOLUTION 1: Agent Personality Defaults (Reduced Hat Switching)
		agentPersonalities: {
			security_focused: {
				name: "Security-Focused Agent",
				defaultPrecision: 0.92,
				mandatoryAxes: ["nearSemanticNeighbor"],
				optionalAxes: ["relatedConcept"],
				analogicalExpansion: "minimal",
				taskOverride: "allowed_with_justification"
			},
			
			architecture_specialist: {
				name: "Architecture Specialist Agent", 
				defaultPrecision: 0.85,
				mandatoryAxes: ["nearSemanticNeighbor", "relatedConcept"],
				optionalAxes: ["analogicalPattern"],
				analogicalExpansion: "moderate",
				taskOverride: "encouraged"
			},
			
			development_generalist: {
				name: "Development Generalist Agent",
				defaultPrecision: 0.70,
				mandatoryAxes: ["nearSemanticNeighbor", "relatedConcept", "analogicalPattern"],
				optionalAxes: [],
				analogicalExpansion: "full",
				taskOverride: "automatic"
			},
			
			innovation_explorer: {
				name: "Innovation Explorer Agent",
				defaultPrecision: 0.45,
				mandatoryAxes: ["analogicalPattern"],
				optionalAxes: ["relatedConcept", "nearSemanticNeighbor"],
				analogicalExpansion: "maximum",
				taskOverride: "rare"
			}
		},

		// SOLUTION 2: Structured Semantic Subdocuments
		semanticMetadataStructure: {
			fieldContext: {
				domain: "string", // security, architecture, development, operations, innovation
				criticalityLevel: "string", // critical, high, medium, low
				taskType: "string", // debugging, documentation, learning, exploration
				assessmentConfidence: "number" // 0-1 confidence in field classification
			},
			
			expansionStrategy: {
				selectedPersonality: "string", // agent personality used
				precisionCoefficient: "number", // actual precision applied
				overrideReason: "string?", // if personality default was overridden
				qualityValidation: "boolean" // whether validation passed
			},
			
			semanticAxes: {
				nearSemanticNeighbor: {
					tags: "string[]",
					confidence: "number", // 0-1 confidence in relationships
					generationMethod: "string", // automatic, manual, hybrid
					validationStatus: "string" // validated, pending, rejected
				},
				relatedConcept: {
					tags: "string[]", 
					confidence: "number",
					conceptualDistance: "number", // how conceptually distant
					generationMethod: "string",
					validationStatus: "string"
				},
				analogicalPattern: {
					tags: "string[]",
					confidence: "number", 
					crossDomainJustification: "string", // why this analogy is valid
					transferabilityScore: "number", // how transferable the lesson is
					generationMethod: "string",
					validationStatus: "string"
				}
			},
			
			qualityMetrics: {
				overallSemanticQuality: "number", // 0-1 overall quality score
				discoverabilityEnhancement: "number", // measured improvement in findability
				noiseReduction: "number", // false positive reduction
				crossAxisCoherence: "number", // how well axes work together
				usageAnalytics: {
					searchHits: "number",
					patternMatches: "number", 
					crossDomainConnections: "number"
				}
			}
		},

		// SIMPLIFIED EXPANSION RULES
		expansionRules: {
			personalityBased: {
				description: "Use agent personality defaults unless task requires override",
				implementation: "Agent declares personality at initialization, uses defaults for most operations",
				overrideConditions: [
					"Explicit task criticality mismatch (e.g., security task with development agent)",
					"User-specified precision requirements",
					"Context-specific accuracy needs"
				]
			},
			
			structuredStorage: {
				description: "Store semantic expansion in structured subdocument separate from content",
				implementation: "Content remains clean, semantic metadata queryable independently",
				benefits: [
					"Clean separation of concerns",
					"Queryable semantic analytics",
					"Axis-specific quality tracking",
					"Evolution of semantic relationships over time"
				]
			},
			
			qualityFeedback: {
				description: "Continuous improvement through usage analytics and quality metrics",
				implementation: "Track semantic expansion effectiveness, adjust strategies based on performance",
				metrics: [
					"Search result relevance improvement",
					"Cross-domain pattern recognition accuracy",
					"False positive reduction",
					"User satisfaction with discovery"
				]
			}
		}
	},

		// ENHANCED MEMORY ENTRY INTERFACE
	memoryEntryInterface: {
		coreEntry: {
			id: "string",
			content: "string", 
			evidence: "string[]",
			confidence: "number",
			
			// Enhanced temporal tracking with microsecond precision
			temporal: {
				serverTimestamp: "number", // UNIX timestamp with microsecond precision
				clientTimestamp: "number?", // Optional client timestamp for latency analysis
				processingLatency: "number?", // Microseconds between client request and server processing
				clockSource: "string", // 'server' | 'ntp' | 'atomic' | 'local'
				timezone: "string", // ISO timezone string
				sequenceNumber: "number" // Monotonic sequence for same-microsecond events
			},
			
			// Legacy timestamp for backward compatibility
			timestamp: "string", // ISO string derived from serverTimestamp
			
			source: "string",
			verificationMethod: "string"
		},
		
		semanticExpansion: {
			// Separate subdocument structure
			fieldContext: "FieldContext",
			expansionStrategy: "ExpansionStrategy", 
			semanticAxes: "SemanticAxes",
			qualityMetrics: "QualityMetrics"
		},
		
		systemMetadata: {
			tier: "string", // short, intermediate, long
			importance: "number",
			accessCount: "number",
			lastAccessed: "number", // UNIX timestamp with microseconds
			relationshipCount: "number", // number of semantic connections
			
			// Enhanced temporal tracking
			createdAt: "number", // UNIX timestamp when entry was first created
			lastModified: "number", // UNIX timestamp when entry was last modified
			accessHistory: "number[]" // Array of access timestamps (limited to last N accesses)
		}
	},

	// AGENT OPERATIONAL GUIDELINES (Simplified)
	agentGuidelines: {
		initialization: [
			"Agent declares personality type at startup",
			"System loads appropriate semantic expansion defaults", 
			"Agent can request personality change with justification",
			"Override capabilities based on agent role and experience"
		],
		
		memoryOperations: [
			"Use personality defaults for routine operations",
			"Apply task override only when necessary",
			"Store semantic expansion in structured subdocument",
			"Validate semantic relationships for quality"
		],
		
		qualityAssurance: [
			"Monitor semantic expansion effectiveness",
			"Adjust strategies based on usage analytics",
			"Provide feedback on semantic relationship quality",
			"Participate in continuous improvement of expansion algorithms"
		]
	},

	// HUMAN INTERFACE (Simplified)
	humanInterface: {
		personalitySelection: {
			description: "Humans can specify preferred agent personality for different tasks",
			options: ["security_focused", "architecture_specialist", "development_generalist", "innovation_explorer"],
			customization: "Humans can adjust personality defaults for specific projects or domains"
		},
		
		semanticVisibility: {
			description: "Structured semantic metadata is visible and editable",
			presentation: "Semantic axes displayed separately from core content",
			interaction: "Users can validate, edit, or enhance semantic relationships"
		}
	},

	// METADATA
	metadata: {
		created: "2025-08-25",
		author: "AI Agent Memory System",
		foundation_lineage: ["v1.5.0", "v1.6.0", "v1.7.0", "v1.7.1"],
		refinements_from_v170: [
			"Reduced cognitive load through agent personality defaults",
			"Structured semantic expansion as separate subdocuments", 
			"Simplified field context assessment",
			"Enhanced object model for better queryability",
			"Server-side UNIX timestamp encoding with microsecond precision",
			"Temporal metadata tracking for causality analysis and debugging"
		],
		compatibility: {
			backward: "Full compatibility with v1.5.0, v1.6.0, v1.7.0",
			forward: "Foundation for adaptive semantic AI architectures"
		},
		validation_status: "Design refinement ready for implementation",
		deployment_readiness: "Ready for development and testing"
	}
};
