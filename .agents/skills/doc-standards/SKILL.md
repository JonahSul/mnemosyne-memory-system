---
name: doc-standards
description: >
  Documentation expectations for Mnemosyne: JSDoc on public APIs, README per
  published package, ADR for significant decisions, TypeDoc generation, and
  cross-linking conventions. Use when creating or reviewing documentation.
---

# Documentation Standards

## Source Code (JSDoc)

All public APIs must have JSDoc with:
- `@param` for each parameter
- `@returns` for return value
- `@throws` for expected errors
- Brief description of the function/class purpose

```typescript
/**
 * Search memory tiers with relevance ranking.
 * @param query - The search query string
 * @param options - Search configuration (tiers, limit, thresholds)
 * @returns Ranked results across tiers
 * @throws If tier configuration is invalid
 */
```

TypeDoc generates API docs from JSDoc. Run: `pnpm docs:generate`.

## Package README

Every published package needs `README.md` in its root:
- Brief description + badges
- Installation (npm / npx / from source)
- Quick start example
- API overview (main exports)
- Configuration reference (if applicable)
- Link to full API docs

Packages requiring README: `@mnemosyne/core`, `@mnemosyne/cloudflare`, `@mnemosyne/mcp`.

✅ Have README: `@mnemosyne/sqlite`, `@mnemosyne/pubsub`, `mnemosyne-sqlite-vscode`.

## ADR (Architecture Decision Records)

Stored in `docs/adr/<topic>/`. Template:
```markdown
# ADR-NNN: Title

- **Status:** proposed | accepted | deprecated | superseded
- **Date:** YYYY-MM-DD
- **Deciders:** [list]

## Context

## Decision

## Consequences
```

Number sequentially within topic (memory/clustering/federation). Keep one decision per ADR.

## Documentation Index

`docs/README.md` provides TOC for all documentation. Update when adding new docs.

## Agent Guidance

`.agents/AGENTS.md` is the entry point. Agent skills in `.agents/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`).

## CI/CD Docs Pipeline

- `pnpm docs:generate` produces `docs/api/` via TypeDoc
- CI publishes `docs/api/` to GitHub Pages on release
- PRs should preview doc changes

## Cross-Linking

- Link between docs with relative paths
- Link to API docs from READMEs
- Link to ADRs from architecture docs
- Link to skills from AGENTS.md
