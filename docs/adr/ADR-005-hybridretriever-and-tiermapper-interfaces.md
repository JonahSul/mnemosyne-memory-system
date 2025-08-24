Title: ADR-005 HybridRetriever and TierMapper scaffolding interfaces
Status: Proposed
Date: 2025-08-24
Owners: Memory Agent, Human Developer

Context
- ADR-002 and ADR-003 call for a HybridRetriever (hybrid orchestration) and a TierMapper (cognitive→persistence mapping).
- We need baseline interfaces and initial behaviors to integrate and iterate.

Decision
- Introduce src/modules/hybrid-retriever.ts implementing parallel retrieval, score normalization, tier-aware boosts, deduplication, and provenance.
- Introduce src/modules/tier-mapper.ts implementing mapping rules and actions consistent with ADR-003.

Scope
- These modules are scaffolds meant to be wired into UnifiedMemoryFacade and tool registries.

Consequences
- Pros: Clear integration points; enables testing and telemetry.
- Cons: Additional orchestration complexity; needs real env bindings for AutoRAG and Vectorize to achieve production parity.

Implementation Notes
- HybridRetriever
  - Inputs: query, options (workloadType, expectedResults, tierPreference, allowAutoRAG, allowVectorize, threshold)
  - Outputs: ranked items with provenance and stats; latencies per source; annotations on failures.
  - Default boosts: tiers (axiom 0.15, long 0.10, intermediate 0.05), workload-type source boosts (document→AutoRAG, behavioral→Vectorize).
  - Dedupe: id/uri/title equality, fallback Jaccard ≥ 0.9 on snippets.
- TierMapper
  - selectCognitiveTier by importance thresholds (≥0.9 axiom, ≥0.7 long, ≥0.3 intermediate, else short).
  - Persistence mapping per ADR-003 with promotion actions and write-through/checkpoint markers.

Testing
- Unit tests for boosts and deduplication behavior.
- Tier mapping tests for boundary cases (importance 0.69/0.7/0.9) and promotion triggers.

Next Steps
- Wire HybridRetriever into UnifiedMemoryFacade as the default path for hybrid queries.
- Expose TierMapper decisions in analytics and promotion workflows; add write-through hooks.
