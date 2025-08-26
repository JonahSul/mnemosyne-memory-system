/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Persistent Core Memory Operations Module
 * 
 * ARCHITECTURAL FIX: Replaces volatile Map storage with immediate persistence
 * to CloudflareVectorStore and KV storage for true persistence compliance
 */

import type { MemoryEntry } from './memory-interfaces';
import { CloudflareVectorStore } from '../cloudflare-vector-store';

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
	private vectorStore: CloudflareVectorStore;
	private kvStore: any; // KV binding from Worker environment

	constructor(vectorStore: CloudflareVectorStore, kvStore?: any) {
		this.vectorStore = vectorStore;
		this.kvStore = kvStore;
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
			await this.kvStore.put(`memory:${claimId}`, JSON.stringify(memory));
		}
        
		// Store to vector store for semantic search using actual CloudflareVectorStore API
		await this.vectorStore.storeKnowledge({
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
			await this.kvStore.put(`memory:${assumptionId}`, JSON.stringify(memory));
		}
        
		await this.vectorStore.storeKnowledge({
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
			let searchResults = await (this.vectorStore as any).getById ? await (this.vectorStore as any).getById(claimId) : [];
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
			await this.kvStore.put(`memory:${claimId}`, JSON.stringify(memory));
		}

		// Update vector store (upsert semantic record)
		await this.vectorStore.storeKnowledge({
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

		return results.map(result => ({
			id: result.id,
			timestamp: (result.metadata && (result.metadata as any).timestamp) || new Date().toISOString(),
			type: 'claim',
			content: result.content,
			status: (result.metadata && (result.metadata as any).status) || 'pending',
			context: result.metadata || {}
		}));
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

		return results.map(result => ({
			id: result.id,
			timestamp: (result.metadata && (result.metadata as any).timestamp) || new Date().toISOString(),
			type: (result.metadata && (result.metadata as any).type) || 'unknown',
			content: result.content,
			status: (result.metadata && (result.metadata as any).status) || 'unknown',
			context: result.metadata || {},
			evidence: (result.metadata && (result.metadata as any).evidence)
		}));
	}

	/**
	 * PERSISTENCE FIX: Store memory entry immediately to persistent storage
	 */
	async storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string> {
		// IMMEDIATE PERSISTENCE: Store to both KV and vector store
		if (this.kvStore) {
			await this.kvStore.put(`memory:${entry.id}`, JSON.stringify(entry));
		}
        
		await this.vectorStore.storeKnowledge({
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
		const results = await this.vectorStore.searchSimilar(searchQuery, { limit: 50 });

		return results.map(result => ({
			id: result.id,
			timestamp: (result.metadata && (result.metadata as any).timestamp) || new Date().toISOString(),
			type: (result.metadata && (result.metadata as any).type) || 'unknown',
			content: result.content,
			status: (result.metadata && (result.metadata as any).status) || 'unknown',
			context: result.metadata || {},
			evidence: (result.metadata && (result.metadata as any).evidence)
		}));
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
}
