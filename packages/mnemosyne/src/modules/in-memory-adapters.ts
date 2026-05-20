import type {
	KeyValueStoreAdapter,
	VectorStoreAdapter,
	VectorStoreRecord,
	VectorStoreSearchOptions,
	VectorStoreSearchResult
} from '../interfaces/storage';

/**
 * Lightweight in-memory KeyValue store for testing and local development.
 */
export class InMemoryKeyValueStore implements KeyValueStoreAdapter {
	private store = new Map<string, string>();

	async put(key: string, value: string): Promise<void> {
		this.store.set(key, value);
	}

	async get(key: string): Promise<string | null> {
		return this.store.has(key) ? this.store.get(key)! : null;
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	async list(): Promise<string[]> {
		return Array.from(this.store.keys());
	}

	getSize(): number {
		return this.store.size;
	}

	clear(): void {
		this.store.clear();
	}
}

/**
 * Simple in-memory VectorStore adapter used to satisfy Mnemosyne dependencies during tests.
 */
export class InMemoryVectorStoreAdapter implements VectorStoreAdapter {
	private records = new Map<string, VectorStoreRecord>();

	async storeKnowledge(record: VectorStoreRecord): Promise<VectorStoreRecord> {
		const id = record.id ?? this.generateId();
		const stored: VectorStoreRecord = {
			...record,
			id
		};
		this.records.set(id, stored);
		return stored;
	}

	async searchSimilar(query: string, options: VectorStoreSearchOptions = {}): Promise<VectorStoreSearchResult[]> {
		const normalized = query.replace(/-testing/g, '').trim().toLowerCase();
		const matches = Array.from(this.records.values()).filter(record => {
			if (normalized === '' || normalized === '*') {
				return true;
			}
			const baseContent = record.content?.toLowerCase() ?? '';
			if (baseContent.includes(normalized)) {
				return true;
			}
			const metadataValues = Object.values(record.metadata ?? {});
			return metadataValues.some(value => typeof value === 'string' && value.toLowerCase().includes(normalized));
		});

		const limited = matches.slice(0, options.limit ?? matches.length);

		return limited.map(record => ({
			id: record.id!,
			content: record.content,
			metadata: record.metadata ?? {},
			tags: record.tags ?? [],
			similarity: 0.9,
			...(record.embedding ? { embedding: record.embedding } : {}),
			...(record.timestamp ? { timestamp: record.timestamp } : {})
		}));
	}

	async getById(id: string): Promise<VectorStoreSearchResult[]> {
		const record = this.records.get(id);
		if (!record) {
			return [];
		}

		return [{
			id,
			content: record.content,
			metadata: record.metadata ?? {},
			tags: record.tags ?? [],
			similarity: 1,
			...(record.embedding ? { embedding: record.embedding } : {}),
			...(record.timestamp ? { timestamp: record.timestamp } : {})
		}];
	}

	getCount(): number {
		return this.records.size;
	}

	clear(): void {
		this.records.clear();
	}

	private generateId(): string {
		const globalCrypto = globalThis as { crypto?: { randomUUID?: () => string } };
		if (globalCrypto.crypto && typeof globalCrypto.crypto.randomUUID === 'function') {
			return globalCrypto.crypto.randomUUID();
		}
		return `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
	}
}
