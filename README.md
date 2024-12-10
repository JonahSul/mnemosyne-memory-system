# Mnemosyne Memory System

A cognitive enhancement and behavioral regulation system for AI agents, built as a Model Context Protocol (MCP) server. Named after the Greek goddess of memory to encourage developers to create their own Mnemosyne Memory System implementations.

## Key Technologies

- **Cloudflare Workers** - Serverless deployment platform
- **Model Context Protocol (MCP)** - Tool integration for AI agents
- **TypeScript** - Type-safe development
- **Durable Objects** - Persistent memory storage
- **Zod** - Runtime validation

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/yourusername/mnemosyne-memory-system)

## Usage

### Development

```bash
npm install
npm run dev
```

### Deployment

```bash
npm run deploy
```

### MCP Integration

Add to your MCP client configuration:

```json
{
  "servers": {
    "mnemosyne": {
      "url": "https://your-worker.yoursubdomain.workers.dev/sse",
      "type": "http"
    }
  }
}
```

## Available Tools

- `memory_log_claim` - Track claims for verification
- `memory_verify_claim` - Verify previously logged claims
- `memory_record_violation` - Log behavioral rule violations
- `memory_check_behavioral_status` - View current system status
- `memory_export_state` - Export memory system state
- `memory_view_foundation` - View foundational behavioral rules

Start with `memory_view_foundation` to understand the behavioral framework.
