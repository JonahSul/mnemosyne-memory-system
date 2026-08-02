/**
 * @mnemosyne/mcp-server — real MCP server with tool registry.
 *
 * Replaces the stub @mnemosyne/mcp package. Uses the MCP SDK Server with
 * explicit tool registration (not inline handlers in a 1037-line registry).
 */

export { McpServer } from './server.js';
export { ToolRegistry } from './tool-registry-impl.js';
export type { MCPTool, MCPToolSchema, MCPToolResult } from './tool-registry.js';
