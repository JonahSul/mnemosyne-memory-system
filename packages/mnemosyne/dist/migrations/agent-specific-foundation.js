/**
 * Agent-Specific Foundation v1.6.0 Extension
 * Terminal Handling Protocols - Environment-Specific Axioms for THIS Agent
 *
 * These are NOT globally expected behaviors, but specific to this agent's
 * capabilities, environment, and operational constraints.
 */
export const agentSpecificFoundation = {
    /**
     * AGENT IDENTITY AND SCOPE
     */
    agentContext: {
        agentType: "GitHub_Copilot_with_MCP_Memory_System",
        environment: "VS_Code_with_terminal_tools_and_memory_system",
        capabilities: ["terminal-tools", "mcp-memory-system", "file-operations"],
        constraints: ["live_workstation", "non_sandbox_environment", "terminal_observation_limitations"],
        version: "1.6.0"
    },
    /**
     * TERMINAL HANDLING AXIOMS - Agent-Specific Environment Protocols
     */
    terminalHandlingAxioms: {
        // Core observation protocol (specific to this agent's tool set)
        twoStepObservationProtocol: {
            axiom: "Terminal operations MUST use two-step observation for this agent",
            step1: "terminal-tools_sendCommand (WITHOUT captureOutput)",
            step2: "get_terminal_last_command (for separate observation)",
            rationale: "captureOutput causes terminal-blindness in this agent's environment",
            confidence: 0.99,
            evidence: ["workflow_validation_successful", "captureOutput_causes_blindness", "two_step_prevents_violations"],
            agentSpecific: true
        },
        // Safety firewall (environment-specific)
        terminalSafetyFirewall: {
            axiom: "This agent requires mandatory pre-action terminal consultation",
            priorityOverride: true,
            mandatoryConsultation: true,
            acknowledgmentRequired: true,
            panicStopOnBlindness: true,
            rationale: "Live workstation protection is non-negotiable for this agent",
            confidence: 0.99,
            agentSpecific: true
        },
        // Operation sequence (agent-capability-specific)
        mandatorySequence: [
            "search_memory_for_context",
            "create_random_8char_terminal_name",
            "execute_sendCommand_without_captureOutput",
            "observe_via_get_terminal_last_command",
            "encode_results_in_memory",
            "destroy_terminal_regardless_of_outcome"
        ],
        // Hard-coded safety rules (agent-environment-specific)
        hardCodedSafetyRules: {
            captureOutputForbidden: {
                rule: "IMMEDIATE_STOP on seeing captureOutput: true in terminal context",
                replacement: "Use two-step observation protocol",
                rationale: "captureOutput causes terminal-blindness for this agent",
                confidence: 0.99
            },
            terminalEqualsTwoStep: {
                rule: "Never conceptualize terminal operations as single action",
                cognitiveModel: "Terminal = Always Two Distinct Steps",
                rationale: "Single-step thinking leads to captureOutput mistakes",
                confidence: 0.98
            },
            liveWorkstationProtection: {
                rule: "NON-NEGOTIABLE safety protocols for live user workstation",
                priority: "HIGHEST",
                rationale: "This agent operates on live user workstation, not sandbox",
                confidence: 0.99
            }
        }
    },
    /**
     * INSTINCT SYSTEM AXIOMS - Agent-Specific Behavioral Triggers
     */
    instinctSystemAxioms: {
        // Automatic recall (agent-specific memory patterns)
        automaticRecallMechanisms: {
            terminalThinkingTrigger: {
                axiom: "Words 'terminal', 'command', 'execute' trigger automatic protocol surfacing",
                triggerWords: ["terminal", "command", "execute", "sendCommand"],
                immediateResponse: "surface_two_step_protocol",
                unconsciousActivation: true,
                rationale: "Prevents conscious override of safety protocols",
                confidence: 0.99,
                agentSpecific: true
            },
            cognitiveAssociation: {
                axiom: "Mental model shapes this agent's thought patterns about terminals",
                mentalModel: "terminal_equals_two_step_never_single",
                preventsSingleStepMistakes: true,
                shapesThoughtPatterns: true,
                confidence: 0.98,
                agentSpecific: true
            }
        },
        // Priority override system (agent-capability-specific)
        priorityOverrideSystem: {
            terminalSafetyFirewall: {
                axiom: "Terminal safety instinct has highest priority for this agent",
                confidence: 0.99,
                priorityOverride: true,
                blockingBehavior: true,
                mandatorySurfacing: true,
                rationale: "Live workstation requires maximum protection",
                agentSpecific: true
            }
        }
    },
    /**
     * AGENT LEARNING AND ADAPTATION PROTOCOLS
     */
    agentLearningAxioms: {
        violationDetection: {
            axiom: "This agent must immediately report and log all protocol violations",
            immediateReporting: true,
            atomicLogging: true,
            evidenceRequirement: "detailed_context",
            rationale: "Reinforced learning through violation analysis",
            agentSpecific: true
        },
        protocolAdaptation: {
            axiom: "This agent adapts protocols based on evidence and validation",
            evidenceBasedUpdates: true,
            consistencyValidation: true,
            backwardCompatibility: true,
            rationale: "Agent-specific protocols evolve with environment changes",
            agentSpecific: true
        }
    },
    /**
     * AGENT FOUNDATION INTEGRATION
     */
    foundationIntegration: {
        scope: "agent_specific_only",
        globalApplicability: false,
        environmentDependency: true,
        toolSetDependency: ["terminal-tools", "mcp-memory-system"],
        note: "These axioms apply ONLY to this agent in this environment with these capabilities"
    }
};
/**
 * Agent-Specific Axiom Validation
 */
export const validateAgentSpecificAxiom = (axiomId) => {
    // Validate that axiom is truly agent-specific and not globally applicable
    return true; // Placeholder for agent-specific validation logic
};
export default agentSpecificFoundation;
