/**
 * Mnemosyne Durable Object — per-session stateful object.
 *
 * Composition root: builds the `McpServer` + `ToolRegistry` from Cloudflare
 * bindings and routes incoming requests to the MCP HTTP transport or the
 * federation REST endpoints. Contains NO business logic — it delegates to the
 * application services via the tool registry.
 *
 * Replaces the legacy `MnemosyneMemoryMCP` god object in `src/agent.ts`.
 */

import { McpServer } from '@mnemosyne/mcp-server';
import type { ShardKey } from '@mnemosyne/core';
import { composeSaas } from './composition-root.js';
import type { SaasEnv } from './composition-root.js';

const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
};

export class MnemosyneDurableObject {
    private readonly env: SaasEnv;
    private readonly shardKey: ShardKey;
    private server?: McpServer;

    constructor(private readonly state: DurableObjectState, env: unknown) {
        this.env = env as SaasEnv;
        this.shardKey = { tenant: 'default', tier: 'intermediate' };
    }

    private getMcpServer(): McpServer {
        if (!this.server) {
            const { registry } = composeSaas(this.env, this.shardKey);
            this.server = new McpServer({ registry, transport: 'http' });
        }
        return this.server;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers: CORS_HEADERS });
        }

        // MCP endpoint (Streamable HTTP)
        if (url.pathname === '/mcp' || url.pathname === '/sse' || url.pathname === '/sse/message') {
            const server = this.getMcpServer();
            const response = await server.handleHttpRequest(request);
            // Merge CORS headers onto the transport response.
            const headers = new Headers(response.headers);
            for (const [key, value] of Object.entries(CORS_HEADERS)) {
                headers.set(key, value);
            }
            return new Response(response.body, { status: response.status, headers });
        }

        // Federation REST endpoints
        if (url.pathname.startsWith('/federation/v1/')) {
            return this.handleFederationRequest(request);
        }

        return new Response('Mnemosyne SaaS — see /mcp, /sse, /federation/v1/*', {
            status: 200,
            headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS },
        });
    }

    private async handleFederationRequest(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        if (parts.length < 5) {
            return this.json({ success: false, error: 'Invalid federation endpoint format. Expected: /federation/v1/{role}/{operation}' }, 400);
        }
        const role = parts[3];
        const operation = parts[4];

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return this.json({ success: false, error: 'Missing or invalid Authorization header. Expected: Bearer {token}' }, 401);
        }

        let payload: unknown = {};
        if (request.method === 'POST') {
            try {
                payload = await request.json();
            } catch {
                return this.json({ success: false, error: 'Invalid JSON payload' }, 400);
            }
        }

        // Federation operations are delegated to the domain FederationService.
        // The legacy `processFederationOperation` is replaced by the domain
        // service; for now return a structured response indicating the route.
        return this.json({
            success: true,
            role,
            operation,
            agentId: 'unknown',
            operationId: `op_${Date.now()}`,
            timestamp: Date.now(),
            payload,
        }, 200);
    }

    private json(body: unknown, status: number): Response {
        return new Response(JSON.stringify(body), {
            status,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }
}
