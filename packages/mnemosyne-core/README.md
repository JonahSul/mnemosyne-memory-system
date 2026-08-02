# @mnemosyne/core

The Mnemosyne core domain model — pure TypeScript with zero I/O dependencies.

## What this package contains

- **Domain aggregates** — `Memory` (root), `FoundationRules`
- **Domain services** — `TierManagementService`, `SearchService`, `CausalityService`
- **Value objects** — `ShardKey`, `MemoryId`, `TopicId`, `Confidence`, `TemporalMetadata`
- **Domain events** — `MemoryStored`, `MemorySearched`, `MemoryForgotten`, `FoundationUpdated`
- **Repository interfaces** — `VectorStoreAdapter`, `KeyValueStoreAdapter` (shard-aware)
- **Application services** — use-case orchestration (`StoreMemoryUseCase`, `SearchMemoryUseCase`, etc.)

## What this package does NOT contain

- No Cloudflare, SQLite, Redis, or any infrastructure code
- No `fetch`, no filesystem, no network calls
- No mocks, stubs, or test shims (those live in test fixtures)
- No Foundation migration history (collapsed into `seedFoundationRules()`)

## Architecture

This package follows Domain-Driven Design. The domain model is pure: it defines
interfaces for storage and events, and infrastructure packages provide real
implementations. See `docs/adr/restructuring/ADR-001-ddd-restructuring.md` for
the full rationale.

## Installation

```bash
npm install @mnemosyne/core
```

## Usage

```typescript
import { MemoryAggregate, ShardKey, type VectorStoreAdapter } from '@mnemosyne/core';

// The domain model accepts injected adapters — no I/O knowledge inside.
const memory = new MemoryAggregate({ vectorStore, kvStore });
await memory.store({ content, shardKey, metadata });
```

See [repo-architecture](../../.agents/skills/repo-architecture/SKILL.md) for the
full package dependency graph.
