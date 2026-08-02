/**
 * MCPTool interface — each tool is a class implementing this.
 *
 * Replaces the inline handler objects in `simplified-registry.ts`.
 * Tools receive their dependencies via constructor injection.
 */

import type { z } from 'zod';

export interface MCPToolSchema {
    readonly name: string;
    readonly description: string;
    readonly schema: Record<string, z.ZodType>;
}

export interface MCPToolResult {
    readonly content: Array<{ type: 'text'; text: string }>;
}

export interface MCPTool extends MCPToolSchema {
    execute(params: Record<string, unknown>): Promise<MCPToolResult>;
}
