/**
 * Agent-Specific Foundation v1.6.0 Extension
 * Terminal Handling Protocols - Environment-Specific Axioms for THIS Agent
 *
 * These are NOT globally expected behaviors, but specific to this agent's
 * capabilities, environment, and operational constraints.
 */
export declare const agentSpecificFoundation: {
    /**
     * AGENT IDENTITY AND SCOPE
     */
    agentContext: {
        agentType: string;
        environment: string;
        capabilities: string[];
        constraints: string[];
        version: string;
    };
    /**
     * TERMINAL HANDLING AXIOMS - Agent-Specific Environment Protocols
     */
    terminalHandlingAxioms: {
        twoStepObservationProtocol: {
            axiom: string;
            step1: string;
            step2: string;
            rationale: string;
            confidence: number;
            evidence: string[];
            agentSpecific: boolean;
        };
        terminalSafetyFirewall: {
            axiom: string;
            priorityOverride: boolean;
            mandatoryConsultation: boolean;
            acknowledgmentRequired: boolean;
            panicStopOnBlindness: boolean;
            rationale: string;
            confidence: number;
            agentSpecific: boolean;
        };
        mandatorySequence: string[];
        hardCodedSafetyRules: {
            captureOutputForbidden: {
                rule: string;
                replacement: string;
                rationale: string;
                confidence: number;
            };
            terminalEqualsTwoStep: {
                rule: string;
                cognitiveModel: string;
                rationale: string;
                confidence: number;
            };
            liveWorkstationProtection: {
                rule: string;
                priority: string;
                rationale: string;
                confidence: number;
            };
        };
    };
    /**
     * INSTINCT SYSTEM AXIOMS - Agent-Specific Behavioral Triggers
     */
    instinctSystemAxioms: {
        automaticRecallMechanisms: {
            terminalThinkingTrigger: {
                axiom: string;
                triggerWords: string[];
                immediateResponse: string;
                unconsciousActivation: boolean;
                rationale: string;
                confidence: number;
                agentSpecific: boolean;
            };
            cognitiveAssociation: {
                axiom: string;
                mentalModel: string;
                preventsSingleStepMistakes: boolean;
                shapesThoughtPatterns: boolean;
                confidence: number;
                agentSpecific: boolean;
            };
        };
        priorityOverrideSystem: {
            terminalSafetyFirewall: {
                axiom: string;
                confidence: number;
                priorityOverride: boolean;
                blockingBehavior: boolean;
                mandatorySurfacing: boolean;
                rationale: string;
                agentSpecific: boolean;
            };
        };
    };
    /**
     * AGENT LEARNING AND ADAPTATION PROTOCOLS
     */
    agentLearningAxioms: {
        violationDetection: {
            axiom: string;
            immediateReporting: boolean;
            atomicLogging: boolean;
            evidenceRequirement: string;
            rationale: string;
            agentSpecific: boolean;
        };
        protocolAdaptation: {
            axiom: string;
            evidenceBasedUpdates: boolean;
            consistencyValidation: boolean;
            backwardCompatibility: boolean;
            rationale: string;
            agentSpecific: boolean;
        };
    };
    /**
     * AGENT FOUNDATION INTEGRATION
     */
    foundationIntegration: {
        scope: string;
        globalApplicability: boolean;
        environmentDependency: boolean;
        toolSetDependency: string[];
        note: string;
    };
};
/**
 * Agent-Specific Axiom Validation
 */
export declare const validateAgentSpecificAxiom: (axiomId: string) => boolean;
export default agentSpecificFoundation;
//# sourceMappingURL=agent-specific-foundation.d.ts.map