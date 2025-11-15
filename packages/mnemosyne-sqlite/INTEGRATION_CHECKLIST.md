# Integration Checklist

Use this checklist to integrate the Mnemosyne SQLite MCP Server into your workflow.

## Installation & Build

- [x] Package structure created in `packages/mnemosyne-sqlite`
- [x] Dependencies installed (`better-sqlite3`, `@modelcontextprotocol/sdk`)
- [x] Package builds successfully with TypeScript
- [x] Type definitions generated
- [x] Example runs successfully
- [ ] Added to your project's workspace (update root `package.json` if needed)

## Configuration

### For MCP Clients

- [ ] Determine your database path (e.g., `./project-knowledge.db` or `~/.mnemosyne/knowledge.db`)
- [ ] Copy `mcp-config.example.json` and update paths
- [ ] Add configuration to your MCP client:
  - [ ] Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - [ ] Cline: VS Code settings or `.vscode/settings.json`
  - [ ] Other MCP client: See client documentation

### Environment Variables

- [ ] Set `MNEMOSYNE_DB_PATH` if using non-default location
- [ ] Ensure directory exists and is writable

## Testing

- [ ] Start your MCP client
- [ ] Verify the server appears in available tools/servers
- [ ] Test `store_knowledge` tool with sample data
- [ ] Test `search_knowledge` with a query
- [ ] Test `get_stats` to confirm storage
- [ ] Test `list_knowledge` to view all items

## Usage Patterns

### Recommended Workflow

1. **Initial Setup**
   ```
   "Remember that our API uses JWT authentication with 24-hour expiry"
   "Store this: Database migrations are in /db/migrations"
   ```

2. **During Development**
   ```
   "What do you know about our authentication?"
   "Search for database-related information"
   ```

3. **Maintenance**
   ```
   "List all stored knowledge"
   "Show knowledge base statistics"
   ```

### Best Practices

- [ ] Use consistent tag naming (e.g., `api`, `auth`, `database`)
- [ ] Include metadata for categorization (e.g., `{ priority: "high", category: "security" }`)
- [ ] Regular backups of the `.db` file
- [ ] Use full-text search for keyword queries (faster)
- [ ] Use semantic search for conceptual queries (more flexible)

## Backup Strategy

- [ ] Determine backup frequency (daily/weekly)
- [ ] Set up automatic backups:
  ```bash
  # Add to cron or task scheduler
  sqlite3 project-knowledge.db ".backup project-knowledge-$(date +%Y%m%d).db"
  ```
- [ ] Test restore process

## Performance Tuning

Current configuration handles up to ~10,000 items efficiently.

If you need to store more:
- [ ] Consider implementing HNSW indexing
- [ ] Investigate sqlite-vec extension
- [ ] Monitor search performance with `get_stats`

## Custom Embeddings (Optional)

If you want better semantic search:

- [ ] Choose embedding provider (OpenAI, Cohere, local model)
- [ ] Implement custom `embeddingFn` in the store initialization
- [ ] Update `embeddingDimension` to match your model
- [ ] Test with sample queries

Example:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

const store = new SqliteVectorStore({
  databasePath: './knowledge.db',
  embeddingDimension: 1536,
  embeddingFn: async (text) => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  }
});
```

## Documentation

- [ ] Review `README.md` for API reference
- [ ] Read `QUICK_START.md` for usage examples
- [ ] Run `example.ts` to see it in action
- [ ] Share `QUICK_START.md` with team members

## Monitoring

- [ ] Periodically check database size (see `get_stats` tool)
- [ ] Monitor query performance
- [ ] Watch for any error messages in server logs

## Troubleshooting

If you encounter issues:

1. **Server won't start**
   - [ ] Check database path exists and is writable
   - [ ] Verify Node.js version (18+)
   - [ ] Check for error messages in stderr

2. **Slow searches**
   - [ ] Use `search_fulltext` for keyword queries
   - [ ] Lower similarity threshold
   - [ ] Check database size with `get_stats`

3. **Database locked**
   - [ ] Ensure only one server instance is running
   - [ ] Check for stale lock files (`*.db-shm`, `*.db-wal`)

## Next Steps

- [ ] Start using the MCP tools in your AI assistant
- [ ] Build up your project knowledge base
- [ ] Experiment with different search strategies
- [ ] Share findings with team
- [ ] Consider contributing improvements back to the project

## Support

For issues or questions:
- Review documentation in `packages/mnemosyne-sqlite/`
- Check the main Mnemosyne project documentation
- File issues on the project repository

---

**Date Completed**: _______________

**Configured By**: _______________

**Database Location**: _______________
