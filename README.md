# Mnemosyne Memory System

"Memory is the mother of all wisdom" — Aeschylus

Short intro (for a general audience)

Mnemosyne is an open software project that provides a configurable memory system for intelligent agents. It helps systems remember, search, and act on past information using semantic search and configurable behavior rules. This repository contains the code, deployment patterns, and documentation needed by engineers to run or adapt the system.

Why this matters (one paragraph)

Modern AI systems can perform better when they remember relevant past interactions, documents, and rules. Mnemosyne focuses on explainable, configurable memory that teams can host and govern themselves — reducing the need to depend on opaque, specialized commercial agent platforms.

Where to go next (role-based paths)
- If you are a non-technical evaluator or executive: docs/EXECUTIVE_SUMMARY.md — short brief comparing value vs. commercial systems and recommended evaluation steps.
- Engineers & integrators: docs/README_ENGINEER.md, src/ code, types.ts for API types, and semantic examples in the repo root.
- Operators & SREs: docs/README_OPERATOR-SRE.md and docs/VENDOR_DEPLOYMENT.md for vendor-specific deploy guidance (Azure Functions + others), DEPLOYMENT.md, docker-compose.dev.yml and wrangler.jsonc.
- Architects & researchers: docs/README_ARCHITECT.md, migrations/, copilot-notes/, and tests/ for experiments and design notes.
- Technical leaders & approvers: docs/README_TECH-LEADER.md and docs/README_TECH-PURCHASER.md for decision criteria and procurement considerations.

Quick, non-technical summary of capabilities
- Stores and retrieves semantic memories (embeddings + vector search).
- Supports configurable retention tiers (short/intermediate/long) and behavioral "foundations" (rules) that can be versioned.
- Built to be deployable on several serverless and container platforms; operator guidance lives in docs/VENDOR_DEPLOYMENT.md.

How we handle trust & governance
- Data control: you can host vectors and metadata in your infrastructure or cloud account.
- Versioned foundations: behavioral rules are applied via versioned migrations so changes can be reviewed before going live.
- Backups: export and backup patterns are documented for vector indexes and metadata.

Want technical details?
- Engineers: start at docs/README_ENGINEER.md and the src/ tree. Example scripts and demos live in the repo root.
- Operators: see docs/README_OPERATOR-SRE.md and docs/VENDOR_DEPLOYMENT.md for production guidance and operational caveats.
- Researchers: inspect migrations/ and copilot-notes/ for experiments and migration patterns.

Contributing
- We welcome contributions. See docs/CONTRIBUTING.md for contribution workflow, and add migrations/ when changing runtime foundations.

Contact & licensing
- License: see LICENSE in the repository root.
- For questions or to request a walkthrough, open an issue or contact the maintainers via the repo.
