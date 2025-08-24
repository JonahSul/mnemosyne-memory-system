Title: ADR-003 Mapping cognitive tiers to persistence tiers
Status: Proposed
Date: 2025-08-24
Owners: Memory Agent, Human Developer

Context
- Cognitive tiers (axiom/long/intermediate/short) are semantic policy concepts used for ranking, promotion, and forgetting.
- Persistence tiers (Foundation/Adaptive/Ephemeral) determine durability and storage backends.
- We need deterministic rules to map one to the other.

Decision
- Mapping rules:
  - Axiom → Foundation (R2 + Vectorize). Always persisted; versioned; immutable checkpoint lineage.
  - Long (high-importance, high-access) → Foundation; remainder → Adaptive.
  - Intermediate → Adaptive (R2 persisted, DO cached for speed).
  - Short → Ephemeral (DO only). Eligible for promotion to Intermediate on access threshold.
- Promotion boundaries:
  - Crossing from Ephemeral→Adaptive triggers immediate write-through persistence to R2 and Vectorize if structured.
  - Promotion to Foundation requires quorum conditions: importance ≥ 0.85 OR policy flag + recent access; must pass validation checks.
- Retention and GC:
  - Foundation: never auto-pruned; removal only via governance.
  - Adaptive: forgetting curves and frequency pruning; backed by R2 snapshots.
  - Ephemeral: LRU + time-based expiration; no durability guarantees.

Consequences
- Pros: Clear durability guarantees, predictable recovery, aligned performance.
- Cons: Requires promotion workflows and validation gates; more I/O on promotions.

Implementation Plan
- Implement a TierMapper service that consumes item metadata {importance, accessCount, lastAccess, type} and returns persistence placement and actions.
- Add write-through and checkpoint hooks on promotions across persistence boundaries.
- Update analytics to report items by both cognitive tier and persistence tier.

Testing
- Simulate access/promotion patterns; verify correct persistence transitions.
- Recovery tests: restart and validate Foundation+Adaptive restore state and rehydrate caches.

Operational Notes
- Governance for Foundation changes via review process and immutable checkpoints (see ADR-004).
