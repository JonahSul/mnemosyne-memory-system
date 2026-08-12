---
name: repo-architecture
description: >
  Mnemosyne monorepo layout, package dependency graph, and key architectural
  patterns (Delegator, multi-tier memory, foundation system, semantic search).
  Use for orientation when starting a new task or understanding system scope.
---

# Repo Architecture

## Monorepo Layout

```
mnemosyne-memory-system/
├── .agents/              → Agent guidance & skills
├── .github/              → CI/CD, chatmodes, prompts
├── config/               → Query-rewrite config
├── copilot-notes/        → Embedding upload scripts
├── docs/                 → ADRs, architecture guides
├── packages/
│   ├── mnemosyne-core/   → @mnemosyne/core (domain model, ports)
│   ├── mnemosyne-pubsub/ → @mnemosyne/pubsub (event bus + SSE)
│   ├── mnemosyne-infrastructure-cloudflare/ → @mnemosyne/infra-cloudflare
│   ├── mnemosyne-infrastructure-sqlite/     → @mnemosyne/infra-sqlite
│   ├── mnemosyne-mcp-server/ → @mnemosyne/mcp-server (MCP server)
│   ├── mnemosyne-streaming/ → @mnemosyne/streaming (SSE + WS)
│   ├── mnemosyne-saas/    → @mnemosyne/saas (Cloudflare Worker)
│   └── mnemosyne-cli/     → @mnemosyne/cli (local CLI)
├── docker/               → Dockerfiles (qdrant, redis, ollama)
├── scripts/              → Version bump, KV setup, migrations
└── typedoc.json          → API doc generation config
```

## Dependency Graph

```
@mnemosyne/core (no intra-repo deps)
    ↑ deps on core
@mnemosyne/infra-cloudflare  @mnemosyne/infra-sqlite  @mnemosyne/mcp-server
    ↑                              ↑                    ↑
    └──────────┬───────────────────┘                    │
               ↓                                        │
        @mnemosyne/streaming (SSE + WS)                │
               │                                        │
               └──────────┬─────────────────────────────┘
                          ↓
              @mnemosyne/saas (Cloudflare Worker)
              @mnemosyne/cli (local CLI)
```

## Key Architecture Patterns

### DDD Bounded Contexts
Six bounded contexts: Memory, Tier, Search, Foundation, Causality, Federation. Each has aggregates, services, and types in `@mnemosyne/core/src/domain/`.

### Application Services (Use Cases)
`@mnemosyne/core/src/application/` — StoreMemoryUseCase, SearchMemoryUseCase, GetSystemStatsUseCase, AdministerFoundationUseCase, StoreEnhancedMemoryUseCase, AnalyzeCausalityUseCase. Orchestrate domain services; no business logic.

### Ports & Adapters
`@mnemosyne/core/src/shared/` defines ports (VectorStoreAdapter, KeyValueStoreAdapter, EventPublisher, EmbeddingProvider). Infrastructure packages implement them. Composition roots (`@mnemosyne/saas`, `@mnemosyne/cli`) bind adapters to the domain.

### Multi-Tier Memory
Four tiers: axiom, long, intermediate, short. Forgetting curves applied per tier.

### Semantic Search
Vector embeddings (768-dim, BGE-base-en-v1.5) with adaptive thresholds.

### Foundation System
Hot-deployable behavioral rules. Foundation v1.8.0 canonical.

## Build Order

When building from clean: `pnpm build` runs all 8 packages:
1. `@mnemosyne/core` → domain model
2. `@mnemosyne/pubsub` → event bus
3. `@mnemosyne/infra-cloudflare` → Cloudflare adapters
4. `@mnemosyne/infra-sqlite` → SQLite adapters
5. `@mnemosyne/mcp-server` → MCP server
6. `@mnemosyne/streaming` → SSE + WS
7. `@mnemosyne/saas` → Cloudflare Worker
8. `@mnemosyne/cli` → local CLI

## Test Structure

- Tests live in each package's `tests/` directory (Vitest)
- Run from root: `pnpm test`

## Deployment

- **Dev branch** → CI runs tests + pre-release npm publish (dev tag)
- **Main branch** → CI runs tests + version bump + npm publish (latest) + GitHub Release
- **Local** → Docker compose (qdrant + redis + ollama) or wrangler dev
