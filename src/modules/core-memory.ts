/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Core Memory Operations Module
 * 
 * Handles basic memory entry operations: claims, assumptions, verifications
 */

import type { MemoryEntry } from './memory-interfaces';

/**
 * Custom error for when memory entries are not found
 * This should be handled as a 404 error, not a 500
 */
export class MemoryNotFoundError extends Error {
	constructor(id: string, type: string = 'memory') {
		super(`${type} ${id} not found`);
		this.name = 'MemoryNotFoundError';
	}
}

export interface CoreMemoryOperations {
	logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high', testing?: boolean): Promise<string>;
	logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>, testing?: boolean): Promise<string>;
	verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
	getUnverifiedClaims(includeTestingData?: boolean): MemoryEntry[];
	getUnverifiedClaimsCount(includeTestingData?: boolean): number;
	getMemories(includeTestingData?: boolean): Map<string, MemoryEntry>;
	storeMemory(entry: MemoryEntry, testing?: boolean): Promise<string>;
	searchMemory(query: string, includeTestingData?: boolean): Promise<MemoryEntry[]>;
	getMemoryStats(includeTestingData?: boolean): any;
	exportMemory(includeTestingData?: boolean): Promise<any>;
}

export class CoreMemoryManager implements CoreMemoryOperations {
	// ARCHITECTURAL VIOLATION: This Map storage is VOLATILE - lost on worker restart
	// FIX REQUIRED: Replace with immediate CloudflareVectorStore/KV writes
	// TODO: Remove volatile Map, implement write-through persistence
	private memories = new Map<string, MemoryEntry>();

	/**
	 * Filter memories based on testing flag
	 */
	private filterMemories(memories: Map<string, MemoryEntry>, includeTestingData: boolean = false): Map<string, MemoryEntry> {
		if (includeTestingData) {
			return memories;
		}
		
		const filtered = new Map<string, MemoryEntry>();
		for (const [id, memory] of memories) {
			// Exclude testing data (only include if testing flag is explicitly false or undefined)
			if (!memory.context?.testing) {
				filtered.set(id, memory);
			}
		}
		return filtered;
	}

	/**
	 * Filter memory array based on testing flag
	 */
	private filterMemoryArray(memories: MemoryEntry[], includeTestingData: boolean = false): MemoryEntry[] {
		if (includeTestingData) {
			return memories;
		}
		
		return memories.filter(memory => !memory.context?.testing);
	}

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
				testing // Add testing flag to context
			}
		};

		// PERSISTENCE VIOLATION: Writing to volatile Map instead of persistent storage
		// FIX REQUIRED: Replace with await vectorStore.store() or KV.put() call
		this.memories.set(claimId, memory);
		return claimId;
	}

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
				testing // Add testing flag to context
			}
		};

		// PERSISTENCE VIOLATION: Writing to volatile Map instead of persistent storage
		// FIX REQUIRED: Replace with await vectorStore.store() or KV.put() call
		this.memories.set(assumptionId, memory);
		return assumptionId;
	}

	async verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean> {
		const memory = this.memories.get(claimId);
		if (!memory) {
			throw new MemoryNotFoundError(claimId, 'Claim');
		}

		memory.status = success ? 'verified' : 'failed';
		memory.evidence = evidence;
		if (notes) {
			memory.context = { ...memory.context, notes };
		}

		// PERSISTENCE VIOLATION: Updating volatile Map instead of persistent storage
		// FIX REQUIRED: Replace with await vectorStore.update() or KV.put() call
		this.memories.set(claimId, memory);
		return true;
	}

	getUnverifiedClaims(includeTestingData: boolean = false): MemoryEntry[] {
		const unverified = Array.from(this.memories.values()).filter(memory => 
			memory.type === 'claim' && memory.status === 'pending'
		);
		return this.filterMemoryArray(unverified, includeTestingData);
	}

	getUnverifiedClaimsCount(includeTestingData: boolean = false): number {
		return this.getUnverifiedClaims(includeTestingData).length;
	}

	getMemories(includeTestingData: boolean = false): Map<string, MemoryEntry> {
		return this.filterMemories(this.memories, includeTestingData);
	}

	async storeMemory(entry: MemoryEntry, testing: boolean = false): Promise<string> {
		// Add testing flag to context if not already present
		if (testing && entry.context) {
			entry.context.testing = true;
		} else if (testing) {
			entry.context = { testing: true };
		}
		
		this.memories.set(entry.id, entry);
		return entry.id;
	}

	async searchMemory(query: string, includeTestingData: boolean = false): Promise<MemoryEntry[]> {
		const lowerQuery = query.toLowerCase();
		const results = Array.from(this.memories.values()).filter(memory =>
			memory.content.toLowerCase().includes(lowerQuery) ||
			(memory.context && JSON.stringify(memory.context).toLowerCase().includes(lowerQuery))
		);
		return this.filterMemoryArray(results, includeTestingData);
	}

	getMemoryStats(includeTestingData: boolean = false): any {
		const memories = Array.from(this.filterMemories(this.memories, includeTestingData).values());
		return {
			totalMemories: memories.length,
			claims: memories.filter(m => m.type === 'claim').length,
			assumptions: memories.filter(m => m.type === 'assumption').length,
			verified: memories.filter(m => m.status === 'verified').length,
			pending: memories.filter(m => m.status === 'pending').length,
			failed: memories.filter(m => m.status === 'failed').length,
			testingDataExcluded: !includeTestingData
		};
	}

	async exportMemory(includeTestingData: boolean = false): Promise<any> {
		const filteredMemories = this.filterMemories(this.memories, includeTestingData);
		return {
			memories: Array.from(filteredMemories.entries()),
			stats: this.getMemoryStats(includeTestingData),
			exportTime: new Date().toISOString(),
			testingDataIncluded: includeTestingData
		};
	}
}
