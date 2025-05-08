# Tools Registry Architecture

The Tools Registry is the heart of Mnemosyne's Model Context Protocol (MCP) integration, providing a sophisticated, centralized system for tool definition, validation, and execution. This architecture demonstrates advanced patterns for building scalable, maintainable MCP servers.

## 🏗️ Architecture Overview

The Tools Registry implements a **declarative tool definition pattern** with automatic validation, error handling, and execution orchestration. It serves as the central nervous system connecting MCP requests to memory system operations.

### Key Components

```
src/tools/registry.ts
├── Tool Definitions (Declarative)
├── Schema Validation (Zod-based)
├── Handler Functions (Async Execution)
├── Error Classification (HTTP Status Mapping)
└── Memory Instance Management (Singleton Pattern)
```

## 🎯 Design Principles

### 1. Declarative Tool Definition

Each tool is defined as a complete, self-contained specification:

```typescript
{
  name: "memory_search_tiered",
  description: "Search across all memory tiers with tier-aware ranking...",
  schema: {
    query: z.string().describe("The search query"),
    tierPreference: z.enum(["short", "intermediate", "long", "all"]).optional(),
    limit: z.number().optional(),
    threshold: z.number().optional()
  },
  handler: async (params) => {
    // Implementation with full error handling
  }
}
```

### 2. Rich Schema Validation

Using Zod for comprehensive type safety and runtime validation:

- **Parameter Types**: String, number, enum, optional fields
- **Descriptive Metadata**: Each parameter includes usage documentation
- **Default Values**: Sensible defaults like `threshold: 0.05` for inclusive search
- **Validation Pipeline**: Automatic validation before handler execution

### 3. Sophisticated Error Handling

The registry implements **differentiated error handling** with proper HTTP status codes:

```typescript
try {
  const result = await tool.handler(toolArgs);
  return successResponse(result);
} catch (error) {
  if (error instanceof MemoryNotFoundError) {
    return errorResponse(404, "Resource not found", error.message);
  }
  return errorResponse(500, "Tool execution error", error.message);
}
```

## 🔧 Tool Categories

### Core Memory Operations
- **Claim Management**: `memory_log_claim`, `memory_verify_claim`
- **Behavioral Monitoring**: `memory_check_behavioral_status`, `memory_record_violation`
- **State Management**: `memory_export_state`

### Semantic Knowledge System
- **Knowledge Storage**: `memory_store_knowledge`, `memory_store_tiered`
- **Semantic Search**: `memory_search_knowledge`, `memory_search_tiered`
- **Performance Monitoring**: `memory_stats_tiered`

### Advanced Features
- **Dynamic Optimization**: `memory_tune_search_thresholds`
- **Foundation Management**: `memory_view_foundation`, `memory_update_foundation`

## 🎛️ Dynamic Threshold Tuning System

One of the most sophisticated features is the **workload-aware threshold optimization**:

### Workload Types
- **Exploration** (threshold: 0.02): Maximum discovery, very inclusive
- **Precision** (threshold: 0.25): High accuracy, focused results
- **Recall** (threshold: 0.05): Comprehensive coverage, low false negatives
- **Balanced** (threshold: 0.1): Good precision/recall balance
- **Debugging** (threshold: 0.08): Context-adaptive optimization

### Context Adjustments
- **Complexity Multiplier**: Simple (×1.2), Moderate (×1.0), Complex (×0.8)
- **Tier Preference**: Higher tiers get precision boost (×1.1)
- **Result Count**: Expected results influence threshold (fewer = higher threshold)
- **Memory Load**: Full memory increases selectivity

## 🧠 Memory Instance Management

The registry uses a **global singleton pattern** for memory instance access:

```typescript
function getMnemosyneMemoryInstance(): MnemosyneMemorySystem {
  if ((globalThis as any).getMemoryInstance) {
    return (globalThis as any).getMemoryInstance();
  }
  
  if (!globalMnemosyneInstance) {
    globalMnemosyneInstance = new MnemosyneMemorySystem();
  }
  
  return globalMnemosyneInstance;
}
```

This ensures:
- **Consistency**: Same memory instance across all tool executions
- **Performance**: No instance recreation overhead
- **State Persistence**: Memory state maintained across requests

## 🚀 Handler Execution Pattern

Each tool handler follows a consistent pattern:

### 1. Parameter Extraction
```typescript
const { query, limit = 8, threshold = 0.05 } = params;
```

### 2. Memory Instance Access
```typescript
const memory = getMnemosyneMemoryInstance();
```

### 3. Operation Execution with Error Handling
```typescript
try {
  const results = await memory.searchSimilar(query, options);
  return formatSuccessResponse(results);
} catch (error) {
  return handleSpecificError(error);
}
```

### 4. Standardized Response Format
```typescript
return {
  content: [{
    type: "text" as const,
    text: formattedOutput
  }],
  isError?: boolean
};
```

## 📊 Advanced Features

### Inclusive Default Thresholds

The registry sets **inclusive defaults** for better out-of-the-box experience:
- `threshold: 0.05` instead of restrictive `0.1`
- `limit: 8` for comprehensive results
- Workload-specific optimizations available via tuning tool

### Rich Descriptive Output

Tool responses include:
- **Similarity Scores**: Percentage-based for user understanding
- **Tier Information**: Shows which memory tier items came from
- **Result Summaries**: "Found X items for query Y"
- **Usage Examples**: How to use results or adjust parameters

### Error Recovery Guidance

When errors occur, the registry provides:
- **Specific Error Messages**: "Claim not found" vs generic errors
- **Corrective Actions**: "Please verify the claim ID is correct"
- **Alternative Approaches**: Suggestions for different search strategies

## 🔄 Integration with MCP Server

The registry integrates seamlessly with the MCP server through:

### Tool Discovery
```typescript
const { memoryTools } = await import('./tools/registry.js');
```

### Dynamic Tool Listing
```typescript
tools: memoryTools.map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: buildJsonSchema(tool.schema)
}))
```

### Execution Pipeline
```typescript
const tool = memoryTools.find(t => t.name === toolName);
const result = await tool.handler(toolArgs);
```

## 🎯 Why This Architecture Excels

### 1. **Maintainability**
- Single file contains all tool definitions
- Consistent patterns across all tools
- Easy to add new tools or modify existing ones

### 2. **Type Safety**
- Zod schemas provide runtime and compile-time validation
- TypeScript integration catches errors early
- Parameter documentation enforces proper usage

### 3. **Error Resilience**
- Comprehensive error classification
- Proper HTTP status code mapping
- Graceful degradation with helpful error messages

### 4. **Performance Optimization**
- Workload-aware threshold tuning
- Memory instance reuse
- Efficient search parameter defaults

### 5. **Developer Experience**
- Rich tool descriptions
- Usage examples in responses
- Clear error messages with corrective guidance

This Tools Registry represents a **best-practice implementation** for building sophisticated MCP servers with advanced memory management capabilities.
