Title: ADR-002 Hybrid retrieval: AutoRAG vs Vectorize boundaries and merge policy
Status: Proposed
Date: 2025-08-24
Owners: Memory Agent, Human Developer

Context
- We have two retrieval paths:
  1) AutoRAG over R2 artifacts (deployment-resilient document knowledge)
  2) Vectorize index for structured behavioral memory and knowledge items
- Without clear boundaries, we risk duplication, cost, and inconsistent results.

Decision
- Boundary of responsibility:
  - AutoRAG: Artifact/document corpora uploaded to R2 (docs, logs, runbooks, collaboration notes, exports). Source of truth for deployment-resilient historical knowledge.
  - Vectorize: Structured memory items (behavioral claims, violations, rules, checkpoints, short notes) with strict schemas and IDs.
- Hybrid query orchestration merges sources with source-aware scoring and de-duplication.

Merge Policy
- Execute in parallel:
  - AutoRAG.aiSearch(query)
  - Vectorize.query(embedding(query)) with tier filters
- Normalize scores per source; apply boosts:
  - Source boost: Vectorize +0.05 for structured behavioral items; AutoRAG +0.05 for long-form documents when the query length > N or contains doc-like terms.
  - Tier-aware boosts (see ADR-003) applied to Vectorize results only.
- Deduplicate by URL/ID/title similarity (≥0.9 string sim or ≥0.95 cosine content sim); keep higher confidence.
- Return combined ranked list with provenance {source, id, tier?, metadata}.

Fallbacks
- If Vectorize unavailable: serve AutoRAG results; annotate read-only mode.
- If AutoRAG unavailable: serve Vectorize results; annotate reduced coverage.

Consequences
- Pros: Clear separation, cost control, consistent retrieval behavior, resilience.
- Cons: More orchestration code; additional normalization/merging logic.

Implementation Plan
- Create HybridRetriever orchestrator with pluggable scorers and dedupe.
- Add telemetry: per-source latency, hit ratios, dedupe rate, user-visible quality.
- Feature flags to tune boosts and thresholds at runtime.

Testing
- Golden-query sets validating merged ranking stability and provenance.
- Fault-injection tests simulating source outages.

Operational Notes
- Monitor AutoRAG costs and latencies separately from Vectorize.
- Cache frequent embeddings and query rewrites to reduce cost/latency.
