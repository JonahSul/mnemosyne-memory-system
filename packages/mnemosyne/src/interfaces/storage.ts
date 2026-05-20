export interface VectorStoreRecord {
	id?: string;
	content: string;
	embedding?: number[];
	metadata?: Record<string, unknown>;
	tags?: string[];
	timestamp?: string;
}

export interface VectorStoreSearchOptions {
	limit?: number;
	threshold?: number;
}

export interface VectorStoreSearchResult {
	id: string;
	content: string;
	embedding?: number[];
	metadata: Record<string, unknown>;
	tags: string[];
	timestamp?: string;
	similarity: number;
}

export interface VectorStoreAdapter {
	storeKnowledge(record: VectorStoreRecord): Promise<VectorStoreRecord>;
	searchSimilar(query: string, options?: VectorStoreSearchOptions): Promise<VectorStoreSearchResult[]>;
	getById?(id: string): Promise<VectorStoreSearchResult[]>;
}

export interface KeyValueStoreAdapter {
	put(key: string, value: string, options?: { expiration?: number } | Record<string, unknown>): Promise<void>;
	get(key: string): Promise<string | null>;
	delete(key: string): Promise<void>;
	list?(options?: Record<string, unknown>): Promise<string[]>;
}
