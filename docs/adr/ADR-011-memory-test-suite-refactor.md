# ADR 011: Memory Test-Suite Refactor (In-Memory Focus) // Draft

Status: Proposed
Date: 2025-08-26

Context
- The in-memory test suite currently relies on production-facing bindings (VECTORIZE_INDEX/AI).
- Needs deterministic, fast tests that run in CI without these bindings, while preserving meaningful validation.

Decision
- Adopt a test-mode shim for the memory test suite. Use in-memory mocks to simulate vector store and AI in CI/test environments.
- Production mode preserves hard fail behavior if bindings are missing.
- Create a tiered test plan: unit (mocks), integration (limited mocks), and end-to-end (external environment gated).

Impact
- Tests become deterministic and faster in CI.
- Requires maintenance to keep mocks aligned with production semantics.

Next steps
- Implement test-mode shim in simplified-registry.ts to switch to mock vector store and mock AI.
- Update tests to explicitly opt into test mode by environment variable NODE_ENV=test or __VECTORIZE_TEST_SHIM flag.
- Add a small smoke test to ensure the core flows (store → search → stats) operate under test shim.
