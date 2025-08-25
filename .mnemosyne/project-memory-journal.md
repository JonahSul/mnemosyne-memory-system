# Mnemosyne Project Memory Journal

This document is an authoritative, agent-maintained memory of work performed on the mnemosyne-memory-system repository. It is intended primarily for recovery, onboarding new agents, and auditability.

## 1. Project Overview
- Purpose: Mnemosyne is a multi-tier memory system that provides AI agents with persistent, verifiable memory, semantic knowledge storage, behavioral rule enforcement, and self-monitoring.
- Key technologies: TypeScript, Cloudflare Workers, Vector embeddings (semantic search), Model Context Protocol (MCP), multi-tier memory architecture (short/intermediate/long-term), runtime foundation updates.
- High-level architecture: Agents call MCP tools to interact with memory components. Knowledge is stored as semantic vectors in a vector store, with a tiered persistence layer for prioritized retention. Foundation rules govern behavioral constraints and can be hot-deployed.

## 2. Getting Started
### Prerequisites
- Node.js (recommended 18+)
- npm or pnpm
- Cloudflare account (for Workers & Durable Objects) if using deployment
- Environment variables configured per `.env.example` (MCP endpoints, API keys)

### Installation
1. npm install
2. Copy `.env.example` to `.env` and configure

### Basic usage
- Development: `npm run dev`
- Run tests: `npm test` or `npm run test`
- Build: `npm run build`
- Deploy: `npm run deploy`

### Running tests
- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`

## 3. Project Structure
- src/: TypeScript source code and MCP integrations
- migrations/: foundation migration definitions and examples
- .mnemosyne/: local exports, snapshots, and rehydration helpers (important for recovery)
  - agent-activity-journal.md (agent-maintained activity log)
  - project-memory-journal.md (this file)
  - memory-state-2025-08-23.json (snapshot)
  - knowledge-store.tmp.json (knowledge export)
  - memory-rehydrator.ts/.js (restoration tooling)
- vector-backups/: archived vector backups and exports
- docs/: developer-facing docs and examples

Key files
- README.md — project overview and quick start
- memory-rehydrator.ts — scripted rehydration logic (simulated restore in repo)
- .mnemosyne/memory-state-2025-08-23.json — snapshot used in recovery attempts

## 4. Development Workflow
- Branching: feature branches per task, merge via PR with CI checks
- Coding standards: TypeScript with strict mode; prefer small, testable modules
- Testing: unit tests for core logic, integration tests for MCP interactions
- Deployment: use `npm run deploy` to publish to Cloudflare Workers; foundation changes may be hot-deployed
- Contribution: open issues, submit PRs, include tests and update docs

## 5. Key Concepts
- Claim: A logged assertion that requires later verification (truth-tracking)
- Violation: Logged behavioral failure used for learning and correction
- Foundation: Set of behavioral rules that constrain agents; can be hot-deployed
- Tiered memory: Multi-layered storage (short/intermediate/long-term) with different retention policies
- KV vs Vector Store: KV used for critical, small objects; vector store used for semantic similarity retrieval

## 6. Common Tasks
- Store knowledge: call `memory_store_knowledge` with content and metadata
- Store tiered knowledge: call `memory_store_tiered` with importance and targetTier
- Log claim: call `memory_log_claim` immediately after making assertions
- Verify claim: call `memory_verify_claim` when evidence is obtained
- Record violation: call `memory_record_violation` on behavioral failures
- Export state: `memory_export_state` for snapshots
- Restore from snapshots: `memory_restore_from_snapshots`

Examples
- Logging a claim:
  - `memory_log_claim({ claim: 'X', confidence: 'medium', source: 'agent' })`
- Storing critical protocol:
  - `memory_store_knowledge({ content: 'REFINED TERMINAL BEHAVIORAL PROTOCOL', metadata: {...}, tags:['terminal-protocol'], importance:'critical' })`

## 7. Troubleshooting
- Symptom: Tiered writes time out
  - Cause: MCP tiered endpoint latency or misconfiguration
  - Mitigation: Fall back to memory_store_knowledge (KV-backed) and retry tiered storage with exponential backoff; log all steps to memory
- Symptom: Vector store backfill returns 0 items
  - Cause: No snapshots indexed or snapshot naming mismatch
  - Mitigation: Check .mnemosyne for snapshot files; run memory_backfill_from_vector_store with lower minSimilarity threshold or increase maxItems
- Symptom: Foundation rules missing
  - Cause: Not loaded or improper migration
  - Mitigation: Re-apply foundation with memory_update_foundation (migration object) and ensure backup

## 8. References
- README.md (project root)
- .mnemosyne/memory-rehydrator.ts
- .mnemosyne/memory-state-2025-08-23.json
- migrations/foundation.ts

## Assumptions & Items needing verification
- Deployment configuration details (Cloudflare account, worker names) — NEEDS_VERIFICATION
- Exact test commands and CI steps — NEEDS_VERIFICATION
- Any missing exports: confirm whether knowledge-store-export.json and memory-state-export.json exist or need to be generated — NEEDS_VERIFICATION

## Lessons Learned
- Always verify writes immediately using a read operation (search or export_state) and log a claim about the write.
- Prefer KV for critical persistence; use tiered writes for semantic ranking when available.
- Maintain canonical exports in `.mnemosyne` for reliable recovery.

---

(Agent-maintained on 2025-08-24)
