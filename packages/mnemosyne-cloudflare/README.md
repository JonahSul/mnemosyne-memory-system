# @mnemosyne/cloudflare

Cloudflare-specific adapters for the Mnemosyne Memory System — Vectorize integration and AI Workers embedding.

## Installation

```bash
npm install @mnemosyne/cloudflare
```

## Usage

```typescript
import { CloudflareVectorStore } from '@mnemosyne/cloudflare';

const store = new CloudflareVectorStore({
  env: { VECTORIZE_INDEX, AI }
});

await store.upsert([{ id: 'doc-1', vector: [...], metadata: {} }]);
const results = await store.search(queryVector, { limit: 10 });
```

## Configuration

Requires Cloudflare Worker bindings:
- `VECTORIZE_INDEX` — Vectorize index binding
- `AI` — Workers AI binding

Falls back to in-memory store when bindings not available (useful for testing).

## API Docs

Full API reference: [docs/api](https://jonahsul.github.io/mnemosyne-memory-system).

## License

MIT — © Jonah Sullivan
