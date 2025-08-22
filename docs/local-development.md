# Mnemosyne Local Development Stack

## 🐳 Docker Compose Setup

Complete local development environment with:
- **Qdrant** - Vector database (replaces Cloudflare Vectorize)
- **Redis** - Persistent storage (replaces Durable Objects)  
- **Ollama** - Local embedding service
- **Node.js** - Development server with hot reload

## Quick Start

```bash
# Start the development stack
npm run dev:local

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop the stack
npm run dev:stop
```

## Service URLs

- **Development Server**: http://localhost:8000
- **Qdrant API**: http://localhost:6333
- **Qdrant Dashboard**: <http://localhost:6333/dashboard>
- **Redis**: localhost:6379
- **RedisInsight UI**: http://localhost:8001
- **Ollama API**: http://localhost:11434
- **Embedding Service**: http://localhost:8002

## Development Workflow

1. **Start services**: `npm run dev:local`
2. **Check health**: Visit http://localhost:8000/health
3. **Code changes**: Auto-reload with volume mounts
4. **Debug**: Node.js inspector on port 9229
5. **Monitor**: Use UI dashboards for Qdrant and Redis

## Environment Configuration

Copy `.env.development` and adjust as needed:

```bash
cp .env.development .env.local
```

## GPU Support (Optional)

For faster embeddings with GPU acceleration:

1. Install NVIDIA Docker runtime
2. Uncomment `runtime: nvidia` in docker-compose.dev.yml
3. Restart the stack

## Architecture Mapping

| Production (Cloudflare) | Development (Docker) |
|------------------------|---------------------|
| Vectorize | Qdrant |
| Durable Objects | Redis |
| Workers Runtime | Node.js + Express |
| External Embeddings | Ollama/sentence-transformers |

## Next Steps

- Implement MCP handler adaptation for Express
- Add memory system endpoints  
- Create local foundation management
- Set up automated testing against local stack
