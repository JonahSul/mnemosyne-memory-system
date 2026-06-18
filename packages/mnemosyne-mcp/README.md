# @mnemosyne/mcp

MCP server and agent package for the Mnemosyne Memory System. Runs on Cloudflare Durable Objects and local development.

## Installation

```bash
npm install @mnemosyne/mcp
```

## Usage

```typescript
import { createMcpServer } from '@mnemosyne/mcp';

const server = createMcpServer({
  // MCP configuration
});
```

## MCP Tools

The server exposes Mnemosyne memory operations as MCP tools:
- `memory_log_claim` / `memory_verify_claim`
- `memory_record_violation` / `memory_check_behavioral_status`
- `memory_store_knowledge` / `memory_search_knowledge`
- `memory_admin` (foundation management)

## Deployment

Deploys as a Cloudflare Worker with Durable Objects. See `wrangler.jsonc` for configuration.

## Development

```bash
pnpm dev
```

## API Docs

Full API reference: [docs/api](https://jonahsul.github.io/mnemosyne-memory-system).

## License

MIT — © Jonah Sullivan
