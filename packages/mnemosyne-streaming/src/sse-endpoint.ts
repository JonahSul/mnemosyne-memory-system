/**
 * SSE endpoint — real Server-Sent Events stream.
 *
 * Implements: heartbeat (every 30s), event dispatch from EventRouter,
 * client lifecycle (connect, disconnect, max clients).
 *
 * Cloudflare-compatible: `handleRequest(request)` returns a streaming
 * `Response` backed by a `ReadableStream`. Each connected client gets a
 * dedicated stream that receives `broadcast()` events and periodic heartbeats.
 * Unlike the legacy code, this actually streams events — not a single
 * connection message then idle.
 */

import type { StreamClient, StreamEvent } from './types.js';

const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_CLIENTS = 100;

export interface SSEEndpointConfig {
    readonly heartbeatIntervalMs?: number;
    readonly maxClients?: number;
}

export class SSEEndpoint {
    private readonly clients = new Map<string, StreamClient>();
    private readonly heartbeatIntervalMs: number;
    private readonly maxClients: number;
    private heartbeatTimer?: ReturnType<typeof setInterval>;

    constructor(config: SSEEndpointConfig = {}) {
        this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? HEARTBEAT_INTERVAL_MS;
        this.maxClients = config.maxClients ?? MAX_CLIENTS;
    }

    /**
     * Handle an SSE connection request. Returns a streaming Response that
     * stays open, sending heartbeats and broadcast events until the client
     * disconnects.
     */
    handleRequest(request: Request, tenant: string): Response {
        if (this.clients.size >= this.maxClients) {
            return new Response('Too many connections', { status: 503 });
        }

        const clientId = `sse_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const encoder = new TextEncoder();
        const clients = this.clients;
        let controller: ReadableStreamDefaultController<Uint8Array>;

        const stream = new ReadableStream<Uint8Array>({
            start(c) {
                controller = c;
                // Send an initial comment to establish the connection.
                c.enqueue(encoder.encode(': connected\n\n'));
            },
            cancel() {
                clients.delete(clientId);
            },
        });

        const client: StreamClient = {
            id: clientId,
            tenant,
            send(event: StreamEvent) {
                const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
                try {
                    controller.enqueue(encoder.encode(payload));
                } catch {
                    // Stream closed; client will be cleaned up on cancel.
                }
            },
            close() {
                try {
                    controller.close();
                } catch {
                    // Already closed.
                }
                clients.delete(clientId);
            },
        };

        this.clients.set(clientId, client);
        this.ensureHeartbeat();

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });
    }

    broadcast(event: StreamEvent): void {
        for (const client of this.clients.values()) {
            client.send(event);
        }
    }

    getClientCount(): number {
        return this.clients.size;
    }

    private ensureHeartbeat(): void {
        if (this.heartbeatTimer) return;
        this.heartbeatTimer = setInterval(() => {
            const heartbeat: StreamEvent = { type: 'heartbeat', data: { ts: Date.now() }, timestamp: Date.now() };
            this.broadcast(heartbeat);
        }, this.heartbeatIntervalMs);
    }

    stop(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        for (const client of this.clients.values()) {
            client.close();
        }
        this.clients.clear();
    }
}
