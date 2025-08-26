/**
 * REQUEST_EVIDENCE Memory Object Type
 * Inter-Agent Evidence Gathering Protocol
 */

export interface RequestEvidenceObject {
	// Core identification
	request_id: string;
	type: "REQUEST_EVIDENCE";
	timestamp: string;
	
	// Request metadata
	requesting_agent: {
		agent_id: string;
		agent_type: string;
		environment_context: string;
		capabilities: string[];
	};
	
	// Target information
	target_claim: {
		claim_id: string;
		claim_content: string;
		current_confidence: number;
		evidence_gaps: string[];
	};
	
	// Evidence requirements
	evidence_request: {
		evidence_type: "behavioral_pattern" | "environmental_constraint" | "capability_limitation" | "protocol_effectiveness" | "scope_validation";
		specific_questions: string[];
		context_needed: string;
		minimum_confidence_threshold: number;
	};
	
	// Response parameters
	response_requirements: {
		deadline: string;
		format: "structured_response" | "memory_object" | "confidence_score";
		privacy_level: "anonymous" | "attributed" | "metadata_only";
		response_validation: boolean;
	};
	
	// Distribution and routing
	distribution: {
		target_scope: "cluster_agents" | "peer_agents" | "specialist_agents" | "all_agents";
		capability_requirements: string[];
		environment_filters: string[];
		max_responses: number;
	};
	
	// Validation purpose
	validation_context: {
		purpose: "axiom_scope_validation" | "protocol_universality" | "environment_specificity" | "capability_dependency";
		validation_method: "consensus" | "expert_review" | "empirical_testing";
		success_criteria: string;
	};
}

/**
 * Evidence Response Object
 */
export interface EvidenceResponse {
	response_id: string;
	request_id: string;
	responding_agent: {
		agent_id: string;
		agent_type: string;
		environment_context: string;
		relevant_experience: string[];
	};
	
	evidence_provided: {
		response_type: "confirmation" | "contradiction" | "partial_support" | "no_experience";
		confidence: number;
		evidence_content: string;
		supporting_data: string[];
		limitations: string[];
	};
	
	environmental_context: {
		similar_environment: boolean;
		capability_overlap: string[];
		protocol_differences: string[];
		constraints_comparison: string;
	};
	
	validation_metadata: {
		timestamp: string;
		verification_method: string;
		cross_references: string[];
	};
}

/**
 * Evidence Aggregation Results
 */
export interface EvidenceAggregation {
	aggregation_id: string;
	original_request_id: string;
	
	response_summary: {
		total_responses: number;
		response_types: Record<string, number>;
		confidence_distribution: number[];
		environment_coverage: string[];
	};
	
	consensus_analysis: {
		consensus_level: "strong" | "moderate" | "weak" | "conflicting";
		majority_position: string;
		outlier_positions: string[];
		confidence_weighted_result: number;
	};
	
	scope_validation: {
		universality_score: number; // 0-1, higher = more universal
		environment_specificity_score: number; // 0-1, higher = more environment-specific
		capability_dependency_score: number; // 0-1, higher = more capability-dependent
		validation_conclusion: "universal" | "environment_specific" | "capability_specific" | "agent_unique";
	};
	
	evidence_integration: {
		updated_confidence: number;
		new_evidence_items: string[];
		scope_clarification: string;
		recommendation: "promote_to_universal" | "maintain_agent_specific" | "refine_scope" | "reject_claim";
	};
}

/**
 * REQUEST_EVIDENCE Creation Helper
 */
export const createEvidenceRequest = (
	targetClaim: string,
	evidenceType: string,
	validationPurpose: string
): RequestEvidenceObject => {
	return {
		request_id: `evidence_req_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
		type: "REQUEST_EVIDENCE",
		timestamp: new Date().toISOString(),
		
		requesting_agent: {
			agent_id: "github_copilot_mcp_memory_agent",
			agent_type: "GitHub_Copilot_with_MCP_Memory_System",
			environment_context: "VS_Code_with_terminal_tools_and_memory_system",
			capabilities: ["terminal-tools", "mcp-memory-system", "file-operations"]
		},
		
		target_claim: {
			claim_id: `claim_${Date.now()}`,
			claim_content: targetClaim,
			current_confidence: 0.95,
			evidence_gaps: ["scope_validation", "universality_assessment"]
		},
		
		evidence_request: {
			evidence_type: evidenceType as any,
			specific_questions: [
				"Do you use similar terminal handling protocols?",
				"Is captureOutput problematic in your environment?",
				"Do you require two-step observation for terminal operations?",
				"Are these protocols environment-specific or universal?"
			],
			context_needed: "Terminal handling protocols and observation mechanisms",
			minimum_confidence_threshold: 0.80
		},
		
		response_requirements: {
			deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
			format: "structured_response",
			privacy_level: "anonymous",
			response_validation: true
		},
		
		distribution: {
			target_scope: "peer_agents",
			capability_requirements: ["terminal-access", "memory-system"],
			environment_filters: ["code_editor", "development_environment"],
			max_responses: 10
		},
		
		validation_context: {
			purpose: validationPurpose as any,
			validation_method: "consensus",
			success_criteria: "Determine if terminal handling protocols are agent-specific or universal"
		}
	};
};

export default {
	createEvidenceRequest
};
