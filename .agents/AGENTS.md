# Mnemosyne Memory System — Agent Guidance

Repo agent entry point. Skills below give concise context for common tasks. Browse `skills/` for topic-specific guidance.

## Quick Links

| Skill | When |
|-------|------|
| [repo-architecture](skills/repo-architecture/SKILL.md) | Understand monorepo layout, package deps, key patterns |
| [code-quality](skills/code-quality/SKILL.md) | Lint, test, build expectations |
| [doc-standards](skills/doc-standards/SKILL.md) | README, JSDoc, ADR conventions |
| [cavecrew](skills/cavecrew/SKILL.md) | When to delegate to caveman subagents |
| [caveman](skills/caveman/SKILL.md) | Compressed communication mode |

## Root Layout

```
.agents/            → Agent guidance & skills
.github/workflows/  → ci.yml (gate+tag), publish.yml (npm publish)
.husky/             → pre-commit (lint-staged), pre-push (build+test)
config/             → Runtime config (query-rewrite, etc.)
copilot-notes/      → Upload scripts, training data
docs/               → ADRs, architecture guides
packages/
  mnemosyne-core/   → @mnemosyne/core (domain model)
  mnemosyne-pubsub/ → @mnemosyne/pubsub (event bus)
  mnemosyne-infrastructure-cloudflare/ → @mnemosyne/infra-cloudflare
  mnemosyne-infrastructure-sqlite/     → @mnemosyne/infra-sqlite
  mnemosyne-mcp-server/ → @mnemosyne/mcp-server
  mnemosyne-streaming/ → @mnemosyne/streaming
  mnemosyne-saas/    → @mnemosyne/saas (Cloudflare Worker)
  mnemosyne-cli/     → @mnemosyne/cli
scripts/            → version-bump.mjs, KV setup, migrations
```

## Branch Naming

| Pattern | Purpose |
|---------|---------|
| `feat/<desc>` | New feature |
| `fix/<desc>` | Bug fix |
| `docs/<desc>` | Documentation |
| `refactor/<desc>` | Refactoring |
| `ci/<desc>` | CI/CD changes |
| `chore/<desc>` | Maintenance |

Branch from `dev`, kebab-case, delete after merge.

## CI/CD Pipeline

```
push/PR → ci.yml
  ├─ test (build + test) ← THE GATE
  ├─ docs (dev only, needs test)
  └─ bump-version (push only, needs test)
       ├─ dev: prerelease vX.Y.Z-dev.N
       └─ main: patch/minor/major from commits since last tag
            ↓ commits [skip ci], pushes v<version> tag
tag v* → publish.yml
  ├─ checkout tagged SHA (immutable)
  ├─ pnpm build + test (prove the artifact)
  ├─ npm publish (--tag dev for prerelease, --tag latest for release)
  └─ release: GitHub Release + docs deploy (release only)
```

Pre-commit: `lint-staged` (tsc --noEmit on staged files).
Pre-push: `pnpm build && pnpm test` (blocks push on failure).

## Core Patterns

- **DDD bounded contexts** — Memory, Tier, Search, Foundation, Causality, Federation
- **Application services** — use cases orchestrate domain services
- **Ports & adapters** — infrastructure implements @mnemosyne/core ports
- **Multi-tier memory** — short/intermediate/long-term with forgetting curves
- **Semantic search** — vector embeddings + adaptive thresholds
- **Foundation system** — hot-deployable behavioral rules

## NPM Packages

| Package | Published | Docs |
|---------|-----------|------|
| `@mnemosyne/core` | ✅ npm | packages/mnemosyne-core/ |
| `@mnemosyne/pubsub` | ✅ npm | packages/mnemosyne-pubsub/ |
| `@mnemosyne/infra-cloudflare` | ✅ npm | packages/mnemosyne-infrastructure-cloudflare/ |
| `@mnemosyne/infra-sqlite` | ✅ npm | packages/mnemosyne-infrastructure-sqlite/ |
| `@mnemosyne/mcp-server` | ✅ npm | packages/mnemosyne-mcp-server/ |
| `@mnemosyne/streaming` | ✅ npm | packages/mnemosyne-streaming/ |
| `@mnemosyne/saas` | ✅ npm | packages/mnemosyne-saas/ |
| `@mnemosyne/cli` | ✅ npm | packages/mnemosyne-cli/ |
