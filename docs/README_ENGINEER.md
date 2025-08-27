# Engineer README

Purpose

This document is the primary entrypoint for engineers who want to run, extend, or integrate Mnemosyne.

Getting started
- Code: see src/ for server runtime and integration code.
- Types: refer to types.ts for API and data model definitions.
- Examples: check example scripts and semantic examples in the repository root for ingestion and query flows.

Key areas to review
- Ingestion pipelines and embedding configuration
- Vector index selection and retention tier mapping
- Migration scripts in migrations/ for changing foundations/rules
- Tests/benchmarks in tests/ for performance baselines

Developer workflow
- Add migration files when changing runtime foundations or behavioral rules.
- Run unit and integration tests before opening PRs.

Operational notes for engineers
- Keep embedding calls and model usage configurable via environment variables.
- Design retention policies for your domain and instrument metrics for recall and latency.

Contact
- Open issues for bugs or feature requests and tag maintainers for review.