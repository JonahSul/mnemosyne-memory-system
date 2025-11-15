/**
 * Pub/Sub Adapters for Different Backends
 * 
 * Implementations for Redis, in-memory, and other pub/sub systems.
 */

import type {
	PubSubAdapter,
	EventHandler,
	MnemosyneEvent
} from './types.js';

/**
 * In-Memory Pub/Sub Adapter
 * 
 * Simple in-process pub/sub for single-node deployments.
 */
export class InMemoryPubSubAdapter implements PubSubAdapter {
	private channels: Map<string, Set<EventHandler>> = new Map();

	async publish(channel: string, event: MnemosyneEvent): Promise<void> {
		const handlers = this.channels.get(channel);
		if (!handlers || handlers.size === 0) {
			return;
		}

		const promises: Promise<void>[] = [];
		for (const handler of handlers) {
			try {
				const result = handler(event);
				if (result instanceof Promise) {
					promises.push(result);
				}
			} catch (error) {
				console.error(`Error in pub/sub handler for channel ${channel}:`, error);
			}
		}

		if (promises.length > 0) {
			await Promise.allSettled(promises);
		}
	}

	async subscribe(channel: string, handler: EventHandler): Promise<void> {
		if (!this.channels.has(channel)) {
			this.channels.set(channel, new Set());
		}
		this.channels.get(channel)!.add(handler);
	}

	async unsubscribe(channel: string): Promise<void> {
		this.channels.delete(channel);
	}

	async close(): Promise<void> {
		this.channels.clear();
	}

	getChannelCount(): number {
		return this.channels.size;
	}

	getSubscriberCount(channel: string): number {
		return this.channels.get(channel)?.size ?? 0;
	}
}

/**
 * Redis Pub/Sub Adapter
 * 
 * For distributed deployments using Redis.
 * Note: Requires redis package to be installed separately.
 */
export class RedisPubSubAdapter implements PubSubAdapter {
	private publisher: any;
	private subscriber: any;
	private handlers: Map<string, EventHandler> = new Map();
	private connected: boolean = false;

	constructor(options: { url: string } | { host: string; port: number; password?: string }) {
		// Redis initialization would go here
		// This is a stub that needs actual Redis client implementation
		throw new Error('RedisPubSubAdapter requires redis package and implementation');
	}

	async publish(channel: string, event: MnemosyneEvent): Promise<void> {
		if (!this.connected) {
			throw new Error('Redis not connected');
		}

		const message = JSON.stringify(event);
		// await this.publisher.publish(channel, message);
	}

	async subscribe(channel: string, handler: EventHandler): Promise<void> {
		if (!this.connected) {
			throw new Error('Redis not connected');
		}

		this.handlers.set(channel, handler);
		// await this.subscriber.subscribe(channel);
	}

	async unsubscribe(channel: string): Promise<void> {
		if (!this.connected) {
			return;
		}

		this.handlers.delete(channel);
		// await this.subscriber.unsubscribe(channel);
	}

	async close(): Promise<void> {
		if (this.subscriber) {
			// await this.subscriber.quit();
		}
		if (this.publisher) {
			// await this.publisher.quit();
		}
		this.connected = false;
		this.handlers.clear();
	}
}

/**
 * Cloudflare Durable Objects Pub/Sub Adapter
 * 
 * Uses Cloudflare Durable Objects for distributed pub/sub.
 */
export class CloudflarePubSubAdapter implements PubSubAdapter {
	private durableObjectNamespace: any;
	private handlers: Map<string, EventHandler> = new Map();

	constructor(durableObjectNamespace: any) {
		this.durableObjectNamespace = durableObjectNamespace;
	}

	async publish(channel: string, event: MnemosyneEvent): Promise<void> {
		// Get Durable Object for this channel
		const id = this.durableObjectNamespace.idFromName(channel);
		const stub = this.durableObjectNamespace.get(id);
		
		// Send event to Durable Object
		await stub.fetch('https://internal/publish', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(event)
		});
	}

	async subscribe(channel: string, handler: EventHandler): Promise<void> {
		this.handlers.set(channel, handler);

		// Setup WebSocket subscription to Durable Object
		const id = this.durableObjectNamespace.idFromName(channel);
		const stub = this.durableObjectNamespace.get(id);
		
		// This would need WebSocket implementation
		// const ws = await stub.fetch('https://internal/subscribe', { 
		//   headers: { Upgrade: 'websocket' }
		// });
	}

	async unsubscribe(channel: string): Promise<void> {
		this.handlers.delete(channel);
	}

	async close(): Promise<void> {
		this.handlers.clear();
	}
}
