# Forgetting Curves and Memory Persistence

The Mnemosyne Memory System implements sophisticated forgetting mechanisms based on cognitive science principles, particularly the Ebbinghaus forgetting curve, to manage memory efficiently while preserving important information.

## 🧠 Theoretical Foundation

### Ebbinghaus Forgetting Curve
The system implements a mathematical model based on Hermann Ebbinghaus's research on memory retention:

```
R(t) = e^(-t/S)
```

Where:
- **R(t)** = Retention probability at time t
- **t** = Time elapsed since learning
- **S** = Strength of memory (influenced by importance and access patterns)

### Cognitive Memory Principles

**Spacing Effect**: Information reviewed at increasing intervals is better retained
**Importance Weighting**: More important information receives stronger memory traces
**Access Pattern Reinforcement**: Frequently accessed memories become more persistent
**Interference Theory**: Similar memories can interfere with each other, requiring strategic pruning

## 🏗️ Multi-Tier Architecture

### Tier Specifications

```typescript
const DEFAULT_TIER_CONFIG: TierConfig = {
  axiom: {
    name: 'axiom-tier',
    maxItems: 100,
    retentionHours: Infinity, // Never expire
    accessThreshold: 0,
    pruningStrategy: 'importance'
  },
  long: {
    name: 'long-term',
    maxItems: 1000,
    retentionHours: 8760, // 1 year retention
    accessThreshold: 0,
    pruningStrategy: 'importance'
  },
  intermediate: {
    name: 'intermediate-term', 
    maxItems: 200,
    retentionHours: 24, // Daily retention cycle
    accessThreshold: 5, // Promote after 5 accesses
    pruningStrategy: 'frequency'
  },
  short: {
    name: 'short-term',
    maxItems: 50,
    retentionHours: 2, // Very aggressive pruning
    accessThreshold: 3, // Promote after 3 accesses
    pruningStrategy: 'lru' // Least recently used
  }
};
```

### Promotion Mechanics

**Access-Based Promotion**: Items that exceed access thresholds are promoted to higher tiers
**Importance-Based Initial Placement**: New items are placed in tiers based on importance scores
**Weight-Based Enhancement**: Combined significance and semantic weights influence retention

## ⚡ Forgetting Mechanisms

### Probabilistic Forgetting
The system uses probabilistic forgetting rather than hard expiration:

```typescript
private calculateRetentionProbability(
  item: TieredKnowledgeItem, 
  tier: MemoryTier
): number {
  const ageHours = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60);
  const retentionHours = tier.retentionHours;
  
  if (retentionHours === Infinity) return 1.0; // Axiom tier never forgets
  
  // Base Ebbinghaus curve
  let retentionProbability = Math.exp(-ageHours / retentionHours);
  
  // Importance modifier (0.1 to 2.0 multiplier)
  const importanceMultiplier = 0.1 + (item.importance * 1.9);
  retentionProbability *= importanceMultiplier;
  
  // Access pattern modifier
  const accessMultiplier = Math.min(2.0, 1.0 + (item.accessCount * 0.1));
  retentionProbability *= accessMultiplier;
  
  // Recency modifier
  const hoursSinceAccess = (Date.now() - new Date(item.lastAccessed).getTime()) / (1000 * 60 * 60);
  const recencyMultiplier = Math.exp(-hoursSinceAccess / (retentionHours * 0.5));
  retentionProbability *= (0.5 + 0.5 * recencyMultiplier);
  
  return Math.min(1.0, Math.max(0.0, retentionProbability));
}
```

### Intelligent Sparing
Important items can be spared from time-based expiration:

```typescript
private shouldSpareFromExpiration(
  item: TieredKnowledgeItem, 
  tier: string
): boolean {
  // High importance items are more likely to be spared
  if (item.importance > 0.8) return Math.random() < 0.9;
  
  // Frequently accessed items
  if (item.accessCount > 10) return Math.random() < 0.7;
  
  // Recently accessed items
  const hoursSinceAccess = (Date.now() - new Date(item.lastAccessed).getTime()) / (1000 * 60 * 60);
  if (hoursSinceAccess < 1) return Math.random() < 0.8;
  
  // Items with high combined weight
  if (item.combinedWeight > 0.7) return Math.random() < 0.6;
  
  return false;
}
```

## 🧹 Garbage Collection

### Automated Cleanup
The system runs automatic garbage collection during normal operations:

```typescript
async runGarbageCollection(): Promise<GarbageCollectionResult> {
  const results = {
    expiredItemsRemoved: { axiom: 0, long: 0, intermediate: 0, short: 0, total: 0 },
    itemsSpared: { axiom: 0, long: 0, intermediate: 0, short: 0, total: 0 },
    forgettingCurveStats: this.getForgettingCurveAnalytics()
  };
  
  // Process each tier with appropriate forgetting strategy
  for (const tierName of ['short', 'intermediate', 'long', 'axiom']) {
    await this.pruneWithForgettingCurves(tierName as any);
  }
  
  return results;
}
```

### Forgetting Curve Analytics
The system provides detailed analytics on memory retention:

```typescript
getForgettingCurveAnalytics(): ForgettingCurveAnalytics {
  const analytics = {
    retentionProbabilities: { axiom: [], long: [], intermediate: [], short: [] },
    averageRetention: { axiom: 1.0, long: 0, intermediate: 0, short: 0 },
    itemsAtRisk: { axiom: 0, long: 0, intermediate: 0, short: 0 }
  };
  
  // Calculate retention probabilities for all items
  this.getTiersToSearch('all').forEach(([tierName, tierMap]) => {
    const probabilities: number[] = [];
    let atRiskCount = 0;
    
    tierMap.forEach(item => {
      const probability = this.calculateRetentionProbability(item, tierName as any);
      probabilities.push(probability);
      if (probability < 0.3) atRiskCount++;
    });
    
    analytics.retentionProbabilities[tierName] = probabilities;
    analytics.averageRetention[tierName] = probabilities.length > 0 
      ? probabilities.reduce((a, b) => a + b, 0) / probabilities.length 
      : 1.0;
    analytics.itemsAtRisk[tierName] = atRiskCount;
  });
  
  return analytics;
}
```

## 📊 Memory Health Monitoring

### System Metrics
The forgetting system provides comprehensive health metrics:

- **Retention Rates**: Track retention across all tiers
- **Promotion Patterns**: Monitor tier promotion effectiveness  
- **Access Distribution**: Analyze access patterns and their impact
- **Capacity Utilization**: Track memory usage across tiers
- **Forgetting Effectiveness**: Measure garbage collection impact

### Performance Optimization

**Dynamic Threshold Adjustment**: Automatically adjust retention thresholds based on memory pressure
**Load Balancing**: Distribute memory load across tiers effectively  
**Access Pattern Learning**: Adapt retention based on usage patterns
**Importance Calibration**: Continuously refine importance scoring

## 🔬 Validation and Testing

### Autonomous Testing
The system includes comprehensive autonomous testing for forgetting mechanisms:

```javascript
// 8-hour autonomous test validates:
// 1. Ebbinghaus forgetting curve implementation
// 2. Importance-based retention exceptions  
// 3. Tier-specific forgetting behaviors
// 4. Access pattern influences on retention
// 5. Probabilistic forgetting mechanisms
// 6. Memory system self-healing and efficiency
```

### Test Assertions

**Forgetting Curve Compliance**: Mathematical validation of retention probabilities
**Importance Preservation**: High-importance items should resist forgetting
**Access Pattern Effects**: Frequently accessed items should be retained longer
**Tier Behavior**: Each tier should exhibit expected forgetting characteristics
**System Stability**: Memory system should remain stable under various loads

## 🚀 Advanced Features

### Semantic Weight Integration
The forgetting system considers semantic relationships:

```typescript
private async calculateSemanticWeight(
  content: string, 
  embedding: number[]
): Promise<number> {
  let maxSimilarity = 0;
  
  // Check similarity with existing memories
  this.getAllItems().forEach(existingItem => {
    const similarity = this.calculateCosineSimilarity(embedding, existingItem.embedding);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  });
  
  // Higher semantic similarity increases retention weight
  return Math.min(1.0, maxSimilarity * 1.2);
}
```

### Adaptive Learning
The system learns from forgetting patterns:

- **Pattern Recognition**: Identify which types of memories are most valuable
- **Retention Optimization**: Adjust forgetting parameters based on outcomes
- **User Behavior Adaptation**: Learn from user access patterns
- **Context Awareness**: Consider situational factors in retention decisions

The forgetting curves and memory persistence system ensures that the Mnemosyne Memory System efficiently manages information while preserving what matters most, creating an intelligent balance between memory conservation and information retention.
