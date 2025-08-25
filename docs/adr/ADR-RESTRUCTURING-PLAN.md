# ADR Restructuring Plan

**Date**: 2025-08-24  
**Status**: Implementation  

## Current State Analysis

The current ADRs 006-008 have grown comprehensive but unwieldy:

- **ADR-006**: Distributed Knowledge Network Architecture (~160 lines)
- **ADR-007**: Decentralized Global Federation (~470 lines) 
- **ADR-008**: Cluster Governance and Specialization (~1200+ lines)

## Decomposition Strategy

### Core Architecture Layer (Foundational)
- **ADR-006**: [Distributed Knowledge Network Architecture](ADR-006-distributed-knowledge-network-architecture.md) *(retain, refactor)*
- **ADR-009**: [Worker Identity and Authentication](ADR-009-worker-identity-authentication.md) *(new)*
- **ADR-010**: [Blockchain-of-Blockchains Federation Events](ADR-010-blockchain-federation-events.md) *(new)*

### Governance Layer (Organizational)  
- **ADR-011**: [Cluster Governance and Role Framework](ADR-011-cluster-governance-roles.md) *(new)*
- **ADR-012**: [Democratic Election and Assessment](ADR-012-democratic-election-assessment.md) *(new)*
- **ADR-013**: [Truth Verification and Trust System](ADR-013-truth-verification-trust.md) *(new)*

### Federation Layer (Cross-Cluster)
- **ADR-007**: [Decentralized Global Federation](ADR-007-decentralized-global-federation.md) *(retain, refactor)*
- **ADR-014**: [Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md) *(new)*

### Implementation Layer (Technical)
- **ADR-015**: [Intelligent Work Distribution and Resource Optimization](ADR-015-intelligent-work-distribution.md) *(new)*
- **ADR-016**: [Multi-Modal Coordination and Specialization](ADR-016-multi-modal-coordination.md) *(new)*

## Cross-Reference Strategy

### Hyperlink Convention
- `[ADR-XXX: Title](ADR-XXX-filename.md)` for full references
- `[ADR-XXX](ADR-XXX-filename.md#section)` for section references  
- `[concept-name](ADR-XXX-filename.md#concept-anchor)` for concept links

### Dependency Hierarchy
```
ADR-006 (Foundation)
├── ADR-009 (Identity) 
├── ADR-010 (Blockchain)
└── ADR-011 (Governance)
    ├── ADR-012 (Elections)
    ├── ADR-013 (Truth)
    └── ADR-016 (Multi-Modal)
    
ADR-007 (Federation)
├── ADR-009 (Identity)
├── ADR-010 (Blockchain) 
└── ADR-014 (Competency)

ADR-015 (Work Distribution)
├── ADR-011 (Governance)
├── ADR-014 (Competency)
└── ADR-016 (Multi-Modal)
```

## Navigation Enhancements

### Table of Contents
- Every ADR gets anchor-linked TOC
- Cross-references to related sections
- Clear "See Also" sections

### Summary Sections
- Each ADR includes "Integration with Other ADRs" section
- Key concepts list with links to detailed explanations
- Decision rationale with links to supporting ADRs

### Human & AI Friendliness
- Consistent heading structures for AI parsing
- Clear section anchors: `#core-concepts`, `#integration-points`, `#implementation`
- Searchable concept index across all ADRs

## Implementation Phases

### Phase 1: Create New Focused ADRs
1. Extract content from ADR-008 into specialized ADRs
2. Create proper cross-references and hyperlinks
3. Add navigation structures

### Phase 2: Refactor Existing ADRs  
1. Slim down ADR-007 and ADR-008
2. Add cross-references to new ADRs
3. Update with hyperlinked summaries

### Phase 3: Update Index and Docs
1. Update README.md with new structure
2. Create concept index across ADRs
3. Add navigation diagrams

## Benefits

- **Reduced Context Size**: Each ADR focused on single concern
- **Better Navigation**: Hyperlinked cross-references for humans and AI
- **Improved Maintainability**: Changes affect smaller, focused documents  
- **Enhanced Searchability**: Specific concepts easier to locate
- **Clearer Dependencies**: Explicit relationship between architectural decisions
