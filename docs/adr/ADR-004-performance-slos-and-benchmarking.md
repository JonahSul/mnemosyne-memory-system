Title: ADR-004 Performance SLOs and benchmarking methodology
Status: Proposed
Date: 2025-08-24
Owners: Memory Agent, Human Developer

Context
- Prior performance assumptions were based on local mocks.
- We need explicit SLOs and a repeatable benchmarking method for Worker-native embeddings and Vectorize search, plus hybrid orchestration.

Decisions
- Initial SLO targets (subject to revision after baseline runs):
  - Embedding generation: p50 ≤ 300ms, p95 ≤ 800ms (batched where possible)
  - Vector search (768d, ≤100k vectors): p50 ≤ 150ms, p95 ≤ 400ms
  - Hybrid query orchestration (Vectorize + AutoRAG): p50 ≤ 400ms, p95 ≤ 900ms
  - Cold-start recovery to functional memory: ≤ 30s
  - Checkpoint integrity success: ≥ 99.9% over 7 days
- Benchmark methodology:
  - Workloads: short queries, doc-style queries, and behavioral lookups.
  - Index sizes: 10k, 50k, 100k; measure latency and recall@k.
  - Embedding: compare single vs batched (N∈{1,4,8,16}); track cost and tail latency.
  - Threshold calibration: learn similarity distributions; auto-tune per workload.
  - Cold-start: measure time to rehydrate Adaptive caches from R2 and establish checkpoints.
- Observability:
  - Metrics: per-source latency (p50/p95), errors, queue depth, cache hit ratio, dedupe rate, promotion counts.
  - Tracing: annotate spans by source (autorag|vectorize) and cognitive tier.

Implementation Plan
- Add a perf-test harness script using Miniflare or Cloudflare test env with env bindings.
- Seed indexes with synthetic and real sampled data; define golden queries.
- Capture results to vector-backups/perf-reports/ with timestamps.

Risks
- Cold starts and regional variance may widen p95.
- Cost-sensitive batched embeddings may introduce queueing latency.

Rollback/Adjustment
- If SLOs are missed, enable feature flags: reduce AutoRAG usage, increase caching, adjust thresholds, batch more conservatively.
