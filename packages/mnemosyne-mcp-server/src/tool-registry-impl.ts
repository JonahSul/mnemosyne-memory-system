/**
 * Tool registry — registers and dispatches MCP tools.
 *
 * Each tool is a class implementing MCPTool. The registry maps tool names to
 * instances. The server dispatches `tools/call` to the registry.
 */

import type { MCPTool, MCPToolResult } from './tool-registry.js';

export interface ToolJsonSchema {
    readonly type: 'object';
    readonly properties: Record<string, { type: string; description?: string }>;
    readonly required: string[];
    readonly additionalProperties: boolean;
}

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

    /**
     * Build the MCP `inputSchema` for a tool from its zod parameter types.
     */
    inputSchema(tool: MCPTool): ToolJsonSchema {
        const properties: Record<string, { type: string; description?: string }> = {};
        const required: string[] = [];
        for (const [name, zodType] of Object.entries(tool.parameters)) {
            const jsonType = (zodType as unknown as { _def?: unknown })._def;
            const type = this.zodToJsonType(zodType);
            properties[name] = {
                type,
                ...(zodType.description ? { description: zodType.description } : {}),
            };
            if (!this.isOptional(zodType)) {
                required.push(name);
            }
        }
        return { type: 'object', properties, required, additionalProperties: false };
    }

    async call(name: string, params: Record<string, unknown>): Promise<MCPToolResult> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }
        return tool.execute(params);
    }

    private zodToJsonType(zodType: unknown): string {
        const def = (zodType as { _def?: { typeName?: string; innerType?: unknown } })._def;
        switch (def?.typeName) {
            case 'ZodString': return 'string';
            case 'ZodNumber': return 'number';
            case 'ZodBoolean': return 'boolean';
            case 'ZodArray': return 'array';
            case 'ZodEnum': return 'string';
            case 'ZodRecord': return 'object';
            case 'ZodObject': return 'object';
            default: return 'string';
        }
    }

    private isOptional(zodType: unknown): boolean {
        const def = (zodType as { _def?: { typeName?: string; innerType?: unknown } })._def;
        return def?.typeName === 'ZodOptional' || def?.typeName === 'ZodDefault';
    }
}
