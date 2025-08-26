# AutoRAG Knowledge Extraction & Checkpointing System

## Architecture Overview

**Goal**: Periodic extraction of knowledge from live long-term memory → R2 → AutoRAG indexing for highly atomic, deployment-resilient retrieval.

**AutoRAG Config**: `square-darkness-6e04` Vectorize store (1024 dimensions)  
**R2 Buckets**: `mnemosyne-autorag-stage` / `mnemosyne-autorag-prod`  
**Extraction Frequency**: Configurable (suggested: 6-hour intervals)

## System Components

### 1. Knowledge Extraction Worker

```typescript
export class KnowledgeExtractionWorker {
  constructor(
    private memorySystem: MnemosyneMemoryMCP,
    private r2: R2Bucket,
    private env: WorkerEnv
  ) {}

  /**
   * Extract high-value knowledge from long-term memory
   * Filter by confidence, importance, and cross-reference density
   */
  async extractKnowledgeCheckpoint(): Promise<ExtractionResult> {
    // 1. Query long-term memory for high-confidence entries
    const longTermEntries = await this.memorySystem.memory_search({
      query: "*", // All entries
      tierPreference: "long",
      minConfidence: 0.7,
      limit: 100
    });

    // 2. Extract knowledge clusters
    const knowledgeClusters = this.clusterKnowledge(longTermEntries);

    // 3. Generate atomic knowledge documents
    const atomicDocs = await this.generateAtomicDocuments(knowledgeClusters);

    // 4. Write to R2 with metadata
    const uploadResults = await this.uploadToR2(atomicDocs);

    return {
      timestamp: new Date().toISOString(),
      entriesProcessed: longTermEntries.length,
      clustersGenerated: knowledgeClusters.length,
      documentsUploaded: atomicDocs.length,
      r2Results: uploadResults
    };
  }

  private clusterKnowledge(entries: MemoryEntry[]): KnowledgeCluster[] {
    // Group related memories by semantic similarity and tags
    const clusters: Map<string, MemoryEntry[]> = new Map();
    
    entries.forEach(entry => {
      const primaryTag = entry.tags?.[0] || 'general';
      if (!clusters.has(primaryTag)) {
        clusters.set(primaryTag, []);
      }
      clusters.get(primaryTag)!.push(entry);
    });

    return Array.from(clusters.entries()).map(([topic, memories]) => ({
      topic,
      memories,
      confidence: Math.max(...memories.map(m => m.confidence || 0)),
      crossReferences: this.extractCrossReferences(memories)
    }));
  }

  private async generateAtomicDocuments(clusters: KnowledgeCluster[]): Promise<AtomicDocument[]> {
    const documents: AtomicDocument[] = [];

    for (const cluster of clusters) {
      // Create consolidated knowledge document
      const document: AtomicDocument = {
        id: `knowledge_${cluster.topic}_${Date.now()}`,
        topic: cluster.topic,
        summary: await this.generateClusterSummary(cluster),
        keyInsights: this.extractKeyInsights(cluster.memories),
        evidence: cluster.memories.map(m => ({
          content: m.content,
          confidence: m.confidence,
          source: m.source,
          timestamp: m.timestamp
        })),
        metadata: {
          extractionTimestamp: new Date().toISOString(),
          memoryCount: cluster.memories.length,
          averageConfidence: cluster.confidence,
          tags: [...new Set(cluster.memories.flatMap(m => m.tags || []))]
        }
      };

      documents.push(document);
    }

    return documents;
  }

  private async uploadToR2(documents: AtomicDocument[]): Promise<R2UploadResult[]> {
    const results: R2UploadResult[] = [];

    for (const doc of documents) {
      try {
        const key = `knowledge/${doc.metadata.extractionTimestamp}/${doc.id}.json`;
        const content = JSON.stringify(doc, null, 2);

        await this.r2.put(key, content, {
          customMetadata: {
            topic: doc.topic,
            memoryCount: doc.metadata.memoryCount.toString(),
            confidence: doc.metadata.averageConfidence.toString(),
            extractionTime: doc.metadata.extractionTimestamp
          }
        });

        results.push({
          key,
          success: true,
          size: content.length,
          topic: doc.topic
        });
      } catch (error) {
        results.push({
          key: doc.id,
          success: false,
          error: error.message,
          topic: doc.topic
        });
      }
    }

    return results;
  }
}
```

### 2. Scheduled Extraction Service

```typescript
export class ScheduledExtractionService {
  constructor(private env: WorkerEnv) {}

  /**
   * Cron-triggered knowledge extraction
   * Schedule: Every 6 hours or on significant memory growth
   */
  async handleScheduledExtraction(event: ScheduledEvent): Promise<Response> {
    try {
      // Get memory system instance
      const memoryId = this.env.MNEMOSYNE_MCP_OBJECT.idFromName("memory-system");
      const memoryObj = this.env.MNEMOSYNE_MCP_OBJECT.get(memoryId);
      
      const extractionWorker = new KnowledgeExtractionWorker(
        memoryObj,
        this.env.R2_BUCKET,
        this.env
      );

      const result = await extractionWorker.extractKnowledgeCheckpoint();

      // Store extraction metadata in memory system
      await this.recordExtractionEvent(result);

      return new Response(JSON.stringify({
        success: true,
        extraction: result,
        nextExtraction: this.calculateNextExtraction()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Scheduled extraction failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async recordExtractionEvent(result: ExtractionResult): Promise<void> {
    // Record extraction in memory for tracking
    const memoryId = this.env.MNEMOSYNE_MCP_OBJECT.idFromName("memory-system");
    const memoryObj = this.env.MNEMOSYNE_MCP_OBJECT.get(memoryId);

    await memoryObj.fetch(new Request('https://memory/store', {
      method: 'POST',
      body: JSON.stringify({
        operation: 'memory_store',
        content: `AUTORAG EXTRACTION: Completed knowledge checkpoint - ${result.entriesProcessed} entries processed, ${result.documentsUploaded} documents uploaded to R2`,
        confidence: 0.95,
        evidence: [
          `${result.entriesProcessed} memory entries processed`,
          `${result.clustersGenerated} knowledge clusters identified`,
          `${result.documentsUploaded} atomic documents generated`,
          `Extraction timestamp: ${result.timestamp}`
        ],
        tags: ['autorag', 'extraction', 'checkpoint', 'system-maintenance'],
        source: 'automated_extraction',
        verification_method: 'automated'
      })
    }));
  }
}
```

### 3. AutoRAG Query Enhancement

```typescript
export class HybridRetrievalSystem {
  constructor(
    private memorySystem: MnemosyneMemoryMCP,
    private env: WorkerEnv
  ) {}

  /**
   * Hybrid search: Live memory + AutoRAG persistent knowledge
   */
  async hybridKnowledgeSearch(query: string, options: HybridSearchOptions = {}): Promise<HybridSearchResult> {
    const {
      includeAutoRAG = true,
      includeMemory = true,
      autoragWeight = 0.4,
      memoryWeight = 0.6
    } = options;

    const results: HybridSearchResult = {
      query,
      sources: [],
      combinedInsights: []
    };

    // 1. Search live memory system
    if (includeMemory) {
      const memoryResults = await this.memorySystem.memory_search({
        query,
        limit: 8,
        searchType: 'recall',
        tierPreference: 'all'
      });

      results.sources.push({
        type: 'live_memory',
        weight: memoryWeight,
        results: memoryResults,
        latency: 'low'
      });
    }

    // 2. Search AutoRAG persistent knowledge
    if (includeAutoRAG && this.env.AI) {
      try {
        const autoragResults = await this.env.AI.autorag("square-darkness-6e04").aiSearch({
          query: query
        });

        results.sources.push({
          type: 'autorag_persistent',
          weight: autoragWeight,
          results: autoragResults,
          latency: 'medium'
        });
      } catch (error) {
        console.warn('AutoRAG search failed:', error);
      }
    }

    // 3. Combine and rank results
    results.combinedInsights = this.combineResults(results.sources);

    return results;
  }

  private combineResults(sources: SearchSource[]): CombinedInsight[] {
    // Merge results with confidence-weighted ranking
    const allInsights: CombinedInsight[] = [];

    sources.forEach(source => {
      source.results.forEach((result, index) => {
        const rankingBonus = 1 - (index * 0.1); // Diminishing returns for rank
        const weightedConfidence = (result.confidence || 0.5) * source.weight * rankingBonus;

        allInsights.push({
          content: result.content,
          confidence: weightedConfidence,
          source: source.type,
          originalRank: index,
          evidence: result.evidence || []
        });
      });
    });

    // Sort by weighted confidence
    return allInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Top 10 combined insights
  }
}
```

## Integration Points

### 1. Cron Schedule (wrangler.jsonc)

```jsonc
{
  "triggers": {
    "crons": ["0 */6 * * *"]  // Every 6 hours
  }
}
```

### 2. Memory Tool Enhancement

Add to memory tools:

```typescript
async memory_search_hybrid(args: {
  query: string;
  include_autorag?: boolean;
  autorag_weight?: number;
}) {
  const hybridSystem = new HybridRetrievalSystem(this.memorySystem, this.env);
  
  const results = await hybridSystem.hybridKnowledgeSearch(args.query, {
    includeAutoRAG: args.include_autorag ?? true,
    autoragWeight: args.autorag_weight ?? 0.4
  });

  return this.formatHybridResults(results);
}
```

### 3. Quality Metrics

Track extraction quality:

- **Coverage**: % of long-term memory represented
- **Atomicity**: Average document focus score
- **Retrieval Performance**: AutoRAG vs memory search comparison
- **Freshness**: Time delta between memory update and R2 availability

## Deployment Strategy

### Phase 1: Basic Extraction

- Implement `KnowledgeExtractionWorker`
- Manual trigger for testing
- R2 upload validation

### Phase 2: Scheduled Automation

- Add cron scheduling
- Automated extraction every 6 hours
- Extraction event recording

### Phase 3: Hybrid Retrieval

- Implement `HybridRetrievalSystem`
- Weight optimization based on query type
- Performance monitoring

This creates a **deployment-resilient knowledge layer** where critical insights persist beyond memory resets while maintaining the live memory system's responsiveness and Foundation v1.5.0 accountability principles.
