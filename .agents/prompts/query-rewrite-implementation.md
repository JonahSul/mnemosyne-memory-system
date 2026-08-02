# Query Rewrite Implementation Guide

## Configuration Setup

### 1. Query Rewrite Model Configuration

```yaml
# Example configuration for your vector indexing system
query_rewrite:
  enabled: true
  model: "llama-3.1-8b-fast-instruct"  # Same as your generation model
  system_prompt_file: ".agents/prompts/query-rewrite-system.md"
  max_tokens: 150
  temperature: 0.1  # Low temperature for consistent rewrites
  timeout: 5000ms
```

### 2. Integration with Current Setup

Since you have:
- Similarity threshold: 0.4
- Max results: 10
- Strong caching enabled

The query rewrite should:
1. Process user query before vector search
2. Cache rewritten queries for efficiency
3. Use rewritten query for similarity search

### 3. Implementation Flow

```
User Query → Query Rewrite → Vector Search → Results
     ↓              ↓              ↓           ↓
"upload errors" → "upload errors wrangler r2 bucket..." → Similarity Search → Relevant docs
```

## Testing the Query Rewrite System

### Test Queries for Validation

**Basic Technical Terms:**
```
Input: "wrangler config"
Expected: "wrangler configuration cloudflare deployment r2 bucket durable objects"

Input: "memory issues"  
Expected: "memory mnemosyne behavioral claims violations patterns persistence issues"
```

**Temporal Queries:**
```
Input: "recent violations"
Expected: "violations recent 2025-08-23 behavioral rules truth tracking terminal protocols"

Input: "today's collaboration"
Expected: "collaboration 2025-08-23 agent coordination foundation v1.2.0 threading"
```

**Complex Scenarios:**
```
Input: "upload script broken"
Expected: "upload script broken errors wrangler r2 bucket metadata flags ES module require command execution"

Input: "memory lost after deployment"
Expected: "memory lost deployment durable object reset staging production persistent storage recovery"
```

## Performance Tuning

### A/B Testing Approach

1. **Test without query rewrite** (baseline)
2. **Test with query rewrite** (enhanced)
3. **Compare retrieval accuracy** using known relevant documents

### Key Metrics to Monitor

- **Retrieval accuracy**: Do results match expected documents?
- **Query latency**: How much overhead does rewriting add?
- **Cache hit rate**: Are similar queries benefiting from caching?
- **User satisfaction**: Do users find more relevant results?

## Gradual Rollout Strategy

### Phase 1: Core Technical Terms
Start with basic expansions:
- wrangler → cloudflare deployment
- memory → mnemosyne behavioral
- R2 → cloudflare object storage

### Phase 2: Add Temporal Handling
Include date-based enhancements:
- recent → 2025-08-23
- today → current date
- yesterday → previous date

### Phase 3: Full Context Enhancement
Complete behavioral pattern and collaboration context.

### Phase 4: Advanced Features
- Intent classification refinement
- Dynamic term weighting
- Performance optimization

## Monitoring & Alerting

### Query Rewrite Metrics
```
- Rewrite success rate (should be >95%)
- Average rewrite latency (target <100ms)
- Cache efficiency for rewritten queries
- User query patterns and common rewrites
```

### Quality Assurance
```
- Manual review of rewritten queries
- A/B testing against direct queries
- User feedback on result relevance
- Analysis of failed retrievals
```

## Integration Code Example

```typescript
// Pseudo-code for integration
async function enhancedVectorSearch(userQuery: string) {
  // Step 1: Rewrite query
  const rewrittenQuery = await queryRewriteModel.process({
    query: userQuery,
    systemPrompt: queryRewriteSystemPrompt,
    temperature: 0.1
  });
  
  // Step 2: Vector search with enhanced query
  const results = await vectorStore.search({
    query: rewrittenQuery,
    threshold: 0.4,
    maxResults: 10
  });
  
  // Step 3: Return results with original and rewritten query context
  return {
    originalQuery: userQuery,
    rewrittenQuery: rewrittenQuery,
    results: results,
    metadata: {
      searchType: 'enhanced',
      timestamp: new Date().toISOString()
    }
  };
}
```

This implementation will significantly improve your R2 bucket vector indexing system's ability to find relevant collaboration artifacts, especially for the complex technical and behavioral queries that are common in the Mnemosyne memory system context.
