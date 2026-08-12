/**
 * MCPTool interface — each tool is a class implementing this.
 *
 * Replaces the inline handler objects in `simplified-registry.ts`.
 * Tools receive their dependencies via constructor injection.
 */

import type { z } from 'zod';

/**
 * A single tool parameter schema entry (zod type with optional description).
 */
export interface MCPToolSchema {
    readonly name: string;
    readonly description: string;
    /**
     * Input parameter definitions. Keys are parameter names, values are zod
     * types. Used to build the MCP `inputSchema` for `tools/list`.
     */
    readonly parameters: Record<string, z.ZodType>;
}

export interface MCPToolResult {
    readonly content: Array<{ type: 'text'; text: string }>;
}

export interface MCPTool extends MCPToolSchema {
    execute(params: Record<string, unknown>): Promise<MCPToolResult>;
}
