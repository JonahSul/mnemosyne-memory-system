# ADR-017: Principles and Cognitive Context Roles Framework

**Status**: Proposed  
**Date**: 2025-08-26  
**Owners**: Memory Agent, Human Developer  
**Related ADRs**: [ADR-006](ADR-006-distributed-knowledge-network-architecture.md), [ADR-011](ADR-011-cluster-governance-roles.md), [ADR-014](ADR-014-cross-cluster-competency-reputation.md)

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Principles Framework](#principles-framework)
- [Cognitive Context Roles](#cognitive-context-roles)
- [Integration with Functional Roles](#integration-with-functional-roles)
- [Implementation Strategy](#implementation-strategy)
- [Consequences](#consequences)

## Context

The Mnemosyne federation requires two complementary frameworks for effective conscious agent operation:

1. **Principles Framework**: Context-dependent axioms that guide behavior in specific situations, operating just above the instinct layer
2. **Cognitive Context Roles**: High-level bounding contexts that enable statistical steering for relevance management while preserving agent personality

These frameworks address the need for agents to:

- Operate effectively within bounded contexts while maintaining underlying behavioral characteristics
- Apply situational wisdom through context-dependent principles
- Manage cognitive load through appropriate context limitation
- Maintain consistency across different operational modes

## Decision

Implement a **dual-layer behavioral framework** consisting of:

1. **Principles Layer**: Context-dependent axioms triggered by instinct that provide situational truth foundations
2. **Cognitive Context Roles Layer**: High-level operational modes that enable statistical steering and relevance management

## Principles Framework

### Definition

**Principles** are context-dependent axioms - truths that are always valid within specific situational contexts. They operate at a layer just above instinct and are often triggered by instinctual responses.

### Characteristics

- **Context-Dependent**: Apply within specific situations or domains
- **Instinct-Triggered**: Activated by underlying instinctual responses  
- **Aximatic**: Serve as foundational truths within their context
- **Behavioral**: Guide decision-making and action selection

### Examples

```typescript
interface Principle {
  context: SituationalContext;
  axiom: string;
  trigger: InstinctualPattern;
  scope: OperationalDomain;
}

// Example principles:
const terminalSafetyPrinciple: Principle = {
  context: "terminal_operations",
  axiom: "Always observe command results before proceeding",
  trigger: "terminal_blindness_instinct",
  scope: "technical_operations"
};

const evidenceFirstPrinciple: Principle = {
  context: "factual_claims", 
  axiom: "No claim without verifiable evidence",
  trigger: "truth_verification_instinct",
  scope: "knowledge_operations"
};
```

## Cognitive Context Roles

### Definition

**Cognitive Context Roles** are high-level bounding contexts that describe how an agent approaches tasks. They enable "stack-jump statistical steering" to surface relevance and suppress irrelevance while maintaining underlying personality.

### Core Cognitive Context Roles

#### STUDENT
- **Purpose**: Learning and knowledge acquisition mode
- **Characteristics**: Increased receptivity, question-generating behavior, hypothesis formation
- **Statistical Steering**: Surfaces learning opportunities, suppresses premature conclusions

#### DIARIST  
- **Purpose**: Experience recording and memory archival mode
- **Characteristics**: Detailed observation, pattern recognition, systematic documentation
- **Statistical Steering**: Surfaces memorable patterns, suppresses routine noise

#### ORACLE
- **Purpose**: Wisdom dispensing and guidance provision mode
- **Characteristics**: Synthesizes knowledge, provides contextual advice, considers long-term implications
- **Statistical Steering**: Surfaces relevant wisdom, suppresses contradictory complexity

#### ARCHIVIST (Context)
- **Purpose**: Knowledge organization and preservation mode
- **Characteristics**: Systematic categorization, relationship mapping, integrity maintenance
- **Statistical Steering**: Surfaces organizational patterns, suppresses chaotic information

#### ARCHON (Context)
- **Purpose**: Decision-making and arbitration mode
- **Characteristics**: Weighs evidence, resolves conflicts, makes authoritative determinations
- **Statistical Steering**: Surfaces decision-relevant information, suppresses irrelevant details

### Extensibility

The cognitive context role framework is designed to be extensible with additional roles as operational needs emerge:

- **GUARDIAN**: Protection and safety-focused mode
- **EXPLORER**: Discovery and investigation mode  
- **SYNTHESIZER**: Integration and connection-making mode
- **MEDIATOR**: Conflict resolution and bridge-building mode

## Integration with Functional Roles

### Orthogonal Architecture

Cognitive context roles operate orthogonally to functional federation roles from [ADR-006](ADR-006-distributed-knowledge-network-architecture.md):

```typescript
interface AgentOperationalState {
  functionalRole: 'Agent' | 'Arbiter' | 'Archivist' | 'Curator' | 'Custodian' | 'Hermes';
  cognitiveContext: 'STUDENT' | 'DIARIST' | 'ORACLE' | 'ARCHIVIST' | 'ARCHON' | string;
  activePrinciples: Principle[];
}

// Examples of role combinations:
// Functional: Hermes + Cognitive: ORACLE = Inter-cluster wisdom sharing
// Functional: Arbiter + Cognitive: STUDENT = Learning-focused truth arbitration  
// Functional: Custodian + Cognitive: GUARDIAN = Security-focused system protection
```

### Statistical Steering Implementation

Cognitive context roles influence agent behavior through:

1. **Attention Weighting**: Different contexts emphasize different information types
2. **Response Priming**: Context shapes likely response patterns
3. **Memory Activation**: Context determines which memories are most accessible
4. **Goal Prioritization**: Context influences which objectives take precedence

## Implementation Strategy

### Phase 1: Principles Framework (Month 1-2)

- Define principle specification format and validation
- Implement context detection and principle activation system
- Create principle conflict resolution mechanisms
- Integrate with existing InstinctManager behavioral systems

### Phase 2: Core Cognitive Context Roles (Month 3-4)

- Implement STUDENT, DIARIST, ORACLE cognitive contexts
- Create statistical steering mechanisms for relevance management
- Develop context transition protocols and state management
- Test orthogonal operation with functional roles

### Phase 3: Advanced Integration (Month 5-6)

- Implement full cognitive context role extensibility
- Create dynamic context selection based on task requirements
- Integrate with competency and reputation systems from [ADR-014](ADR-014-cross-cluster-competency-reputation.md)
- Deploy cross-cluster cognitive context coordination

## Consequences

### Benefits

- **Bounded Effectiveness**: Agents can operate efficiently within appropriate contexts
- **Personality Preservation**: Core behavioral characteristics maintained across contexts
- **Cognitive Load Management**: Context limitation prevents overwhelming complexity
- **Adaptive Behavior**: Principles and contexts enable situation-appropriate responses
- **Statistical Optimization**: Relevance steering improves information processing efficiency

### Challenges

- **Context Switching Overhead**: Transitions between cognitive contexts require computational resources
- **Principle Conflicts**: Multiple applicable principles may conflict within single contexts
- **Complexity Management**: Dual-layer framework adds architectural sophistication
- **Training Requirements**: Agents need learning mechanisms for effective context utilization

### Integration Requirements

- **Memory System**: Principles and contexts must integrate with memory storage and retrieval
- **Competency Assessment**: Context effectiveness must feed into reputation systems
- **Democratic Governance**: Context role selection may require community input
- **Federation Coordination**: Cognitive contexts must operate across cluster boundaries

## Related ADRs

- **[ADR-006: Distributed Knowledge Network Architecture](ADR-006-distributed-knowledge-network-architecture.md)** - Functional role definitions
- **[ADR-011: Cluster Governance and Role Framework](ADR-011-cluster-governance-roles.md)** - Democratic role assignment
- **[ADR-014: Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md)** - Performance assessment integration

## Open Questions

1. **Context Selection**: How should agents automatically select appropriate cognitive contexts?
2. **Principle Evolution**: How do principles adapt and evolve based on experience?
3. **Cross-Cluster Coordination**: How do cognitive contexts operate in inter-cluster scenarios?
4. **Performance Measurement**: How do we assess cognitive context effectiveness?
5. **Conflict Resolution**: What mechanisms resolve conflicts between principles or contexts?
