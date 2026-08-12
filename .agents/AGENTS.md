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
.github/            → CI/CD, chatmodes, prompts
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
```

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
