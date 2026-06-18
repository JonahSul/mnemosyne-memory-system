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
│   ├── mnemosyne/          → @mnemosyne/core (types, services, domains)
│   ├── mnemosyne-cloudflare/ → @mnemosyne/cloudflare (Vectorize, AI binding)
│   ├── mnemosyne-mcp/      → @mnemosyne/mcp (MCP server for Workers)
│   ├── mnemosyne-pubsub/   → @mnemosyne/pubsub (event bus + SSE)
│   ├── mnemosyne-sqlite/   → @mnemosyne/sqlite (local SQLite + MCP server)
│   └── mnemosyne-sqlite-vscode/ → VS Code extension
├── src/                  → Cloudflare Worker entry point
├── tests/                → Vitest suite
├── docker/               → Dockerfiles (qdrant, redis, ollama)
├── scripts/              → Version bump, KV setup, migrations
└── typedoc.json          → API doc generation config
```

## Dependency Graph

```
@mnemosyne/core (no intra-repo deps)
    ↑ deps on core
@mnemosyne/cloudflare  @mnemosyne/pubsub  @mnemosyne/sqlite
    ↑                              ↑                    ↑
    └──────────┬───────────────────┘                    │
               ↓                                        │
        @mnemosyne/mcp (MCP server)                     │
               │                                        │
               └──────────┬─────────────────────────────┘
                          ↓
              mnemosyne-sqlite-vscode (VS Code ext)
```

## Key Architecture Patterns

### Delegator Pattern
Module composition via method routing. `Delegator` class autodiscovers methods from registered modules and dispatches calls. Used in `memory-tool.ts`.

### Multi-Tier Memory
Three tiers: short-term (aggressive pruning), intermediate-term (frequency-based), long-term (persistent). Forgetting curves applied per tier.

### Semantic Search
Vector embeddings (768-dim, BGE-base-en-v1.5) with adaptive thresholds. Workload-aware tuning for precision/recall balance.

### Foundation System
Hot-deployable behavioral rules. Foundation v1.7.0 canonical. Rules: Verify Before Claim, Ask for Help When Blocked, Evidence-Based Claims, Systematic Debugging, Progressive Disclosure.

## Build Order

When building from clean: `pnpm build` runs:
1. `@mnemosyne/core` → produces `dist/library.js`
2. `@mnemosyne/pubsub` → depends on core types
3. `@mnemosyne/cloudflare` → depends on core interfaces
4. `@mnemosyne/sqlite` → depends on core interfaces

`@mnemosyne/mcp` and `mnemosyne-sqlite-vscode` build separately.

## Test Structure

- `tests/` root — integration & behavioral tests (Vitest)
- Not all packages have `test` scripts; core tests run from root

## Deployment

- **Dev branch** → CI runs tests + pre-release npm publish (dev tag)
- **Main branch** → CI runs tests + version bump + npm publish (latest) + GitHub Release
- **Local** → Docker compose (qdrant + redis + ollama) or wrangler dev
