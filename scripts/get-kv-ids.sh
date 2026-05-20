#!/bin/bash

# KV Namespace ID Extraction Script
# This script gets the actual namespace IDs and provides the correct wrangler.jsonc configuration

echo "🔍 Getting KV Namespace IDs for wrangler.jsonc configuration..."
echo "================================================================"

echo ""
echo "📋 Listing all KV namespaces..."
namespaces=$(wrangler kv namespace list 2>/dev/null)
echo "$namespaces"

echo ""
echo "📝 Configuration Update Instructions:"
echo "====================================="
echo ""
echo "The namespace IDs in wrangler.jsonc should be the actual IDs from the list above."
echo "Look for namespaces named 'MEMORY_KV' and use their IDs."
echo ""
echo "Example format:"
echo '  "kv_namespaces": ['
echo '    {'
echo '      "binding": "MEMORY_KV",'
echo '      "id": "ACTUAL_NAMESPACE_ID_HERE",'
echo '      "preview_id": "ACTUAL_PREVIEW_ID_HERE"'
echo '    }'
echo '  ]'
echo ""

# Try to extract IDs automatically if format is predictable
echo "🔧 Attempting to extract IDs automatically..."
echo ""

# Check if wrangler output contains namespace info
if echo "$namespaces" | grep -q "MEMORY_KV"; then
    echo "✅ Found MEMORY_KV namespaces in the list above"
    echo "📝 Please manually copy the IDs from the namespace list and update wrangler.jsonc"
else
    echo "⚠️  No MEMORY_KV namespaces found. You may need to create them first:"
    echo "   wrangler kv namespace create \"MEMORY_KV\""
    echo "   wrangler kv namespace create \"MEMORY_KV\" --preview"
    echo "   wrangler kv namespace create \"MEMORY_KV\" --env staging"
    echo "   wrangler kv namespace create \"MEMORY_KV\" --preview --env staging"
    echo "   wrangler kv namespace create \"MEMORY_KV\" --env production"
    echo "   wrangler kv namespace create \"MEMORY_KV\" --preview --env production"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Copy the actual namespace IDs from the list above"
echo "2. Replace placeholder IDs in wrangler.jsonc with real IDs"
echo "3. Test with: wrangler dev -e staging"
