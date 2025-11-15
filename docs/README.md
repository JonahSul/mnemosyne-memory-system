# Mnemosyne Memory System Documentation

Multi-tier memory system with semantic search capabilities and runtime behavioral rule deployment.

## 📚 Documentation Structure

### Architecture & Design
- **[Multi-Tier Memory Architecture](./multi-tier-memory.md)** - Hierarchical memory with intelligent retention
- **[Semantic Search System](./semantic-search.md)** - Vector embeddings and adaptive threshold optimization  
- **[Delegator Pattern](./delegator-pattern.md)** - Modular architecture for clean separation of concerns
- **[Tools Registry](./tools-registry.md)** - Centralized MCP tool management and dynamic routing

### Core Systems
- **[Behavioral Rules Engine](./behavioral-rules.md)** - Foundation system with runtime updates
- **[Error Handling](./error-handling.md)** - Comprehensive error classification and HTTP status mapping
- **[Memory Persistence](./memory-persistence.md)** - Durable Objects and state management

### Advanced Features
- **[Dynamic Threshold Tuning](./dynamic-threshold-tuning.md)** - Workload-aware search optimization
- **[Forgetting Curves](./forgetting-curves.md)** - Ebbinghaus-based probabilistic memory decay
- **[Runtime Foundation Updates](./runtime-foundation-updates.md)** - Hot-deployment of behavioral rules

### Testing & Validation
- **[Autonomous Testing Framework](./autonomous-testing.md)** - 8-hour validation system for memory performance
- **[Performance Monitoring](./performance-monitoring.md)** - Memory system analytics and optimization

### Deployment & Operations
- **[Cloudflare Workers Deployment](./cloudflare-deployment.md)** - Edge computing with Durable Objects
- **[MCP Integration](./mcp-integration.md)** - Model Context Protocol implementation
- **[Production Monitoring](./production-monitoring.md)** - Observability and maintenance

## 🏗️ Architecture

Key principles:

1. **Modularity**: Delegator pattern with clean separation
2. **Scalability**: Multi-tier memory with intelligent promotion/demotion
3. **Adaptability**: Dynamic threshold tuning based on workload
4. **Reliability**: Comprehensive error handling with HTTP status codes
5. **Observability**: Built-in monitoring and autonomous testing

## 🎯 Innovations

- **Semantic Search with Adaptive Thresholds**: Workload-aware optimization
- **Multi-Tier Memory Architecture**: Hierarchical storage mimicking cognitive patterns  
- **Runtime Foundation Updates**: Hot-deployment without service interruption
- **Autonomous Testing Framework**: Self-validating forgetting performance tests
- **Comprehensive Error Handling**: Proper HTTP status mapping

## 🚀 Getting Started

1. [Architecture Overview](./architecture-overview.md)
2. [Multi-Tier Memory](./multi-tier-memory.md)
3. [Tools Registry](./tools-registry.md)
4. [Deployment Guide](./cloudflare-deployment.md)

---

*This documentation reflects the current state of the system as of August 2025, including all recent improvements to semantic search, error handling, and dynamic optimization features.*

## 🔁 Imperative Agent Loop (Mnemosyne MCP)

**Quiet Operation Principle:** Memory operations should be performed silently and automatically as part of normal agent cognition. Do not announce or narrate memory searches, stores, or retrievals unless:

- An error occurs
- A protocol hint is received
- The user explicitly asks about memory usage

Treat the memory system like working memory: consult it naturally and quietly behind the scenes. See [Quiet Operation Examples](./quiet-operation-examples.md) for detailed patterns.

Agents integrating via the Mnemosyne MCP server should follow a simple, repeatable loop:

1. **Search before asserting**

- Use `search_knowledge` (or `search_fulltext`) to look for prior facts, analyses, or results before making any strong claim.
- If no strong evidence is found, treat your statement as a **hypothesis** rather than a fact.

1. **Record decisions, hypotheses, and plans**

- Use `store_knowledge` with `documentType` in {`HYPOTHESIS`, `DECISION`, `TASK_PLAN`, `FACT`}.
- Always include `topics`, `task` (with a stable `task.id`), and `agent` metadata.
- When you assert or decide, link back to prior memories via `metadata.causality.precedentMemoryIds` and group related assertions with a shared `metadata.causality.assertionId`.

1. **Execute the task**

- Optionally record `TASK_PLAN` / `TASK_EXECUTION` memories that describe how you are testing or acting on the assertion.

1. **Record results**

- Store a `RESULT` memory when you have evidence, using the same `metadata.causality.assertionId` and setting `metadata.result.status` to `PROVEN`, `DISPROVEN`, or `PARTIAL`.

1. **Learn and self-correct**

- When responses include `protocolHints`, treat them as requests to refresh your understanding via the `foundation_info` and `orientation_onramp` tools and to repair missing metadata (task IDs, precedent links, assertion IDs) in future writes.
