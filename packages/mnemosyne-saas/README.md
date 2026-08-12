# @mnemosyne/saas

The Mnemosyne SaaS application — a Cloudflare Worker that serves as the
composition root, binding the domain model to Cloudflare infrastructure.

## What this replaces

This package replaces the legacy `src/` directory:
- `src/index.ts` (Worker entry) → `worker.ts` (explicit route table)
- `src/agent.ts` (632-line god Durable Object) → `durable-object.ts` + route handlers
- `src/tools/simplified-registry.ts` (1037 lines) → `@mnemosyne/mcp-server` tool registry

## Routes

| Path | Method | Handler |
|------|--------|---------|
| `/mcp` | POST | MCP JSON-RPC over HTTP |
| `/stream` | GET | Real SSE event stream |
| `/stream` | WS | WebSocket (Hibernation API) |
| `/federation/v1/*` | GET/POST | Federation REST endpoints |

## Composition root

`wiring.ts` binds Cloudflare adapters to domain services:

```
env.VECTORIZE_INDEX → VectorizeAdapter → SearchService
env.MEMORY_KV       → KVAdapter         → MemoryAggregate
env.AI              → WorkersAIEmbeddingAdapter → StoreMemoryUseCase
```

## Durable Object

The Durable Object holds per-session state and delegates to application
services. It does NOT contain business logic (unlike the legacy 632-line god).
