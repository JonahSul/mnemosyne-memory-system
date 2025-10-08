/**
 * Foundation v1.5.0: Evidence-Based Accountability & Atomic Memory Architecture
 *
 * This foundation establishes rigorous standards for evidence-based memory storage,
 * accountability mechanisms, and optimal usage patterns for the memory system.
 */
export const foundationMigrationV15 = {
    version: "1.5.0",
    description: "Evidence-Based Accountability & Atomic Memory Architecture",
    // Core Behavioral Rules in expected format
    coreRules: [
        // Legacy v1.4.3 behavioral rules (preserved for compatibility)
        {
            id: "no-unverified-claims",
            rule: "Never claim something is \"fixed\" without verification",
            description: "Ensure all claims are backed by evidence or proper verification",
            priority: "critical",
            enforcement: "strict",
            examples: [
                "❌ \"The bug is fixed\" (without testing)",
                "✅ \"The bug is fixed, confirmed by test case XYZ\"",
                "❌ \"This should work now\" (without verification)",
                "✅ \"Tested successfully - here's the output log\""
            ]
        },
        {
            id: "systematic-approach",
            rule: "Break down complex problems systematically",
            description: "Use systematic approaches to solve complex problems",
            priority: "high",
            enforcement: "advisory",
            examples: [
                "Create step-by-step debugging plans",
                "Use structured approaches for complex tasks",
                "Document systematic problem-solving processes",
                "Break large problems into manageable components"
            ]
        },
        {
            id: "consult-memory-before-response",
            rule: "Always consult memory before responding to user queries",
            description: "Check relevant memories and patterns before providing responses",
            priority: "critical",
            enforcement: "strict",
            examples: [
                "Search memory for relevant patterns before answering",
                "Check previous solutions to similar problems",
                "Validate responses against stored knowledge",
                "Use memory search to provide context-aware answers"
            ]
        },
        // New v1.5.0 evidence-based accountability rules
        {
            id: "evidence-first-principle",
            rule: "Every factual claim must include verifiable evidence before storage",
            description: "No statement of fact enters memory without supporting evidence that can be independently verified",
            priority: "critical",
            enforcement: "strict",
            examples: [
                "Store test results with specific output logs as evidence",
                "Include file counts or metrics when making system claims",
                "Cross-reference new information with existing memory",
                "Use verification_method to indicate validation approach"
            ]
        },
        {
            id: "atomic-commit-pattern",
            rule: "Store information in small, focused, atomic units rather than large blocks",
            description: "Optimize for granular knowledge building that enables precise retrieval and validation",
            priority: "high",
            enforcement: "advisory",
            examples: [
                "Store single observations rather than complex multi-part claims",
                "Break down behavioral patterns into individual instances",
                "Use focused content with specific evidence per storage operation",
                "Avoid bundling unrelated information in single memory entries"
            ]
        },
        {
            id: "accountability-chain",
            rule: "Establish clear accountability mechanisms beyond human oversight",
            description: "Build systematic validation into the memory system itself",
            priority: "critical",
            enforcement: "strict",
            examples: [
                "Use pre-storage validation against existing memory",
                "Implement evidence quality assessment with confidence scoring",
                "Enable periodic re-validation of stored claims",
                "Track provenance through verification methods"
            ]
        }
    ],
    // Essential Patterns for optimal usage
    essentialPatterns: [
        {
            pattern: "high-confidence-storage",
            description: "Store facts with evidence array and high confidence (0.8+)",
            desiredOutcome: "positive",
            interventions: [
                "Require evidence array for confidence > 0.8",
                "Use verification_method to establish provenance",
                "Cross-reference with existing memory for consistency"
            ]
        },
        {
            pattern: "medium-confidence-observations",
            description: "Store observations with context and medium confidence (0.5-0.8)",
            desiredOutcome: "positive",
            interventions: [
                "Include supporting context for observations",
                "Use intermediate tier for temporary patterns",
                "Mark as observations rather than definitive facts"
            ]
        },
        {
            pattern: "low-confidence-hypotheses",
            description: "Store hypotheses and assumptions with low confidence (0.2-0.5)",
            desiredOutcome: "neutral",
            interventions: [
                "Clearly mark as hypotheses requiring validation",
                "Store in short-term tier for quick decay",
                "Include rationale for hypothesis formation"
            ]
        },
        {
            pattern: "atomic-memory-commits",
            description: "Store information in small, focused units for better retrieval",
            desiredOutcome: "positive",
            interventions: [
                "Break complex information into atomic units",
                "Focus each storage operation on single concepts",
                "Avoid bundling unrelated information together"
            ]
        },
        {
            pattern: "evidence-based-validation",
            description: "Cross-validate claims against existing memory with evidence",
            desiredOutcome: "positive",
            interventions: [
                "Search existing memory before making claims",
                "Provide evidence for contradictory information",
                "Update confidence based on memory consensus"
            ]
        }
    ],
    // Safety Constraints for system integrity
    safetyConstraints: [
        {
            constraint: "evidence-requirement-threshold",
            rationale: "Require evidence for claims above confidence 0.6 to maintain system reliability",
            enforcement: "warning"
        },
        {
            constraint: "cross-validation-requirement",
            rationale: "Cross-validate against memory for confidence above 0.8 to prevent contradictions",
            enforcement: "warning"
        },
        {
            constraint: "atomic-storage-preference",
            rationale: "Prefer granular storage over bulk information dumps for better retrieval",
            enforcement: "logging"
        },
        {
            constraint: "provenance-tracking",
            rationale: "Always include verification method for accountability and audit trails",
            enforcement: "logging"
        }
    ],
    // Metadata for foundation management
    metadata: {
        author: "Mnemosyne Memory System",
        timestamp: new Date().toISOString(),
        changelog: [
            "Introduced evidence-based accountability architecture",
            "Added atomic memory commit patterns",
            "Implemented systematic accountability chains",
            "Established empirical confidence thresholds",
            "Added provenance tracking mechanisms"
        ],
        compatibleWith: ["1.4.x", "1.3.x"],
        replaces: "1.4.3",
        notes: "Major architectural upgrade focusing on evidence-based operations and accountability",
        empiricalBasis: "Foundation v1.4.3 empirical thresholds: exploration=0.014, recall=0.036, precision=0.300, evidence_required=0.6, cross_validation=0.8"
    }
};
