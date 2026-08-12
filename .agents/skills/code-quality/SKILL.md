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
pnpm build   # builds all 8 DDD packages
```

## Local Git Hooks (Husky)

- **pre-commit**: runs `lint-staged` → `tsc --noEmit` on staged `.ts`/`.js`/`.mjs` files. Catches type errors per-file before commit.
- **pre-push**: runs full `pnpm build && pnpm test`. Blocks push if build or tests fail. Skipped when `CI=true` (GitHub Actions handles its own gating).
- Install on clone: `pnpm install` triggers `husky` via the `prepare` script.

## Branch Naming Strategy

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feat/<short-desc>` | New feature | `feat/release-automation-pipeline` |
| `fix/<short-desc>` | Bug fix | `fix/test-shims` |
| `docs/<short-desc>` | Documentation only | `doc/adr-inclusion-pass` |
| `refactor/<short-desc>` | Refactoring (no behavior change) | `refactor/domain-extraction` |
| `ci/<short-desc>` | CI/CD pipeline changes | `ci/publish-pipeline` |
| `chore/<short-desc>` | Maintenance, deps, tooling | `chore/deps-bump` |

- Branch from `dev`, target `dev` (for pre-release) or `main` (for release).
- Use kebab-case, keep description under 40 chars.
- Delete branch after merge.

## Commits

Conventional Commits format:
- `feat:` — new feature (minor bump on release)
- `fix:` — bug fix (patch bump)
- `docs:`, `chore:`, `refactor:`, `test:`, `ci:` — no version bump
- Breaking changes: add `BREAKING CHANGE` footer → major bump
- **No agent branding or co-author tails** — commits are authored by the developer, not attributed to AI tools.

## CI/CD Pipeline

### Stage 1: Gate (ci.yml, on push + PR to dev/main)
- `test` job: `pnpm install` → `pnpm build` → `pnpm test`. Must pass.
- `docs` job (dev only): generates API docs. Needs `test`.

### Stage 2: Version + Tag (ci.yml, on push only, needs test)
- `bump-version` job: computes next version, bumps all `package.json` files, commits with `[skip ci]`, pushes a `v<version>` tag pointing at the bump commit.
  - **dev**: always prerelease (`vX.Y.Z-dev.N`).
  - **main**: patch/minor/major from conventional commits since last tag.

### Stage 3: Publish (publish.yml, on tag push `v*`)
- Checks out the tagged SHA (immutable, already tested).
- Classifies: `-dev.` → npm `dev` dist-tag; release → npm `latest` + GitHub Release + docs deploy.
- Publishes all 8 packages.

### Pre-release (dev merge)
Every push to dev that passes CI → prerelease tag → npm `dev` dist-tag.

### Release (main merge)
Push to main → version bump from commits since last tag → release tag → npm `latest` + GitHub Release + API docs.

## Linting

- No ESLint config detected — use `tsc --noEmit` for type checking
- Prefer `biome` or `eslint` if adding lint rules
- `wrangler.jsonc` formatting: keep JSON with comments

## Documentation Requirements

See [doc-standards](../doc-standards/SKILL.md).
