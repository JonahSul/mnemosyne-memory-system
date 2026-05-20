# Mnemosyne SQLite - Quick Start Guide

This guide will help you get started with the Mnemosyne SQLite MCP server.

## Installation

1. Install dependencies:
```bash
cd packages/mnemosyne-sqlite
npm install
npm run build
```

## Using as an MCP Server

### Configuration

#### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "node",
      "args": [
        "/Users/yourname/path/to/mnemosyne-memory-system/packages/mnemosyne-sqlite/dist/server.js"
      ],
      "env": {
        "MNEMOSYNE_DB_PATH": "./claude-knowledge.db"
      }
    }
  }
}
```

#### For Cline (VS Code Extension)

Add to your VS Code settings or `.vscode/settings.json`:

```json
{
  "mcp.servers": [
    {
      "name": "mnemosyne-sqlite",
      "command": "node",
      "args": [
        "/path/to/mnemosyne-memory-system/packages/mnemosyne-sqlite/dist/server.js"
      ],
      "env": {
        "MNEMOSYNE_DB_PATH": "${workspaceFolder}/.mnemosyne/knowledge.db"
      }
    }
  ]
}
```

### Available Tools

Once configured, the following tools will be available to your AI assistant:

#### 1. `store_knowledge`
Store new knowledge with optional tags and metadata.

**Example prompts:**
- "Remember that our API endpoint is https://api.example.com/v1"
- "Store this: TypeScript interfaces are structurally typed"

#### 2. `search_knowledge`
Semantic search across stored knowledge.

**Example prompts:**
- "What do you know about our API?"
- "Search for information about TypeScript"
- "Find similar content to 'database optimization'"

#### 3. `search_fulltext`
Fast keyword-based search.

**Example prompts:**
- "Search for all entries containing 'React'"
- "Find documents with 'API' and 'authentication'"

#### 4. `get_knowledge`
Retrieve a specific knowledge item by ID.

#### 5. `list_knowledge`
Browse all stored knowledge with pagination.

**Example prompts:**
- "List all stored knowledge"
- "Show me the first 20 items"

#### 6. `delete_knowledge`
Remove a knowledge item by ID.

#### 7. `get_stats`
View knowledge base statistics.

**Example prompts:**
- "How many items are in the knowledge base?"
- "Show knowledge base stats"

## Using as a Library

### Basic Usage

```typescript
import { SqliteVectorStore } from '@mnemosyne/sqlite';

const store = new SqliteVectorStore({
  databasePath: './my-knowledge.db',
  embeddingDimension: 768
});

// Store
const item = await store.storeKnowledge({
  content: 'Important information here',
  tags: ['important', 'project-x'],
  metadata: { source: 'documentation', priority: 'high' }
});

// Search
const results = await store.searchSimilar('find important info', {
  limit: 5,
  threshold: 0.3
});

// Cleanup
store.close();
```

### Custom Embeddings

```typescript
import { SqliteVectorStore } from '@mnemosyne/sqlite';
import OpenAI from 'openai';

const openai = new OpenAI();

const store = new SqliteVectorStore({
  databasePath: './knowledge.db',
  embeddingDimension: 1536, // text-embedding-ada-002
  embeddingFn: async (text: string) => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  }
});
```

## Use Cases

### 1. Project Documentation Memory

Store project-specific information that the AI can recall:

```
"Remember: Our staging server is deployed at staging.example.com"
"Store this: The admin password reset flow requires email verification"
"Note: We use Conventional Commits for our commit messages"
```

### 2. Code Patterns and Best Practices

```
"Remember: We always use async/await instead of .then() chains"
"Store this pattern: Error handling uses try-catch with specific error types"
"Note: All API endpoints must have rate limiting configured"
```

### 3. Team Knowledge Base

```
"Remember: Sarah is the lead on the authentication module"
"Store: Production deployments happen every Tuesday at 3 PM EST"
"Note: The design system documentation is at https://design.example.com"
```

### 4. Meeting Notes and Decisions

```
"Store meeting note: Decided to migrate from REST to GraphQL in Q2 2024"
"Remember: Client wants real-time updates using WebSockets"
```

## Database Management

### Backup

```bash
# Simple file copy (stop server first)
cp project-knowledge.db project-knowledge.db.backup

# Or use SQLite's backup command
sqlite3 project-knowledge.db ".backup project-knowledge.db.backup"
```

### Export to JSON

```typescript
import { SqliteVectorStore } from '@mnemosyne/sqlite';
import { writeFileSync } from 'fs';

const store = new SqliteVectorStore({
  databasePath: './knowledge.db'
});

const all = await store.listAll({ limit: 10000 });
writeFileSync('knowledge-export.json', JSON.stringify(all, null, 2));
store.close();
```

### Inspect Database

```bash
sqlite3 project-knowledge.db

# View all records
SELECT id, content, tags, timestamp FROM knowledge;

# Count records
SELECT COUNT(*) FROM knowledge;

# Search content
SELECT content FROM knowledge WHERE content LIKE '%API%';
```

## Performance Tips

1. **Use Full-Text Search for Keywords**: If you're looking for specific terms, use `search_fulltext` instead of `search_knowledge`—it's much faster.

2. **Adjust Similarity Threshold**: Lower thresholds (e.g., 0.1) return more results; higher thresholds (e.g., 0.5) are more strict.

3. **Tag Organization**: Use consistent tags to make filtering easier.

4. **Database Size**: The database grows approximately 1KB per item (with 768-dim embeddings).

5. **WAL Mode**: Enabled by default for better concurrency.

## Troubleshooting

### Server Won't Start

Check that:
- The database path directory exists and is writable
- Node.js version is 18+ 
- The package is built (`npm run build`)

### Slow Searches

- Use full-text search for keyword queries
- Consider lowering the similarity threshold
- For large databases (>50k items), consider upgrading to native vector search

### Database Locked

- Ensure only one server instance is accessing the database
- WAL mode (enabled by default) helps with concurrency

## Next Steps

- Integrate with your AI workflow
- Set up automatic backups
- Configure custom embeddings for better search quality
- Build custom tools that combine multiple queries

## Support

For issues and questions, see the main Mnemosyne project documentation.
