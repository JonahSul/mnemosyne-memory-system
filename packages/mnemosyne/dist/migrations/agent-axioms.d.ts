/**
 * Agent Axioms - Self-Generated Behavioral Principles
 * Subject to ARBITER truthiness validation before axiom tier placement
 */
export interface AgentAxiomCandidate {
    id: string;
    axiom: string;
    description: string;
    authority: "agent";
    source_instinct_id?: string;
    validation_status: "pending" | "arbiter_review" | "validated" | "rejected";
    evidence: string[];
    confidence: number;
    promotion_metrics: {
        successful_applications: number;
        consistency_score: number;
        evidence_quality: number;
        validation_count: number;
        time_observed: string;
    };
    arbiter_assessment?: {
        truthiness_score: number;
        validation_method: string;
        reviewer_id: string;
        timestamp: string;
        notes: string;
    };
}
export declare const agentAxiomCandidates: AgentAxiomCandidate[];
export declare const promoteInstinctToAxiomCandidate: (instinctId: string, promotionEvidence: string[]) => Promise<AgentAxiomCandidate>;
export declare const submitToArbiterValidation: (candidate: AgentAxiomCandidate) => Promise<AgentAxiomCandidate>;
export declare const validateUserAxiomFromPattern: (userStatement: string, memoryEvidence: string[]) => Promise<AgentAxiomCandidate>;
//# sourceMappingURL=agent-axioms.d.ts.map