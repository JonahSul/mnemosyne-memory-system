# @mnemosyne/infra-sqlite

Real SQLite infrastructure adapters for local, CLI, and VS Code use.

## Adapters

- **`SqliteVectorStore`** — vector store backed by `better-sqlite3` with optional `sqlite-vec` extension
- **`SqliteKVStore`** — key-value store backed by SQLite tables

## No mocks

The legacy `generateMockEmbedding` fallback is NOT carried forward. Consumers
must provide an `EmbeddingProvider` (e.g. from `@mnemosyne/infra-cloudflare`
or a local Ollama adapter).

## Usage

```typescript
import { SqliteVectorStore, SqliteKVStore } from '@mnemosyne/infra-sqlite';

const vectorStore = new SqliteVectorStore({ dbPath: './knowledge.db' });
const kvStore = new SqliteKVStore({ dbPath: './knowledge.db' });
```
