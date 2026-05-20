# Changelog

All notable changes to the Mnemosyne SQLite MCP Server will be documented in this file.

## [1.0.0] - 2025-11-15

### Added
- Initial release of Mnemosyne SQLite MCP Server
- SQLite-based persistent vector storage
- MCP tools for knowledge management:
  - `store_knowledge`: Store knowledge with tags and metadata
  - `search_knowledge`: Semantic similarity search
  - `search_fulltext`: Fast FTS5 full-text search
  - `get_knowledge`: Retrieve by ID
  - `list_knowledge`: List all items with pagination
  - `delete_knowledge`: Delete by ID
  - `get_stats`: Database statistics
- Vector embedding support:
  - Mock embeddings (deterministic, hash-based)
  - Custom embedding function support
  - 768-dimensional vectors (compatible with BGE-base models)
- SQLite FTS5 full-text search indexing
- WAL mode for better concurrency
- Complete TypeScript type definitions
- Comprehensive documentation and examples

### Features
- Project-local knowledge storage (no cloud dependencies)
- Semantic search with configurable similarity thresholds
- Full-text search with SQLite FTS5
- JSON metadata and tag support
- Automatic timestamp tracking
- Database statistics and monitoring
- Graceful shutdown handling

### Performance
- O(n) semantic search (acceptable for <10k records)
- O(log n) full-text search
- ~1KB per record storage overhead
- WAL mode for concurrent reads

### Documentation
- README.md with full API documentation
- QUICK_START.md with usage examples
- example.ts demonstrating library usage
- mcp-config.example.json for MCP client setup

## [Unreleased]

### Planned
- sqlite-vec extension support for native vector operations
- Automatic embedding service integrations (OpenAI, Cohere, local models)
- Background indexing and optimization
- Import/export utilities
- Multi-database support
- HNSW indexing for large-scale deployments
