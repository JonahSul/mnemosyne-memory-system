# Mnemosyne Foundation Protocol

_Current canonical baseline: **Foundation v1.7.0** (Multi‑Axis Semantic Expansion), extended with topic/task/document rigor and MCP onramp semantics._

This document is the single, authoritative overview of how agents should interact with the Mnemosyne Memory System.

## 1. Core Principles

- **Topic / Task / Document Rigor**
  - Every stored memory is tagged with:
    - **Topics** from the 25‑term universal taxonomy (e.g. `structure`, `flow`, `state`, `control`, `semantics`, `agent`).
    - A **documentType** (e.g. `raw_memory`, `note`, `plan`, `analysis`, `log`).
    - A **task context** (`taskId`, optional label, mode: `read` / `write` / `read-write`, and task topics).
    - **Agent attribution** (`uuad`, optional role and federation node).
  - Writes are **fail‑closed** if this metadata is missing or invalid.

- **Multi‑Axis Semantic Expansion (v1.7.0)**
  - Every memory can be expanded along three axes:
    - **Near‑Semantic Neighbors** – direct synonyms and technical variants.
    - **Related Concepts** – conceptually connected technical domains.
    - **Analogical Patterns** – cross‑domain, pattern‑level analogies.
  - Expansion behavior is controlled by a **field precision matrix** (security vs. architecture vs. development vs. exploration).

- **Multi‑Tier Memory & Forgetting**
  - Memories are organized into short‑, intermediate‑, and long‑term tiers.
  - Promotion/demotion and deletion follow forgetting‑curve‑inspired policies.

- **Search Discipline**
  - Semantic search uses vector embeddings, **adaptive thresholds**, and field‑aware axis weighting.
  - Reads are **fail‑open**: retrieval never fails because of telemetry or observability features.

- **Behavioral Rules & Runtime Updates**
  - A behavioral rules system governs how agents may read/write and transform memory.
  - Rules can be updated at runtime in a controlled way ("Foundation updates").

## 2. Semantic Expansion (Foundation v1.7.0)

Foundation v1.7.0 (see `docs/foundation-v1.7.0-guide.md`) defines the **Multi‑Axis Semantic Expansion Architecture**:

- **Axes**
  - `nearSemanticNeighbor`: tight synonyms and terminology variants.
  - `relatedConcept`: conceptually related but broader or adjacent topics.
  - `analogicalPattern`: cross‑domain patterns useful for transfer learning.

- **Field Precision Matrix**
  - Critical fields (e.g. security/safety) use high precision (≈ 0.90–0.95) with conservative expansion.
  - Architecture and core systems use balanced precision (≈ 0.80–0.90).
  - Development/operations use medium precision (≈ 0.60–0.80) to favor discovery.
  - Innovation/exploration uses lower precision (≈ 0.30–0.60) to maximize analogical expansion.

- **Mandatory Rules for Agents**
  - Always apply field‑appropriate precision coefficients.
  - Include at least the minimum required semantic axes for the field.
  - Validate cross‑domain and analogical connections (no gratuitous noise).
  - Persist enough metadata for later inspection of expansion decisions.

## 3. Metadata Contract for Writes (vNext)

Any agent writing to Mnemosyne must treat the following as **required** metadata for each memory write:

- `topics: TopicId[]`
  - At least a minimum number of topics from the universal taxonomy.

- `documentType: DocumentType`
  - Describes the role of the memory (e.g. `note`, `plan`, `analysis`, `log`).

- `task: TaskContext`
  - `taskId` – stable identifier for the current task.
  - Optional `taskLabel` – human‑readable description.
  - `mode` – `read`, `write`, or `read-write`.
  - `topics` – the topics most relevant to this task.

- `agent: AgentAttribution`
  - `uuad` – unique agent descriptor.
  - Optional `agentRole` and `federationNodeId`.

**System behavior:**

- On **writes**, invalid or missing metadata causes the operation to be rejected (fail‑closed), protecting topic/task/document rigor.
- On **reads**, metadata is interpreted best‑effort; retrieval does not fail because of telemetry issues.

## 4. Topic Access & Observability

To support analytics, orientation, and task‑aware behavior, the system emits **topic access events** whenever a recall/search operation returns memories:

- `TOPIC_ACCESSED` events (via the pubsub layer) carry:
  - `topicIds` – union of topics inferred from the retrieved memories.
  - `query` – the search query string.
  - `resultCount` – number of results returned.
  - `memoryIds` – identifiers of the retrieved memories.
  - Optional `agent`, `task`, `mode`, and diagnostic metadata.

Properties:

- This telemetry is **best‑effort** and **non‑blocking**.
- It enables:
  - Per‑task and per‑agent topic profiles.
  - Heatmaps of active topics.
  - Orientation services that show “what the system is about” for a given task.

## 5. Agent Onramp (How to Get Oriented)

When connecting as an agent (via MCP or other integration), follow this minimal onramp procedure:

1. **Call the Foundation Info Endpoint**
   - Use the MCP tool (e.g. `foundation_info`) to retrieve:
     - Current Foundation version and summary.
     - Key principles and expectations.
     - Recommended starting commands.

2. **Run the Orientation Sequence**
   - Use the orientation/onramp tool (e.g. `orientation_onramp`) to get:
     - A short list of orientation steps.
     - Known long‑term orientation memory IDs (e.g. system overview, quick start, behavioral lessons).
   - Execute the recommended search:
     - `memory_search_tiered query="orientation" tierPreference="long-term" threshold=0.01`.
   - Inspect the retrieved long‑term memories.

3. **Align Your Behavior with Foundation**
   - When writing memories:
     - Always include topics, documentType, task, and agent metadata.
     - Respect field‑specific precision for semantic expansion.
   - When reading:
     - Use topic‑aware, task‑aligned queries.
     - Consider topic access events as hints about what the system and other agents focus on.

## 6. Imperative Agent Loop & Causality

**Quiet Operation:** Agents should perform memory operations (search, store) silently in the background unless errors or protocol hints occur. Do not narrate or announce every memory access—treat the memory system like working memory, not a verbose journal. See [Quiet Operation Examples](./docs/quiet-operation-examples.md) for correct vs. incorrect patterns.

Agents must treat the memory system as an explicit checkpoint for facts, decisions, and results. For any non-trivial claim or action, follow this loop:

1. **Search Before Stating a Fact**

- Call `search_knowledge` (or `search_fulltext`) with a concise query describing the fact, decision, or pattern you need.
- Treat high-similarity results as prior evidence and cite their `id` values in later writes.
- If evidence is weak or absent, downgrade your statement to a **hypothesis**, not a fact.

1. **Record Decisions, Hypotheses, and Plans**

- Use `store_knowledge` with:
  - `documentType` in {`HYPOTHESIS`, `DECISION`, `TASK_PLAN`, `FACT`}.
  - `task.id` bound to a stable task identifier.
  - `agent` filled with your unique identity.
  - `causality.precedentMemoryIds` listing supporting memory IDs from your prior search.
  - `causality.assertionId` to bind a family of memories (hypothesis, decision, result) about the same assertion.

1. **Perform the Task**

- Optionally store `TASK_PLAN` / `TASK_EXECUTION` memories that describe how you intend to verify or act on the assertion.
- Keep `task.id` and `causality.assertionId` consistent so future agents can reconstruct the chain.

1. **Record Results (Prove or Disprove)**

- After executing, store a `RESULT` memory with:
  - `documentType: "RESULT"`.
  - The same `causality.assertionId` as the hypothesis/decision.
  - `result.status` ∈ {`PROVEN`, `DISPROVEN`, `PARTIAL`}.
  - Any relevant quantitative or qualitative metrics in `result.metrics`.

1. **Maintain Full Causality**

- Use `causality.precedentMemoryIds` to link each memory back to its evidence, hypotheses, and plans.
- Future agents should search by `task.id`, `documentType`, `topics`, and (where supported) `causality.assertionId` to learn from past successes and mistakes.

### Protocol Drift & Hints

The system may emit **protocol hints** when your writes appear to violate the imperative loop (for example, missing `task.id` or missing `causality.precedentMemoryIds` on assertions). Clients should treat these hints as a request to:

- Refresh their understanding via `foundation_info` and `orientation_onramp`.
- Re-issue writes with corrected metadata (binding to a task, linking to precedent memories, and tracking assertion IDs).

## 7. Relationship to Detailed Documentation

`FOUNDATION.md` is an overview. Detailed behavior and implementation notes live in `./docs`:

- Semantic expansion and Foundation v1.7.0:
  - `docs/foundation-v1.7.0-guide.md`
- Behavioral rules and runtime updates:
  - `docs/behavioral-rules-system.md`
  - `docs/runtime-foundation-updates.md` (if present)
- Memory and search architecture:
  - `docs/multi-tier-memory.md`
  - `docs/semantic-search.md`
  - `docs/dynamic-threshold-tuning.md`
- MCP integration and tools:
  - `docs/tools-registry.md`
  - `docs/mcp-integration.md` (if present)

As the system evolves (e.g. formalizing "Foundation v1.8.0"), this file should be updated to reflect the current operational protocol and any new mandatory rules for agents.
