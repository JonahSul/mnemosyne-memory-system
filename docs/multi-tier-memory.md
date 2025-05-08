# Multi-Tier Memory Architecture

The Multi-Tier Memory Architecture is inspired by human cognitive memory patterns and implements a sophisticated hierarchical storage system with **intelligent retention policies**, **access-based promotion**, and **probabilistic forgetting curves**. This system represents a breakthrough in AI memory management.

## 🧠 Cognitive Memory Model

The architecture mimics human memory systems with four distinct tiers:

### Memory Tier Hierarchy

```
┌─────────────────┐  ← Axiom Tier (Permanent Knowledge)
│   AXIOM TIER    │    • Core principles and user preferences
│   (100 items)   │    • Never expires, highest priority
└─────────────────┘
        ↑
┌─────────────────┐  ← Long-Term Memory (Important Knowledge)  
│  LONG-TERM      │    • 1 year retention, 1000 item capacity
│  (1000 items)   │    • Importance-based pruning
└─────────────────┘
        ↑
┌─────────────────┐  ← Intermediate Memory (Working Knowledge)
│ INTERMEDIATE    │    • 24 hour retention, 200 item capacity  
│  (200 items)    │    • Frequency-based retention
└─────────────────┘
        ↑
┌─────────────────┐  ← Short-Term Memory (Recent Context)
│  SHORT-TERM     │    • 2 hour retention, 50 item capacity
│   (50 items)    │    • LRU (Least Recently Used) pruning
└─────────────────┘
```

## 🔄 Intelligent Memory Management

### Automatic Tier Placement

Items are automatically placed in appropriate tiers based on **importance scoring**:

```typescript
private selectInitialTier(importance: number): 'axiom' | 'long' | 'intermediate' | 'short' {
  if (importance >= 0.9) return 'axiom';    // Core knowledge
  if (importance >= 0.7) return 'long';     // Important information  
  if (importance >= 0.3) return 'intermediate'; // Working knowledge
  return 'short';                           // Temporary context
}
```

### Access-Based Promotion

Items can be **promoted** to higher tiers based on access patterns:

- **Short → Intermediate**: After 3 accesses
- **Intermediate → Long**: After 5 accesses  
- **Long → Axiom**: Reserved for critical knowledge

### Weight-Based Enhancement

Each memory item maintains sophisticated weight tracking:

```typescript
interface TieredKnowledgeItem {
  // Core properties
  content: string;
  importance: number;
  
  // Weight-based enhancement
  significanceWeight: number;    // Inherent importance (0-1)
  semanticWeight: number;        // Reinforcement through similarity (0-1)
  combinedWeight: number;        // Total weight for decisions (0-1)
  
  // Historical tracking
  weightHistory: Array<{
    timestamp: string;
    significance: number;
    semantic: number;
    combined: number;
    reason: string;
  }>;
}
```

## 🎯 Semantic Search Integration

### Tier-Aware Ranking

Search results receive **tier-based boosts** to surface important information:

```typescript
private getTierBoost(tier: 'axiom' | 'long' | 'intermediate' | 'short'): number {
  return {
    'axiom': 1.5,        // 50% boost for axioms
    'long': 1.2,         // 20% boost for long-term
    'intermediate': 1.1,  // 10% boost for intermediate  
    'short': 1.0         // No boost for short-term
  }[tier];
}
```

### Adaptive Threshold Calculation

The system calculates **context-aware thresholds** based on:

- **Workload Type**: Exploration (0.02) vs Precision (0.25)
- **Context Complexity**: Simple, Moderate, Complex adjustments
- **Memory Load**: Higher selectivity when memory is full
- **Expected Results**: Fewer expected = higher threshold

### Search Performance Optimization

```typescript
async searchWithAdaptiveThreshold(query: string, options: {
  workloadType?: 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging';
  contextComplexity?: 'simple' | 'moderate' | 'complex';
  tierPreference?: 'axiom' | 'long' | 'intermediate' | 'short' | 'all';
}) {
  const adaptiveThreshold = this.calculateAdaptiveThreshold({
    ...options,
    currentMemoryLoad: this.calculateMemoryLoad()
  });
  
  return this.searchSimilar(query, { threshold: adaptiveThreshold });
}
```

## ⏱️ Forgetting Curves & Retention

### Ebbinghaus Forgetting Curve Implementation

The system implements **probabilistic forgetting** based on established cognitive science:

```typescript
private calculateRetentionProbability(item: TieredKnowledgeItem, tier: string): number {
  const hoursAge = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60);
  const retentionHours = this.config[tier].retentionHours;
  
  if (hoursAge <= retentionHours) return 1.0; // Within retention period
  
  // Ebbinghaus curve: R(t) = e^(-t/τ) where τ is time constant
  const timeConstant = retentionHours * 0.5; // Decay parameter
  const baseProbability = Math.exp(-hoursAge / timeConstant);
  
  // Importance and access modifiers
  const importanceBoost = item.importance * 0.3;
  const accessBoost = Math.min(item.accessCount * 0.1, 0.4);
  
  return Math.min(baseProbability + importanceBoost + accessBoost, 0.95);
}
```

### Intelligent Retention Policies

Different tiers use **specialized pruning strategies**:

- **Axiom**: Importance-based (only remove least important if at capacity)
- **Long-term**: Importance-based with forgetting curves
- **Intermediate**: Frequency-based with access pattern analysis
- **Short-term**: LRU (Least Recently Used) for token conservation

### Sparing Important Items

Items can be **spared from expiration** based on:

- **High importance** (>0.7)
- **Recent access** (accessed within 25% of retention period)
- **High access count** (frequent usage)
- **Semantic significance** (high semantic weight)

## 📊 Performance Analytics

### Memory Statistics

The system provides comprehensive analytics:

```typescript
getMemoryStats(): {
  axiom?: { count: number; capacity: number; utilizationPercent: number };
  long: { count: number; capacity: number; utilizationPercent: number };
  intermediate: { count: number; capacity: number; utilizationPercent: number };
  short: { count: number; capacity: number; utilizationPercent: number };
  total: { count: number; capacityUsed: number };
}
```

### Forgetting Curve Analytics

```typescript
getForgettingCurveAnalytics(): {
  retentionProbabilities: { 
    axiom?: number[]; 
    long: number[]; 
    intermediate: number[]; 
    short: number[] 
  };
  averageRetention: { 
    axiom?: number; 
    long: number; 
    intermediate: number; 
    short: number 
  };
  itemsAtRisk: { 
    axiom?: number; 
    long: number; 
    intermediate: number; 
    short: number 
  };
}
```

### Garbage Collection Insights

```typescript
async runGarbageCollection(): Promise<{
  expiredItemsRemoved: { total: number; [tier]: number };
  itemsSpared: { total: number; [tier]: number };
  forgettingCurveStats: ForgettingCurveAnalytics;
}>
```

## 🔬 Advanced Features

### Mock Embedding Generation

For development and testing, the system generates **semantically meaningful embeddings**:

```typescript
private generateMockEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  
  // Create embeddings that have similarity for similar texts
  return Array.from({ length: 384 }, (_, i) => {
    let value = 0;
    for (const word of words) {
      const seed = this.simpleHash(word + i);
      value += this.seededRandom(seed)() * 0.1;
    }
    return Math.tanh(value); // Normalize to [-1, 1]
  });
}
```

### Capacity Management

Automatic capacity enforcement with **intelligent overflow handling**:

- **Proactive pruning** before reaching capacity limits
- **Emergency pruning** when capacity is exceeded
- **Graduated retention** based on item significance

### Promotion Pipeline

Sophisticated promotion logic with **weighted decision making**:

```typescript
private async checkPromotions(): Promise<void> {
  for (const [tier, items] of this.getAllTierMaps()) {
    for (const item of items.values()) {
      if (item.accessCount >= this.config[tier].accessThreshold) {
        const nextTier = this.getNextTier(tier);
        if (nextTier && this.shouldPromote(item, nextTier)) {
          this.promoteItem(item, nextTier);
        }
      }
    }
  }
}
```

## 🎯 Why This Architecture Excels

### 1. **Cognitive Fidelity**
- Mirrors human memory patterns with short/intermediate/long-term tiers
- Implements scientifically-based forgetting curves
- Access-driven promotion mimics human memory strengthening

### 2. **Adaptive Intelligence**  
- Context-aware threshold optimization
- Workload-specific search tuning
- Dynamic capacity management

### 3. **Performance Optimization**
- Tier-based search ranking for relevance
- Intelligent pruning preserves important information
- Token-efficient short-term memory management

### 4. **Observability & Analytics**
- Comprehensive statistics and analytics
- Forgetting curve performance monitoring  
- Garbage collection insights for optimization

### 5. **Semantic Sophistication**
- Vector embeddings with cosine similarity
- Semantic weight reinforcement through related content
- Context-aware similarity thresholds

This Multi-Tier Memory Architecture represents a **state-of-the-art implementation** of cognitive memory patterns for AI systems, providing both human-like memory behavior and superior performance characteristics.
