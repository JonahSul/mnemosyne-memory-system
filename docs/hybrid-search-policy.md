Hybrid Search Policy
Status: Draft
Date: 2025-08-24
Owners: Memory Agent, Human Developer

Purpose
Define how to execute and merge results from Vectorize (structured behavioral memory) and AutoRAG (artifact/document knowledge) with predictable quality and resilience.

Inputs
- query: string
- context: { workloadType, expectedResults, tierPreference?, allowAutoRAG?: boolean, allowVectorize?: boolean }

Execution Plan
1) Preprocess
- Optional query rewrite/expansion.
- Decide sources: default allow both; disable a source if feature flag or cost/latency budget exceeded.

2) Parallel retrieval
- Vectorize: embed(query) via env.AI, query index with tier filters (if any).
- AutoRAG: aiSearch(query) via env.AI.autorag(serviceName).
- Collect latencies and partial errors.

3) Score normalization
- Normalize source scores into [0,1]. Apply boosts:
  - Tier-aware boosts to Vectorize results: axiom +0.15, long +0.10, intermediate +0.05, short +0.
  - Source/context boosts: if workloadType=="document" or query length > L, AutoRAG +0.05; if workloadType=="behavioral", Vectorize +0.05.

4) Deduplication
- If items share same id/url/title, keep the higher score.
- Otherwise, compute text-similarity (cosine on mini-embeddings or string sim); if ≥0.9, dedupe.

5) Budgeted ranking
- Respect expectedResults (k). Use latency-aware tie-breakers (faster source wins ties).
- Return results with provenance: {source, id, tier?, score, title?, snippet?, uri?, metadata}.

6) Fallback and annotation
- If one source fails, return the other with a note.
- If both fail, return empty with diagnostic info (no silent failures).

Observability
- Log per-source latency, hit counts, dedupe rate, and final blend ratios.
- Emit counters for cache hits and promotions triggered by query access.

Configuration
- Feature flags for boosts, thresholds, and source enablement.
- Service names and index bindings from environment.

Testing
- Golden query sets spanning behavioral lookups and document retrieval.
- Fault injection: timeouts, partial failures, high-latency scenarios.
