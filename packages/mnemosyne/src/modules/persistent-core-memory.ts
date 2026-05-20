/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Persistent Core Memory Operations Module
 * 
 * ARCHITECTURAL FIX: Replaces volatile Map storage with immediate persistence
 * to CloudflareVectorStore and KV storage for true persistence compliance
 */

import type { MemoryEntry } from './memory-interfaces';
import type { KeyValueStoreAdapter, VectorStoreAdapter, VectorStoreSearchResult } from '../interfaces/storage';

/**
 * Custom error for when memory entries are not found
 */
export class MemoryNotFoundError extends Error {
	constructor(id: string, type: string = 'memory') {
		super(`${type} ${id} not found`);
		this.name = 'MemoryNotFoundError';
	}
}

export interface PersistentCoreMemoryOperations {
	logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high', testing?: boolean): Promise<string>;
	logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing?: boolean): Promise<string>;
	verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
	getUnverifiedClaims(includeTestingData?: boolean): Promise<MemoryEntry[]>;
	getUnverifiedClaimsCount(includeTestingData?: boolean): Promise<number>;
	getMemories(includeTestingData?: boolean): Promise<MemoryEntry[]>;
	storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string>;
	searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
	getMemoryStats(includeTestingData?: boolean): Promise<any>;
	exportMemory(includeTestingData?: boolean): Promise<any>;
}

export class PersistentCoreMemoryManager implements PersistentCoreMemoryOperations {
	private vectorStore: VectorStoreAdapter;
	private kvStore?: KeyValueStoreAdapter;
	private kvKeyIndex: Set<string> = new Set();

	constructor(vectorStore: VectorStoreAdapter, kvStore?: KeyValueStoreAdapter) {
		this.vectorStore = vectorStore;
		if (kvStore) {
			this.kvStore = kvStore;
		}
	}

	/**
	 * PERSISTENCE FIX: Store claim immediately to persistent storage
	 */
	async logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence: 'low' | 'medium' | 'high' = 'medium', testing: boolean = false): Promise<string> {
		const claimId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const memory: MemoryEntry = {
			id: claimId,
			timestamp: new Date().toISOString(),
			type: 'claim',
			content: claim,
			status: 'pending',
			context: {
				...context,
				source,
				confidence,
				testing
			}
		};

		// IMMEDIATE PERSISTENCE: Store to both KV and vector store
		if (this.kvStore) {
			const kvKey = `memory:${claimId}`;
			await this.kvStore.put(kvKey, JSON.stringify(memory));
			this.trackKvKey(kvKey);
		}
        
		// Store to vector store for semantic search using provided adapter
		await this.vectorStore.storeKnowledge({
			id: claimId,
			content: memory.content,
			metadata: {
				id: claimId,
				type: memory.type,
				status: memory.status,
				timestamp: memory.timestamp,
				confidence,
				...memory.context
			},
			tags: [memory.type, memory.status, `confidence_${confidence}`, testing ? 'testing' : 'production']
		});

		return claimId;
	}

	/**
	 * PERSISTENCE FIX: Store assumption immediately to persistent storage
	 */
	async logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing: boolean = false): Promise<string> {
		const assumptionId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const memory: MemoryEntry = {
			id: assumptionId,
			timestamp: new Date().toISOString(),
			type: 'assumption',
			content: assumption,
			status: 'pending',
			context: {
				...context,
				reasoning,
				testing
			}
		};

		// IMMEDIATE PERSISTENCE: Store to both KV and vector store
		if (this.kvStore) {
			const kvKey = `memory:${assumptionId}`;
			await this.kvStore.put(kvKey, JSON.stringify(memory));
			this.trackKvKey(kvKey);
		}
        
		await this.vectorStore.storeKnowledge({
			id: assumptionId,
			content: memory.content,
			metadata: {
				id: assumptionId,
				type: memory.type,
				status: memory.status,
				timestamp: memory.timestamp,
				reasoning,
				...memory.context
			},
			tags: [memory.type, memory.status, testing ? 'testing' : 'production']
		});

		return assumptionId;
	}

	/**
	 * PERSISTENCE FIX: Update claim verification in persistent storage
	 */
	async verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean> {
		// Retrieve from KV store
		let memory: MemoryEntry | null = null;
		
		if (this.kvStore) {
			const kvData = await this.kvStore.get(`memory:${claimId}`);
			if (kvData) {
				memory = JSON.parse(kvData);
			}
		}

		if (!memory) {
			// Fallback: first try direct id lookup on vector store (if implemented), then semantic search
			let searchResults: VectorStoreSearchResult[] = [];
			if (typeof this.vectorStore.getById === 'function') {
				searchResults = await this.vectorStore.getById(claimId);
			}
			if (!searchResults || searchResults.length === 0) {
				searchResults = await this.vectorStore.searchSimilar(claimId, { limit: 1 });
			}
			if (!searchResults || searchResults.length === 0) {
				throw new MemoryNotFoundError(claimId, 'Claim');
			}
			const first = searchResults[0];
			const meta = (first && first.metadata) ? (first.metadata as any) : {};
			memory = {
				id: claimId,
				timestamp: meta.timestamp || new Date().toISOString(),
				type: 'claim',
				content: first ? first.content : '',
				status: meta.status || 'pending',
				context: meta || {}
			};
		}

		// Update memory
		memory.status = success ? 'verified' : 'failed';
		memory.evidence = evidence;
		if (notes) {
			memory.context = { ...memory.context, notes };
		}

		// IMMEDIATE PERSISTENCE: Update in both stores
		if (this.kvStore) {
			const kvKey = `memory:${claimId}`;
			await this.kvStore.put(kvKey, JSON.stringify(memory));
			this.trackKvKey(kvKey);
		}

		// Update vector store (upsert semantic record)
		await this.vectorStore.storeKnowledge({
			id: claimId,
			content: memory.content,
			metadata: {
				...memory.context,
				id: claimId,
				type: memory.type,
				status: memory.status,
				timestamp: memory.timestamp,
				evidence,
				verification_timestamp: new Date().toISOString()
			},
			tags: [memory.type, memory.status, (memory.context && (memory.context as any).testing) ? 'testing' : 'production']
		});

		return true;
	}

	/**
	 * PERSISTENCE FIX: Retrieve unverified claims from persistent storage
	 */
	async getUnverifiedClaims(includeTestingData: boolean = false): Promise<MemoryEntry[]> {
		const searchQuery = includeTestingData ? 'type:claim status:pending' : 'type:claim status:pending -testing';
		const results = await this.vectorStore.searchSimilar(searchQuery, { limit: 100 });
		let claims: MemoryEntry[] = results.map(result => this.normalizeVectorResult(result, 'claim'));

		// Fallback to KV-derived entries when vector search returns no matches (e.g., mock adapters)
		if (claims.length === 0) {
			const kvEntries = await this.loadMemoriesFromKV(includeTestingData);
			claims = kvEntries.filter(entry => entry.type === 'claim' && entry.status === 'pending');
		}

		return claims;
	}

	/**
	 * PERSISTENCE FIX: Count unverified claims from persistent storage
	 */
	async getUnverifiedClaimsCount(includeTestingData: boolean = false): Promise<number> {
		const claims = await this.getUnverifiedClaims(includeTestingData);
		return claims.length;
	}

	/**
	 * PERSISTENCE FIX: Retrieve all memories from persistent storage
	 */
	async getMemories(includeTestingData: boolean = false): Promise<MemoryEntry[]> {
		const searchQuery = includeTestingData ? '*' : '-testing';
		const results = await this.vectorStore.searchSimilar(searchQuery, { limit: 1000 });
		const memoryMap = new Map<string, MemoryEntry>();

		for (const result of results) {
			const entry = this.normalizeVectorResult(result);
			memoryMap.set(entry.id, entry);
		}

		if (memoryMap.size === 0) {
			const kvEntries = await this.loadMemoriesFromKV(includeTestingData);
			for (const kvEntry of kvEntries) {
				memoryMap.set(kvEntry.id, kvEntry);
			}
		}

		return Array.from(memoryMap.values());
	}

	/**
	 * PERSISTENCE FIX: Store memory entry immediately to persistent storage
	 */
	async storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string> {
		// IMMEDIATE PERSISTENCE: Store to both KV and vector store
		if (this.kvStore) {
			const kvKey = `memory:${entry.id}`;
			await this.kvStore.put(kvKey, JSON.stringify(entry));
			this.trackKvKey(kvKey);
		}
        
		await this.vectorStore.storeKnowledge({
			id: entry.id,
			content: entry.content,
			metadata: {
				...entry.context,
				id: entry.id,
				type: entry.type,
				status: entry.status,
				timestamp: entry.timestamp,
				evidence: entry.evidence
			},
			tags: [entry.type, entry.status || 'unknown', testing ? 'testing' : 'production']
		});

		return entry.id;
	}

	/**
	 * PERSISTENCE FIX: Search memories in persistent storage
	 */
	async searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]> {
		const searchQuery = includeTestingData ? query : `${query} -testing`;
		let results = await this.vectorStore.searchSimilar(searchQuery, { limit: 50 });

		if (!includeTestingData && results.length === 0) {
			results = await this.vectorStore.searchSimilar(query, { limit: 50 });
		}

		if (results.length === 0) {
			const kvEntries = await this.loadMemoriesFromKV(!!includeTestingData);
			const normalizedQuery = query.toLowerCase();
			return kvEntries.filter(entry => entry.content.toLowerCase().includes(normalizedQuery));
		}

		return results.map(result => this.normalizeVectorResult(result));
	}

	/**
	 * PERSISTENCE FIX: Get memory statistics from persistent storage
	 */
	async getMemoryStats(includeTestingData?: boolean): Promise<any> {
		const memories = await this.getMemories(includeTestingData);
		const claims = memories.filter(m => m.type === 'claim');
		const assumptions = memories.filter(m => m.type === 'assumption');
		const verified = memories.filter(m => m.status === 'verified');
		const pending = memories.filter(m => m.status === 'pending');
		const failed = memories.filter(m => m.status === 'failed');

		return {
			totalMemories: memories.length,
			claims: claims.length,
			assumptions: assumptions.length,
			verified: verified.length,
			pending: pending.length,
			failed: failed.length,
			testingDataExcluded: !includeTestingData
		};
	}

	/**
	 * PERSISTENCE FIX: Export all memory data from persistent storage
	 */
	async exportMemory(includeTestingData?: boolean): Promise<any> {
		const memories = await this.getMemories(includeTestingData);
		const stats = await this.getMemoryStats(includeTestingData);

		return {
			memories,
			stats,
			timestamp: new Date().toISOString(),
			source: 'persistent_storage'
		};
	}

	private async loadMemoriesFromKV(includeTestingData: boolean): Promise<MemoryEntry[]> {
		if (!this.kvStore) {
			return [];
		}

		const keys = typeof this.kvStore.list === 'function'
			? await this.kvStore.list()
			: Array.from(this.kvKeyIndex);
		if (!keys || keys.length === 0) {
			return [];
		}

		const entries: MemoryEntry[] = [];
		for (const key of keys) {
			if (!key.startsWith('memory:')) continue;
			const raw = await this.kvStore.get(key);
			if (!raw) continue;
			try {
				const parsed = JSON.parse(raw) as MemoryEntry;
				if (!includeTestingData && parsed.context && (parsed.context as any).testing) {
					continue;
				}
				entries.push(parsed);
			} catch (error) {
				console.warn(`Failed to parse memory entry for key ${key}:`, error);
			}
		}

		return entries;
	}

	private trackKvKey(key: string): void {
		if (key.startsWith('memory:')) {
			this.kvKeyIndex.add(key);
		}
	}

	private normalizeVectorResult(result: VectorStoreSearchResult, fallbackType: MemoryEntry['type'] = 'pattern'): MemoryEntry {
		const metadata = (result.metadata ?? {}) as Record<string, unknown>;
		const rawType = typeof metadata.type === 'string' ? metadata.type : undefined;
		const type: MemoryEntry['type'] = this.isValidMemoryType(rawType) ? rawType as MemoryEntry['type'] : fallbackType;
		const rawStatus = typeof metadata.status === 'string' ? metadata.status : undefined;
		const status: MemoryEntry['status'] = this.isValidMemoryStatus(rawStatus) ? rawStatus as MemoryEntry['status'] : 'pending';
		const timestamp = typeof metadata.timestamp === 'string' ? metadata.timestamp : new Date().toISOString();
		const context = Object.keys(metadata).length > 0 ? metadata : undefined;
		const evidenceValue = typeof metadata.evidence === 'string' ? metadata.evidence : undefined;

		return {
			id: result.id,
			timestamp,
			type,
			content: result.content,
			status,
			...(evidenceValue !== undefined ? { evidence: evidenceValue } : {}),
			...(context ? { context } : {})
		};
	}

	private isValidMemoryType(value: string | undefined): value is MemoryEntry['type'] {
		return value === 'claim' || value === 'rule' || value === 'verification' || value === 'pattern' || value === 'assumption' || value === 'plan';
	}

	private isValidMemoryStatus(value: string | undefined): value is MemoryEntry['status'] {
		return value === 'pending' || value === 'verified' || value === 'failed' || value === 'enforced' || value === 'violated';
	}
}
