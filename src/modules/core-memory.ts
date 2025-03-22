/**
 * Core Memory Operations Module
 * 
 * Handles basic memory entry operations: claims, assumptions, verifications
 */

import type { MemoryEntry } from './memory-interfaces';

export interface CoreMemoryOperations {
	logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence?: 'low' | 'medium' | 'high'): Promise<string>;
	logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>): Promise<string>;
	verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean>;
	getUnverifiedClaims(): MemoryEntry[];
	getMemories(): Map<string, MemoryEntry>;
	storeMemory(entry: MemoryEntry): Promise<string>;
	searchMemory(query: string): Promise<MemoryEntry[]>;
	getMemoryStats(): any;
	exportMemory(): Promise<any>;
}

export class CoreMemoryManager implements CoreMemoryOperations {
	private memories = new Map<string, MemoryEntry>();

	async logClaim(claim: string, context?: Record<string, unknown>, source?: string, confidence: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
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
				confidence
			}
		};

		this.memories.set(claimId, memory);
		return claimId;
	}

	async logAssumption(assumption: string, reasoning: string, context?: Record<string, unknown>): Promise<string> {
		const assumptionId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const memory: MemoryEntry = {
			id: assumptionId,
			timestamp: new Date().toISOString(),
			type: 'assumption',
			content: assumption,
			status: 'pending',
			context: {
				...context,
				reasoning
			}
		};

		this.memories.set(assumptionId, memory);
		return assumptionId;
	}

	async verifyClaim(claimId: string, success: boolean, evidence: string, notes?: string): Promise<boolean> {
		const memory = this.memories.get(claimId);
		if (!memory) {
			throw new Error(`Claim ${claimId} not found`);
		}

		memory.status = success ? 'verified' : 'failed';
		memory.evidence = evidence;
		if (notes) {
			memory.context = { ...memory.context, notes };
		}

		this.memories.set(claimId, memory);
		return true;
	}

	getUnverifiedClaims(): MemoryEntry[] {
		return Array.from(this.memories.values()).filter(memory => 
			(memory.type === 'claim' || memory.type === 'assumption') && 
			memory.status === 'pending'
		);
	}

	getMemories(): Map<string, MemoryEntry> {
		return this.memories;
	}

	async storeMemory(entry: MemoryEntry): Promise<string> {
		this.memories.set(entry.id, entry);
		return entry.id;
	}

	async searchMemory(query: string): Promise<MemoryEntry[]> {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.memories.values()).filter(memory =>
			memory.content.toLowerCase().includes(lowerQuery) ||
			(memory.context && JSON.stringify(memory.context).toLowerCase().includes(lowerQuery))
		);
	}

	getMemoryStats(): any {
		const memories = Array.from(this.memories.values());
		return {
			totalMemories: memories.length,
			claims: memories.filter(m => m.type === 'claim').length,
			assumptions: memories.filter(m => m.type === 'assumption').length,
			verified: memories.filter(m => m.status === 'verified').length,
			pending: memories.filter(m => m.status === 'pending').length,
			failed: memories.filter(m => m.status === 'failed').length
		};
	}

	async exportMemory(): Promise<any> {
		return {
			memories: Array.from(this.memories.entries()),
			stats: this.getMemoryStats(),
			exportTime: new Date().toISOString()
		};
	}
}
