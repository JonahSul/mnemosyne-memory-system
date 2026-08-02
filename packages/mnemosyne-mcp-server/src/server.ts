/**
 * MCP server — real MCP SDK server with tool registry and transport abstraction.
 *
 * Phase 5 will implement the real server using @modelcontextprotocol/sdk.
 * Supports stdio transport (for CLI/VS Code) and HTTP transport (for SaaS).
 *
 * Unlike the legacy code, the server does NOT bypass the SDK's request
 * handlers — it uses them properly.
 */

import type { ToolRegistry } from './tool-registry-impl.js';

export interface McpServerConfig {
    readonly registry: ToolRegistry;
    readonly transport: 'stdio' | 'http';
    readonly name?: string;
    readonly version?: string;
}

export class McpServer {
    private readonly registry: ToolRegistry;
    private readonly transport: 'stdio' | 'http';

    constructor(config: McpServerConfig) {
        this.registry = config.registry;
        this.transport = config.transport;
    }

    async start(): Promise<void> {
        // Phase 5: real implementation using @modelcontextprotocol/sdk
        throw new Error('McpServer.start: not yet implemented (Phase 5)');
    }

    async stop(): Promise<void> {
        throw new Error('McpServer.stop: not yet implemented (Phase 5)');
    }
}
