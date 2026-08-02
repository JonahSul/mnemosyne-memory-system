/**
 * Event router — subscribes to @mnemosyne/pubsub events and pushes to clients.
 *
 * Domain events (memory.stored, memory.searched, memory.forgotten, etc.)
 * flow from the EventBus through this router to connected SSE/WS clients.
 */

import type { StreamClient, StreamEvent } from './types.js';

export class EventRouter {
    private readonly clients = new Map<string, StreamClient>();

    addClient(client: StreamClient): void {
        this.clients.set(client.id, client);
    }

    removeClient(clientId: string): void {
        this.clients.delete(clientId);
    }

    /**
     * Route a domain event to all connected clients for the relevant tenant.
     * Phase 6 will wire this to the real @mnemosyne/pubsub EventBus.
     */
    route(eventType: string, data: unknown, tenant: string): void {
        const event: StreamEvent = { type: eventType, data, timestamp: Date.now() };
        for (const client of this.clients.values()) {
            if (client.tenant === tenant) {
                client.send(event);
            }
        }
    }
}
