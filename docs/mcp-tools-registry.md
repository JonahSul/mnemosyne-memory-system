# MCP Tools Registry Architecture

The Mnemosyne Memory System implements a sophisticated Model Context Protocol (MCP) tools registry that provides AI agents with seamless access to memory operations through a clean, standardized interface.

## 🏗️ Architecture Overview

### Registry Pattern
The tools registry follows a clean registry pattern that separates tool definitions from their implementations:

```typescript
interface ToolImplementation {
  name: string;
  description: string;
  schema: Record<string, z.ZodType>;
  handler: (params: any) => Promise<ToolResult>;
}
```

### Automatic Tool Discovery
Tools are automatically discovered and registered with the MCP server:

```typescript
export function registerMemoryTools(server: Server): void {
  memoryTools.forEach(tool => {
    server.addTool({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(z.object(tool.schema))
    }, tool.handler);
  });
}
```

## 🛠️ Core Memory Tools

### Claim Management
```typescript
{
  name: "memory_log_claim",
  description: "Log a claim or assertion made by the AI agent that requires verification. CRITICAL: Use this immediately after making any factual statement, assumption, or conclusion to enable later accountability and behavioral correction.",
  schema: {
    claim: z.string().describe("The exact claim being made"),
    context: z.record(z.unknown()).optional().describe("Additional context including reasoning, assumptions, or supporting data"),
    confidence: z.enum(['low', 'medium', 'high']).optional().describe("Agent's confidence level in this claim"),
    source: z.string().optional().describe("Source of information supporting this claim")
  },
  handler: async (params) => {
    const memory = getMnemosyneMemoryInstance();
    const claimId = memory.logClaim(params.claim, {
      context: params.context,
      confidence: params.confidence,
      source: params.source,
      timestamp: new Date().toISOString()
    });
    
    return {
      content: [{
        type: "text",
        text: `📝 **Claim Logged** (ID: ${claimId})...`
      }]
    };
  }
}
```

### Semantic Search
```typescript
{
  name: "memory_search_knowledge",
  description: "search knowledge using semantic similarity. Performs RAG-based retrieval to find contextually relevant information from the working memory knowledge base.",
  schema: {
    query: z.string().describe("The search query or question to find related knowledge"),
    limit: z.number().optional().describe("Maximum number of results to return (default: 8)"),
    threshold: z.number().optional().describe("Minimum similarity threshold for results (0-1, default: 0.05 for inclusive search)")
  },
  handler: async (params) => {
    const vectorStore = getVectorStoreInstance();
    const results = await vectorStore.searchSimilar(params.query, {
      limit: params.limit || 8,
      threshold: params.threshold || 0.05
    });
    
    return formatSearchResults(results, params.query);
  }
}
```

## 🎯 Dynamic Threshold Tuning

### Workload-Aware Optimization
The registry includes sophisticated threshold tuning capabilities:

```typescript
{
  name: "memory_tune_search_thresholds",
  description: "Dynamically adjust semantic search thresholds based on workload characteristics and desired precision/recall balance.",
  schema: {
    workloadType: z.enum(["exploration", "precision", "recall", "balanced", "debugging"]),
    contextComplexity: z.enum(["simple", "moderate", "complex"]).optional(),
    expectedResultCount: z.number().optional()
  },
  handler: async (params) => {
    // Calculate optimal threshold based on workload characteristics
    let recommendedThreshold: number;
    
    switch (params.workloadType) {
      case "exploration":
        recommendedThreshold = 0.02; // Very inclusive for discovery
        break;
      case "precision":
        recommendedThreshold = 0.25; // High threshold for accuracy
        break;
      case "recall":
        recommendedThreshold = 0.05; // Low threshold for completeness
        break;
      case "debugging":
        recommendedThreshold = 0.08; // Adaptive based on context
        break;
      default: // "balanced"
        recommendedThreshold = 0.1;
    }
    
    return formatThresholdRecommendation(recommendedThreshold, params);
  }
}
```

## 🔍 Multi-Tier Search

### Hierarchical Memory Access
The registry provides access to the multi-tier memory system:

```typescript
{
  name: "memory_search_tiered",
  description: "Search across all memory tiers or target specific tiers with tier-aware ranking. Higher tiers (long-term) receive ranking boosts for better recall of important information.",
  schema: {
    query: z.string().describe("The search query"),
    tierPreference: z.enum(["short", "intermediate", "long", "all"]).optional(),
    limit: z.number().optional(),
    threshold: z.number().optional()
  },
  handler: async (params) => {
    const multiTierMemory = getMultiTierMemoryInstance();
    const results = await multiTierMemory.searchSimilar(params.query, {
      tierPreference: params.tierPreference || "all",
      limit: params.limit || 8,
      threshold: params.threshold || 0.05
    });
    
    return formatTieredResults(results, params.query);
  }
}
```

## 🛡️ Error Handling & Type Safety

### Custom Error Types
The registry implements proper error handling with custom error types:

```typescript
import { MemoryNotFoundError } from "../modules/core-memory.js";

// In tool handlers:
try {
  const memory = getMnemosyneMemoryInstance();
  await memory.verifyClaim(params.claimId, params.success, params.evidence);
  
  return successResponse;
} catch (error) {
  if (error instanceof MemoryNotFoundError) {
    return {
      content: [{
        type: "text",
        text: `Error: Claim ${params.claimId} not found. Please verify the claim ID is correct.`
      }],
      isError: true
    };
  }
  // Re-throw other errors as they should be 500s
  throw error;
}
```

### Schema Validation
All tools use Zod schemas for runtime type validation:

```typescript
schema: {
  claimId: z.string().describe("The unique ID of the claim to verify"),
  evidence: z.string().describe("Concrete evidence supporting or refuting the claim"),
  success: z.boolean().describe("Whether the claim was verified as TRUE or FALSE"),
  notes: z.string().optional().describe("Additional notes about the verification process")
}
```

## 🔧 Instance Management

### Singleton Pattern
The registry uses a singleton pattern for memory instance management:

```typescript
let mnemosyneMemoryInstance: MnemosyneMemorySystem | null = null;
let vectorStoreInstance: VectorStore | null = null;
let multiTierMemoryInstance: MultiTierMemorySystem | null = null;

export function getMnemosyneMemoryInstance(): MnemosyneMemorySystem {
  if (!mnemosyneMemoryInstance) {
    mnemosyneMemoryInstance = new MnemosyneMemorySystem();
  }
  return mnemosyneMemoryInstance;
}

// Global instance getter for tool execution context
export function getMemoryInstance(): MnemosyneMemorySystem {
  return (globalThis as any).getMemoryInstance?.() || getMnemosyneMemoryInstance();
}
```

## 📊 Tool Categories

### Core Memory Operations
- `memory_log_claim` - Claim tracking and accountability
- `memory_verify_claim` - Evidence-based claim verification
- `memory_record_violation` - Behavioral rule violation tracking
- `memory_check_behavioral_status` - System health monitoring

### Search & Retrieval
- `memory_search_knowledge` - Semantic vector search
- `memory_search_tiered` - Multi-tier hierarchical search
- `memory_tune_search_thresholds` - Dynamic optimization

### System Management
- `memory_view_foundation` - Foundation rules inspection
- `memory_export_state` - Complete system state export
- `memory_store_knowledge` - Knowledge storage with metadata
- `memory_store_tiered` - Tier-specific storage

## 🚀 Best Practices

### Tool Design
1. **Clear Descriptions**: Each tool has comprehensive documentation
2. **Intuitive Schemas**: Parameter names and descriptions are self-documenting
3. **Error Handling**: Proper error types and user-friendly messages
4. **Type Safety**: Full TypeScript and Zod validation

### Registry Organization
1. **Modular Structure**: Tools grouped by functionality
2. **Consistent Patterns**: Uniform handler signatures and response formats
3. **Instance Management**: Clean singleton pattern for memory instances
4. **Extensibility**: Easy to add new tools following established patterns

### Performance Considerations
1. **Default Parameters**: Sensible defaults for all optional parameters
2. **Inclusive Thresholds**: Lower default thresholds for better discovery
3. **Tier Awareness**: Intelligent tier selection and ranking
4. **Caching**: Singleton instances prevent unnecessary re-initialization

The MCP Tools Registry architecture provides a robust, type-safe, and extensible foundation for AI agents to interact with the Mnemosyne memory system through standardized protocols.
