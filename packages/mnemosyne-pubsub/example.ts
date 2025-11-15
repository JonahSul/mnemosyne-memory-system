/**
 * Example: Using Mnemosyne PubSub with SQLite Storage
 * 
 * Demonstrates:
 * - Wrapping storage with event publishing
 * - Subscribing to storage events
 * - SSE streaming setup
 * - Event filtering and replay
 */

import { 
	InMemoryEventBus, 
	SSEManager, 
	EventPublishingVectorStore,
	EventFactory 
} from './src/index.js';

// Mock storage adapter for example
class MockVectorStore {
	private records: Map<string, any> = new Map();

	async upsert(records: any[]): Promise<void> {
		for (const record of records) {
			this.records.set(record.id, record);
		}
	}

	async search(query: any): Promise<any[]> {
		return Array.from(this.records.values());
	}

	async delete(ids: string[]): Promise<void> {
		for (const id of ids) {
			this.records.delete(id);
		}
	}

	async get(ids: string[]): Promise<any[]> {
		return ids.map(id => this.records.get(id)).filter(Boolean);
	}
}

async function main() {
	// 1. Create event bus
	const eventBus = new InMemoryEventBus({
		maxHistorySize: 100
	});

	// 2. Create base storage
	const baseStore = new MockVectorStore();

	// 3. Wrap with event publishing
	const eventStore = new EventPublishingVectorStore(baseStore, eventBus, {
		publishWrites: true,
		publishReads: true
	});

	// 4. Subscribe to events
	console.log('\n=== Setting up event listeners ===\n');

	eventBus.on('storage.created', (event) => {
		console.log('📝 Document created:', event.payload);
	});

	eventBus.on('storage.updated', (event) => {
		console.log('✏️  Document updated:', event.payload);
	});

	eventBus.on('storage.deleted', (event) => {
		console.log('🗑️  Document deleted:', event.payload);
	});

	eventBus.on('storage.searched', (event) => {
		console.log('🔍 Search performed:', event.payload);
	});

	// 5. Perform storage operations
	console.log('\n=== Performing storage operations ===\n');

	await eventStore.upsert([
		{
			id: 'doc-1',
			vector: [0.1, 0.2, 0.3],
			metadata: { title: 'First Document', type: 'article' }
		},
		{
			id: 'doc-2',
			vector: [0.4, 0.5, 0.6],
			metadata: { title: 'Second Document', type: 'note' }
		}
	]);

	await eventStore.search({
		vector: [0.2, 0.3, 0.4],
		topK: 5
	});

	await eventStore.delete(['doc-2']);

	// 6. View event history
	console.log('\n=== Event History ===\n');
	const history = eventBus.getHistory({ type: 'storage.*' });
	console.log(`Total events: ${history.length}`);
	
	for (const event of history) {
		console.log(`- ${event.type} at ${new Date(event.timestamp).toISOString()}`);
	}

	// 7. SSE Manager example (conceptual)
	console.log('\n=== SSE Manager Setup (conceptual) ===\n');
	
	const sseManager = new SSEManager(eventBus, {
		heartbeatInterval: 30000,
		clientTimeout: 300000
	});

	console.log('SSE Manager created. In a real HTTP server:');
	console.log('- Call sseManager.addClient(clientId, response) in your /events endpoint');
	console.log('- Call sseManager.removeClient(clientId) on connection close');
	console.log('- Events will be automatically broadcast to all connected clients');

	// 8. Manual event creation
	console.log('\n=== Creating custom events ===\n');

	const customEvent = EventFactory.createMemoryEvent('consolidated', {
		memoryId: 'mem-123',
		consolidationType: 'similarity',
		mergedCount: 5
	}, {
		correlationId: 'batch-456',
		priority: 5
	});

	await eventBus.publish(customEvent);

	// 9. Event filtering
	console.log('\n=== Filtered history ===\n');
	
	const recentCreates = eventBus.getHistory({
		type: 'storage.created',
		since: Date.now() - 60000 // Last minute
	});

	console.log(`Created events in last minute: ${recentCreates.length}`);

	// 10. Priority handlers
	console.log('\n=== Priority handler demo ===\n');

	eventBus.on('test.event', () => {
		console.log('  Low priority handler (priority: 1)');
	}, 1);

	eventBus.on('test.event', () => {
		console.log('  High priority handler (priority: 10)');
	}, 10);

	await eventBus.publish({
		id: 'test-1',
		type: 'test.event',
		timestamp: Date.now(),
		payload: {},
		source: 'example'
	});

	console.log('\n=== Example complete ===\n');
}

main().catch(console.error);
