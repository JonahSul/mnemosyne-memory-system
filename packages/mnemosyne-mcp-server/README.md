# @mnemosyne/mcp-server

Real MCP (Model Context Protocol) server for Mnemosyne.

## What this replaces

This package replaces the stub `@mnemosyne/mcp` package (which was a 30-line
process spawner with no real implementation). This is a real MCP SDK server
with a tool registry, prompt registry, and resource registry.

## Tools

Each tool is a class implementing the `MCPTool` interface, registered in a
registry. The server dispatches `tools/call` requests to the appropriate tool.

- `memory_init` — Foundation beacon and system initialization
- `memory_store` — Store a memory with metadata validation
- `memory_search` — Semantic search with adaptive thresholds
- `memory_stats` — System analytics
- `memory_admin` — Foundation management operations
- `memory_store_enhanced` — Store with causality and semantic expansion
- `memory_analyze_causality` — Analyze causal relationships

## Transports

- **stdio** — for CLI and VS Code extension use
- **HTTP** — for the SaaS Worker

## Usage

```typescript
import { McpServer, ToolRegistry } from '@mnemosyne/mcp-server';
import { StoreMemoryTool } from '@mnemosyne/mcp-server/tools';

const registry = new ToolRegistry();
registry.register(new StoreMemoryTool({ memory, embeddingProvider }));
const server = new McpServer({ registry, transport: 'stdio' });
await server.start();
```
