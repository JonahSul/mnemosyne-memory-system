# Mnemosyne PubSub

Event-driven pub/sub system for Mnemosyne memory operations with Server-Sent Events (SSE) support.

## Overview

`@mnemosyne/pubsub` provides an event bus architecture for broadcasting storage and memory operations across distributed systems. It enables:

- **Real-time updates** via Server-Sent Events
- **Event history and replay** for new subscribers
- **Causality tracking** integration with Mnemosyne core
- **Multiple backend adapters** (in-memory, Redis, Cloudflare)
- **Flexible event filtering** and subscription patterns

## Installation

```bash
npm install @mnemosyne/pubsub
```

## Quick Start

### 1. Wrap Your Storage Adapter

```typescript
import { EventPublishingVectorStore } from '@mnemosyne/pubsub';
import { InMemoryEventBus } from '@mnemosyne/pubsub';
import { SqliteVectorStore } from '@mnemosyne/sqlite';

const eventBus = new InMemoryEventBus();
const baseStore = new SqliteVectorStore({ path: './data.db' });

const eventStore = new EventPublishingVectorStore(baseStore, eventBus, {
  publishWrites: true,
  publishReads: true
});

// Now all operations publish events
await eventStore.upsert([{ 
  id: 'doc-1', 
  vector: [0.1, 0.2], 
  metadata: { title: 'Hello' } 
}]);
```

### 2. Subscribe to Events

```typescript
eventBus.on('storage.created', (event) => {
  console.log('New document created:', event.payload);
});

eventBus.on('storage.searched', (event) => {
  console.log('Search performed:', event.payload);
});

// Subscribe to all storage events
eventBus.on('storage.*', (event) => {
  console.log('Storage event:', event.type, event.payload);
});
```

### 3. Enable SSE Streaming

```typescript
import { SSEManager } from '@mnemosyne/pubsub';
import express from 'express';

const app = express();
const sseManager = new SSEManager(eventBus);

app.get('/events', (req, res) => {
  const clientId = req.query.clientId as string;
  
  sseManager.addClient(clientId, res, {
    filter: { type: 'storage.*' },
    replayHistory: true
  });

  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

app.listen(3000);
```

## Architecture

```
┌─────────────────────────────────────────────┐
│          Application Layer                  │
│   (MCP Tools, API Endpoints, Workers)       │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼─────────┐
        │  EventPublishing  │
        │   VectorStore     │
        │   (Wrapper)       │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │    Event Bus      │
        │  (InMemoryEB)     │
        └─────┬───────┬─────┘
              │       │
     ┌────────▼──┐ ┌──▼─────────┐
     │    SSE    │ │  PubSub    │
     │  Manager  │ │  Adapter   │
     └────┬──────┘ └──┬─────────┘
          │           │
    ┌─────▼─────┐ ┌───▼───────┐
    │  Browser  │ │   Redis   │
    │  Clients  │ │  Workers  │
    └───────────┘ └───────────┘
```

## Event Types

### Storage Events

- `storage.created` - Record(s) created
- `storage.updated` - Record(s) updated
- `storage.deleted` - Record(s) deleted
- `storage.searched` - Search performed

### Memory Events

- `memory.stored` - Memory stored
- `memory.recalled` - Memory retrieved
- `memory.forgotten` - Memory deleted
- `memory.consolidated` - Memory consolidated

### System Events

- `system.initialized` - System started
- `system.shutdown` - System stopping
- `system.error` - System error

### Federation Events

- `federation.sync_started` - Sync initiated
- `federation.sync_completed` - Sync finished
- `federation.conflict_detected` - Conflict found
- `federation.conflict_resolved` - Conflict resolved

## API Reference

### EventBus

```typescript
interface EventBus {
  publish(event: MnemosyneEvent): Promise<void>;
  on(type: string, handler: EventHandler, priority?: EventPriority): Subscription;
  once(type: string, handler: EventHandler): Subscription;
  off(type: string): void;
  getHistory(filter?: EventFilter): MnemosyneEvent[];
  replay(events: MnemosyneEvent[]): Promise<void>;
  pause(): void;
  resume(): void;
}
```

### SSEManager

```typescript
class SSEManager {
  constructor(eventBus: EventBus, options?: {
    heartbeatInterval?: number;
    clientTimeout?: number;
  });
  
  addClient(clientId: string, response: Response, options?: {
    filter?: EventFilter;
    replayHistory?: boolean;
  }): void;
  
  removeClient(clientId: string): void;
  broadcast(event: MnemosyneEvent): void;
  getClientCount(): number;
}
```

### PubSubAdapter

```typescript
interface PubSubAdapter {
  publish(channel: string, event: MnemosyneEvent): Promise<void>;
  subscribe(channel: string, handler: EventHandler): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  close(): Promise<void>;
}
```

## Adapters

### InMemoryPubSubAdapter

For single-process applications:

```typescript
import { InMemoryPubSubAdapter } from '@mnemosyne/pubsub';

const adapter = new InMemoryPubSubAdapter();
await adapter.subscribe('storage.created', (event) => {
  console.log('Created:', event.payload);
});
```

### RedisPubSubAdapter

For distributed systems (requires `redis` package):

```typescript
import { RedisPubSubAdapter } from '@mnemosyne/pubsub';

const adapter = new RedisPubSubAdapter({
  url: 'redis://localhost:6379'
});

await adapter.subscribe('storage.*', (event) => {
  // Handle events from any Redis instance
});
```

### CloudflarePubSubAdapter

For Cloudflare Workers with Durable Objects:

```typescript
import { CloudflarePubSubAdapter } from '@mnemosyne/pubsub';

const adapter = new CloudflarePubSubAdapter(env.EVENT_BUS);

await adapter.publish('channel', event);
```

## Causality Tracking

Events automatically track causality relationships:

```typescript
const event = EventFactory.createStorageEvent('created', {
  records: [{ id: 'doc-1' }]
}, {
  correlationId: 'request-123',  // Groups related events
  causationId: 'evt_previous_1'  // Links to parent event
});

await eventBus.publish(event);
```

## Event Filtering

Subscribe to specific event patterns:

```typescript
// All storage events
eventBus.on('storage.*', handler);

// Specific event type
eventBus.on('storage.created', handler);

// Multiple patterns
eventBus.on('storage.*|memory.*', handler);

// Custom filter function
const sub = eventBus.on('*', handler);
sub.filter = (event) => event.priority >= 5;
```

## Priority System

Events can have priority levels (1-10):

```typescript
eventBus.on('storage.created', handler, 10); // High priority
eventBus.on('storage.created', logger, 1);   // Low priority
```

Handlers execute in priority order (high to low).

## History and Replay

Event bus maintains history for replay:

```typescript
const eventBus = new InMemoryEventBus({
  maxHistorySize: 1000
});

// Get recent events
const history = eventBus.getHistory({
  type: 'storage.*',
  since: Date.now() - 3600000 // Last hour
});

// Replay to new subscriber
await eventBus.replay(history);
```

## SSE Client Example

```typescript
const eventSource = new EventSource('/events?clientId=client-123');

eventSource.addEventListener('storage.created', (event) => {
  const data = JSON.parse(event.data);
  console.log('New record:', data);
});

eventSource.addEventListener('heartbeat', () => {
  console.log('Connection alive');
});

eventSource.onerror = () => {
  console.error('SSE connection lost');
};
```

## Integration Examples

### With Express

```typescript
import express from 'express';
import { SSEManager, InMemoryEventBus } from '@mnemosyne/pubsub';

const app = express();
const eventBus = new InMemoryEventBus();
const sseManager = new SSEManager(eventBus);

app.get('/events', (req, res) => {
  const clientId = crypto.randomUUID();
  sseManager.addClient(clientId, res, {
    filter: { type: 'storage.*' },
    replayHistory: true
  });
  
  req.on('close', () => sseManager.removeClient(clientId));
});

app.listen(3000);
```

### With Hono (Cloudflare Workers)

```typescript
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

const app = new Hono();

app.get('/events', (c) => {
  return streamSSE(c, async (stream) => {
    const clientId = crypto.randomUUID();
    
    const subscription = eventBus.on('*', (event) => {
      stream.writeSSE({
        data: JSON.stringify(event),
        event: event.type
      });
    });
    
    // Heartbeat
    const interval = setInterval(() => {
      stream.writeSSE({ event: 'heartbeat', data: 'ping' });
    }, 30000);
    
    stream.onAbort(() => {
      subscription.unsubscribe();
      clearInterval(interval);
    });
  });
});
```

## Testing

```typescript
import { InMemoryEventBus, EventFactory } from '@mnemosyne/pubsub';

const eventBus = new InMemoryEventBus();
const events: MnemosyneEvent[] = [];

eventBus.on('*', (event) => {
  events.push(event);
});

const event = EventFactory.createStorageEvent('created', {
  records: [{ id: 'test' }]
});

await eventBus.publish(event);

console.assert(events.length === 1);
console.assert(events[0].type === 'storage.created');
```

## Performance Considerations

- **Event History**: Limit `maxHistorySize` in production to prevent memory growth
- **SSE Clients**: Monitor client count and implement connection limits
- **Handler Errors**: Failed handlers don't block other handlers
- **Priority Execution**: High-priority handlers run first but all handlers complete
- **Async Handlers**: Use async handlers for I/O operations
- **Backpressure**: SSE manager handles slow clients with buffering

## Best Practices

1. **Use correlation IDs** to group related events
2. **Set appropriate TTLs** for time-sensitive events
3. **Filter events** at subscription time, not in handlers
4. **Use priorities** for critical vs. logging handlers
5. **Monitor event history size** to prevent memory leaks
6. **Implement heartbeats** for SSE connections
7. **Handle client disconnections** gracefully
8. **Use pub/sub adapters** for multi-node deployments

## License

MIT
