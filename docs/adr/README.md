# Architecture Decision Records (ADRs)

This index lists accepted and proposed architectural decisions for the Mnemosyne Memory System.

## ADR Overview

The Mnemosyne ADRs are organized in four architectural layers, from foundational infrastructure to advanced federation capabilities.

### Layer 1: Core Architecture
- **ADR-006**: [Distributed Knowledge Network Architecture](ADR-006-distributed-knowledge-network-architecture.md) - Foundation distributed system with Agent/Arbiter/Archivist/Curator/Custodian roles
- **ADR-009**: [Worker Identity and Authentication](ADR-009-worker-identity-authentication.md) - Decentralized identity using DIDs with cryptographic authentication
- **ADR-010**: [Blockchain-of-Blockchains Federation Events](ADR-010-blockchain-federation-events.md) - Multi-tier event processing with intelligent routing

### Layer 2: Governance Framework
- **ADR-011**: [Cluster Governance and Role Framework](ADR-011-cluster-governance-roles.md) - Six-role democratic governance with anti-centralization safeguards
- **ADR-012**: [Democratic Election and Assessment](ADR-012-democratic-election-assessment.md) - Quadratic voting with competency assessment and continuous oversight
- **ADR-013**: [Truth Verification and Trust System](ADR-013-truth-verification-trust.md) - Multi-tier truth verification with democratic validation

### Layer 3: Federation Operations  
- **ADR-007**: [Decentralized Global Federation](ADR-007-decentralized-global-federation.md) - Global federation with DID identity and blockchain events
- **ADR-014**: [Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md) - Performance-based reputation with democratic validation

### Layer 4: Advanced Implementation
- **ADR-015**: [Intelligent Work Distribution](ADR-015-intelligent-work-distribution.md) - Capability-based assignment with democratic allocation
- **ADR-016**: [Multi-Modal Coordination](ADR-016-multi-modal-coordination.md) - Specialized AI model coordination with democratic integration

## Legacy System ADRs

- ADR-001: Persistent-first storage via Cloudflare Worker bindings (AI + Vectorize)
  - File: ADR-001-persistent-first-worker-bindings.md
  - Status: Proposed

- ADR-002: Hybrid retrieval boundaries and merge policy (AutoRAG vs Vectorize)
  - File: ADR-002-hybrid-retrieval-boundaries-and-merge-policy.md
  - Status: Proposed

- ADR-003: Mapping cognitive tiers to persistence tiers
  - File: ADR-003-cognitive-to-persistence-tier-mapping.md
  - Status: Proposed

- ADR-004: Performance SLOs and benchmarking methodology
  - File: ADR-004-performance-slos-and-benchmarking.md
  - Status: Proposed

- ADR-005: HybridRetriever and TierMapper scaffolding interfaces
  - File: ADR-005-hybridretriever-and-tiermapper-interfaces.md
  - Status: Proposed

## Superseded ADRs

The following ADRs contain comprehensive content that has been decomposed into the focused ADRs above:

- **ADR-008**: [Cluster Delegate Election and Model Specialization](ADR-008-cluster-delegate-election-model-specialization.md) - Content distributed across ADR-011, ADR-012, ADR-015, ADR-016
  - Status: Superseded (content redistributed)

## Related Operational Policy

- Hybrid Search Policy
  - File: ../hybrid-search-policy.md
  - Status: Draft

## Process

- New ADRs start as Proposed.
- After review, mark as Accepted or Rejected and update this index.
- Supersessions should reference prior ADRs.
