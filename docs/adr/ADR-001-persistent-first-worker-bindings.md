Title: ADR-001 Persistent-first storage via Cloudflare Worker bindings (AI + Vectorize)
Status: Proposed
Date: 2025-08-24
Owners: Memory Agent, Human Developer

Context
- Prior implementation relied on mock/in-memory stores and HTTP APIs with credentials.
- We have Cloudflare Worker bindings for AI and Vectorize that eliminate credential handling and improve reliability.
- Performance assumptions from local mocks are invalid in production Worker environments.

Decision
- Adopt persistent-first design with native Worker bindings:
  - Embeddings: env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [...] })
  - Vector store: env.VECTORIZE_INDEX.{upsert,query}
- Disallow storing critical data solely in Durable Objects or in-memory.
- Establish a single unified storage backend class (CloudflareVectorStore) used by all tools.
- Standardize on 768-d embeddings.

Scope
- Applies to all memory persistence and search components in Mnemosyne.
- Includes migration of integration tests to use Worker bindings (or stubs that mimic bindings under test runners).

Out of Scope
- Specific hybrid query merging (covered by ADR-002 and Hybrid Search Policy).
- Cognitive tiering rules (ADR-003).

Consequences
- Pros: Security (no tokens), reliability, production alignment, simpler configuration.
- Cons: Higher latency than mocks; requires perf tuning and batching; CI integration requires local Worker stubs.

Implementation Plan
- Introduce CloudflareVectorStore as the sole persistence surface.
- Remove or gate legacy API-based code paths; keep a dev-only mock behind explicit flags for unit tests.
- Wire MCP tools to route storage/search via CloudflareVectorStore.
- Add configuration and guards for 768 dimensions.

Operational Notes
- Ensure wrangler.jsonc includes AI and Vectorize bindings.
- Add runbooks for: cold start, snapshot/restore, index maintenance, and embedding batching.

Testing
- Unit tests: keep deterministic mocks.
- Integration tests: run with Miniflare or Worker test harness exposing env bindings.
- Performance tests: measure real latencies against staging indexes.

Rollback Strategy
- If Worker bindings are unavailable, fail closed with clear errors and fall back to read-only from R2 artifacts via AutoRAG where applicable.
