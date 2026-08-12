# @mnemosyne/infra-cloudflare

Real Cloudflare infrastructure adapters for the Mnemosyne memory system.

## Adapters

- **`VectorizeAdapter`** — vector store backed by Cloudflare Vectorize + Workers AI embeddings (`@cf/baai/bge-base-en-v1.5`)
- **`KVAdapter`** — key-value store backed by Cloudflare KV Namespace (real, not `{} as any`)
- **`R2Adapter`** — object storage backed by Cloudflare R2 (for AutoRAG)
- **`WorkersAIEmbeddingAdapter`** — embedding provider backed by Workers AI

## No mocks

This package contains **no mock implementations**. Test shims live in
`tests/fixtures/`, not in published packages. The production path requires
real Cloudflare bindings (`VECTORIZE_INDEX`, `AI`, `MEMORY_KV`, `R2_BUCKET`).

## Usage

```typescript
import { VectorizeAdapter, KVAdapter, WorkersAIEmbeddingAdapter } from '@mnemosyne/infra-cloudflare';

const vectorStore = new VectorizeAdapter({ vectorizeIndex: env.VECTORIZE_INDEX });
const kvStore = new KVAdapter({ namespace: env.MEMORY_KV });
const embeddingProvider = new WorkersAIEmbeddingAdapter({ ai: env.AI });
```

See [repo-architecture](../../.agents/skills/repo-architecture/SKILL.md) for the full dependency graph.
