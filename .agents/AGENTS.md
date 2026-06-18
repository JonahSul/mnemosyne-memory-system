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
  mnemosyne/          → @mnemosyne/core
  mnemosyne-cloudflare/ → @mnemosyne/cloudflare
  mnemosyne-mcp/      → @mnemosyne/mcp
  mnemosyne-pubsub/   → @mnemosyne/pubsub
  mnemosyne-sqlite/   → @mnemosyne/sqlite (+ VS Code ext)
src/                → Cloudflare Worker entry point
tests/              → Vitest test suite
```

## Core Patterns

- **Delegator pattern** — module composition via method routing
- **Multi-tier memory** — short/intermediate/long-term with forgetting curves
- **Semantic search** — vector embeddings + adaptive thresholds
- **Foundation system** — hot-deployable behavioral rules

## NPM Packages

| Package | Published | Docs |
|---------|-----------|------|
| `@mnemosyne/core` | ✅ npm | packages/mnemosyne/ |
| `@mnemosyne/cloudflare` | ✅ npm | packages/mnemosyne-cloudflare/ |
| `@mnemosyne/pubsub` | ✅ npm | packages/mnemosyne-pubsub/ |
| `@mnemosyne/sqlite` | ✅ npm | packages/mnemosyne-sqlite/ |
| `@mnemosyne/mcp` | ✅ npm | packages/mnemosyne-mcp/ |
| `mnemosyne-sqlite-vscode` | VS Marketplace | packages/mnemosyne-sqlite-vscode/ |
