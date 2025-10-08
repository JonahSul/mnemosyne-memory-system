name: Persistence Unification & Refactor (refactor)
about: Unify core and persistent memory modules, centralize IDs and errors, and standardize repository interfaces
labels: refactor, backend, medium-priority

---

# Persistence Unification & API Standardization

## Summary
The codebase currently contains multiple memory implementations with inconsistent interfaces and duplicated logic (e.g., `src/modules/core-memory.ts` uses a volatile Map and returns a Map from `getMemories`, while `src/modules/persistent-core-memory.ts` returns arrays and performs immediate persistence). This task unifies the persistence layer, centralizes shared utilities (ID generation, errors), and standardizes memory repository interfaces.

## Background
Duplication and interface inconsistency cause subtle bugs, complicate testing, and make future maintenance difficult. Centralizing common logic will reduce bug surface area, simplify migrations, and enable a single authoritative implementation for persistence.

## Proposed Change
- Define a canonical `MemoryRepository` interface in `src/modules/memory-repository.ts` that all implementations must implement (consistent method signatures returning Promises and consistent types)
- Move `MemoryNotFoundError` into a shared `src/errors/memory-errors.ts`
- Introduce a single ID generation utility `src/utils/id.ts` (e.g., `generateMemoryId()` with deterministic formatting and collision-resistance)
- Migrate `CoreMemoryManager` to delegate to `PersistentCoreMemoryManager` or to a new adapter that implements `MemoryRepository`
- Update callers (`memory-tool.ts`, `simplified-registry.ts`, `tests`) to use the unified interface
- Add comprehensive unit tests for the adapter layer and repository methods

## Acceptance Criteria
- Single `MemoryRepository` interface with defined semantics
- All memory modules implement or adapt to this interface
- `MemoryNotFoundError` referenced only from the shared errors module
- ID generation is centralized and used everywhere that previously generated `mem_...` IDs
- Test coverage added for new interfaces and adapter logic

## Implementation Notes
- Keep migration small and reversible; implement adapters first to avoid simultaneous large refactors
- Maintain backwards compatibility during migration by keeping thin adapter shims
- Consider a feature-flagged rollout for production to switch authoritative repository

## Testing Plan
- Run existing test suite and add adapter-specific tests
- Create a small migration smoke test: store -> retrieve -> verify -> export

## Rollout & Migration
- Deploy adapter + new repository in the same release (no behavioral change)
- Flip default repository to persistent implementation behind a flag
- Remove volatile Map implementation after a stabilization period

## Estimate
- 4–8 engineer days (interface design, migration adapters, tests, rollout)

---

Link any relevant design sketches or diagrams.