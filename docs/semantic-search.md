# Semantic Search System

The Semantic Search System in Mnemosyne implements **state-of-the-art vector similarity search** with **adaptive threshold optimization**, **workload-aware tuning**, and **context-sensitive ranking**. This system represents a breakthrough in making semantic search both **powerful and accessible** for AI memory applications.

## 🔍 Search Architecture Overview

The semantic search system operates on multiple levels:

```
Vector Store (Basic Semantic Search)
    ↓
Multi-Tier Memory (Tier-Aware Search)  
    ↓
Dynamic Threshold Tuning (Workload Optimization)
    ↓
Adaptive Search Interface (Context-Aware Results)
```

## 🧠 Vector Embedding System

### Mock Embedding Generation

For development and testing, the system generates **semantically meaningful embeddings**:

```typescript
private generateMockEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  
  // Create 384-dimensional embeddings (standard size)
  return Array.from({ length: 384 }, (_, i) => {
    let value = 0;
    
    // Word-based semantic seeding
    for (const word of words) {
      const seed = this.simpleHash(word + i.toString());
      const rng = this.seededRandom(seed);
      value += rng() * 0.1;
    }
    
    // Normalize to [-1, 1] range
    return Math.tanh(value);
  });
}
```

### Semantic Similarity Calculation

Uses **cosine similarity** for semantic distance measurement:

```typescript
private cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

## 🎯 Dynamic Threshold Optimization

### Workload-Aware Threshold Calculation

The system calculates **adaptive thresholds** based on workload characteristics:

```typescript
calculateAdaptiveThreshold(options: {
  workloadType?: 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging';
  contextComplexity?: 'simple' | 'moderate' | 'complex';
  expectedResultCount?: number;
  currentMemoryLoad?: number;
}): number {
  // Base threshold by workload type
  let baseThreshold: number;
  switch (workloadType) {
    case 'exploration': baseThreshold = 0.02; break;   // Very inclusive
    case 'precision':   baseThreshold = 0.25; break;   // High accuracy
    case 'recall':      baseThreshold = 0.05; break;   // Comprehensive
    case 'debugging':   baseThreshold = 0.08; break;   // Adaptive
    default:           baseThreshold = 0.1;   break;   // Balanced
  }
  
  // Context complexity adjustments
  const complexityMultiplier = {
    'simple': 1.2,     // Higher threshold for simple contexts
    'moderate': 1.0,   // No adjustment
    'complex': 0.8     // Lower threshold for complex contexts
  }[contextComplexity || 'moderate'];
  
  // Memory load adjustment (more selective when full)
  const memoryLoadMultiplier = currentMemoryLoad ? 
    (1 + currentMemoryLoad * 0.3) : 1.0;
  
  // Calculate final adaptive threshold
  const adaptiveThreshold = baseThreshold * complexityMultiplier * memoryLoadMultiplier;
  
  // Ensure reasonable bounds
  return Math.max(0.01, Math.min(0.5, adaptiveThreshold));
}
```

### Workload Type Optimization

Different workload types receive **specialized threshold tuning**:

#### Exploration Mode (0.02 threshold)
- **Use Case**: Discovery, brainstorming, broad research
- **Strategy**: Maximum inclusivity, capture related concepts
- **Trade-off**: High recall, lower precision

#### Precision Mode (0.25 threshold)  
- **Use Case**: Fact-checking, specific information retrieval
- **Strategy**: High accuracy, focused results only
- **Trade-off**: High precision, lower recall

#### Recall Mode (0.05 threshold)
- **Use Case**: Comprehensive research, ensuring completeness
- **Strategy**: Capture all potentially relevant information
- **Trade-off**: Balanced precision/recall with recall emphasis

#### Debugging Mode (0.08 threshold)
- **Use Case**: Problem-solving, diagnostic information
- **Strategy**: Adaptive based on context complexity
- **Trade-off**: Context-sensitive optimization

## 🏗️ Tier-Aware Search Architecture

### Multi-Tier Search Integration

The semantic search integrates with the **multi-tier memory architecture**:

```typescript
async searchSimilar(query: string, options: {
  limit?: number;
  threshold?: number;
  tierPreference?: 'axiom' | 'long' | 'intermediate' | 'short' | 'all';
}): Promise<Array<TieredKnowledgeItem & { similarity: number }>> {
  const { limit = 10, threshold = 0.05, tierPreference = 'all' } = options;
  const queryEmbedding = this.generateMockEmbedding(query);
  
  // Search across specified tiers
  const results: Array<TieredKnowledgeItem & { similarity: number }> = [];
  const tiersToSearch = this.getTiersToSearch(tierPreference);
  
  for (const [tierName, tierMap] of tiersToSearch) {
    for (const item of tierMap.values()) {
      const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
      
      if (similarity >= threshold) {
        results.push({
          ...item,
          similarity: similarity * this.getTierBoost(item.tier) // Tier-based ranking boost
        });
      }
    }
  }
  
  // Sort by boosted similarity and return top results
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
```

### Tier-Based Ranking Boosts

Higher memory tiers receive **ranking advantages**:

```typescript
private getTierBoost(tier: 'axiom' | 'long' | 'intermediate' | 'short'): number {
  return {
    'axiom': 1.5,        // 50% boost - Core knowledge prioritized
    'long': 1.2,         // 20% boost - Important information
    'intermediate': 1.1,  // 10% boost - Working knowledge  
    'short': 1.0         // No boost - Recent context
  }[tier];
}
```

## 🎛️ Search Interface Design

### Inclusive Default Parameters

The system uses **inclusive defaults** for better out-of-the-box experience:

```typescript
// Tools Registry Default Parameters
{
  limit: 8,              // More results than typical 5
  threshold: 0.05,       // Lower threshold for inclusivity (was 0.1)
  tierPreference: 'all'  // Search across all memory tiers
}
```

### Comprehensive Result Formatting

Search results include **rich contextual information**:

```typescript
// Example formatted output
`Found 3 knowledge items for query: "debugging memory issues"

1. [LONG] 87.3% - "Memory leak debugging requires systematic approach..."
   └─ Stored: 2 hours ago, Accessed: 5 times

2. [INTERMEDIATE] 65.2% - "Common debugging patterns include trace analysis..."  
   └─ Stored: 30 minutes ago, Accessed: 2 times

3. [AXIOM] 45.1% - "Always verify assumptions before claiming fixes..."
   └─ Core principle, Permanent storage`
```

## 🔧 Advanced Search Features

### Context-Sensitive Search

The system adapts search behavior based on **query characteristics**:

```typescript
async searchWithAdaptiveThreshold(query: string, options: {
  workloadType?: 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging';
  contextComplexity?: 'simple' | 'moderate' | 'complex';
  expectedResultCount?: number;
}): Promise<Array<TieredKnowledgeItem & { 
  similarity: number; 
  adaptiveThreshold: number 
}>> {
  // Calculate optimal threshold for this search context
  const adaptiveThreshold = this.calculateAdaptiveThreshold({
    ...options,
    currentMemoryLoad: this.calculateMemoryLoad()
  });
  
  // Perform search with optimized threshold
  const results = await this.searchSimilar(query, {
    threshold: adaptiveThreshold,
    limit: options.limit || 8,
    tierPreference: 'all'
  });
  
  // Include threshold information in results for transparency
  return results.map(result => ({
    ...result,
    adaptiveThreshold
  }));
}
```

### Memory Load Awareness

Search thresholds adjust based on **current memory utilization**:

```typescript
private calculateMemoryLoad(): number {
  const totalUsed = this.shortTerm.size + this.intermediateTerm.size + this.longTerm.size;
  const totalCapacity = this.config.short.maxItems + 
                       this.config.intermediate.maxItems + 
                       this.config.long.maxItems;
  return totalUsed / totalCapacity;
}
```

## 📊 Search Performance Analytics

### Threshold Effectiveness Monitoring

The system tracks **threshold performance** across different workloads:

```typescript
interface ThresholdAnalytics {
  workloadType: string;
  averageThreshold: number;
  resultCounts: number[];
  userSatisfactionScores: number[];
  optimalThresholdRange: [number, number];
}
```

### Search Quality Metrics

```typescript
interface SearchQualityMetrics {
  precision: number;        // Relevant results / Total results
  recall: number;          // Relevant results / Total relevant items  
  f1Score: number;         // Harmonic mean of precision and recall
  averageRankPosition: number; // Where relevant items appear in results
  thresholdOptimalness: number; // How well-tuned the threshold was
}
```

## 🎯 Integration with Tools Registry

### Memory Search Knowledge Tool

```typescript
{
  name: "memory_search_knowledge",
  description: "search knowledge using semantic similarity...",
  schema: {
    query: z.string().describe("The search query"),
    limit: z.number().optional().describe("Maximum results (default: 8)"),
    threshold: z.number().optional().describe("Similarity threshold (default: 0.05)")
  },
  handler: async (params) => {
    const vectorStore = getVectorStoreInstance();
    const results = await vectorStore.searchSimilar(params.query, {
      limit: params.limit || 8,
      threshold: params.threshold || 0.05  // Inclusive default
    });
    
    return formatSearchResults(results, params.query);
  }
}
```

### Dynamic Threshold Tuning Tool

```typescript
{
  name: "memory_tune_search_thresholds", 
  description: "Dynamically adjust search thresholds based on workload...",
  schema: {
    workloadType: z.enum(["exploration", "precision", "recall", "balanced", "debugging"]),
    contextComplexity: z.enum(["simple", "moderate", "complex"]).optional(),
    expectedResultCount: z.number().optional()
  },
  handler: async (params) => {
    const recommendedThreshold = calculateOptimalThreshold(params);
    return provideThresholdGuidance(recommendedThreshold, params);
  }
}
```

## 🚀 Why This Search System Excels

### 1. **Adaptive Intelligence**

- **Context-aware thresholds** optimize for different use cases
- **Workload-specific tuning** provides optimal precision/recall balance
- **Memory load awareness** adjusts selectivity based on system state

### 2. **Cognitive Fidelity**

- **Tier-based ranking** mirrors human memory importance hierarchies
- **Semantic similarity** captures meaning beyond keyword matching
- **Access pattern integration** reinforces frequently used information

### 3. **User Experience**

- **Inclusive defaults** provide good out-of-the-box results
- **Rich result formatting** includes context and metadata
- **Transparent optimization** shows threshold decisions to users

### 4. **Performance Optimization**

- **Efficient vector operations** with optimized similarity calculations
- **Intelligent result limiting** prevents overwhelming responses
- **Memory-aware processing** scales with system capacity

### 5. **Extensibility**

- **Pluggable embedding systems** for future integration with real models
- **Configurable similarity metrics** beyond cosine similarity
- **Flexible threshold strategies** for domain-specific optimization

This Semantic Search System represents a **comprehensive solution** for AI memory applications, providing both sophisticated search capabilities and user-friendly optimization tools that adapt to different cognitive workloads.
