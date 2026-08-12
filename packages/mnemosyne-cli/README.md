# @mnemosyne/cli

Standalone Mnemosyne MCP server over stdio, using SQLite infrastructure.

## What this replaces

This package replaces:
- `packages/mnemosyne-sqlite/src/server.ts` (the standalone MCP server)
- `src/local-agent.ts` (the local-dev Qdrant/Redis/Ollama agent)
- `src/server.ts` (the Express + Socket.IO local dev server)

## Usage

```bash
# Run as MCP server over stdio
npx mnemosyne --db ./knowledge.db

# With a specific agent identity
npx mnemosyne --uuad my-agent --db ./knowledge.db
```

## Composition root

Binds SQLite adapters to the domain:

```
SqliteVectorStore → SearchService
SqliteKVStore     → MemoryAggregate
```

The VS Code extension (`mnemosyne-vscode`) shells out to this package.
