# Integration Example: SSE with Express

This example shows how to integrate Mnemosyne PubSub with an Express server to provide real-time event streaming.

## Setup

```bash
npm install express @types/express
```

## Server Implementation

```typescript
import express from 'express';
import { 
  InMemoryEventBus, 
  SSEManager, 
  EventPublishingVectorStore 
} from '@mnemosyne/pubsub';
import { SqliteVectorStore } from '@mnemosyne/sqlite';

const app = express();
const eventBus = new InMemoryEventBus({ maxHistorySize: 1000 });
const sseManager = new SSEManager(eventBus, {
  heartbeatInterval: 30000,
  clientTimeout: 300000
});

// Wrap storage with event publishing
const baseStore = new SqliteVectorStore({ path: './data.db' });
const eventStore = new EventPublishingVectorStore(baseStore, eventBus);

// SSE endpoint
app.get('/events', (req, res) => {
  const clientId = req.query.clientId as string || crypto.randomUUID();
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Add client with optional filtering
  const eventType = req.query.type as string;
  sseManager.addClient(clientId, res, {
    filter: eventType ? { type: eventType } : undefined,
    replayHistory: req.query.replay === 'true'
  });
  
  // Remove client on disconnect
  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

// API endpoints
app.post('/documents', express.json(), async (req, res) => {
  const { id, content, metadata } = req.body;
  
  await eventStore.upsert([{
    id,
    vector: [0.1, 0.2, 0.3], // Replace with real embeddings
    metadata: { content, ...metadata }
  }]);
  
  res.json({ success: true, id });
});

app.get('/documents/:id', async (req, res) => {
  const docs = await eventStore.get([req.params.id]);
  
  if (docs.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json(docs[0]);
});

app.delete('/documents/:id', async (req, res) => {
  await eventStore.delete([req.params.id]);
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('SSE endpoint: http://localhost:3000/events');
});
```

## Client Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mnemosyne SSE Demo</title>
</head>
<body>
  <h1>Real-time Memory Updates</h1>
  <div id="events"></div>
  
  <script>
    const clientId = crypto.randomUUID();
    const eventSource = new EventSource(`/events?clientId=${clientId}&replay=true`);
    const eventsDiv = document.getElementById('events');
    
    // Listen for storage events
    eventSource.addEventListener('storage.created', (event) => {
      const data = JSON.parse(event.data);
      addEvent('Created', data, 'green');
    });
    
    eventSource.addEventListener('storage.updated', (event) => {
      const data = JSON.parse(event.data);
      addEvent('Updated', data, 'blue');
    });
    
    eventSource.addEventListener('storage.deleted', (event) => {
      const data = JSON.parse(event.data);
      addEvent('Deleted', data, 'red');
    });
    
    eventSource.addEventListener('storage.searched', (event) => {
      const data = JSON.parse(event.data);
      addEvent('Searched', data, 'orange');
    });
    
    // Heartbeat
    eventSource.addEventListener('heartbeat', () => {
      console.log('Connection alive');
    });
    
    // Error handling
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      addEvent('Connection Error', { message: 'Reconnecting...' }, 'red');
    };
    
    function addEvent(type, data, color) {
      const div = document.createElement('div');
      div.style.borderLeft = `4px solid ${color}`;
      div.style.padding = '10px';
      div.style.marginBottom = '10px';
      div.style.backgroundColor = '#f5f5f5';
      
      div.innerHTML = `
        <strong>${type}</strong>
        <small>${new Date().toLocaleTimeString()}</small>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
      
      eventsDiv.insertBefore(div, eventsDiv.firstChild);
      
      // Keep only last 10 events
      while (eventsDiv.children.length > 10) {
        eventsDiv.removeChild(eventsDiv.lastChild);
      }
    }
  </script>
</body>
</html>
```

## Testing

```bash
# Start server
npm start

# In another terminal, create documents
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{"id":"doc-1","content":"Test document","metadata":{"type":"test"}}'

# Watch events in browser
open http://localhost:3000
```

## Advanced Features

### Event Filtering

```typescript
// Only storage.created events
app.get('/events/created', (req, res) => {
  sseManager.addClient(clientId, res, {
    filter: { type: 'storage.created' }
  });
});

// Multiple event types
app.get('/events/writes', (req, res) => {
  sseManager.addClient(clientId, res, {
    filter: { type: 'storage.created|storage.updated|storage.deleted' }
  });
});
```

### Event History Replay

```typescript
// Replay last hour
app.get('/events', (req, res) => {
  const history = eventBus.getHistory({
    since: Date.now() - 3600000
  });
  
  sseManager.addClient(clientId, res, {
    replayHistory: true
  });
  
  // History is automatically sent to client
});
```

### Authentication

```typescript
import jwt from 'jsonwebtoken';

app.get('/events', (req, res) => {
  const token = req.query.token as string;
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const clientId = payload.userId;
    
    sseManager.addClient(clientId, res, {
      filter: { 
        // User can only see their own events
        metadata: { userId: clientId }
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

## Monitoring

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    clients: sseManager.getClientCount(),
    events: eventBus.getHistory().length,
    uptime: process.uptime()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const history = eventBus.getHistory();
  const byType = history.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  res.json({
    totalEvents: history.length,
    eventsByType: byType,
    connectedClients: sseManager.getClientCount()
  });
});
```
