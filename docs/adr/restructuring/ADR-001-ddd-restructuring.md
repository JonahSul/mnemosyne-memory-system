# ADR-001: DDD Restructuring — SaaS Architecture with Pure Domain Model

- **Status:** accepted
- **Date:** 2026-08-02
- **Deciders:** Jonah Sul

## Context

The Mnemosyne memory system had grown into an architecturally fractured
codebase with two parallel architectures:

1. **New DDD layer** (`core/`, `domains/`, `services/`, `interfaces/`) — clean,
   typed, `BaseManager`-based. Exported via `library.ts`. **Not used at runtime.**
2. **Legacy operational layer** (`modules/`, `memory-tool.ts`,
   `multi-tier-memory.ts`) — Delegator-pattern facade, the actual runtime.
   Used its own `memory-interfaces.ts` types (duplicating `core/types/`).

Key problems identified:
- `memory-tool.ts` was a 928-line god class importing 14 modules directly.
- Volatile storage (`core-memory.ts`, `multi-tier-memory.ts`) shipped alongside
  real persistent implementations (`persistent-core-memory.ts`,
  `persistent-tier-memory.ts`).
- Production `wrangler.jsonc` had no `MEMORY_KV` binding, but the code threw
  FATAL without it — `memory_store`/`memory_search` would crash in prod.
- SSE was fake (Worker routed `/sse` to POST JSON-RPC; Express sent one
  message then idled).
- `@mnemosyne/mcp` was a 30-line stub spawner, not a real MCP server.
- 18 Foundation migration files with 5 conflicting "current" version claims.
- Mocks and stubs in published packages (mock embeddings, `kv: {} as any`,
  "Mock threat analysis").

## Decision

Restructure the entire codebase along DDD lines into a SaaS architecture:

### Package structure

| Package | Scope | Role |
|---------|-------|------|
| `@mnemosyne/core` | `packages/mnemosyne-core/` | Pure domain model — aggregates, services, use cases. Zero I/O deps. |
| `@mnemosyne/infra-cloudflare` | `packages/mnemosyne-infrastructure-cloudflare/` | Real Cloudflare adapters (Vectorize, KV, R2, Workers AI). No mocks. |
| `@mnemosyne/infra-sqlite` | `packages/mnemosyne-infrastructure-sqlite/` | Real SQLite adapters (better-sqlite3, sqlite-vec). No mocks. |
| `@mnemosyne/mcp-server` | `packages/mnemosyne-mcp-server/` | Real MCP SDK server with tool registry. Replaces stub. |
| `@mnemosyne/streaming` | `packages/mnemosyne-streaming/` | Real SSE + WebSocket. No fake SSE. |
| `@mnemosyne/pubsub` | `packages/mnemosyne-pubsub/` | Event bus (kept, fixed). |
| `@mnemosyne/saas` | `packages/mnemosyne-saas/` | Cloudflare Worker — composition root. |
| `@mnemosyne/cli` | `packages/mnemosyne-cli/` | Standalone MCP server over stdio (SQLite). |
| `@mnemosyne/vscode` | `packages/mnemosyne-sqlite-vscode/` | VS Code extension (kept). |

Legacy packages (`@mnemosyne/legacy-*`) are retained temporarily and will be
deleted in Phase 7 after all code is migrated.

### Architectural rules

1. **Domain is pure.** `@mnemosyne/core` has zero I/O dependencies. All storage
   is via interfaces (`VectorStoreAdapter`, `KeyValueStoreAdapter`).
2. **Infrastructure is swappable.** Two real adapter packages (Cloudflare,
   SQLite). No mock adapters in published packages — test shims live in
   `tests/fixtures/`.
3. **Composition roots bind adapters to domain.** `@mnemosyne/saas` binds
   Cloudflare adapters; `@mnemosyne/cli` binds SQLite adapters.
4. **MCP server is real and reusable.** Used by both SaaS (HTTP) and CLI
   (stdio).
5. **Streaming is real.** SSE with heartbeat + event dispatch; WebSocket with
   Cloudflare Hibernation API.
6. **Memory is shard-able.** `ShardKey` value object (tenant + tier + topic)
   enforced by the `Memory` aggregate. Fail-closed on writes without a valid
   shard key.
7. **Foundation version is canonical in one place.** `FOUNDATION.md` header +
   `FoundationRulesAggregate.version`. No scattered version claims.
8. **No mocks or stubs in production paths.** Everything that ships is real.

### Bounded contexts

- **Memory** — `Memory` aggregate root (fail-closed metadata validation,
  shard key enforcement, tier placement)
- **Tier** — `TierManagementService` (multi-tier, forgetting curves, shard-able)
- **Search** — `SearchService` (adaptive thresholds, semantic + fulltext)
- **Foundation** — `FoundationRulesAggregate` (behavioral rules, single seed)
- **Causality** — `CausalityService` (Lamport/Vector/HLC clocks)
- **Federation** — `FederationService` (identity, auth, governance)

## Migration phases

1. **Phase 1 — Scaffolding** (this ADR): create new packages, rename old ones
   to `legacy-*`, verify builds + tests pass. ✅ Complete.
2. **Phase 2 — Domain extraction**: extract real logic from `modules/` into
   `@mnemosyne/core/domain/`. Delete `modules/memory-interfaces.ts` (duplicate
   types). Collapse 18 migration files into `seedFoundationRules()`.
3. **Phase 3 — Application services**: extract use cases from `memory-tool.ts`
   + `simplified-registry.ts` into `@mnemosyne/core/application/`. Delete the
   928-line god class.
4. **Phase 4 — Infrastructure adapters**: move real implementations from
   legacy packages into `@mnemosyne/infra-*`. Move test shims to
   `tests/fixtures/`. Fix `wrangler.jsonc` production bindings.
5. **Phase 5 — SaaS Worker + MCP server**: real routing, real MCP SDK server,
   real tool registry. Delete `src/agent.ts`, `src/index.ts`,
   `src/tools/simplified-registry.ts`.
6. **Phase 6 — Real streaming**: SSE + WebSocket + event router. Wire domain
   events → pubsub → streaming → clients.
7. **Phase 7 — Clean up**: delete all legacy packages, `src/` directory,
   stale code comments, and update all documentation.

## Consequences

- **Positive:** Clean separation of concerns, swappable infrastructure, no
  mocks in production, real streaming, single-source-of-truth for Foundation
  version, shard-able multi-tier memory.
- **Negative:** Large migration effort (7 phases). Legacy packages coexist
  temporarily. Some code is stubbed with `throw new Error('not yet implemented
  (Phase N)')` until the real logic is extracted.
- **Risk:** The `throw` stubs in new packages must NOT ship to npm. Phase 7
  must complete before publishing `@mnemosyne/*` v2.0.0.
