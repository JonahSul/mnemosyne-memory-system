/**
 * @mnemosyne/mcp-server — real MCP server with tool registry.
 *
 * Replaces the stub @mnemosyne/mcp package and the inline handlers in the
 * legacy `simplified-registry.ts` (1035 lines). Uses the MCP SDK Server with
 * explicit tool registration, and concrete memory tools that delegate to the
 * `@mnemosyne/core` application services.
 */

export { McpServer } from './server.js';
export type { McpServerConfig } from './server.js';
export { ToolRegistry } from './tool-registry-impl.js';
export type { ToolJsonSchema } from './tool-registry-impl.js';
export type { MCPTool, MCPToolSchema, MCPToolResult } from './tool-registry.js';
export { registerMemoryTools } from './tools/index.js';
export type { MemoryToolContext } from './tools/index.js';
