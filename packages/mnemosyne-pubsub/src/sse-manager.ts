/**
 * SSE (Server-Sent Events) Manager
 * 
 * Manages SSE connections and broadcasts events to connected clients.
 * Integrates with the event bus for real-time updates.
 */

import type {
	SSEChannel,
	SSEClient,
	EventFilter,
	MnemosyneEvent,
	EventBus
} from './types.js';

export interface SSEMessage {
	id?: string;
	event?: string;
	data: string;
	retry?: number;
}

export interface SSEManagerOptions {
	heartbeatInterval?: number;  // Send heartbeat every N ms
	clientTimeout?: number;      // Remove inactive clients after N ms
	maxClients?: number;         // Maximum number of concurrent clients
}

export class SSEManager implements SSEChannel {
	private clients: Map<string, SSEClientConnection> = new Map();
	private eventBus?: EventBus;
	private heartbeatTimer?: any;
	private cleanupTimer?: any;
	private options: Required<SSEManagerOptions>;

	constructor(options: SSEManagerOptions = {}) {
		this.options = {
			heartbeatInterval: options.heartbeatInterval ?? 30000,
			clientTimeout: options.clientTimeout ?? 300000,
			maxClients: options.maxClients ?? 1000
		};
	}

	/**
	 * Connect event bus for automatic event broadcasting
	 */
	connectEventBus(eventBus: EventBus, filter?: EventFilter): void {
		this.eventBus = eventBus;
		
		// Subscribe to all events (or filtered events)
		eventBus.subscribe(
			filter?.type ?? '*' as any,
			async (event) => {
				await this.broadcast(event);
			},
			{ filter }
		);
	}

	/**
	 * Register a new SSE client connection
	 */
	registerClient(
		clientId: string,
		sendFunction: (message: SSEMessage) => void,
		filter?: EventFilter
	): SSEClient {
		if (this.clients.size >= this.options.maxClients) {
			throw new Error('Maximum client limit reached');
		}

		const client: SSEClientConnection = {
			id: clientId,
			connectedAt: Date.now(),
			lastActivity: Date.now(),
			filter,
			sendFunction,
			metadata: {}
		};

		this.clients.set(clientId, client);

		// Start heartbeat if this is the first client
		if (this.clients.size === 1) {
			this.startHeartbeat();
			this.startCleanup();
		}

		return {
			id: client.id,
			connectedAt: client.connectedAt,
			lastActivity: client.lastActivity,
			filter: client.filter,
			metadata: client.metadata
		};
	}

	/**
	 * Unregister a client connection
	 */
	unregisterClient(clientId: string): void {
		this.clients.delete(clientId);

		// Stop heartbeat if no clients left
		if (this.clients.size === 0) {
			this.stopHeartbeat();
			this.stopCleanup();
		}
	}

	/**
	 * Broadcast event to all connected clients
	 */
	async broadcast(event: MnemosyneEvent): Promise<void> {
		const promises: Promise<void>[] = [];

		for (const [clientId, client] of this.clients.entries()) {
			if (this.eventMatchesClientFilter(event, client.filter)) {
				promises.push(
					this.sendToClient(client, event).catch(error => {
						// Client send failed, remove client
						this.unregisterClient(clientId);
					})
				);
			}
		}

		await Promise.allSettled(promises);
	}

	/**
	 * Send event to specific client
	 */
	async send(clientId: string, event: MnemosyneEvent): Promise<void> {
		const client = this.clients.get(clientId);
		if (!client) {
			throw new Error(`Client ${clientId} not found`);
		}

		await this.sendToClient(client, event);
	}

	/**
	 * Get connected client count
	 */
	getClientCount(): number {
		return this.clients.size;
	}

	/**
	 * Get all connected clients
	 */
	getClients(): SSEClient[] {
		return Array.from(this.clients.values()).map(client => ({
			id: client.id,
			connectedAt: client.connectedAt,
			lastActivity: client.lastActivity,
			filter: client.filter,
			metadata: client.metadata
		}));
	}

	/**
	 * Close the channel and disconnect all clients
	 */
	async close(): Promise<void> {
		this.stopHeartbeat();
		this.stopCleanup();
		
		// Send close message to all clients
		const closeMessage: SSEMessage = {
			event: 'close',
			data: JSON.stringify({ message: 'Server closing connection' })
		};

		for (const client of this.clients.values()) {
			try {
				client.sendFunction(closeMessage);
			} catch (error) {
				// Ignore errors on close
			}
		}

		this.clients.clear();
	}

	private async sendToClient(
		client: SSEClientConnection,
		event: MnemosyneEvent
	): Promise<void> {
		const message: SSEMessage = {
			id: event.id,
			event: event.type,
			data: JSON.stringify({
				...event,
				// Include causality info if present
				causalContext: event.causalContext
			})
		};

		client.sendFunction(message);
		client.lastActivity = Date.now();
	}

	private startHeartbeat(): void {
		this.heartbeatTimer = setInterval(() => {
			const heartbeat: SSEMessage = {
				event: 'heartbeat',
				data: JSON.stringify({ timestamp: Date.now() })
			};

			for (const [clientId, client] of this.clients.entries()) {
				try {
					client.sendFunction(heartbeat);
					client.lastActivity = Date.now();
				} catch (error) {
					this.unregisterClient(clientId);
				}
			}
		}, this.options.heartbeatInterval);
	}

	private stopHeartbeat(): void {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = undefined;
		}
	}

	private startCleanup(): void {
		this.cleanupTimer = setInterval(() => {
			const now = Date.now();
			const timeout = this.options.clientTimeout;

			for (const [clientId, client] of this.clients.entries()) {
				if (now - client.lastActivity > timeout) {
					this.unregisterClient(clientId);
				}
			}
		}, this.options.clientTimeout / 2);
	}

	private stopCleanup(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = undefined;
		}
	}

	private eventMatchesClientFilter(
		event: MnemosyneEvent,
		filter?: EventFilter
	): boolean {
		if (!filter) return true;

		// Check type
		if (filter.type) {
			const types = Array.isArray(filter.type) ? filter.type : [filter.type];
			if (!types.includes(event.type)) {
				return false;
			}
		}

		// Check source
		if (filter.source) {
			const sources = Array.isArray(filter.source) ? filter.source : [filter.source];
			if (!sources.includes(event.source)) {
				return false;
			}
		}

		// Check priority
		if (filter.priority) {
			const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
			if (!priorities.includes(event.priority)) {
				return false;
			}
		}

		// Check custom predicate
		if (filter.predicate && !filter.predicate(event)) {
			return false;
		}

		return true;
	}
}

interface SSEClientConnection extends SSEClient {
	sendFunction: (message: SSEMessage) => void;
}
