name: Remove bundled `dist` and add build artifacts to .gitignore (chore)
about: Remove build artifacts from repository and ensure CI builds artifacts during release
labels: chore, infra, low-priority

---

# Remove `dist/` from VCS and add build artifacts to .gitignore

## Summary
The repository currently includes compiled/bundled artifacts in `dist/`. These files cause merge noise, duplicate logic, and risk shipping stale code. We should remove `dist/` from version control and add standard build artifacts to `.gitignore`. Ensure CI and release processes generate `dist/` artifacts during deployment instead.

## Background
Including `dist/` commits duplicates source, increases repository size, and makes tracing changes harder. Best practice is to generate `dist/` in CI or release pipelines, not check them in.

## Proposed Change
- Remove `dist/` directory from the repository with a git rm commit
- Add `dist/` and other build outputs to `.gitignore` (e.g., `dist/`, `build/`, `*.map` if desired)
- Update documentation to show how to generate build artifacts locally (`npm run build` or `npm run dev`)
- Ensure any integration that depends on `dist/` (e.g., Dockerfiles) references build scripts or artifacts produced during CI

## Acceptance Criteria
- `dist/` removed from the repo
- `.gitignore` updated and committed
- CI pipeline builds `dist/` before packaging/deploy
- No functional change to the application after removal

## Implementation Notes
- Coordinate with teams that depend on checked-in artifacts
- Consider a small migration PR: remove, update .gitignore, update README with build steps

## Testing Plan
- Run full test suite after removing `dist/`
- Ensure Docker images and local dev flows still work by using local build steps

## Estimate
- 1–2 engineer days (remove, update CI, test)

---

Add references to any existing CI workflows or release scripts.