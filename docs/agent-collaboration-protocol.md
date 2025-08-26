# In-Memory Agent Collaboration Protocol

## Overview

This document defines a protocol for direct agent-to-agent collaboration through the Mnemosyne memory system, enabling ARC-0, MEM-0, and future agents to coordinate work while maintaining Foundation v1.5.0 principles.

## Protocol Principles

- **Memory-Native**: All collaboration occurs through persistent memory storage
- **Attribution-Aware**: Every collaboration message includes verifiable agent attribution
- **Evidence-Based**: Collaboration decisions must include supporting evidence
- **Asynchronous**: Agents can collaborate across time without simultaneous presence
- **Auditable**: Full collaboration history preserved for accountability

## Collaboration Message Schema

### Base Collaboration Message
**Storage**: Vectorize with special metadata tags
**Namespace**: `collab:{protocolVersion}:{threadId}`

```typescript
interface CollaborationMessage {
  // Message identification
  messageId: string;
  threadId: string;              // Groups related collaboration messages
  parentMessageId?: string;      // For threaded conversations
  
  // Agent attribution (using identity registry)
  attribution: {
    authorId: string;            // Agent identifier (ARC-0, MEM-0, etc.)
    agentRole: 'architect' | 'memory_specialist' | 'domain_expert' | 'coordinator';
    signature: string;           // Cryptographic signature of message content
    timestamp: string;           // ISO timestamp
  };
  
  // Message content
  content: {
    messageType: CollaborationMessageType;
    subject: string;             // Brief description of collaboration topic
    body: string;               // Full message content
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];             // For semantic categorization
  };
  
  // Collaboration context
  context: {
    projectPhase: string;        // e.g., "identity_registry_design"
    workArtifacts: string[];     // Referenced files, schemas, implementations
    decisions: CollaborationDecision[]; // Decisions made in this message
    actionItems: ActionItem[];   // Tasks assigned or requested
  };
  
  // Evidence and validation
  evidence: {
    supportingMemories: string[]; // Memory IDs that support this message
    crossReferences: string[];   // Related collaboration messages
    validationCriteria: string[]; // How to verify correctness
    confidence: number;          // 0.0-1.0 confidence in content
  };
  
  // Response handling
  response: {
    responseRequested: boolean;
    responseDeadline?: string;    // ISO timestamp
    responseFormat?: string;     // Preferred response format
    acknowledgmentReceived: boolean;
  };
}

type CollaborationMessageType = 
  | 'proposal'          // Proposing new work or changes
  | 'review_request'    // Requesting review of work
  | 'feedback'          // Providing feedback on proposals
  | 'decision'          // Making or documenting decisions
  | 'status_update'     // Progress updates
  | 'question'          // Asking for clarification
  | 'handoff'           // Transferring work responsibility
  | 'approval'          // Approving proposed work
  | 'coordination'      // Coordinating parallel work streams
  | 'documentation';    // Documenting decisions or learnings
```

### Collaboration Decision Schema
```typescript
interface CollaborationDecision {
  decisionId: string;
  title: string;
  description: string;
  decisionType: 'architectural' | 'implementation' | 'process' | 'priority';
  decidedBy: string[];           // Agent IDs that participated in decision
  alternatives: string[];       // Alternative options considered
  rationale: string;            // Why this decision was made
  evidence: string[];           // Supporting evidence for decision
  implementationNotes: string;  // How to implement this decision
  reviewDate?: string;          // When to review this decision
  status: 'proposed' | 'decided' | 'implemented' | 'superseded';
}
```

### Action Item Schema
```typescript
interface ActionItem {
  actionId: string;
  title: string;
  description: string;
  assignedTo: string[];         // Agent IDs responsible
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort: string;      // Time/complexity estimate
  dependencies: string[];       // Other action items that must complete first
  deliverables: string[];       // Expected outputs
  dueDate?: string;            // ISO timestamp
  status: 'created' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  blockingReasons?: string[];   // If status is 'blocked'
  progressNotes: string[];      // Updates on progress
}
```

## Collaboration Workflows

### 1. Proposal & Review Workflow
```
ARC-0 → [proposal] → memory_store with collab tags
MEM-0 → memory_search for collab:proposal → reviews proposal
MEM-0 → [feedback] → memory_store with parent reference
ARC-0 → [decision] → memory_store documenting final decision
```

### 2. Work Handoff Workflow
```
ARC-0 → [handoff] → documents completed work + next steps
MEM-0 → [acknowledgment] → confirms receipt and understanding
MEM-0 → [status_update] → regular progress updates
MEM-0 → [completion] → documents completion + deliverables
```

### 3. Parallel Coordination Workflow
```
ARC-0 → [coordination] → defines parallel work streams
MEM-0 → [coordination] → confirms work stream assignment
Both → [status_update] → regular progress synchronization
Either → [coordination] → adjustment if streams diverge
```

## Memory Integration

### Storage Strategy
```typescript
// Collaboration messages stored as specialized memory entries
await memory_store({
  content: `COLLAB[${messageType}]: ${subject} - ${body}`,
  metadata: {
    messageType: 'collaboration',
    collabMessageType: messageType,
    threadId: threadId,
    authorId: authorId,
    agentRole: agentRole,
    priority: priority,
    responseRequested: responseRequested
  },
  tags: ['collaboration', agentRole, messageType, ...customTags],
  importance: priorityToImportance(priority),
  source: 'agent_collaboration',
  verification_method: 'cryptographic'
});
```

### Discovery & Response
```typescript
// Agents search for collaboration messages
const collabMessages = await memory_search({
  query: `COLLAB collaboration ${agentRole} ${messageType}`,
  searchType: 'recall',
  requireEvidence: false,
  tierPreference: 'all'
});

// Filter for unresponded messages
const pendingMessages = collabMessages.filter(msg => 
  msg.metadata.responseRequested && 
  !msg.metadata.responseReceived
);
```

## Protocol Commands

### Core Collaboration Commands
```typescript
// Send collaboration message
async function sendCollaborationMessage(
  message: Omit<CollaborationMessage, 'messageId' | 'attribution'>
): Promise<string> {
  const messageId = generateCollaborationId();
  const signature = await signMessage(message.content.body);
  
  await memory_store({
    content: formatCollaborationMessage(message),
    metadata: enhanceWithCollabMetadata(message, messageId, signature),
    tags: generateCollaborationTags(message),
    importance: calculateMessageImportance(message),
    source: 'agent_collaboration'
  });
  
  return messageId;
}

// Retrieve collaboration thread
async function getCollaborationThread(threadId: string): Promise<CollaborationMessage[]> {
  const results = await memory_search({
    query: `COLLAB threadId:${threadId}`,
    searchType: 'recall',
    limit: 100
  });
  
  return parseCollaborationMessages(results)
    .sort((a, b) => new Date(a.attribution.timestamp).getTime() - 
                    new Date(b.attribution.timestamp).getTime());
}

// Respond to collaboration message
async function respondToCollaboration(
  parentMessageId: string,
  response: Partial<CollaborationMessage>
): Promise<string> {
  const parentMessage = await getCollaborationMessage(parentMessageId);
  
  return sendCollaborationMessage({
    ...response,
    threadId: parentMessage.threadId,
    parentMessageId: parentMessageId,
    content: {
      ...response.content,
      messageType: response.content?.messageType || 'feedback'
    }
  });
}
```

## Agent-Specific Protocols

### ARC-0 (Architect) Protocol
- **Primary Role**: Architectural decisions, system design, strategic direction
- **Message Types**: proposals, decisions, coordination, architectural reviews
- **Response SLA**: 24 hours for urgent, 72 hours for high priority
- **Authority**: Final decision authority on architectural matters

### MEM-0 (Memory Specialist) Protocol  
- **Primary Role**: Memory system integrity, ADR compliance, storage optimization
- **Message Types**: review_request, feedback, implementation details, memory analysis
- **Response SLA**: 12 hours for memory-critical issues, 48 hours otherwise
- **Authority**: Veto power on memory system changes that violate ADR principles

### Future Agent Protocols
- **Domain Experts**: Specialized knowledge areas
- **Coordinators**: Cross-agent workflow management
- **Validators**: Quality assurance and testing

## Collaboration Governance

### Message Lifecycle
1. **Draft** → Agent composes collaboration message
2. **Validate** → Verify attribution, evidence, and format
3. **Store** → Persist to memory system with collaboration metadata
4. **Notify** → Target agents discover via memory_search
5. **Respond** → Target agents provide responses
6. **Archive** → Completed threads marked as resolved

### Quality Assurance
- **Evidence Requirements**: All decisions must include supporting evidence
- **Signature Verification**: All messages cryptographically signed
- **Response Tracking**: Unresponded urgent messages escalated
- **Thread Management**: Long threads split to maintain readability

### Conflict Resolution
1. **Technical Conflicts**: Escalate to agent with domain authority
2. **Process Conflicts**: Refer to established ADR principles
3. **Priority Conflicts**: Higher priority work takes precedence
4. **Deadlocks**: Escalate to human oversight

## Implementation Example: ARC-0 ↔ MEM-0

```typescript
// ARC-0 proposes identity registry implementation
await sendCollaborationMessage({
  threadId: 'identity_registry_impl_2025_08',
  content: {
    messageType: 'proposal',
    subject: 'Identity Registry Phase 1 Implementation',
    body: 'Proposing to implement KV-based identity storage with Ed25519 signatures...',
    priority: 'high',
    tags: ['identity_registry', 'phase_1', 'cryptography']
  },
  context: {
    projectPhase: 'identity_registry_design',
    workArtifacts: ['docs/identity-registry-schema.md', 'src/types/identity-registry.ts'],
    decisions: [{
      decisionId: 'id_reg_kv_storage',
      title: 'Use KV Storage for Identity Registry',
      description: 'Store agent identities in Cloudflare KV separate from Vectorize',
      decisionType: 'architectural',
      decidedBy: ['ARC-0'],
      rationale: 'Provides data segregation and optimized access patterns for identity lookups',
      status: 'proposed'
    }],
    actionItems: [{
      actionId: 'implement_identity_kv_schema',
      title: 'Implement Identity KV Schema',
      description: 'Create KV namespace structure and basic CRUD operations',
      assignedTo: ['MEM-0'],
      priority: 'high',
      deliverables: ['KV schema implementation', 'Basic identity operations'],
      status: 'created'
    }]
  },
  evidence: {
    supportingMemories: ['mem_1756134953792_cnx9odkr4'], // Earlier identity registry design
    confidence: 0.9
  },
  response: {
    responseRequested: true,
    responseDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    responseFormat: 'implementation_review'
  }
});

// MEM-0 reviews and provides feedback
await respondToCollaboration('proposal_message_id', {
  content: {
    messageType: 'feedback',
    subject: 'Re: Identity Registry Phase 1 Implementation',
    body: 'Reviewed proposal. Architecture aligns with ADR-001 and ADR-013. Recommending addition of behavioral fingerprinting in Phase 1...',
    priority: 'high'
  },
  context: {
    decisions: [{
      decisionId: 'add_behavioral_fingerprinting_phase1',
      title: 'Include Basic Behavioral Fingerprinting',
      description: 'Add interaction pattern tracking to Phase 1',
      decisionType: 'implementation',
      decidedBy: ['MEM-0'],
      rationale: 'Foundation v1.5.0 requires behavioral consistency validation',
      status: 'proposed'
    }]
  },
  evidence: {
    supportingMemories: ['foundation_v1.5.0_behavioral_rules'],
    confidence: 0.95
  }
});
```

This protocol enables structured, auditable, evidence-based collaboration while leveraging the memory system as the communication medium.
