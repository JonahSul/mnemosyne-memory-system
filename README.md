# Mnemosyne Memory System

"Memory is the mother of all wisdom" — Aeschylus

Status: Public repository. This README is an accurate, concise introduction for a general audience with links inward for engineers, operators, architects, and researchers.

Summary
- Mnemosyne is a software project implementing a semantic, tiered memory and behavioral-foundation system for AI agents. It combines semantic storage and retrieval, configurable behavioral rules (foundations), and runtime management and deployment tooling for the memory system.
- The project is implemented as a worker-oriented service (worker config present), with source in `src/`, migrations for foundation/rules, and deployment tooling (wrangler and Docker/dev compose).
- This repository contains a developer-focused codebase and operational artifacts; deeper, targeted documents are linked below.

Quick navigation (who this README addresses)
- General public / evaluators: read the Summary and Architecture Overview
- Engineers / integrators: Quickstart, Dev & Deploy, API & code links
- Operators: Deployment, Runtime foundation management, Backups & persistence
- Researchers: Design principles, experiments/examples, datasets & tests

What Mnemosyne actually does (concise)
- Provides semantic storage and retrieval for agent memory (embeddings + vector search).
- Supports multi-tier memory (short/intermediate/long) with configurable retention rules.
- Stores and deploys behavioral foundations (rules/constraints) used at runtime — these are versioned via migrations.
- Exposes programmatic tools (typed interfaces) for the core memory operations and administrative functions; types live in `types.ts`.
- Implements worker deployment configuration (`wrangler.jsonc`) and a dev environment (`docker-compose.dev.yml`).

Architecture overview (high level)
- Components:
  - Memory API / Worker: runtime entrypoint (see `src/`) serving memory and admin endpoints.
  - Vector storage: embeddings and an index (vector index/backups directories visible).
  - Foundation migrations: domain/rule definitions under `migrations/`.
  - CLI/dev tools: npm scripts, Docker compose for local testing, and wrangler config for Cloudflare deployment.
- Data flow (simplified):
  1. Agent/tool issues memory operation -> Worker API.
  2. Text is embedded and stored in the vector index with metadata.
  3. Queries perform semantic search across tiers and return ranked, provenance-aware results.
  4. Administrative operations can update/replace the "foundation" (behavior rules) via a migration payload.
- Diagram: `docs/diagrams/architecture.png` (placeholder — add your diagram here)

Audience-focused links
- Engineers — code and API
  - Source: `src/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/src
  - Types & tool interfaces: `types.ts` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/types.ts
  - Examples and small demos: `semantic-memory-examples.js` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/semantic-memory-examples.js
  - Built output (for worker): `dist/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/dist
- Operators — deploy & runtime
  - Deployment guide: `DEPLOYMENT.md` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/DEPLOYMENT.md
  - wrangler config: `wrangler.jsonc` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/wrangler.jsonc
  - Docker/dev compose: `docker-compose.dev.yml` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/docker-compose.dev.yml
  - Vector backups and exports: `vector-backups/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/vector-backups
- Architects & Researchers — design, experiments, and notes
  - Migrations/foundations: `migrations/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/migrations
  - Research notes / agent documentation: `copilot-notes/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/copilot-notes
  - Tests and experimental scripts: `tests/` and test scripts in the repo root

Quickstart (developer/devbox)
- Prereqs: Node.js (LTS), Docker (for the compose-based dev env), and the worker CLI if you deploy to Cloudflare.
- Typical dev steps:
  1. Clone repo
  2. npm install
  3. npm run dev (confirm exact script names in package.json) or use wrangler dev for worker testing: `wrangler dev`
  4. For local composed dev: `docker-compose -f docker-compose.dev.yml up --build`
- Build & deploy (operators)
  - See `DEPLOYMENT.md` for production deploy steps and environment requirements.
  - Worker publish: configured via `wrangler.jsonc` (see file for account/binding details).

Core capabilities (what is implemented in this repo)
- Semantic storage and retrieval (vector embeddings + search).
- Multi-tier memory management (short/intermediate/long) with configurable retention rules and basic statistics/monitoring.
- Foundation/migration system enabling runtime updates to behavioral rules (`migrations/`).
- Administrative tools for exporting/importing state and inspecting foundation versions (refer to `types.ts` and `src/` for concrete tool names).
- Example scripts and demos in the root that show common usage patterns (`semantic-memory-examples.js`, test scripts).

What the previous README overstated (transparency)
- The prior README includes aspirational statements that implied long-term persistence guarantees and exact production deployment paths. This README focuses on the implemented behavior and where to find the implementation.
- Any claims about "indefinite retention" or specific production SLAs are intentional design goals but depend on operational backing (vector index backups, cloud provider durability, and retention policies). See `DEPLOYMENT.md` and `vector-backups/` for the operational reality.

Testing & verification
- Unit & integration test harness is present (see `tests/` and config files). Run tests with the npm script listed in `package.json` (verify exact command).
- Example demo scripts are in the repo root (test and example scripts).

Contributing
- Keep changes small and well-documented.
- Add or update migrations under `migrations/` for foundation changes.
- Include verification steps in `copilot-notes/` when updating coordination checkpoints.
- For PRs that change runtime foundations, include an operator-runbook update in `copilot-notes/FOUNDATION_INTEGRITY_RUNBOOK.md`.

Administrative & runtime operations overview
- Runtime foundation updates are implemented via a migration payload mechanism. The code to view and apply migrations lives under `migrations/` and the admin tool interfaces in `src/`.
- Backups: create periodic exports of vector index and metadata into `vector-backups/` and external storage. The repo contains scripts and example patterns for exporting state.

Diagrams & visuals
- I will include a placeholder reference to `docs/diagrams/architecture.png`. Please add your finalized diagrams there; I'll add them into the README in the PR so they render on GitHub.

Preserved items
- `LICENSE` will remain untouched.
- The quote at the top is preserved; tell me if you prefer to remove it.

Appendix: concrete references to look at in the code
- Tool definitions: `types.ts` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/types.ts
- Example memory operations & demos: `semantic-memory-examples.js` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/semantic-memory-examples.js
- Worker config: `wrangler.jsonc` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/wrangler.jsonc
- Deployment instructions: `DEPLOYMENT.md` — https://github.com/JonahSul/mnemosyne-memory-system/blob/main/DEPLOYMENT.md
- Migration examples & foundation templates: `migrations/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/migrations
- Operational notes: `copilot-notes/` — https://github.com/JonahSul/mnemosyne-memory-system/tree/main/copilot-notes
