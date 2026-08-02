/**
 * Tool registry — registers and dispatches MCP tools.
 *
 * Each tool is a class implementing MCPTool. The registry maps tool names to
 * instances. The server dispatches `tools/call` to the registry.
 */

import type { MCPTool, MCPToolResult } from './tool-registry.js';

export class ToolRegistry {
    private readonly tools = new Map<string, MCPTool>();

    register(tool: MCPTool): void {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool already registered: ${tool.name}`);
        }
        this.tools.set(tool.name, tool);
    }

    list(): MCPTool[] {
        return [...this.tools.values()];
    }

    async call(name: string, params: Record<string, unknown>): Promise<MCPToolResult> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }
        return tool.execute(params);
    }
}
