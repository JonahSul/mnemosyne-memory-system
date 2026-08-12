---
name: code-quality
description: >
  Mnemosyne code quality standards: strict TypeScript, ESM, Vitest testing,
  CI matrix (Node 20/22), Conventional Commits, no `any`, Delegator pattern.
  Use before submitting PRs or reviewing code.
---

# Code Quality Standards

## TypeScript

- **Strict mode** enabled in `tsconfig.json` (`strict: true`)
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch` all on
- `noUncheckedSideEffectImports` enabled
- **No `any`** — use proper types or `unknown` with narrowing
- ESM modules only (`"type": "module"` in package.json)
- Declarations generated (`declaration: true`, `declarationMap: true`)

## Testing

- **Vitest** (v2.1.9) — config in `vitest.config.ts`
- CI runs on Node 20.x + 22.x matrix
- New features need corresponding tests
- Behavioral tests for foundation system changes
- Vector store tests for storage adapter changes
- Run: `pnpm test` (all) or `npx vitest run <file>` (single)

## Build

```bash
pnpm build   # builds all 8 new DDD packages
```

## Commits

Conventional Commits format:
- `feat:` — new feature (minor bump on release)
- `fix:` — bug fix (patch bump)
- `docs:`, `chore:`, `refactor:`, `test:`, `ci:` — no version bump
- Breaking changes: add `BREAKING CHANGE` footer → major bump

## PR Process

1. Branch from `dev`, PR target `main`
2. CI passes all tests + builds
3. Pre-release from `dev` → npm `dev` tag
4. Merge to `main` → npm `latest` + GitHub Release

## Linting

- No ESLint config detected — use `tsc --noEmit` for type checking
- Prefer `biome` or `eslint` if adding lint rules
- `wrangler.jsonc` formatting: keep JSON with comments

## Documentation Requirements

See [doc-standards](../doc-standards/SKILL.md).
