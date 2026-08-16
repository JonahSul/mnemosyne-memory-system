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
├── scripts/              → Version bump, KV setup
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

## Deployment Pipeline

```
push/PR → ci.yml
  ├─ test (build + test) ← THE GATE
  ├─ docs (dev only, needs test)
  └─ bump-version (push only, needs test)
       ├─ dev: prerelease vX.Y.Z-dev.N → npm dev tag
       └─ main: patch/minor/major → npm latest + GitHub Release + docs
            ↓ commits [skip ci], pushes v<version> tag
tag v* → publish.yml
  └─ publish immutable artifact from tagged SHA
```

- **Local gates**: Husky pre-commit (lint-staged), pre-push (build + test)
- **CI gate**: ci.yml test job must pass before bump-version runs
- **Publish**: publish.yml fires on tag push, checks out the tagged SHA
- **Branch naming**: `feat/`, `fix/`, `docs/`, `refactor/`, `ci/`, `chore/`
- **Local dev**: DevContainer / Node 22 (`@mnemosyne/cli` with SQLite, or `wrangler dev`)
