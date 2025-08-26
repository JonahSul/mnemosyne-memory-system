# ADR-017: Plan-Based Accountability Memory Architecture

**Status**: Proposed  
**Date**: 2025-08-25  
**Owners**: Memory Agent, Human Developer  
**Related ADRs**: [ADR-001](ADR-001-persistent-first-worker-bindings.md), [ADR-003](ADR-003-cognitive-to-persistence-tier-mapping.md), [ADR-006](ADR-006-distributed-knowledge-network-architecture.md)

## Overview

This ADR establishes plan-based accountability memory objects that enable temporal vector space plotting for tracking both agent and user accountability across conversation continuity and task execution.

## Context

The current Mnemosyne Memory System lacks structured accountability mechanisms for both agents and users. Several critical gaps exist:

1. **Agent Accountability Gap**: No systematic tracking of agent commitments, milestones, or evidence-based completion verification
2. **User Accountability Gap**: No detection of conversation forks or mechanisms to remind users of original objectives when they become distracted
3. **Temporal Coordination Absence**: No vector space representation of planned vs actual progress trajectories
4. **Conversation Continuity Risk**: Users frequently fork conversations and lose track of original goals without any systematic intervention
5. **Evidence-Based Planning Void**: No structured approach to milestone tracking with blocker identification and resolution workflows

Analysis reveals that while the system has advanced memory storage (ADR-001) and cognitive tiering (ADR-003), it lacks the accountability layer needed for sustained goal achievement and conversation coherence.

## Decision

Implement **Plan-Based Accountability Memory Architecture** with temporal vector space plotting and bi-directional accountability tracking.

## Core Architecture Components

### Plan Memory Object Structure

```typescript
interface PlanMemoryEntry {
  // Core Identity
  id: string;
  title: string;
  description: string;
  objectives: string[];
  
  // Temporal Coordination
  plannedStartTime: string;
  plannedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  
  // Status and Progress
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled' | 'derailed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number; // 0-100 percentage
  
  // Accountability Metadata
  initiatedBy: 'user' | 'agent' | 'collaborative';
  agentResponsible?: string;
  userCommitment?: 'explicit' | 'implied' | 'none';
  
  // Vector Space Temporal Plotting
  vectorMetadata: {
    semanticCluster: string[];
    temporalCoordinates: {
      plannedVector: number[]; // where we planned to be
      currentVector?: number[]; // where we actually are  
      trajectoryVector?: number[]; // direction of progress
    };
    relatedEvents: string[];
    spatialRelevance: number; // 0-1 semantic relevance to current context
  };
  
  // Execution Tracking
  milestones: PlanMilestone[];
  blockers: PlanBlocker[];
  dependencies: string[];
  
  // Accountability Metrics
  accountability: {
    commitmentLevel: number; // 0-1 commitment strength
    trackingMetrics: string[];
    checkInFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
    deviationAlerts: boolean;
  };
  
  // Conversation Continuity
  continuity: {
    canRemindUser: boolean;
    reminderThreshold: number; // minutes before suggesting return
    contextSwitchTolerance: number; // topic switches before intervention
    originalIntent: string;
    alternativeApproaches?: string[];
  };
}
```

### Conversation Fork Detection

**Semantic Distance Monitoring**: Uses vector embeddings to detect when current conversation context deviates from plan objectives beyond configurable thresholds.

**Intervention Strategies**:
- **Gentle Reminder**: "I notice we've drifted from our original focus on [plan title]. Would you like to return to that?"
- **Context Bridging**: Identifies semantic connections between current topic and plan to facilitate natural transitions
- **Choice Presentation**: Explicitly offers user choice between continuing current topic or returning to plan

### Agent Accountability Framework

**Milestone Tracking**: Evidence-based completion verification with dependencies and blocking issue management.

**Progress Monitoring**: Vector space positioning updates that track actual trajectory against planned coordinates.

**Blocker Resolution**: Systematic identification, categorization, and resolution workflows for impediments.

## Vector Space Temporal Plotting

### Coordinate System

Plans exist as **temporal trajectories through semantic vector space** where:
- **Planned Vector**: Expected semantic position at completion
- **Current Vector**: Actual semantic position based on current progress  
- **Trajectory Vector**: Direction and velocity of progress through vector space

### Trajectory Analysis

**Course Correction Detection**: Identifies when actual trajectory deviates significantly from planned path and suggests corrections.

**Convergence Prediction**: Estimates completion time and probability based on current trajectory and historical patterns.

**Related Plan Discovery**: Uses vector similarity to find semantically related plans and suggest coordination opportunities.

## Implementation Requirements

### Storage Integration

- **Foundation**: Built on ADR-001 CloudflareVectorStore for persistent plan storage
- **Vector Embeddings**: Plan descriptions and objectives generate embeddings for semantic search
- **Causal Context**: Integration with enhanced memory interfaces for causality tracking

### Core Operations

```typescript
interface PlanOperations {
  createPlan(plan: Omit<PlanMemoryEntry, 'id' | 'timestamp'>): Promise<string>;
  updatePlanStatus(planId: string, status: PlanMemoryEntry['status']): Promise<boolean>;
  updatePlanProgress(planId: string, progress: number, vectorUpdate?: number[]): Promise<boolean>;
  
  // Accountability Functions
  checkAccountability(planId: string): Promise<AccountabilityReport>;
  detectConversationFork(currentContext: string, planId: string): Promise<ConversationForkAnalysis>;
  suggestReturnToPlan(planId: string): Promise<ReturnSuggestion>;
  
  // Vector Space Functions
  updatePlanVectorPosition(planId: string, currentVector: number[]): Promise<boolean>;
  analyzePlanTrajectory(planId: string): Promise<TrajectoryAnalysis>;
  findRelatedPlans(semanticQuery: string): Promise<PlanMemoryEntry[]>;
}
```

### Integration Points

- **Memory System**: Plans stored as 'plan' type in MemoryEntry with enhanced metadata
- **Causal Context**: Plan events tracked through causality analysis for dependency management
- **Conversation Management**: Fork detection integrated with conversation flow monitoring

## Scope

**In Scope**:
- Plan memory object structure and operations
- Conversation fork detection and user accountability
- Agent milestone tracking and accountability
- Vector space temporal plotting
- Evidence-based completion verification
- Blocker identification and resolution workflows

**Out of Scope**:
- Democratic governance integration (deferred to ADR-006 implementation)
- Cross-cluster plan coordination (requires ADR-007 federation)
- Blockchain event integration (requires ADR-010)
- Multi-modal plan coordination (requires ADR-016)

## Consequences

### Pros
- **User Accountability**: Systematic conversation continuity with gentle intervention strategies
- **Agent Accountability**: Evidence-based progress tracking with milestone verification
- **Temporal Coordination**: Vector space representation enables sophisticated trajectory analysis
- **Goal Achievement**: Structured approach to maintaining focus on original objectives
- **Innovation**: Novel integration of semantic vectors with accountability workflows

### Cons
- **Complexity**: Adds significant complexity to memory system architecture
- **Performance**: Vector space calculations and semantic monitoring increase computational overhead
- **User Experience**: Intervention strategies risk being perceived as intrusive if not carefully tuned
- **Storage Overhead**: Plan objects with full metadata require additional storage capacity

### Risks

**Implementation Risk**: Complex integration of vector calculations, causal tracking, and accountability workflows could introduce bugs.
*Mitigation*: Comprehensive test suite with plan lifecycle scenarios and vector space validation.

**User Acceptance Risk**: Users may find conversation fork detection annoying rather than helpful.
*Mitigation*: Configurable intervention thresholds and user control over reminder preferences.

**Performance Risk**: Vector space calculations for large numbers of plans could impact system responsiveness.
*Mitigation*: Efficient indexing and caching strategies for vector operations.

## Dependencies

**Hard Dependencies**:
- ADR-001: CloudflareVectorStore for persistent plan storage and vector operations
- Enhanced Memory Interfaces: Causal context integration and temporal metadata

**Soft Dependencies**:
- ADR-003: Cognitive tier mapping for plan importance classification
- ADR-006: Future integration with distributed architecture roles

**No Dependencies**:
- ADR-002, ADR-004, ADR-005: Not required for core plan functionality
- ADR-007-016: Federation features can be added later without architectural changes

## Migration Strategy

### Phase 1: Core Implementation
- Implement PlanMemoryEntry interface and basic operations
- Create PlanMemoryManager with vector integration
- Basic conversation fork detection

### Phase 2: Advanced Features  
- Enhanced accountability reporting
- Sophisticated trajectory analysis
- Optimized intervention strategies

### Phase 3: Integration
- Integration with distributed architecture (when ADR-006 implemented)
- Cross-cluster plan coordination (when federation available)
- Multi-modal coordination capabilities

## Success Metrics

- **User Retention**: Measure completion rate of plans vs abandonment after conversation forks
- **Agent Accountability**: Track milestone completion rates and evidence quality
- **System Usage**: Monitor plan creation frequency and user engagement with accountability features
- **Performance**: Vector space operations complete within acceptable latency thresholds

## Conclusion

Plan-Based Accountability Memory Architecture addresses critical gaps in both user and agent accountability while introducing novel vector space temporal plotting capabilities. The architecture builds on proven foundations (ADR-001) while enabling future integration with distributed governance when ready.

This ADR establishes Mnemosyne as a system that not only remembers information but actively supports goal achievement through structured accountability and conversation continuity mechanisms.
