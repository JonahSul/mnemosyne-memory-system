/**
 * McpServer — real MCP server backed by @modelcontextprotocol/sdk.
 *
 * Supports two transports:
 * - `stdio`: for CLI/VS Code local execution (StdioServerTransport).
 * - `http`: for SaaS Cloudflare Workers (WebStandardStreamableHTTPServerTransport).
 *
 * Tools are registered on the SDK Server via `setRequestHandler` for
 * `tools/list` and `tools/call`. Unlike the legacy hand-rolled JSON-RPC
 * handler in `src/agent.ts`, this uses the SDK's request handling properly.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolRegistry } from './tool-registry-impl.js';

export interface McpServerConfig {
    readonly registry: ToolRegistry;
    readonly transport: 'stdio' | 'http';
    readonly name?: string;
    readonly version?: string;
}

export class McpServer {
    private readonly registry: ToolRegistry;
    private readonly server: Server;

    constructor(config: McpServerConfig) {
        this.registry = config.registry;
        this.server = new Server(
            { name: config.name ?? 'mnemosyne', version: config.version ?? '2.0.0' },
            { capabilities: { tools: {} } }
        );
        this.registerToolHandlers();
    }

    private registerToolHandlers(): void {
        // tools/list — surface the registry's tools as MCP tools.
        this.server.setRequestHandler(ListToolsRequestSchema, () => {
            return {
                tools: this.registry.list().map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: this.registry.inputSchema(tool),
                })),
            };
        });

        // tools/call — dispatch to the registry.
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const result = await this.registry.call(name, (args ?? {}) as Record<string, unknown>);
            // A standard tool call result is `{ content: [...] }`. Cast to the
            // SDK's ServerResult (which also permits an optional `task`).
            return result as CallToolResult;
        });
    }

    /** Run the stdio transport. Resolves once the transport closes. */
    async runStdio(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        return new Promise((resolve) => {
            transport.onclose = () => resolve();
        });
    }

    /**
     * Handle a single HTTP request via the Web Standard Streamable HTTP
     * transport. Use a fresh transport per request (stateless mode) so the
     * server instance is shared safely across many client sessions.
     */
    async handleHttpRequest(request: Request): Promise<Response> {
        const transport = new WebStandardStreamableHTTPServerTransport({});
        await this.server.connect(transport);
        return transport.handleRequest(request);
    }

    async close(): Promise<void> {
        await this.server.close();
    }
}
