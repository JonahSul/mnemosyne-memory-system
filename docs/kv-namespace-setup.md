# KV Namespace Setup for Mnemosyne Memory System

## Overview
The KV Memory Layer requires actual Cloudflare KV namespaces to be created before deployment. The current `wrangler.jsonc` contains placeholder IDs that need to be replaced with real namespace IDs.

## Current Status
- ✅ KV Memory Layer code implemented
- ❌ KV namespaces not created in Cloudflare
- ❌ wrangler.jsonc contains placeholder IDs

## Required KV Namespaces

### Development Environment

```bash
# Main namespace
wrangler kv namespace create "MEMORY_KV"
# Preview namespace  
wrangler kv namespace create "MEMORY_KV" --preview
```

### Staging Environment

```bash
# Main namespace
wrangler kv namespace create "MEMORY_KV" --env staging
# Preview namespace
wrangler kv namespace create "MEMORY_KV" --preview --env staging
```

### Production Environment

```bash
# Main namespace
wrangler kv namespace create "MEMORY_KV" --env production
# Preview namespace
wrangler kv namespace create "MEMORY_KV" --preview --env production
```

## Setup Instructions

### Option 1: Use the automated script
```bash
./scripts/setup-kv-namespaces.sh
```

### Option 2: Manual setup
1. Run each command above individually
2. Note the namespace IDs returned by each command
3. Update `wrangler.jsonc` with the actual IDs

## wrangler.jsonc Update Pattern

Replace these placeholder sections:

### Development (root level)
```jsonc
"kv_namespaces": [
    {
        "binding": "MEMORY_KV",
        "id": "ACTUAL_DEV_ID_HERE",
        "preview_id": "ACTUAL_DEV_PREVIEW_ID_HERE"
    }
]
```

### Staging (env.staging)
```jsonc
"kv_namespaces": [
    {
        "binding": "MEMORY_KV", 
        "id": "ACTUAL_STAGING_ID_HERE",
        "preview_id": "ACTUAL_STAGING_PREVIEW_ID_HERE"
    }
]
```

### Production (env.production)
```jsonc
"kv_namespaces": [
    {
        "binding": "MEMORY_KV",
        "id": "ACTUAL_PRODUCTION_ID_HERE", 
        "preview_id": "ACTUAL_PRODUCTION_PREVIEW_ID_HERE"
    }
]
```

## Testing After Setup

### Development
```bash
wrangler dev
```

### Staging
```bash
wrangler dev -e staging
```

### Deploy Staging
```bash
wrangler deploy -e staging
```

### Deploy Production
```bash
wrangler deploy -e production
```

## Verification
After setup, the KV Memory Layer should be accessible and the following should work:
- Memory storage operations
- KV health checks
- Critical memory persistence
- Session state recovery

## Troubleshooting

### "Cannot find KV namespace" error
- Verify the namespace IDs in wrangler.jsonc match the created namespaces
- Check that the binding name "MEMORY_KV" is consistent

### "KV Memory Layer not available" error  
- Ensure the namespaces are created and bound correctly
- Verify the environment is correctly specified

### Permission errors
- Ensure you're authenticated with Cloudflare: `wrangler auth login`
- Verify you have KV permissions in the Cloudflare account
