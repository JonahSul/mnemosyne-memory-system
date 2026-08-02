---
name: doc-style
description: >
  How to write concise, correct, non-confusing documentation for humans and
  agents. Length budgets, single-source-of-truth rules, when to use README vs
  docs/ vs ADR, and anti-patterns to avoid. Use when creating or rewriting any
  markdown. Pairs with doc-maintenance (verification).
---

# Doc Style

Mnemosyne docs serve two readers — humans and agents. Both get confused by the
same things: stale links, duplicated facts, and bloated files. This skill
defines the writing rules. Use [doc-maintenance](../doc-maintenance/SKILL.md)
to verify the result.

## Core Principles

1. **One fact, one home.** State each fact in exactly one canonical place.
   Other docs link to it. Never copy-paste a fact into a second file — link
   instead.
2. **Link, don't duplicate.** If a package README and a `docs/` guide would
   say the same thing, pick one as canonical and have the other link to it.
3. **Index matches reality.** An index that lists missing files is worse than
   no index. Only list what exists.
4. **Concise by default.** A reader should be able to skim a doc in under a
   minute. Deep dives live in `docs/`; summaries live in READMEs.
5. **Agent-readable.** Use plain markdown, clear headings, tables for
   structured data. Avoid prose-only paragraphs where a list or table works.

## Where each doc type lives

| You are writing... | It goes in... | Max length |
|--------------------|---------------|-----------|
| Agent skill (when/how) | `.agents/skills/<name>/SKILL.md` | ~100 lines |
| Agent runtime prompt | `.agents/prompts/<name>.md` | ~200 lines |
| Project intro / quickstart | `README.md` (root) | ~200 lines |
| Contribution flow | `CONTRIBUTING.md` | ~100 lines |
| Behavioral protocol | `FOUNDATION.md` | canonical, no cap |
| Security policy | `SECURITY.md` | ~50 lines |
| Architecture deep dive | `docs/<topic>.md` | ~300 lines |
| Decision record | `docs/adr/<area>/ADR-NNN-<slug>.md` | ~150 lines |
| Package usage | `packages/<pkg>/README.md` | ~300 lines |
| API reference | `docs/api/` (generated) | n/a — do not hand-edit |

If a doc would exceed its budget, extract the overflow into a `docs/` guide and
link to it from the original.

## Writing rules

### Headings
- One `#` title per file. Match the frontmatter `name` or the filename.
- Use `##` for sections, `###` for subsections. Don't skip levels.
- Heading text is a noun phrase or imperative, not a question.

### Lists & tables
- Prefer a table for structured comparisons (≥3 rows, consistent columns).
- Prefer a list for steps or single-column items.
- Keep list items parallel (same grammar, same length ballpark).

### Code
- Fence with the language: ` ```bash `, ` ```typescript `.
- Show runnable commands, not pseudocode, when possible.
- Keep snippets ≤15 lines. Link to a real file for full examples.

### Links
- Relative paths for internal docs: `[repo-architecture](../repo-architecture/SKILL.md)`.
- Never link to a file that doesn't exist yet. Create it first or omit the link.
- Never link into `docs/api/` from a tracked doc — it's generated and gitignored.

### Frontmatter (skills only)
```yaml
---
name: skill-name
description: >
  One-paragraph description. Starts with an imperative or "Use when...".
  Mentions what the skill covers and what it pairs with.
---
```

## Anti-patterns to avoid

| Anti-pattern | Why it's bad | Fix |
|---------------|--------------|-----|
| Phantom index | Lists files that don't exist; misleads readers | Only list real files; update on add/remove |
| Dev notes in packages | IMPLEMENTATION_SUMMARY.md etc. ship to npm consumers | Move to `docs/` or fold into README |
| Duplicated facts | Two homes drift; readers see conflicting info | Pick one canonical home, link from others |
| Prose walls | Hard to skim; agents extract less | Convert to lists/tables/headings |
| Stale version numbers | "Foundation v1.7.0" in 5 files, all must update | State version in one place (FOUNDATION.md), link |
| Generated docs hand-edited | Lost on next `pnpm docs:generate` | Never edit `docs/api/` directly |
| Rival agent configs | `.continue/` vs `.agents/` confuse agents | `.agents/` is canonical; remove rivals |

## Review checklist (before you commit a doc)

- [ ] File is in its canonical home (table above).
- [ ] Length is within budget.
- [ ] Every relative link resolves to an existing file.
- [ ] No fact is duplicated from another file (link instead).
- [ ] Headings are hierarchical and parallel.
- [ ] Code blocks are fenced with a language.
- [ ] If you added/removed a file, the relevant index is updated.
- [ ] No stray dev-note MD added inside `packages/`.

If any box is unchecked, fix before committing. See [doc-maintenance](../doc-maintenance/SKILL.md) for the verification commands.
