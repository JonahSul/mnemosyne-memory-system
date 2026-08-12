/**
 * Shared formatting helpers for MCP tool text output.
 */

import type { MCPToolResult } from '../tool-registry.js';

/** Wrap a plain string as an MCP text content result. */
export function textResult(text: string): MCPToolResult {
    return { content: [{ type: 'text', text }] };
}

/** Format an error into a stable text result rather than throwing. */
export function errorResult(error: unknown, fallback: string): MCPToolResult {
    return textResult(`Error: ${error instanceof Error ? error.message : fallback}`);
}
