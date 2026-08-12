/**
 * Event router — subscribes to @mnemosyne/pubsub events and pushes to clients.
 *
 * Domain events (memory.stored, memory.searched, memory.forgotten, etc.)
 * flow from the EventBus through this router to connected SSE/WS clients.
 *
 * The router subscribes to the real `EventBus` and forwards each event to
 * connected clients whose tenant matches the event's tenant metadata.
 */

import type { EventBus, EventType, MnemosyneEvent } from '@mnemosyne/pubsub';
import { EventType as EventTypeEnum } from '@mnemosyne/pubsub';
import type { StreamClient, StreamEvent } from './types.js';

export class EventRouter {
    private readonly clients = new Map<string, StreamClient>();
    private readonly bus: EventBus;
    private readonly subscriptionId?: string;

    constructor(bus: EventBus) {
        this.bus = bus;
        // Subscribe to every event type so the router forwards all domain events.
        const allTypes = Object.values(EventTypeEnum) as EventType[];
        const subscription = bus.subscribe(allTypes, (event: MnemosyneEvent) => {
            this.route(event.type, event.payload, this.extractTenant(event));
        });
        this.subscriptionId = subscription.id;
    }

    addClient(client: StreamClient): void {
        this.clients.set(client.id, client);
    }

    removeClient(clientId: string): void {
        this.clients.delete(clientId);
    }

    /**
     * Route a domain event to all connected clients for the relevant tenant.
     */
    route(eventType: string, data: unknown, tenant: string): void {
        const event: StreamEvent = { type: eventType, data, timestamp: Date.now() };
        for (const client of this.clients.values()) {
            if (client.tenant === tenant) {
                client.send(event);
            }
        }
    }

    getClientCount(): number {
        return this.clients.size;
    }

    close(): void {
        if (this.subscriptionId) {
            this.bus.unsubscribe(this.subscriptionId);
        }
        this.clients.clear();
    }

    private extractTenant(event: MnemosyneEvent): string {
        const metadata = event.metadata;
        if (metadata && typeof metadata['tenant'] === 'string') {
            return metadata['tenant'];
        }
        const payload = event.payload as { shardKey?: { tenant?: string } };
        if (payload?.shardKey?.tenant) {
            return payload.shardKey.tenant;
        }
        return 'default';
    }
}
