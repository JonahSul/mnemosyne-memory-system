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
export declare const foundationMigrationV171: {
    version: string;
    description: string;
    coreRules: {
        id: string;
        name: string;
        description: string;
        threshold: number;
        enabled: boolean;
        inherited_from: string;
    }[];
    semanticExpansionFramework: {
        enabled: boolean;
        description: string;
        agentPersonalities: {
            security_focused: {
                name: string;
                defaultPrecision: number;
                mandatoryAxes: string[];
                optionalAxes: string[];
                analogicalExpansion: string;
                taskOverride: string;
            };
            architecture_specialist: {
                name: string;
                defaultPrecision: number;
                mandatoryAxes: string[];
                optionalAxes: string[];
                analogicalExpansion: string;
                taskOverride: string;
            };
            development_generalist: {
                name: string;
                defaultPrecision: number;
                mandatoryAxes: string[];
                optionalAxes: never[];
                analogicalExpansion: string;
                taskOverride: string;
            };
            innovation_explorer: {
                name: string;
                defaultPrecision: number;
                mandatoryAxes: string[];
                optionalAxes: string[];
                analogicalExpansion: string;
                taskOverride: string;
            };
        };
        semanticMetadataStructure: {
            fieldContext: {
                domain: string;
                criticalityLevel: string;
                taskType: string;
                assessmentConfidence: string;
            };
            expansionStrategy: {
                selectedPersonality: string;
                precisionCoefficient: string;
                overrideReason: string;
                qualityValidation: string;
            };
            semanticAxes: {
                nearSemanticNeighbor: {
                    tags: string;
                    confidence: string;
                    generationMethod: string;
                    validationStatus: string;
                };
                relatedConcept: {
                    tags: string;
                    confidence: string;
                    conceptualDistance: string;
                    generationMethod: string;
                    validationStatus: string;
                };
                analogicalPattern: {
                    tags: string;
                    confidence: string;
                    crossDomainJustification: string;
                    transferabilityScore: string;
                    generationMethod: string;
                    validationStatus: string;
                };
            };
            qualityMetrics: {
                overallSemanticQuality: string;
                discoverabilityEnhancement: string;
                noiseReduction: string;
                crossAxisCoherence: string;
                usageAnalytics: {
                    searchHits: string;
                    patternMatches: string;
                    crossDomainConnections: string;
                };
            };
        };
        expansionRules: {
            personalityBased: {
                description: string;
                implementation: string;
                overrideConditions: string[];
            };
            structuredStorage: {
                description: string;
                implementation: string;
                benefits: string[];
            };
            qualityFeedback: {
                description: string;
                implementation: string;
                metrics: string[];
            };
        };
    };
    memoryEntryInterface: {
        coreEntry: {
            id: string;
            content: string;
            evidence: string;
            confidence: string;
            temporal: {
                serverTimestamp: string;
                clientTimestamp: string;
                processingLatency: string;
                clockSource: string;
                timezone: string;
                sequenceNumber: string;
            };
            timestamp: string;
            source: string;
            verificationMethod: string;
        };
        semanticExpansion: {
            fieldContext: string;
            expansionStrategy: string;
            semanticAxes: string;
            qualityMetrics: string;
        };
        systemMetadata: {
            tier: string;
            importance: string;
            accessCount: string;
            lastAccessed: string;
            relationshipCount: string;
            createdAt: string;
            lastModified: string;
            accessHistory: string;
        };
    };
    agentGuidelines: {
        initialization: string[];
        memoryOperations: string[];
        qualityAssurance: string[];
    };
    humanInterface: {
        personalitySelection: {
            description: string;
            options: string[];
            customization: string;
        };
        semanticVisibility: {
            description: string;
            presentation: string;
            interaction: string;
        };
    };
    metadata: {
        created: string;
        author: string;
        foundation_lineage: string[];
        refinements_from_v170: string[];
        compatibility: {
            backward: string;
            forward: string;
        };
        validation_status: string;
        deployment_readiness: string;
    };
};
//# sourceMappingURL=foundation-v1.7.1.d.ts.map