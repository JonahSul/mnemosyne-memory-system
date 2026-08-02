---
name: doc-maintenance
description: >
  Keep documentation healthy: detect phantom links, stray dev-note MD files
  inside packages, stale references, and doc bloat. Run the checklist before
  merging doc changes or when investigating "doc drift". Pairs with doc-style
  (how to write) — this skill is how to verify.
---

# Doc Maintenance

Use when: reviewing a PR that touches docs, investigating broken doc links,
or running a periodic doc-health pass. Goal: every doc link resolves, every
doc file is in its canonical home, no dev notes leak into published packages.

## Canonical Doc Homes

| Content type | Home | Notes |
|--------------|------|-------|
| Agent skills | `.agents/skills/<name>/SKILL.md` | YAML frontmatter required |
| Agent prompts | `.agents/prompts/` | Runtime prompts loaded by path |
| Root guides | `README.md`, `CONTRIBUTING.md`, `FOUNDATION.md`, `SECURITY.md` | One concern each |
| Architecture guides | `docs/<topic>.md` | Deep dives, design docs |
| ADRs | `docs/adr/<area>/ADR-NNN-<slug>.md` | Create the dir when the first ADR is written |
| Package docs | `packages/<pkg>/README.md` | **Only** README.md — no stray MD |
| API reference | `docs/api/` | Generated, gitignored, do not hand-edit |
| Issue templates | `.github/ISSUE_TEMPLATE/` | |
| CI | `.github/workflows/` | |

## Health Checklist

Run these before merging doc changes. Each must pass.

### 1. No phantom links
Every relative link in every tracked `.md` file must resolve to a file that
exists on disk. Pay special attention to `docs/README.md` — it is the index
and the most common source of phantom references.

```bash
# Quick check: list links in a markdown file, then verify each resolves.
grep -oE '\]\([^)]+\)' docs/README.md | sed 's/](//;s/)//'
```

If a referenced file does not exist, either create it or remove the link.
**Never leave a link to a missing file** — that is the #1 doc-confusion vector.

### 2. No stray MD in packages
Each `packages/<pkg>/` directory should contain **exactly one** markdown file:
`README.md`. Exceptions: `CHANGELOG.md` is allowed for published packages.
Anything else (IMPLEMENTATION_SUMMARY, DISTRIBUTION, QUICK_START, etc.) is a
dev note that belongs in `docs/` or in the README itself.

```bash
# Find stray package markdown (excluding README and CHANGELOG)
find packages -name '*.md' -not -name 'README.md' -not -name 'CHANGELOG.md'
```

### 3. No duplicate guidance
The same fact should appear in exactly one canonical place. Other docs link to
it. Watch for:
- `.agents/` vs `.continue/` vs `system-prompts/` overlap — `.agents/` is canonical.
- A pattern described in both a package README and a `docs/` guide — pick one.
- FOUNDATION.md vs `docs/foundation-v1.7.0-guide.md` — root is the summary,
  `docs/` is the deep dive. They must agree, not diverge.

### 4. Index matches reality
`docs/README.md` lists docs that exist. `.agents/AGENTS.md` lists skills that
exist. When you add or remove a doc/skill, update the relevant index in the
same change.

### 5. Generated docs stay generated
`docs/api/` is gitignored and produced by `pnpm docs:generate`. Never hand-edit
it, never link to a specific `docs/api/*.html` from a tracked doc (link to the
index or describe how to regenerate).

### 6. Length sanity
- Skill files: target ≤100 lines. Split if larger.
- Package README: target ≤300 lines. Move deep content to `docs/`.
- Root guides: target ≤200 lines. FOUNDATION.md is the exception (canonical).
- If a file exceeds budget, extract a `docs/` guide and link to it.

## When to run

- **Before merge** of any PR touching `*.md`, `.agents/`, or `docs/`.
- **After moving** docs between locations.
- **Periodically** (monthly) to catch drift — files added/removed without
  index updates.

## Output format

When running a doc-health pass, report:
```
DOC HEALTH: <PASS|FAIL>
- phantom links: <count>  (list each)
- stray package MD: <count>  (list each)
- duplicate guidance: <count>  (list each)
- stale index entries: <count>  (list each)
```
Fix all FAILs before merging.
