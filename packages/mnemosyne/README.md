# @mnemosyne/core

Core types, services, and domain logic for the Mnemosyne Memory System.

## Installation

```bash
npm install @mnemosyne/core
```

## Exports

```typescript
// Types & base classes
import { MemoryEntry, MemoryConfig } from '@mnemosyne/core';

// Services
import { MemoryService } from '@mnemosyne/core';

// Domains
import { TieredKnowledgeItem, MemorySearchResult } from '@mnemosyne/core';
```

## Key Concepts

- **Multi-Tier Memory** — Short-term (aggressive pruning), intermediate-term (frequency-based), long-term (persistent)
- **Semantic Search** — Vector embeddings with adaptive thresholds
- **Delegator Pattern** — Module composition via method routing
- **Foundation System** — Hot-deployable behavioral rules

## API Docs

Full API reference: [docs/api](https://jonahsul.github.io/mnemosyne-memory-system) (generated via TypeDoc).

## License

MIT — © Jonah Sullivan
