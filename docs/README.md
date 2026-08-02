# Documentation Index

Only files that exist on disk are listed here. When you add or remove a doc,
update this index in the same change (see `.agents/skills/doc-maintenance`).

## Architecture & Design

| Document | Description |
|----------|-------------|
| [foundation-v1.7.0-guide.md](foundation-v1.7.0-guide.md) | Foundation protocol canonical guide (Multi-Axis Semantic Expansion) |
| [mcp-local-troubleshooting.md](mcp-local-troubleshooting.md) | MCP server local troubleshooting |

> ADRs will live in `docs/adr/<area>/` once the first one is written. Do not
> list ADRs here until the files exist.

## Decision Records (ADR)

### Restructuring
- [ADR-001: DDD Restructuring — SaaS Architecture](adr/restructuring/ADR-001-ddd-restructuring.md)

## API Reference

Generated API docs: `docs/api/index.html` (requires `pnpm docs:generate`).
`docs/api/` is gitignored and regenerated — do not link to specific files
within it from tracked docs.
