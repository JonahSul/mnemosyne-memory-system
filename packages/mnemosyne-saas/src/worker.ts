/**
 * Mnemosyne Worker — Cloudflare Worker fetch handler.
 *
 * Explicit route table:
 * - `/mcp` → MCP JSON-RPC
 * - `/stream` → SSE / WebSocket
 * - `/federation/v1/*` → Federation REST
 *
 * Phase 5 will implement the real routing.
 */

export interface WorkerEnv {
    AI: Ai;
    VECTORIZE_INDEX: VectorizeIndex;
    MEMORY_KV: KVNamespace;
    R2_BUCKET?: R2Bucket;
    MNEMOSYNE_MCP_OBJECT: DurableObjectNamespace;
}

export class MnemosyneWorker {
    constructor(private readonly env: WorkerEnv) { }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Phase 5: real routing
        if (path === '/mcp') {
            throw new Error('MCP route: not yet implemented (Phase 5)');
        }
        if (path === '/stream') {
            throw new Error('Streaming route: not yet implemented (Phase 5/6)');
        }
        if (path.startsWith('/federation/v1/')) {
            throw new Error('Federation route: not yet implemented (Phase 5)');
        }

        return new Response('Mnemosyne SaaS — see /mcp, /stream, /federation/v1/*', { status: 200 });
    }
}

export default {
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
        const worker = new MnemosyneWorker(env);
        return worker.fetch(request);
    },
};
