/**
 * Foundation v1.7.0 - Multi-Axis Semantic Expansion Architecture
 *
 * FOUNDATION EVOLUTION:
 * - v1.5.0: Evidence-based accountability, atomic memory patterns
 * - v1.6.0: Instinctual Behavioral Priority System (disabled scaffold)
 * - v1.7.0: Multi-Axis Semantic Expansion for AI Agent Memory Systems
 *
 * VERSION CODIFICATION: This version formally integrates and standardizes
 * all preceding Foundation principles while introducing structured semantic
 * expansion as a core architectural component for intelligent knowledge organization.
 */
export const foundationMigrationV17 = {
    version: "1.7.0",
    description: "Multi-Axis Semantic Expansion Architecture for AI Agent Memory Systems",
    // INHERITED FOUNDATION PRINCIPLES (v1.5.0 + v1.6.0)
    coreRules: [
        // v1.5.0 Core Principles
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
        // v1.6.0 Behavioral Systems (maintained as disabled)
        {
            id: "instinctual_behavioral_priority",
            name: "Instinctual Behavioral Priority System",
            description: "Priority-based behavioral response system for memory operations",
            threshold: 0.6,
            enabled: false, // Maintained from v1.6.0 disabled state
            inherited_from: "v1.6.0"
        }
    ],
    // NEW v1.7.0 SEMANTIC EXPANSION ARCHITECTURE
    semanticExpansionFramework: {
        enabled: true,
        description: "Multi-axis semantic expansion for enhanced knowledge discovery and pattern recognition",
        axes: {
            nearSemanticNeighbor: {
                name: "Near-Semantic Neighbor Axis",
                description: "Direct technical synonyms and implementation variants",
                precisionRange: { min: 0.85, max: 0.95 },
                application: "Technical accuracy and precision-critical fields",
                examples: [
                    "persistent-storage → durable-storage, non-volatile-storage, permanent-data-storage",
                    "load-balancing → traffic-distribution, request-routing, service-balancing",
                    "authentication → identity-verification, access-control, credential-validation"
                ]
            },
            relatedConcept: {
                name: "Related-Concept Axis",
                description: "Conceptually connected technical domains",
                precisionRange: { min: 0.60, max: 0.80 },
                application: "Architectural patterns and cross-system learning",
                examples: [
                    "database → storage → caching → memory-management",
                    "networking → routing → load-balancing → service-discovery",
                    "security → authentication → authorization → audit-logging"
                ]
            },
            analogicalPattern: {
                name: "Analogical-Pattern Axis",
                description: "Cross-domain patterns and transferable lessons",
                precisionRange: { min: 0.30, max: 0.60 },
                application: "Discovery-oriented learning and creative problem-solving",
                examples: [
                    "primary/fallback → DNS/backup-DNS, master/slave-DB, CDN/origin",
                    "circuit-breaker → electrical-fuse, network-timeout, rate-limiting",
                    "delegation → proxy-pattern, ambassador-pattern, gateway-pattern"
                ]
            }
        },
        fieldCriticalityMatrix: {
            "security_safety": {
                precision: { min: 0.90, max: 0.95 },
                description: "Mission-critical accuracy required",
                mandatory_axes: ["nearSemanticNeighbor"],
                optional_axes: ["relatedConcept"]
            },
            "core_architecture": {
                precision: { min: 0.80, max: 0.90 },
                description: "High reliability with balanced expansion",
                mandatory_axes: ["nearSemanticNeighbor", "relatedConcept"],
                optional_axes: ["analogicalPattern"]
            },
            "development_patterns": {
                precision: { min: 0.60, max: 0.80 },
                description: "Balanced discovery and accuracy",
                mandatory_axes: ["nearSemanticNeighbor", "relatedConcept", "analogicalPattern"],
                optional_axes: []
            },
            "operational_lessons": {
                precision: { min: 0.40, max: 0.70 },
                description: "Learning-oriented with discovery emphasis",
                mandatory_axes: ["relatedConcept", "analogicalPattern"],
                optional_axes: ["nearSemanticNeighbor"]
            },
            "innovation_exploration": {
                precision: { min: 0.30, max: 0.60 },
                description: "Broad exploration and creative connections",
                mandatory_axes: ["analogicalPattern"],
                optional_axes: ["relatedConcept", "nearSemanticNeighbor"]
            }
        },
        implementationRules: {
            minimumTags: {
                nearSemanticNeighbor: 3,
                relatedConcept: 5,
                analogicalPattern: 7
            },
            maximumTags: {
                total: 40,
                perAxis: 15
            },
            validationCriteria: [
                "Tags must demonstrate clear semantic relationships",
                "Expansion must enhance discoverability without noise",
                "Cross-domain connections must be technically justified",
                "Documentation must explain semantic reasoning"
            ]
        }
    },
    // ESSENTIAL PATTERNS (Enhanced with Semantic Expansion)
    essentialPatterns: [
        {
            name: "Evidence-Based Storage",
            confidence: 0.9,
            pattern: "All knowledge storage must include evidence, confidence scores, and verification methods",
            semantic_tags: {
                nearSemanticNeighbor: ["evidence-based-storage", "verified-knowledge-storage", "confidence-scored-memory"],
                relatedConcept: ["audit-trail-storage", "provenance-tracking", "knowledge-verification"],
                analogicalPattern: ["scientific-method", "peer-review-process", "quality-assurance-systems"]
            }
        },
        {
            name: "Multi-Tier Memory Architecture",
            confidence: 0.8,
            pattern: "Organize memory across short-term, intermediate, and long-term tiers based on importance and access patterns",
            semantic_tags: {
                nearSemanticNeighbor: ["tiered-storage", "hierarchical-memory", "stratified-data-organization"],
                relatedConcept: ["cache-hierarchy", "storage-optimization", "data-lifecycle-management"],
                analogicalPattern: ["library-cataloging", "filing-system-organization", "human-memory-structure"]
            }
        },
        {
            name: "Persistent Storage Architecture",
            confidence: 0.95,
            pattern: "Critical system state must never rely on volatile memory; use KV/Vector storage for persistence",
            semantic_tags: {
                nearSemanticNeighbor: ["durable-storage", "non-volatile-persistence", "guaranteed-durability"],
                relatedConcept: ["database-transactions", "ACID-properties", "data-consistency"],
                analogicalPattern: ["document-filing", "safe-deposit-storage", "backup-redundancy"]
            }
        }
    ],
    // SAFETY CONSTRAINTS (Enhanced)
    safetyConstraints: [
        {
            id: "semantic_expansion_quality",
            description: "Semantic expansion must not introduce noise or irrelevant connections",
            threshold: 0.7,
            enforcement: "automatic",
            validation: "Tag relevance scoring and usage analytics"
        },
        {
            id: "field_appropriate_precision",
            description: "Precision coefficients must match field criticality requirements",
            threshold: 0.8,
            enforcement: "mandatory",
            validation: "Automatic field detection and precision verification"
        },
        {
            id: "cross_domain_justification",
            description: "Analogical pattern connections must be technically defensible",
            threshold: 0.6,
            enforcement: "advisory",
            validation: "Documentation requirements and peer review"
        }
    ],
    // MEMORY SYSTEM INTEGRATION
    memoryIntegration: {
        storeMemoryEnhancement: {
            enabled: true,
            description: "Automatic semantic expansion during memory storage operations",
            configuration: {
                autoExpansion: true,
                fieldDetection: true,
                precisionMatching: true,
                qualityValidation: true
            }
        },
        searchOptimization: {
            enabled: true,
            description: "Leverage semantic axes for enhanced discovery",
            configuration: {
                axisWeighting: {
                    nearSemanticNeighbor: 0.4,
                    relatedConcept: 0.35,
                    analogicalPattern: 0.25
                },
                dynamicThresholds: true,
                crossAxisDiscovery: true
            }
        }
    },
    // AGENT OPERATIONAL GUIDELINES
    agentGuidelines: {
        mandatoryPractices: [
            "Apply multi-axis semantic expansion to all memory storage operations",
            "Match precision coefficients to field criticality levels",
            "Validate semantic relationships for technical accuracy",
            "Document expansion reasoning for complex technical concepts"
        ],
        bestPractices: [
            "Use near-semantic expansion for critical system documentation",
            "Apply related-concept expansion for architectural decisions",
            "Leverage analogical patterns for creative problem-solving",
            "Balance precision with discoverability based on use case"
        ],
        qualityChecks: [
            "Do expanded tags enhance knowledge discovery?",
            "Are semantic relationships technically justified?",
            "Does precision level match field requirements?",
            "Will future searches benefit from these connections?"
        ]
    },
    // HUMAN INTERFACE GUIDELINES
    humanInterface: {
        documentation: {
            required: [
                "Explain semantic expansion reasoning for complex entries",
                "Provide field criticality justification",
                "Document cross-domain pattern connections",
                "Include precision coefficient rationale"
            ],
            formatting: {
                tagStructure: "Organize by axis with clear semantic progression",
                examples: "Provide concrete examples for each expansion type",
                rationale: "Explain why specific connections enhance discoverability"
            }
        },
        searchInteraction: {
            queryEnhancement: "System suggests semantically related search terms",
            resultPresentation: "Group results by semantic axis for better understanding",
            feedbackLoop: "User feedback improves semantic relationship quality"
        }
    },
    // METADATA
    metadata: {
        created: "2025-08-25",
        author: "AI Agent Memory System",
        foundation_lineage: ["v1.5.0", "v1.6.0", "v1.7.0"],
        compatibility: {
            backward: "Full compatibility with v1.5.0 and v1.6.0",
            forward: "Foundation for advanced semantic AI architectures"
        },
        validation_status: "Tested through practical implementation",
        deployment_readiness: "Ready for staged deployment with monitoring"
    }
};
