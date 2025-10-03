# Mnemosyne Memory System - Deployment Guide

## Environment Structure

This project uses a structured multi-environment deployment approach with three distinct environments:

### 🛠️ Development
- **Worker Name**: `mnemosyne-memory-system-dev`
- **Durable Object**: `MNEMOSYNE_MCP_OBJECT_DEV`
- **Vectorize Index**: `mnemosyne-memory-index-dev`
- **Purpose**: Local development and testing

### 🧪 Staging (Default)
- **Worker Name**: `mnemosyne-memory-system-stage`
- **Durable Object**: `MNEMOSYNE_MCP_OBJECT_STAGE`
- **Vectorize Index**: `mnemosyne-memory-index-stage`
- **Purpose**: Pre-production testing and validation

### 🚀 Production
- **Worker Name**: `mnemosyne-memory-system`
- **Durable Object**: `MNEMOSYNE_MCP_OBJECT`
- **Vectorize Index**: `mnemosyne-memory-index`
- **Purpose**: Live production deployment

## Deployment Commands

### Development (Default)
```bash
# Deploy to development environment
npx wrangler deploy

# View development logs
npx wrangler tail
```

### Staging Deployment
```bash
# Deploy to staging environment
npx wrangler deploy -e staging

# View staging logs
npx wrangler tail -e staging

# Test staging deployment
# (Your staging worker will be available at mnemosyne-memory-system-stage.<your-subdomain>.workers.dev)
```

### Production Deployment
```bash
# Deploy to production environment
npx wrangler deploy --env production

# View production logs
npx wrangler tail --env production

# Monitor production
npx wrangler tail --env production --format pretty
```

## Environment Management

### Resource Isolation
Each environment has completely isolated:
- ✅ Worker instances
- ✅ Durable Object storage
- ✅ Vectorize indexes
- ✅ Logging configurations

### Recommended Workflow
1. **Development**: Test locally and deploy to dev environment
2. **Staging**: Deploy to staging for integration testing
3. **Production**: Deploy to production after staging validation

### Environment Variables
The `__WRANGLER_ENV__` variable is automatically set for each environment:
- Development: `"development"`
- Staging: `"staging"`
- Production: `"production"`

## Testing Your Current Setup

### 1. Deploy to Staging First
```bash
npx wrangler deploy --env staging
```

### 2. Verify Staging Deployment
- Check that the worker deploys successfully
- Test memory operations
- Verify Vectorize integration

### 3. Production Deployment (when ready)
```bash
npx wrangler deploy --env production
```

## Resource Naming Convention
- **Development**: `*-dev` suffix
- **Staging**: `*-stage` suffix
- **Production**: Clean names (no suffix)
