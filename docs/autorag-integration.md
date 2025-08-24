# AutoRAG Integration Guide

## Cloudflare AutoRAG: square-darkness-6e04

The R2 bucket vector indexing system is powered by Cloudflare AutoRAG named `square-darkness-6e04`. This service automatically processes files uploaded to the `mnemosyne-rag` R2 bucket and makes them searchable via RAG queries.

## Wrangler Configuration

The AI binding has been added to `wrangler.jsonc`:

```jsonc
"ai": { "binding": "AI" }
```

## Integration with Memory System

### Using AutoRAG for Knowledge Retrieval

```typescript
// Example usage in the memory system
export class MnemosyneMemoryMCP {
  constructor(private state: DurableObjectState, private env: any) {
    // env.AI is now available for AutoRAG access
  }

  async searchDeploymentResistantKnowledge(query: string) {
    if (this.env.AI) {
      try {
        // Query the AutoRAG system using the correct Cloudflare pattern
        const results = await this.env.AI.autorag("square-darkness-6e04").aiSearch({
          query: query
        });

        return {
          source: 'autorag',
          query: query,
          results: results,
          deployment_safe: true
        };
      } catch (error) {
        console.error('AutoRAG search failed:', error);
        return null;
      }
    }
    return null;
  }

  async hybridMemorySearch(query: string) {
    // Combine local memory with AutoRAG results
    const localResults = await this.memory.memory_search_knowledge({
      query: query,
      limit: 5
    });

    const autoragResults = await this.searchDeploymentResistantKnowledge(query);

    return {
      local: localResults,
      persistent: autoragResults,
      combined: true
    };
  }
}
```

## Memory Tool Integration

Add AutoRAG search capability to memory tools:

```typescript
/**
 * Search deployment-resilient knowledge from AutoRAG
 */
async memory_search_autorag(args: {
  query: string;
  max_results?: number;
  threshold?: number;
}) {
  const autoragResults = await this.searchDeploymentResistantKnowledge(args.query);
  
  if (autoragResults) {
    return `AutoRAG Search Results for: "${args.query}"

${autoragResults.results.map((result: any, index: number) => 
  `${index + 1}. ${result.content} (Score: ${result.score})`
).join('\n')}

Source: Deployment-resilient R2 bucket memory artifacts`;
  }
  
  return "AutoRAG search unavailable or no results found.";
}
```

## Upload Integration

When memory artifacts are uploaded via the upload scripts, they become automatically available through AutoRAG:

1. **Upload artifacts**: `npm run upload-memory-artifacts`
2. **AutoRAG processes**: Files are automatically indexed
3. **Search available**: Use AutoRAG binding to search processed content

## Query Enhancement

The AutoRAG can use the query rewrite system we created:

```typescript
async enhancedAutoRAGSearch(userQuery: string) {
  // Apply query rewrite
  const enhancedQuery = await this.queryRewrite(userQuery);
  
  // Search with enhanced query using correct Cloudflare pattern
  const results = await this.env.AI.autorag("square-darkness-6e04").aiSearch({
    query: enhancedQuery
  });
  
  return {
    originalQuery: userQuery,
    enhancedQuery: enhancedQuery,
    results: results
  };
}
```

## Deployment Resilience Strategy

**Problem**: Memory system loses state on deployment
**Solution**: AutoRAG provides persistent knowledge layer

1. **Before deployment**: Upload current memory state to R2
2. **After deployment**: Query AutoRAG to recover knowledge
3. **Ongoing**: Hybrid search combines live memory + persistent knowledge

## Example Queries for Testing

Once memory artifacts are uploaded, test with:

```typescript
// Search for collaboration history
const answer = await env.AI.autorag("square-darkness-6e04").aiSearch({
  query: "collaboration behavioral violations truth tracking"
});

// Search for upload script errors  
const answer = await env.AI.autorag("square-darkness-6e04").aiSearch({
  query: "upload script wrangler metadata ES module errors"
});

// Search for memory system patterns
const answer = await env.AI.autorag("square-darkness-6e04").aiSearch({
  query: "memory violations foundation rules deployment reset"
});
```

## Monitoring AutoRAG Performance

Track key metrics:
- Query response time
- Result relevance
- Coverage of uploaded artifacts
- Integration success rate

This AutoRAG integration provides the missing piece for deployment-resilient memory: a persistent knowledge layer that survives code deployments and memory resets.
