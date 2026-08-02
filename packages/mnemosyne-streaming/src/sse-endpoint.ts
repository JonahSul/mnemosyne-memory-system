/**
 * SSE endpoint — real Server-Sent Events stream.
 *
 * Implements: heartbeat (every 30s), event dispatch from EventRouter,
 * client lifecycle (connect, disconnect, max clients).
 *
 * Phase 6 will implement the real stream. Unlike the legacy code, this
 * actually streams events — not a single connection message then idle.
 */

import type { StreamClient, StreamEvent } from './types.js';

export class SSEEndpoint {
    private readonly clients = new Map<string, StreamClient>();
    private heartbeatInterval?: ReturnType<typeof setInterval>;

    start(port: number): void {
        // Phase 6: real implementation
        throw new Error('SSEEndpoint.start: not yet implemented (Phase 6)');
    }

    stop(): void {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.clients.clear();
    }

    broadcast(event: StreamEvent): void {
        for (const client of this.clients.values()) {
            client.send(event);
        }
    }
}
