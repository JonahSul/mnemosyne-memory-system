#!/bin/bash

# KV Namespace Setup Script for Mnemosyne Memory System
# This script creates the necessary KV namespaces and provides the IDs for wrangler.jsonc

echo "🔧 Creating KV Namespaces for Mnemosyne Memory System..."
echo "=================================================="

echo ""
echo "📋 Step 1: Creating Development KV Namespace..."
echo "wrangler kv namespace create \"MEMORY_KV\""
dev_output=$(wrangler kv namespace create "MEMORY_KV" 2>&1)
echo "$dev_output"

echo ""
echo "📋 Step 2: Creating Development Preview KV Namespace..."
echo "wrangler kv namespace create \"MEMORY_KV\" --preview"
dev_preview_output=$(wrangler kv namespace create "MEMORY_KV" --preview 2>&1)
echo "$dev_preview_output"

echo ""
echo "📋 Step 3: Creating Staging KV Namespace..."
echo "wrangler kv namespace create \"MEMORY_KV\" --env staging"
staging_output=$(wrangler kv namespace create "MEMORY_KV" --env staging 2>&1)
echo "$staging_output"

echo ""
echo "📋 Step 4: Creating Staging Preview KV Namespace..."
echo "wrangler kv namespace create \"MEMORY_KV\" --preview --env staging"
staging_preview_output=$(wrangler kv namespace create "MEMORY_KV" --preview --env staging 2>&1)
echo "$staging_preview_output"

echo ""
echo "📋 Step 5: Creating Production KV Namespace..."
echo "wrangler kv namespace create \"MEMORY_KV\" --env production"
production_output=$(wrangler kv namespace create "MEMORY_KV" --env production 2>&1)
echo "$production_output"

echo ""
echo "📋 Step 6: Creating Production Preview KV Namespace..."
echo "wrangler kv namespace create \"MEMORY_KV\" --preview --env production"
production_preview_output=$(wrangler kv namespace create "MEMORY_KV" --preview --env production 2>&1)
echo "$production_preview_output"

echo ""
echo "📝 SUMMARY - Update wrangler.jsonc with these IDs:"
echo "=================================================="

# Extract namespace IDs from outputs (assuming standard wrangler output format)
if [[ $dev_output =~ id\ =\ \"([^\"]+)\" ]]; then
    dev_id="${BASH_REMATCH[1]}"
    echo "Development: id: \"$dev_id\""
fi

if [[ $dev_preview_output =~ id\ =\ \"([^\"]+)\" ]]; then
    dev_preview_id="${BASH_REMATCH[1]}"
    echo "Development Preview: preview_id: \"$dev_preview_id\""
fi

if [[ $staging_output =~ id\ =\ \"([^\"]+)\" ]]; then
    staging_id="${BASH_REMATCH[1]}"
    echo "Staging: id: \"$staging_id\""
fi

if [[ $staging_preview_output =~ id\ =\ \"([^\"]+)\" ]]; then
    staging_preview_id="${BASH_REMATCH[1]}"
    echo "Staging Preview: preview_id: \"$staging_preview_id\""
fi

if [[ $production_output =~ id\ =\ \"([^\"]+)\" ]]; then
    production_id="${BASH_REMATCH[1]}"
    echo "Production: id: \"$production_id\""
fi

if [[ $production_preview_output =~ id\ =\ \"([^\"]+)\" ]]; then
    production_preview_id="${BASH_REMATCH[1]}"
    echo "Production Preview: preview_id: \"$production_preview_id\""
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Update wrangler.jsonc with the actual namespace IDs above"
echo "2. Replace placeholder IDs in each environment section"
echo "3. Test with: wrangler dev -e staging"
echo "4. Deploy with: wrangler deploy -e staging"

echo ""
echo "✅ KV Namespace creation complete!"
