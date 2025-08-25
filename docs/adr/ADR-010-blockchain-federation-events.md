# ADR-010: Blockchain-of-Blockchains Federation Events

**Status**: Proposed  
**Date**: 2025-08-24  
**Extracted from**: [ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md)  
**Related ADRs**: [ADR-007](ADR-007-decentralized-global-federation.md), [ADR-009](ADR-009-worker-identity-authentication.md), [ADR-011](ADR-011-cluster-governance-roles.md)

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Event Classification System](#event-classification-system)
- [Multi-Tier Event Processing](#multi-tier-event-processing)
- [Consensus Mechanisms](#consensus-mechanisms)
- [Event Recording and Storage](#event-recording-and-storage)
- [Cross-Chain Communication](#cross-chain-communication)
- [Intelligence-Driven Routing](#intelligence-driven-routing)
- [Integration with Other ADRs](#integration-with-other-adrs)
- [Implementation Strategy](#implementation-strategy)

## Context

The decentralized Mnemosyne federation requires a robust event system to handle diverse activities across multiple organizational tiers. Traditional single-blockchain approaches cannot efficiently handle the wide variety of events from local worker actions to global governance decisions.

This system must support:

1. **Intelligent Event Routing**: Different events need different consensus mechanisms and storage durability
2. **Scalable Processing**: Handle high-frequency local events without overwhelming global consensus
3. **Democratic Transparency**: Enable democratic oversight without sacrificing efficiency
4. **Cross-Tier Coordination**: Seamlessly handle events that span multiple organizational levels

## Decision

Implement a **Blockchain-of-Blockchains** architecture with intelligent event classification and tier-appropriate processing pathways.

## Event Classification System

### Event Taxonomy

```typescript
interface FederationEvent {
  eventId: string;                    // Unique identifier
  eventType: EventType;               // Classification determining processing pathway
  timestamp: string;                  // When event occurred
  sourceWorker: string;               // DID of acting worker
  sourceCluster: string;              // Originating cluster
  payload: EventPayload;              // Event-specific data
  routingDecision: RoutingDecision;   // How event should be processed
  signatures: EventSignature[];       // Cryptographic authenticity
}

enum EventType {
  // Local Tier - High frequency, cluster-local significance
  WORKER_TASK_COMPLETION = 'worker.task.completion',
  MEMORY_ACCESS = 'memory.access',
  CAPABILITY_USAGE = 'capability.usage',
  LOCAL_CONSENSUS = 'consensus.local',
  
  // Intermediate Tier - Cross-cluster coordination
  KNOWLEDGE_SHARING = 'knowledge.sharing',
  WORKER_MIGRATION = 'worker.migration',
  CLUSTER_COLLABORATION = 'cluster.collaboration',
  REPUTATION_UPDATE = 'reputation.update',
  
  // Global Tier - Federation-wide significance
  GOVERNANCE_PROPOSAL = 'governance.proposal',
  FEDERATION_MEMBERSHIP = 'federation.membership',
  TRUTH_VERIFICATION = 'truth.verification',
  PROTOCOL_UPDATE = 'protocol.update',
  EMERGENCY_CONSENSUS = 'emergency.consensus'
}

interface RoutingDecision {
  tier: EventTier;                    // Which blockchain tier processes this event
  consensusType: ConsensusType;       // Consensus mechanism to use
  storageStrategy: StorageStrategy;   // How to persist event data
  propagationScope: PropagationScope; // How widely to broadcast
  urgencyLevel: UrgencyLevel;         // Processing priority
}
```

### Intelligence-Driven Classification

```typescript
interface EventClassifier {
  analyzeEvent(event: FederationEvent): RoutingDecision;
  
  classificationFactors: {
    impactScope: ImpactScopeAnalysis;     // How many entities affected
    urgencyAssessment: UrgencyAnalysis;   // Time-sensitivity of event
    complexityMeasure: ComplexityMetrics; // Computational requirements
    democraticRelevance: DemocracyMetrics; // Need for democratic oversight
    resourceRequirements: ResourceAnalysis; // Processing and storage needs
  };
  
  adaptiveThresholds: {
    dynamicAdjustment: ThresholdAdjustment; // Adapt based on network load
    contextualModifiers: ContextModifiers;  // Adjust based on current conditions
    learningMechanism: ClassifierLearning;  // Improve classification over time
  };
}
```

## Multi-Tier Event Processing

### Local Tier - Cluster Blockchains

**Purpose**: Handle high-frequency, cluster-local events efficiently

```typescript
interface LocalTierProcessing {
  consensus: {
    mechanism: 'FastPBFT';              // Fast practical Byzantine fault tolerance
    participantRequirement: 'ClusterNodes'; // Only cluster nodes participate
    finalityTime: '1-3 seconds';       // Quick finality for local operations
    throughput: '1000+ TPS';            // High transaction throughput
  };
  
  storage: {
    persistence: 'LocalClusterStorage'; // Stored within cluster
    retentionPolicy: 'ConfigurableRetention'; // Cluster-defined retention
    compression: 'EventCompression';    // Efficient storage for high volume
  };
  
  eventTypes: [
    'WORKER_TASK_COMPLETION',
    'MEMORY_ACCESS',
    'CAPABILITY_USAGE',
    'LOCAL_CONSENSUS'
  ];
}
```

### Intermediate Tier - Cross-Cluster Coordination

**Purpose**: Handle events requiring coordination between multiple clusters

```typescript
interface IntermediateTierProcessing {
  consensus: {
    mechanism: 'PBFT';                  // Practical Byzantine fault tolerance
    participantRequirement: 'InterestedClusters'; // Clusters involved in event
    finalityTime: '10-30 seconds';      // Moderate finality time
    throughput: '100-500 TPS';          // Moderate throughput
  };
  
  storage: {
    persistence: 'DistributedStorage';  // Replicated across involved clusters
    retentionPolicy: 'ExtendedRetention'; // Longer retention for coordination
    indexing: 'CrossClusterIndexing';   // Searchable across clusters
  };
  
  eventTypes: [
    'KNOWLEDGE_SHARING',
    'WORKER_MIGRATION', 
    'CLUSTER_COLLABORATION',
    'REPUTATION_UPDATE'
  ];
}
```

### Global Tier - Federation Governance

**Purpose**: Handle events with federation-wide implications requiring democratic oversight

```typescript
interface GlobalTierProcessing {
  consensus: {
    mechanism: 'DemocraticConsensus';   // Democratic voting with stake weighting
    participantRequirement: 'AllFederationNodes'; // All federation participants
    finalityTime: '1-24 hours';         // Allow time for democratic deliberation
    throughput: '1-10 TPS';             // Lower throughput, higher significance
  };
  
  storage: {
    persistence: 'PermanentArchive';    // Permanent, immutable storage
    retentionPolicy: 'Indefinite';     // Never deleted
    redundancy: 'MaximumRedundancy';    // Highest reliability
    auditability: 'FullAuditTrail';    // Complete democratic transparency
  };
  
  eventTypes: [
    'GOVERNANCE_PROPOSAL',
    'FEDERATION_MEMBERSHIP',
    'TRUTH_VERIFICATION',
    'PROTOCOL_UPDATE',
    'EMERGENCY_CONSENSUS'
  ];
}
```

## Consensus Mechanisms

### FastPBFT for Local Operations

```typescript
interface FastPBFT {
  characteristics: {
    latency: 'Ultra-low (1-3 seconds)';
    throughput: 'High (1000+ TPS)';
    scalability: 'Limited to cluster size';
    faultTolerance: 'f < n/3 Byzantine faults';
  };
  
  optimizations: {
    pipelining: 'Overlapped consensus rounds';
    batching: 'Multiple operations per round';
    precomputation: 'Cryptographic preparation';
    localOptimization: 'Cluster-specific tuning';
  };
  
  useCase: 'High-frequency local operations requiring quick finality';
}
```

### PBFT for Cross-Cluster Coordination

```typescript
interface PBFT {
  characteristics: {
    latency: 'Moderate (10-30 seconds)';
    throughput: 'Moderate (100-500 TPS)';
    scalability: 'Scales to federation subsets';
    faultTolerance: 'f < n/3 Byzantine faults';
  };
  
  adaptations: {
    dynamicParticipation: 'Only relevant clusters participate';
    contextualWeighting: 'Reputation-based influence';
    partialFinality: 'Progressive confirmation levels';
  };
  
  useCase: 'Cross-cluster coordination requiring moderate consensus';
}
```

### Democratic Consensus for Global Governance

**Integration Point**: Links to [ADR-012: Democratic Election and Assessment](ADR-012-democratic-election-assessment.md)

```typescript
interface DemocraticConsensus {
  characteristics: {
    latency: 'Extended (1-24 hours)';
    throughput: 'Low (1-10 TPS)';
    scalability: 'Federation-wide participation';
    democraticLegitimacy: 'High democratic accountability';
  };
  
  votingMechanisms: {
    stakeWeighting: StakeBasedVoting;     // Weighted by cluster contribution
    delegatedVoting: DelegatedVoting;     // Democratic representatives
    directParticipation: DirectVoting;    // Individual worker participation
    quadraticVoting: QuadraticMechanism;  // Prevent plutocracy
  };
  
  deliberationSupport: {
    proposalPeriod: 'Extended comment and review period';
    evidenceGathering: 'Time for evidence collection and analysis';
    minorityProtection: 'Safeguards for minority positions';
    transparentProcess: 'Full public visibility of decision process';
  };
  
  useCase: 'Federation governance requiring democratic legitimacy';
}
```

## Event Recording and Storage

### Immutable Event Logs

```typescript
interface EventStorage {
  localTier: {
    storage: 'Cluster-local blockchain';
    retention: 'Configurable (days to months)';
    compression: 'High compression for volume';
    access: 'Fast local access';
  };
  
  intermediateTier: {
    storage: 'Multi-cluster distributed ledger';
    retention: 'Extended (months to years)';
    replication: 'Cross-cluster redundancy';
    indexing: 'Cross-cluster searchability';
  };
  
  globalTier: {
    storage: 'Federation permanent archive';
    retention: 'Indefinite';
    redundancy: 'Maximum reliability';
    auditability: 'Democratic transparency';
  };
}
```

### Event Aggregation and Summarization

```typescript
interface EventAggregation {
  localToIntermediate: {
    trigger: 'Periodic summarization';
    method: 'Statistical aggregation with significance filtering';
    frequency: 'Hourly to daily';
    content: 'Summarized patterns and significant events';
  };
  
  intermediateToGlobal: {
    trigger: 'Cross-cluster significance threshold';
    method: 'Democratic relevance assessment';
    frequency: 'As needed based on significance';
    content: 'Federation-relevant events and trends';
  };
  
  emergencyEscalation: {
    trigger: 'Critical event detection';
    method: 'Immediate escalation to appropriate tier';
    bypassing: 'Normal aggregation delays';
    notification: 'Alert relevant governance entities';
  };
}
```

## Cross-Chain Communication

### Inter-Tier Event Propagation

```typescript
interface CrossTierCommunication {
  upwardPropagation: {
    localToIntermediate: LocalToIntermediate;
    intermediateToGlobal: IntermediateToGlobal;
    emergencyEscalation: EmergencyEscalation;
  };
  
  downwardPropagation: {
    globalToIntermediate: GlobalToIntermediate;
    intermediateToLocal: IntermediateToLocal;
    governanceUpdates: GovernanceUpdates;
  };
  
  lateralCommunication: {
    clusterToCluster: ClusterCoordination;
    peerToPeer: PeerCoordination;
    knowledgeSharing: KnowledgeExchange;
  };
}

interface EventPropagationProtocol {
  messageFormat: StandardizedEventMessage;
  cryptographicProof: SignatureChain;
  reliabilityMechanism: DeliveryGuarantee;
  latencyOptimization: RoutingOptimization;
}
```

### Event Synchronization

```typescript
interface EventSynchronization {
  consistencyModel: {
    localTier: 'Strong consistency within cluster';
    intermediateTier: 'Eventual consistency across clusters';
    globalTier: 'Strong consistency for governance events';
  };
  
  conflictResolution: {
    temporalOrdering: TimestampBasedOrdering;
    causalOrdering: CausalityPreservation;
    consensusBasedResolution: ConflictConsensus;
  };
  
  catchUpMechanism: {
    eventReplay: EventReplayProtocol;
    stateReconstruction: StateReconstruction;
    fastSync: FastSynchronization;
  };
}
```

## Intelligence-Driven Routing

### Adaptive Event Classification

```typescript
interface AdaptiveClassification {
  learningMechanisms: {
    historicalAnalysis: HistoricalPatternAnalysis;
    outcomeTracking: EventOutcomeTracking;
    performanceMetrics: ClassificationPerformance;
    feedbackLoop: ClassifierImprovement;
  };
  
  contextualAdaptation: {
    networkLoad: LoadBasedAdjustment;
    emergencyMode: EmergencyModeActivation;
    governancePhase: GovernancePhaseAdaptation;
    seasonalPatterns: SeasonalAdjustment;
  };
  
  predictiveRouting: {
    eventPrediction: EventPredictionModel;
    resourcePreallocation: ResourcePreparation;
    consensusPreparation: ConsensusPreparation;
  };
}
```

### Dynamic Threshold Adjustment

```typescript
interface DynamicThresholds {
  adjustmentFactors: {
    networkCongestion: CongestionBasedAdjustment;
    democraticLoad: DemocraticParticipationLoad;
    emergencyEvents: EmergencyThresholdModification;
    consensusPerformance: ConsensusEfficiencyMetrics;
  };
  
  autoTuning: {
    performanceOptimization: AutoPerformanceTuning;
    resourceOptimization: ResourceUsageOptimization;
    democraticBalance: DemocracyEfficiencyBalance;
  };
}
```

## Integration with Other ADRs

### Identity Integration

**[ADR-009: Worker Identity and Authentication](ADR-009-worker-identity-authentication.md)**

- All events cryptographically signed by worker DIDs
- Event attribution enables reputation and competency tracking
- Identity verification required for event consensus participation

### Governance Integration

**[ADR-011: Cluster Governance and Role Framework](ADR-011-cluster-governance-roles.md)**

- Governance role changes recorded as global tier events
- Role-based event processing permissions
- Democratic election results recorded immutably

**[ADR-012: Democratic Election and Assessment](ADR-012-democratic-election-assessment.md)**

- Election events use democratic consensus mechanism
- Voting records stored in global tier for transparency
- Election integrity verification through blockchain

### Truth and Trust Integration

**[ADR-013: Truth Verification and Trust System](ADR-013-truth-verification-trust.md)**

- Truth verification events require special consensus
- Trust metric updates propagated through appropriate tiers
- Evidence trails maintained in immutable storage

### Competency Integration

**[ADR-014: Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md)**

- Competency assessments recorded as intermediate tier events
- Performance evidence linked to immutable event history
- Cross-cluster reputation updates use inter-tier propagation

## Implementation Strategy

### Phase 1: Core Infrastructure (Month 1-3)

- Implement basic event classification system
- Build local tier FastPBFT consensus
- Create event storage and retrieval mechanisms

### Phase 2: Multi-Tier Architecture (Month 4-6)

- Implement intermediate tier PBFT consensus
- Build cross-tier communication protocols
- Create event aggregation and summarization

### Phase 3: Democratic Consensus (Month 7-9)

- Implement global tier democratic consensus
- Integrate with governance systems from [ADR-011](ADR-011-cluster-governance-roles.md)
- Build transparent auditing and accountability

### Phase 4: Intelligence and Optimization (Month 10-12)

- Implement adaptive event classification
- Build predictive routing and resource allocation
- Create performance monitoring and auto-tuning

## Open Questions

1. **Event Privacy**: How to balance transparency with privacy for sensitive events?
2. **Scalability Limits**: What are the practical scalability limits of each tier?
3. **Cross-Implementation Compatibility**: How to ensure compatibility across different implementations?
4. **Emergency Procedures**: How to handle failures in the event system itself?

## References

- [ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md) (source document)
- [Practical Byzantine Fault Tolerance](http://pmg.csail.mit.edu/papers/osdi99.pdf)
- [Democratic Consensus Mechanisms](https://en.wikipedia.org/wiki/Consensus_decision-making)
- [Blockchain Scalability Solutions](https://ethereum.org/en/developers/docs/scaling/)
