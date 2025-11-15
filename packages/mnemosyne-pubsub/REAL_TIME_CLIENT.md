# Real-Time Client Context Synchronization

Guide for building clients that maintain up-to-the-minute context awareness through the event bus.

## Overview

The Mnemosyne event bus enables clients to stay synchronized with all memory operations, including background agent activities. Clients can subscribe to relevant events and maintain current state without polling.

## Core Concepts

### Event Categories

1. **Storage Events** - Low-level CRUD operations
2. **Memory Events** - High-level memory lifecycle
3. **Query Events** - Search and retrieval operations
4. **Agent Events** - Background processing activities
5. **Topic Events** - Topic mutations and trending
6. **Context Events** - Contextual changes
7. **Entity Events** - Named entity tracking
8. **System Events** - System-level changes

### Subscription Patterns

#### Pattern 1: Subscribe to All Changes
```typescript
// Get everything - useful for debugging or admin dashboards
eventBus.subscribe('*', (event) => {
  console.log('Event:', event.type, event.payload);
  updateClientState(event);
});
```

#### Pattern 2: Subscribe by Category
```typescript
// All memory operations
eventBus.subscribe('memory.*', (event) => {
  handleMemoryEvent(event);
});

// All agent activities
eventBus.subscribe('agent.*', (event) => {
  updateAgentStatus(event);
});
```

#### Pattern 3: Subscribe to Specific Events
```typescript
// Only consolidation events
eventBus.subscribe(EventType.MEMORY_CONSOLIDATED, (event) => {
  const { sourceMemories, targetMemory } = event.payload;
  updateMemoryGraph(sourceMemories, targetMemory);
});

// Only topic updates
eventBus.subscribe(EventType.TOPIC_UPDATED, (event) => {
  refreshTopicDisplay(event.payload.topicId);
});
```

#### Pattern 4: Multi-Event Subscription
```typescript
// Critical events only
const criticalEvents = [
  EventType.SYSTEM_ERROR,
  EventType.CAUSALITY_VIOLATION,
  EventType.FEDERATION_CONFLICT_DETECTED
];

for (const eventType of criticalEvents) {
  eventBus.subscribe(eventType, (event) => {
    showAlert(event);
  }, 10); // High priority
}
```

## Real-Time Client Implementation

### Basic Client State Manager

```typescript
import { InMemoryEventBus, SSEManager, EventType } from '@mnemosyne/pubsub';
import type { 
  MemoryStoredPayload,
  MemoryForgottenPayload,
  TopicUpdatedPayload,
  AgentTaskCompletedPayload
} from '@mnemosyne/pubsub/event-schemas';

class MemoryClientState {
  private eventBus: InMemoryEventBus;
  private memories: Map<string, any> = new Map();
  private topics: Map<string, any> = new Map();
  private agentStatus: Map<string, any> = new Map();
  private listeners: Set<(state: any) => void> = new Set();

  constructor(sseEndpoint: string) {
    this.eventBus = new InMemoryEventBus();
    this.connectSSE(sseEndpoint);
    this.setupSubscriptions();
  }

  private connectSSE(endpoint: string): void {
    const eventSource = new EventSource(endpoint);

    eventSource.onmessage = (msg) => {
      const event = JSON.parse(msg.data);
      this.eventBus.publish(event);
    };

    eventSource.onerror = () => {
      console.error('SSE connection lost, reconnecting...');
      this.notifyListeners();
    };
  }

  private setupSubscriptions(): void {
    // Memory lifecycle
    this.eventBus.subscribe<MemoryStoredPayload>(
      EventType.MEMORY_STORED,
      (event) => {
        const { memoryId, content, importance } = event.payload;
        this.memories.set(memoryId, { 
          id: memoryId, 
          content, 
          importance,
          createdAt: event.timestamp 
        });
        this.notifyListeners();
      }
    );

    this.eventBus.subscribe<MemoryForgottenPayload>(
      EventType.MEMORY_FORGOTTEN,
      (event) => {
        this.memories.delete(event.payload.memoryId);
        this.notifyListeners();
      }
    );

    // Topic tracking
    this.eventBus.subscribe<TopicUpdatedPayload>(
      EventType.TOPIC_UPDATED,
      (event) => {
        const topic = this.topics.get(event.payload.topicId) || {};
        
        if (event.payload.changes.name) {
          topic.name = event.payload.changes.name.to;
        }
        
        this.topics.set(event.payload.topicId, topic);
        this.notifyListeners();
      }
    );

    // Agent monitoring
    this.eventBus.subscribe<AgentTaskCompletedPayload>(
      EventType.AGENT_TASK_COMPLETED,
      (event) => {
        const { agentId, taskType, duration, itemsProcessed } = event.payload;
        this.agentStatus.set(agentId, {
          lastTask: taskType,
          lastCompleted: event.timestamp,
          duration,
          itemsProcessed
        });
        this.notifyListeners();
      }
    );

    // Background consolidation
    this.eventBus.subscribe(
      EventType.AGENT_CONSOLIDATION_COMPLETED,
      (event) => {
        const { memoriesConsolidated, duration } = event.payload;
        console.log(`Background consolidation: ${memoriesConsolidated} memories in ${duration}ms`);
        this.notifyListeners();
      }
    );
  }

  // Subscribe to state changes
  onChange(listener: (state: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = {
      memories: Array.from(this.memories.values()),
      topics: Array.from(this.topics.values()),
      agents: Array.from(this.agentStatus.values())
    };

    for (const listener of this.listeners) {
      listener(state);
    }
  }

  getState() {
    return {
      memoryCount: this.memories.size,
      topicCount: this.topics.size,
      activeAgents: this.agentStatus.size
    };
  }
}
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { MemoryClientState } from './client-state';

export function useMemoryState(sseEndpoint: string) {
  const [state, setState] = useState({
    memories: [],
    topics: [],
    agents: [],
    loading: true
  });

  useEffect(() => {
    const client = new MemoryClientState(sseEndpoint);
    
    const unsubscribe = client.onChange((newState) => {
      setState({ ...newState, loading: false });
    });

    return () => {
      unsubscribe();
    };
  }, [sseEndpoint]);

  return state;
}

// Usage in component
function MemoryDashboard() {
  const { memories, topics, agents, loading } = useMemoryState('/events');

  if (loading) return <div>Connecting...</div>;

  return (
    <div>
      <h2>Memories: {memories.length}</h2>
      <h2>Topics: {topics.length}</h2>
      <h2>Active Agents: {agents.length}</h2>
      
      <ul>
        {memories.map(m => (
          <li key={m.id}>{m.content}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Topic-Specific Subscriptions

### Tracking Topic Mutations

```typescript
import { TopicTracker } from '@mnemosyne/pubsub/topic-tracker';

const tracker = new TopicTracker(eventBus);

// Subscribe to specific topics
tracker.subscribeToTopics('client-123', ['ai-research', 'project-updates'], {
  includeRelated: true,
  callback: (event) => {
    console.log('Topic changed:', event.type, event.payload);
    
    // Update UI
    if (event.type === EventType.TOPIC_MEMORIES_ADDED) {
      const { topicId, memoryIds } = event.payload;
      refreshTopicView(topicId, memoryIds);
    }
  }
});

// Get trending topics
const trending = tracker.getTrendingTopics(5);
console.log('Trending:', trending.map(t => t.name));
```

## Advanced Patterns

### Filtered Event Streams

```typescript
// Only high-importance memory changes
eventBus.subscribe(EventType.MEMORY_IMPORTANCE_UPDATED, (event) => {
  const { newImportance } = event.payload;
  
  if (newImportance >= 8) {
    highlightImportantMemory(event.payload.memoryId);
  }
}, {
  filter: {
    predicate: (event) => event.payload.newImportance >= 8
  }
});

// Only errors from specific components
eventBus.subscribe(EventType.SYSTEM_ERROR, (event) => {
  if (event.payload.component === 'federation') {
    alertAdmin(event.payload);
  }
}, {
  filter: {
    predicate: (event) => event.payload.component === 'federation'
  }
});
```

### Event Replay for New Clients

```typescript
// Client connects and wants recent history
const client = new SSEManager(eventBus);

app.get('/events', (req, res) => {
  const since = parseInt(req.query.since as string) || Date.now() - 3600000;
  
  client.addClient(req.query.clientId as string, res, {
    replayHistory: true,
    filter: {
      type: 'memory.*|topic.*',
      since: since
    }
  });
});
```

### Agent Activity Dashboard

```typescript
class AgentMonitor {
  private agentStates: Map<string, AgentState> = new Map();

  constructor(eventBus: EventBus) {
    // Track agent lifecycle
    eventBus.subscribe(EventType.AGENT_STARTED, (event) => {
      const { agentId, agentType } = event.payload;
      this.agentStates.set(agentId, {
        id: agentId,
        type: agentType,
        status: 'running',
        tasksCompleted: 0,
        errors: 0
      });
    });

    // Track completions
    eventBus.subscribe(EventType.AGENT_TASK_COMPLETED, (event) => {
      const { agentId, duration, itemsProcessed, errors } = event.payload;
      const state = this.agentStates.get(agentId);
      
      if (state) {
        state.tasksCompleted++;
        state.errors += errors || 0;
        state.lastDuration = duration;
        state.lastItemsProcessed = itemsProcessed;
      }
    });

    // Track failures
    eventBus.subscribe(EventType.AGENT_TASK_FAILED, (event) => {
      const { agentId } = event.payload;
      const state = this.agentStates.get(agentId);
      
      if (state) {
        state.errors++;
        state.lastError = event.payload;
      }
    });
  }

  getAgentStatus(agentId: string) {
    return this.agentStates.get(agentId);
  }

  getAllAgents() {
    return Array.from(this.agentStates.values());
  }
}
```

## Performance Considerations

### Throttling Updates

```typescript
import { debounce } from 'lodash';

const debouncedUpdate = debounce((state) => {
  updateUI(state);
}, 100);

eventBus.subscribe('memory.*', (event) => {
  localState.apply(event);
  debouncedUpdate(localState);
});
```

### Selective Subscriptions

```typescript
// Only subscribe to events relevant to current view
class ViewAwareClient {
  private subscriptions: Subscription[] = [];

  switchToMemoryView() {
    this.clearSubscriptions();
    
    this.subscriptions.push(
      eventBus.subscribe('memory.*', handleMemoryEvent),
      eventBus.subscribe('storage.*', handleStorageEvent)
    );
  }

  switchToAgentView() {
    this.clearSubscriptions();
    
    this.subscriptions.push(
      eventBus.subscribe('agent.*', handleAgentEvent)
    );
  }

  private clearSubscriptions() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }
}
```

## Error Handling

```typescript
eventBus.subscribe('*', (event) => {
  try {
    processEvent(event);
  } catch (error) {
    console.error('Failed to process event:', event.type, error);
    
    // Report error back to system
    eventBus.publish({
      id: crypto.randomUUID(),
      type: EventType.SYSTEM_ERROR,
      timestamp: Date.now(),
      source: 'client',
      payload: {
        error: error.message,
        component: 'event-handler',
        recoverable: true
      }
    });
  }
});
```

## Testing

```typescript
import { InMemoryEventBus } from '@mnemosyne/pubsub';

describe('Client State Synchronization', () => {
  it('should update when memory is stored', async () => {
    const eventBus = new InMemoryEventBus();
    const client = new MemoryClientState(eventBus);
    
    const event = {
      id: 'evt-1',
      type: EventType.MEMORY_STORED,
      timestamp: Date.now(),
      source: 'test',
      payload: {
        memoryId: 'mem-1',
        content: 'Test memory',
        importance: 5
      }
    };
    
    await eventBus.publish(event);
    
    const state = client.getState();
    expect(state.memoryCount).toBe(1);
  });
});
```
