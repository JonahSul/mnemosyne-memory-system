# Mnemosyne Memory System

*"Memory is the mother of all wisdom"* — Aeschylus

A sophisticated cognitive enhancement and behavioral regulation system for AI agents, implementing **multi-tier memory architecture** with **semantic search**, **dynamic threshold optimization**, and **runtime behavioral rule deployment**. Named after the Greek goddess of memory, Mnemosyne provides AI agents with the ability to learn from past interactions, maintain behavioral integrity, and adapt their responses based on accumulated experience.

## 🧠 Core Concepts

**Mnemosyne Memory System** enables AI agents to:

- **Track and verify claims** to prevent false confidence and maintain accountability
- **Learn from violations** of behavioral rules with automatic correction strategies
- **Store knowledge semantically** across hierarchical memory tiers (short/intermediate/long-term)
- **Search adaptively** with workload-specific threshold optimization
- **Deploy updated behavioral rules** during runtime without service interruption
- **Ensure behavioral integrity** through systematic validation and self-monitoring

This system addresses the core challenge of AI reliability by providing a framework for behavioral accountability, semantic knowledge retention, and continuous improvement through adaptive learning.

## Key Technologies

- **Multi-Tier Memory Architecture** - Hierarchical storage with intelligent retention policies
- **Semantic Search & RAG** - Vector embeddings with cosine similarity and adaptive thresholds
- **Dynamic Threshold Tuning** - Workload-aware optimization for precision/recall balance
- **Cloudflare Workers & Durable Objects** - Serverless deployment with persistent edge storage
- **Model Context Protocol (MCP)** - Standardized tool integration for AI agents  
- **TypeScript & Delegator Pattern** - Type-safe modular architecture with clean separation
- **Runtime Foundation System** - Hot-deployment of behavioral rules with zero downtime

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

### Deployment

```bash
npm run deploy
```

### MCP Integration

Add to your MCP client configuration:

```json
{
  "servers": {
    "mnemosyne": {
      "url": "https://your-worker.yoursubdomain.workers.dev/sse",
      "type": "http"
    }
  }
}
```

## 🛠️ Available Tools

### Core Memory Operations

- `memory_log_claim` - Track claims and assertions for later verification
- `memory_verify_claim` - Verify previously logged claims with evidence  
- `memory_record_violation` - Log behavioral rule violations for learning
- `memory_check_behavioral_status` - Monitor behavioral performance and compliance
- `memory_export_state` - Export complete memory system state for analysis

### Semantic Knowledge Management

- `memory_store_knowledge` - Store information with semantic embeddings for RAG retrieval
- `memory_search_knowledge` - Perform semantic similarity search across knowledge base
- `memory_store_tiered` - Store knowledge in multi-tier system with automatic placement
- `memory_search_tiered` - Search across memory tiers with tier-aware ranking
- `memory_stats_tiered` - Get memory utilization statistics across all tiers
- `memory_tune_search_thresholds` - **🎯 NEW:** Dynamically optimize search thresholds

### Foundation Management  

- `memory_view_foundation` - View foundational behavioral rules and compliance
- `memory_update_foundation` - **⭐ HOT-DEPLOY:** Runtime behavioral rule updates

## 🔄 Runtime Foundation Updates

### Hot-Deployment Capabilities

The Mnemosyne Memory System now supports **runtime foundation updates**, enabling behavioral rule changes without server restart:

```typescript
// Example: Deploy enhanced debugging rules
await agent.callTool('memory_update_foundation', {
  migration: enhancedFoundationV1_1,
  options: {
    mergeRules: true,           // Merge with existing rules
    preserveViolations: true,   // Keep violation history  
    backup: true,              // Create automatic backup
    dryRun: false             // Apply changes immediately
  }
});
```

### Foundation Management via HTTP API

Direct HTTP access for foundation management:

```bash
# Get current foundation status
curl https://your-worker.workers.dev/foundation

# Deploy new foundation
curl -X POST https://your-worker.workers.dev/foundation \
  -H "Content-Type: application/json" \
  -d '{"migration": {...}, "options": {"mergeRules": true}}'
```

### Creating Custom Foundations

Create domain-specific foundations by extending the base migration structure found in `migrations/foundation.ts`. See `migrations/examples.ts` for comprehensive examples including:

- **Enhanced Foundation v1.1.0** - Improved systematic debugging and safety constraints
- **Web Development Foundation v2.0.0** - Specialized rules for web development projects

## 📋 Foundation Rules System

Mnemosyne includes foundational behavioral rules that promote reliable AI behavior:

1. **Verify Before Claim** (Critical) - Never claim success without evidence
2. **Ask for Help When Blocked** (Critical) - Request assistance when information is unavailable  
3. **Evidence-Based Claims** (High) - Support all statements with observable facts
4. **Systematic Debugging** (High) - Break complex problems into verifiable steps
5. **Progressive Disclosure** (Medium) - Present information in digestible layers

**Start with `memory_view_foundation` to understand the complete behavioral framework.**

## 🤝 Contributing

We encourage developers to create their own Mnemosyne Memory Systems with custom behavioral foundations!

1. **Study the base foundation** in `migrations/foundation.ts`
2. **Review examples** in `migrations/examples.ts`
3. **Define domain-specific rules** for your use case
4. **Test with runtime deployment** using the hot-update system
5. **Share with the community** via pull requests

*The runtime foundation update system makes it easy to iterate on behavioral rules and deploy improvements instantly.*
