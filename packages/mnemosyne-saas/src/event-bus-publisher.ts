/**
 * EventBusPublisher — adapts the `@mnemosyne/pubsub` InMemoryEventBus to the
 * `EventPublisher` port from `@mnemosyne/core`.
 *
 * The domain publishes domain events through the port; this adapter forwards
 * them onto the real event bus so streaming clients can subscribe.
 */

import type { EventPublisher } from '@mnemosyne/core';
import { EventPriority } from '@mnemosyne/pubsub';
import type { EventBus, MnemosyneEvent } from '@mnemosyne/pubsub';

export class EventBusPublisher implements EventPublisher {
    private readonly bus: EventBus;

    constructor(bus: EventBus) {
        this.bus = bus;
    }

    async publish<T>(
        eventType: string,
        payload: T,
        metadata?: Record<string, unknown>,
    ): Promise<void> {
        const event: MnemosyneEvent<T> = {
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
            type: eventType as MnemosyneEvent['type'],
            timestamp: Date.now(),
            payload,
            source: 'saas-worker',
            priority: EventPriority.NORMAL,
            retryable: true,
            metadata,
        };
        await this.bus.publish(event);
    }
}
