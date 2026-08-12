/**
 * Mnemosyne Worker — Cloudflare Worker fetch handler.
 *
 * Explicit route table:
 * - `/mcp` → MCP Streamable HTTP (via Durable Object)
 * - `/sse`, `/sse/message` → MCP SSE (via Durable Object)
 * - `/federation/v1/*` → Federation REST (via Durable Object)
 * - `/` → server info
 *
 * Replaces the legacy `src/index.ts` router. Uses an explicit route table,
 * not a god Durable Object.
 */

import type { ShardKey } from '@mnemosyne/core';

export interface WorkerEnv {
    AI: Ai;
    VECTORIZE_INDEX: VectorizeIndex;
    MEMORY_KV: KVNamespace;
    R2_BUCKET?: R2Bucket;
    MNEMOSYNE_MCP_OBJECT: DurableObjectNamespace;
    MNEMOSYNE_MCP_OBJECT_DEV?: DurableObjectNamespace;
    MNEMOSYNE_MCP_OBJECT_STAGE?: DurableObjectNamespace;
}

const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
};

export class MnemosyneWorker {
    private readonly env: WorkerEnv;
    private readonly shardKey: ShardKey;

    constructor(env: WorkerEnv) {
        this.env = env;
        this.shardKey = { tenant: 'default', tier: 'intermediate' };
    }

    private getDurableObjectNamespace(): DurableObjectNamespace {
        // Precedence: STAGE → DEV → default.
        return this.env.MNEMOSYNE_MCP_OBJECT_STAGE
            ?? this.env.MNEMOSYNE_MCP_OBJECT_DEV
            ?? this.env.MNEMOSYNE_MCP_OBJECT;
    }

    private getDurableObjectStub(): DurableObjectStub {
        const ns = this.getDurableObjectNamespace();
        const id = ns.idFromName('default');
        return ns.get(id);
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers: CORS_HEADERS });
        }

        // MCP + SSE + federation all route to the Durable Object.
        if (path === '/mcp' || path === '/sse' || path === '/sse/message' || path.startsWith('/federation/v1/')) {
            const stub = this.getDurableObjectStub();
            return stub.fetch(request);
        }

        // Server info
        if (path === '/') {
            return new Response(JSON.stringify({
                name: 'mnemosyne-memory-system',
                version: '2.0.0',
                protocol: 'MCP 2024-11-05',
                capabilities: { tools: true, streaming: true, federation: true },
                endpoints: ['/mcp', '/sse', '/federation/v1/*'],
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
        }

        return new Response('Mnemosyne SaaS — see /mcp, /sse, /federation/v1/*', {
            status: 200,
            headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS },
        });
    }
}

export default {
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
        const worker = new MnemosyneWorker(env);
        return worker.fetch(request);
    },
};
