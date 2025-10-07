PROJECT STATUS: Mnemosyne Memory System

Date: 2025-10-07
Branch: main
Reviewer: Automated intake (GitHub Copilot)

Executive summary
-----------------
This intake reviewed the repository for security, correctness, maintainability, and architectural consistency. I focused on partially-implemented features, explicit TODO/FIXME markers, duplicated code, API inconsistencies, and repository hygiene (built artifacts, global state, and mixed runtimes).

High-level findings (prioritized)
---------------------------------
1. Incomplete / partially-implemented features (High)
   - Multiple TODO comments indicating missing implementations for critical features:
     - KV and Vector "health checks" (e.g. `src/modules/persistent-tier-integration.ts`, `dist/index.js`).
     - Identity registry & role-based authorization (e.g. `src/tools/simplified-registry.ts`, `docs/*`).
     - Proper JWT validation with Ed25519 signature verification (e.g. `src/modules/federation-auth.ts`).
     - Differential extraction / secure R2 export (TODOs in `simplified-registry.ts`).

2. Persistence vs volatile storage inconsistency (High)
   - Multiple modules continue to rely on volatile in-memory Maps (e.g. `src/modules/core-memory.ts`) while a persistent implementation exists (`src/modules/persistent-core-memory.ts`, `src/modules/persistent-tier-integration.ts`). The two implementations expose different APIs and return shapes (Map vs arrays/promises) which risks runtime bugs and makes swapping implementations error-prone.

3. API & type inconsistencies (High)
   - `CoreMemoryOperations.getMemories()` returns a `Map<string, MemoryEntry>` while `PersistentCoreMemoryOperations.getMemories()` returns a `Promise<MemoryEntry[]>`. Similar inconsistencies exist for other methods (sync vs async, Map vs Array). This requires a unified interface.

4. Code duplication (Medium)
   - Repeated ID generation logic (e.g. `mem_${Date.now()}_${Math.random()...}`) across many modules: `src/modules/core-memory.ts`, `src/modules/persistent-core-memory.ts`, `src/domains/memory/core/CoreMemoryManager.ts`, `src/services/MemoryService.ts`, `src/modules/context-query.ts`.
   - Duplicate `MemoryNotFoundError` class appears in multiple files (`src/modules/core-memory.ts` and `src/modules/persistent-core-memory.ts`).
   - Vector store initialization and environment-binding logic duplicated between `src/tools/simplified-registry.ts`, `src/memory-tool.ts`, and other modules.

5. Repository hygiene issues (Medium)
   - `dist/` (built artifacts) are committed (`dist/index.js`, `dist/index.js.map`). Built artifacts add maintenance burden and risk accidental edits—should be produced by CI artifacts and removed from the repository (or moved to a release artifact). Add `dist/` to `.gitignore` and stop committing generated files.

6. Global state and implicit environment bindings (Medium)
   - Several modules use `globalThis` to store runtime bindings (e.g. `GLOBAL` KV or `getVectorStoreInstance`, `MEMORY_KV`). This pollutes the global namespace, hides dependencies, and makes unit testing and dependency injection harder.

7. Mixed runtime targets and unclear separation of concerns (Medium)
   - The repo mixes Cloudflare Worker-specific code (wrangler + worker bindings) and a Node/Express local development server (`src/server.ts`, `src/local-agent.ts`). There is repeated logic implemented for both runtimes which increases maintenance overhead — recommend explicit separation or a clearer adapter layer.

8. Security gaps (High)
   - JWT validation is only a development shim and lacks Ed25519 signature verification in `src/modules/federation-auth.ts`.
   - Identity registry and role validation are documented but unimplemented; critical admin actions (e.g. R2 extraction) contain TODOs instead of enforcement.

9. Missing/weak health checks and observability (Medium)
   - healthCheck() implementations return hard-coded booleans rather than performing live checks for KV and vector services.
   - Logging and metrics are present but inconsistent in severity and formatting (production console.log usage in non-test code).

10. Tests, test-safety, and dev fallbacks (Low)
    - The code uses dev-only fallbacks (vector test shim) gated by `globalThis.NODE_ENV` and ad-hoc global flags. Tests rely on `globalThis` state and many console logs. Recommended change: build proper test doubles and dependency injection.

Detailed findings (file-level)
------------------------------
- `src/modules/core-memory.ts`
  - Volatile `Map` used for authoritative storage (explicitly marked as ARCHITECTURAL VIOLATION).
  - TODO to remove volatile Map and implement write-through persistence.
  - API is synchronous for many operations (returns `Map`), inconsistent with other modules.

- `src/modules/persistent-core-memory.ts`
  - Well implemented persistence layer writing to both KV and vector store.
  - API returns Promises and arrays; good production shape but inconsistent with in-repo `core-memory` APIs.

- `src/modules/persistent-tier-integration.ts`
  - Contains TODOs for KV/Vector health checks and returns placeholder booleans.
  - Migration helper exists but uses console.error for errors without structured retries or batch failure reporting.

- `src/tools/simplified-registry.ts`
  - Large file (1100+ lines). Contains multiple TODOs (role-based auth, identity registry integration, differential extraction). Stores untyped `workerEnv` globally and uses `globalThis` hacks.
  - The file mixes tool definitions, environment wiring, and business logic—recommend modularization (wire-up vs tool implementations vs helpers separated).

- `src/modules/federation-auth.ts`
  - `validateToken` contains a development mock and TODO for Ed25519 verification. This is a critical security implementation area.

- `src/server.ts` and `src/local-agent.ts`
  - Node/Express local server and Qdrant + Redis based local agent. Useful for local dev but duplicates runtime behavior present in worker code. Without a strict adapter layer there is risk of divergence.

- `dist/` directory
  - Built artifacts are tracked. They duplicate `src/` logic and contain TODOs repeated. Remove from VCS and add a release/CD artifact pipeline.

- `src/modules/*` in general
  - Several modules log directly to console, rely on implicit global bindings, or contain inline comments for architectural fixes.

Remediation checklist (actionable, prioritized)
-----------------------------------------------
I. Critical (must-fix before release to production)

1. Implement secure JWT validation with Ed25519 verification *(Status: ✅ completed on branch `feature/jwt-ed25519-validation` — adds jose-based signature verification, claim enforcement, and unit tests in `tests/federation-auth.test.ts`)*
   - Files: `src/modules/federation-auth.ts`
   - Tasks:
     - Research: pick a well-tested Ed25519 JWT verification library compatible with the runtime(s) (Cloudflare Worker vs Node). Example options: `@noble/ed25519` (wasm/JS), or runtime-native WebCrypto where available.
     - Implement token signature verification, token parsing, claim validation (aud, iss, exp), and replay protections.
     - Add unit tests (valid JWT, invalid signature, expired token, revoked token).
   - Acceptance criteria:
     - `validateToken` verifies signatures end-to-end and rejects malformed or expired tokens.
     - Test coverage >= 90% for `federation-auth` logic.

2. Enforce role-based authorization and integrate identity registry
   - Files: `src/tools/simplified-registry.ts`, `src/modules/federation-auth.ts`, `docs/secured-r2-extraction-implementation.md`
   - Tasks:
     - Design minimal Identity Registry KV schema and API (DID -> role claims, public keys, revocation list).
     - Implement KV-backed identity lookups and role validation helpers.
     - Replace TODO stubs with checks in `extract_to_r2` and other admin operations.
     - Add integration + unit tests that exercise authorization failure and success paths.
   - Acceptance criteria:
     - Admin flows require explicit identity registry validation; unauthorized requests rejected with auditable logs.

3. Replace volatile Maps with write-through persistence or provide a migration strategy
   - Files: `src/modules/core-memory.ts`, integration points in `src/memory-tool.ts`, `src/services/*`
   - Tasks:
     - Decide on canonical memory repository interface (synchronous vs async). Prefer async Promise-based interface returning arrays or paginated responses.
     - Create a shared `MemoryRepository` interface in `src/modules/memory-repository.ts` and migrate both `CoreMemoryManager` and `PersistentCoreMemoryManager` to implement it.
     - Refactor callers to depend on the interface and handle async returns.
     - Add a compatibility adapter that allows existing synchronous tests to run while migration occurs.
   - Acceptance criteria:
     - All producers/consumers of memory operations rely on a single interface; swapping the implementation is a single DI change.
     - No in-repo authoritative Map storage is left in production code.

II. High / Important

4. Unify APIs and types (Map vs Array, sync vs async)
   - Files: `src/modules/core-memory.ts`, `src/modules/persistent-core-memory.ts`, `src/memory-tool.ts`
   - Tasks:
     - Define canonical method signatures in one shared place (e.g. `src/modules/memory-repository.ts`), with comparison by pagination/limit patterns for large data sets.
     - Update implementations and tests.
   - Acceptance criteria:
     - Method signatures are uniform across modules. Unit tests confirm signature expectations.

5. Implement real health checks for KV and Vector stores
   - Files: `src/modules/persistent-tier-integration.ts`, `src/cloudflare-vector-store.ts` (if present)
   - Tasks:
     - Implement light-weight KV operations (get/put/read-only probe key) and vector store health probes (ping, dimension checks) with retry/backoff.
     - Expose structured health endpoint and metrics for monitoring.
     - Add unit and integration tests that mock both healthy and degraded states.
   - Acceptance criteria:
     - `healthCheck()` returns accurate status with machine-readable details and metrics.

6. Consolidate duplicated code
   - Files: Many — create shared helpers
   - Tasks:
     - Extract ID generation into `src/lib/id.ts` (single, testable function with reproducible seed option for tests).
     - Extract common error classes (e.g. `MemoryNotFoundError`) into `src/errors/index.ts` and import from there.
     - Centralize vector initialization logic into an adapter module that accepts explicit env injection.
   - Acceptance criteria:
     - No duplicate ID-generation logic remains. Single canonical error classes used across codebase.

III. Medium / Clean-up

7. Remove committed build artifacts and add CI artifact publishing
   - Files: `dist/*`, repo root
   - Tasks:
     - Remove `dist/` from the repo (create a release branch to preserve history if needed).
     - Add `dist/` to `.gitignore`.
     - Update CI to build artifacts and upload to GitHub Releases or npm as release artifacts.
   - Acceptance criteria:
     - `dist/` not tracked; CI generates reproducible build artifacts.

8. Eliminate globalThis pollution; use dependency injection
   - Files: `src/tools/simplified-registry.ts`, tests, modules that use `globalThis`
   - Tasks:
     - Replace `globalThis`-based wiring with explicit constructors or factory functions that accept an injected `env` object (use typed interfaces for `WorkerEnv`).
     - Update unit tests to pass mocks/stubs through DI.
   - Acceptance criteria:
     - No production modules write new properties to `globalThis` for runtime wiring.

9. Clean up mixed runtime logic
   - Files: `src/server.ts`, worker-specific files
   - Tasks:
     - Create `runtime/worker` and `runtime/node` adapters. Move server-only logic into `runtime/node` and Worker-only into `runtime/worker`.
     - Add a compatibility adapter layer that keeps core logic runtime-agnostic and injects platform-specific implementations for KV, vector stores, and crypto.
   - Acceptance criteria:
     - Clear folder separation and an adapter boundary; core modules do not reference `process.env` or `globalThis` directly.

10. Replace ad-hoc dev/test flags with a test harness
   - Files: tests and modules using `__DEV__` or `NODE_ENV` global flags
   - Tasks:
     - Introduce test doubles and dependency injection for vector store and KV. Replace global toggles with explicit test-mode injection.
   - Acceptance criteria:
     - Tests do not rely on global flags; test harness controls all test-mode dependencies.

IV. Low / Nice-to-have

11. Improve logging and observability consistency
    - Standardize on structured logs (json) and use a lightweight logger interface (e.g. small wrapper) so logs can be adapted to Cloudflare logs, local console, or structured logging sinks.

12. Add missing documentation and reconcile docs with code
    - Synchronize README, architecture docs, and code TODO states. Where docs mention features (identity registry), add explicit implementation tickets.

Acceptance criteria & testing
----------------------------
- Every TODO/FIXME item should be triaged into a ticket in your issue tracker with owner, priority, and estimated effort.
- Unit tests added/updated to cover the security-critical areas (JWT validation, role checks, persistent store fallbacks).
- Integration tests to exercise `persistent-core-memory` against a mocked KV & Vector store; CI to run those mocks for PRs.
- Add a short migration plan to move existing volatile data (if any) to persistent storage and verify integrity.

Suggested next steps (first 6 tasks)
-------------------------------------
1. Create tickets for each TODO found and prioritize security items (JWT & identity registry).
2. Add `src/modules/memory-repository.ts` interface and implement basic adapter to begin migrating `core-memory` callers.
3. Extract ID generator and common errors to `src/lib/` and update modules.
4. Implement minimal KV & Vector health probes and wire them into `/health` endpoint.
5. Remove `dist/` from source control and update `.gitignore`.
6. Implement an Ed25519 JWT verification prototype and unit tests using WebCrypto or `@noble/ed25519`, then iterate.

Research items & open questions
-------------------------------
- Which runtimes should be considered first-class supported (Cloudflare Worker only, or both Worker + Node)? This determines which crypto libraries to target and whether WebCrypto is available.
- What production SLA is required for the vector store (availability, replication, dimensionality checks) so that we can design proper health checks and failover? Do we want local Qdrant fallback in production or only in dev?
- Identity Registry: Should the project adopt a DID method and decentralized registry, or a KV-backed centralized registry suffices for now? Decide trade-offs for cryptographic attestation and rotation.
- Migration strategy: How much historical volatile data exists and where is it stored (e.g. `.mnemosyne` export files)? Determine bulk import windows and rate limits.

Appendix: Representative TODO locations
---------------------------------------
- `src/modules/core-memory.ts` (volatile Map; TODO: Remove volatile Map)
- `src/modules/persistent-core-memory.ts` (complete persistent impl; keep as canonical)
- `src/modules/persistent-tier-integration.ts` (TODO: KV/Vector health checks)
- `src/tools/simplified-registry.ts` (TODO: pass KV to MnemosyneMemorySystem; role-based auth; extraction logic)
- `src/modules/federation-auth.ts` (TODO: Ed25519 signature verification)
- `dist/index.js` and `dist/index.js.map` (multiple TODOs, duplicated source)

If you want I can:
- Open an initial set of issue templates for the highest-priority items (JWT, identity registry, store health checks, API unification).
- Start implementing the small refactors (extract ID generator + central errors + update 3-4 files) and create a follow-up PR with tests.

End of intake.
