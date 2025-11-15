# Mnemosyne SQLite - Project-Local Knowledge Store

A SQLite-based MCP (Model Context Protocol) server that provides persistent, project-local knowledge storage with semantic search capabilities for the Mnemosyne memory system.

## Features

- **Persistent Storage**: SQLite database for durable knowledge storage
- **Semantic Search**: Vector-based similarity search using embeddings
- **Full-Text Search**: Fast keyword-based search using SQLite FTS5
- **MCP Integration**: Exposed as MCP tools for use with AI assistants
- **Zero External Dependencies**: No cloud services required
- **WAL Mode**: Better concurrency for read/write operations
- **Mock Embeddings**: Works without external embedding services (with optional custom embedding function)

## Installation

### Option 1: npm (Recommended)

#### Global Installation (for MCP Server)

```bash
npm install -g @mnemosyne/sqlite
```

Then use with the `mnemosyne-sqlite` command:

```json
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "mnemosyne-sqlite",
      "env": {
        "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
      }
    }
  }
}
```

#### Using with npx (No Installation)

```json
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "npx",
      "args": ["-y", "@mnemosyne/sqlite"],
      "env": {
        "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
      }
    }
  }
}
```

#### Local Installation (for Library Use)

```bash
npm install @mnemosyne/sqlite
```

### Option 2: Quick Install Script

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/JonahSul/mnemosyne-memory-system/main/packages/mnemosyne-sqlite/install.sh | bash

# Or download and run
wget https://raw.githubusercontent.com/JonahSul/mnemosyne-memory-system/main/packages/mnemosyne-sqlite/install.sh
chmod +x install.sh
./install.sh
```

### Option 3: VS Code Extension

Search for "Mnemosyne SQLite" in the VS Code Extensions Marketplace for one-click setup.

### Option 4: From Source

From the root of the mnemosyne-memory-system project:

```bash
cd packages/mnemosyne-sqlite
npm install
npm run build
```

## Usage

### As an MCP Server

Configure the server in your MCP client configuration (e.g., Claude Desktop, Cline):

```json
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "node",
      "args": [
        "/path/to/mnemosyne-memory-system/packages/mnemosyne-sqlite/dist/server.js"
      ],
      "env": {
        "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
      }
    }
  }
}
```

### Environment Variables

- `MNEMOSYNE_DB_PATH`: Path to the SQLite database file (default: `./mnemosyne-knowledge.db`)

### Development

Run in development mode with hot reload:

```bash
npm run dev
```

### As a Library

You can also use the `SqliteVectorStore` class directly in your TypeScript/JavaScript code:

```typescript
import { SqliteVectorStore } from '@mnemosyne/sqlite';

const store = new SqliteVectorStore({
  databasePath: './my-knowledge.db',
  embeddingDimension: 768,
  useWAL: true
});

// Store knowledge
await store.storeKnowledge({
  content: 'TypeScript is a typed superset of JavaScript',
  tags: ['programming', 'typescript'],
  metadata: { source: 'documentation' }
});

// Search semantically
const results = await store.searchSimilar('What is TypeScript?', {
  limit: 5,
  threshold: 0.3
});

// Full-text search
const ftsResults = await store.searchFullText('TypeScript', 10);

// List all records
const all = await store.listAll({ limit: 100, offset: 0 });

// Get by ID
const item = await store.getById('knowledge_12345_abc');

// Delete
await store.deleteById('knowledge_12345_abc');

// Get statistics
const stats = store.getStats();
console.log(stats); // { totalRecords: 42, databaseSize: 1024000, embeddingDimension: 768 }

// Close when done
store.close();
```

## MCP Tools

The server exposes the following tools via MCP:

### `store_knowledge`

Store a piece of knowledge in the database.

**Parameters:**
- `content` (string, required): The knowledge content
- `tags` (string[], optional): Tags for categorization
- `metadata` (object, optional): Additional metadata

**Example:**
```json
{
  "content": "React hooks were introduced in React 16.8",
  "tags": ["react", "frontend"],
  "metadata": { "version": "16.8", "year": 2019 }
}
```

### `search_knowledge`

Search for knowledge using semantic similarity.

**Parameters:**
- `query` (string, required): The search query
- `limit` (number, optional): Max results (default: 5)
- `threshold` (number, optional): Similarity threshold 0-1 (default: 0.1)

**Example:**
```json
{
  "query": "How do I use React hooks?",
  "limit": 3,
  "threshold": 0.3
}
```

### `search_fulltext`

Fast keyword-based search using SQLite FTS5.

**Parameters:**
- `query` (string, required): Search query (supports FTS5 syntax)
- `limit` (number, optional): Max results (default: 10)

**Example:**
```json
{
  "query": "React AND hooks",
  "limit": 5
}
```

### `get_knowledge`

Retrieve a specific knowledge item by ID.

**Parameters:**
- `id` (string, required): The knowledge item ID

### `list_knowledge`

List all knowledge items with pagination.

**Parameters:**
- `limit` (number, optional): Max results (default: 100)
- `offset` (number, optional): Skip N results (default: 0)

### `delete_knowledge`

Delete a knowledge item by ID.

**Parameters:**
- `id` (string, required): The knowledge item ID to delete

### `get_stats`

Get statistics about the knowledge base.

**Returns:**
- `totalRecords`: Number of stored items
- `databaseSize`: Database file size in bytes
- `embeddingDimension`: Vector dimension

## Custom Embeddings

To use custom embeddings (e.g., from OpenAI, Cohere, or local models):

```typescript
import { SqliteVectorStore } from '@mnemosyne/sqlite';
import { generateEmbedding } from './my-embedding-service';

const store = new SqliteVectorStore({
  databasePath: './knowledge.db',
  embeddingDimension: 1536, // OpenAI ada-002
  embeddingFn: async (text: string) => {
    return await generateEmbedding(text);
  }
});
```

## Architecture

- **SQLite Database**: Main storage layer with WAL mode enabled
- **Vector Storage**: Embeddings stored as JSON arrays (future: sqlite-vec extension)
- **FTS5**: Full-text search index maintained via triggers
- **Mock Embeddings**: Deterministic embeddings generated from text hash (useful for testing)

## Database Schema

```sql
-- Main knowledge table
CREATE TABLE knowledge (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding TEXT NOT NULL,      -- JSON array of floats
  metadata TEXT NOT NULL,        -- JSON object
  tags TEXT NOT NULL,            -- JSON array of strings
  timestamp TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- FTS5 full-text search table
CREATE VIRTUAL TABLE knowledge_fts USING fts5(
  content,
  content_rowid=id,
  tokenize='porter unicode61'
);
```

## Performance

- **Semantic Search**: O(n) with cosine similarity (acceptable for <10k records)
- **Full-Text Search**: O(log n) with FTS5 index (fast for any size)
- **Storage**: ~1KB per record (768-dim embedding)
- **WAL Mode**: Concurrent reads, non-blocking writes

## Future Enhancements

- [ ] sqlite-vec extension support for native vector operations
- [ ] Automatic embedding service integration (OpenAI, Cohere, etc.)
- [ ] Background indexing and optimization
- [ ] Import/export functionality
- [ ] Multi-database support

## License

See the main Mnemosyne project LICENSE file.
