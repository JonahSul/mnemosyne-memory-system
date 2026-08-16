# Contributing

## Prerequisites

- Node.js >= 22 (or use the provided VS Code DevContainer)
- pnpm (install via `corepack enable && corepack prepare pnpm@latest --activate`)
- C/C++ compiler and Python 3 (for building native `better-sqlite3` bindings, included automatically in the DevContainer)

## Setup

```bash
git clone https://github.com/JonahSul/mnemosyne-memory-system.git
cd mnemosyne-memory-system
corepack enable
pnpm install
```

## Development

```bash
# Cloudflare Worker / SaaS (dev mode)
pnpm dev

# Local MCP CLI Server (SQLite-backed)
pnpm --filter @mnemosyne/cli dev
```

## Building

```bash
pnpm build
```

Builds all monorepo packages: `@mnemosyne/core`, `@mnemosyne/pubsub`, `@mnemosyne/infra-cloudflare`, `@mnemosyne/infra-sqlite`, `@mnemosyne/mcp-server`, `@mnemosyne/streaming`, `@mnemosyne/saas`, `@mnemosyne/cli`.

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

### Test Requirements

- Tests must pass on Node 20.x and 22.x (CI matrix)
- New features need corresponding tests
- Behavioral tests for foundation system changes
- Vector store tests for storage adapter changes

## Documentation

- Source code: JSDoc on all public APIs
- Package: README.md with install/usage/API sections
- Architecture: ADR in `docs/adr/` for significant decisions
- API docs: `pnpm docs:generate` generates TypeDoc output

## Commit Conventions

[Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — maintenance
- `refactor:` — code restructuring
- `test:` — test changes
- `ci:` — CI config changes

## Pull Request Process

1. Branch from `dev`, PR to `main`
2. CI runs tests + builds on PR
3. Pre-release publishes to npm with `dev` tag from `dev` branch
4. Merge to `main` triggers release publish with `latest` tag

## Code Style

- TypeScript strict mode
- ESM modules only
- No `any` — use proper types
- Prefer immutability where practical
- Use `Delegator` pattern for module composition
