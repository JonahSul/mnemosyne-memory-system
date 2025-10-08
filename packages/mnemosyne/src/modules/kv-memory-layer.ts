/**
 * KV Memory Layer - Foundation Persistence
 * 
 * This provides the most reliable, simple persistence layer for critical memory.
 * KV storage is guaranteed persistent and has simple key-value semantics.
 * 
 * Architecture:
 * KV Layer (Foundation) → Vector Layer (Enhanced Search) → Durable Objects (Performance)
 */

export interface KVMemoryItem {
	id: string;
	content: string;
	timestamp: string;
	type: 'claim' | 'violation' | 'rule' | 'knowledge' | 'protocol' | 'session_state';
	metadata: Record<string, unknown>;
	tier: 'critical' | 'important' | 'working' | 'cache';
}

export interface KVMemoryEnv {
	MEMORY_KV: KVNamespace;
}

export class KVMemoryLayer {
	private kv: KVNamespace;
	private keyPrefix = 'mem:';

	constructor(env: KVMemoryEnv) {
		this.kv = env.MEMORY_KV;
	}

	/**
	 * Store critical memory item in KV with guaranteed persistence
	 */
	async store(item: Omit<KVMemoryItem, 'id' | 'timestamp'>): Promise<string> {
		const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const timestamp = new Date().toISOString();
		
		const memoryItem: KVMemoryItem = {
			id,
			timestamp,
			...item
		};

		const key = `${this.keyPrefix}${item.type}:${id}`;
		
		try {
			await this.kv.put(key, JSON.stringify(memoryItem), {
				metadata: {
					type: item.type,
					tier: item.tier,
					timestamp
				}
			});
			
			// Also store in type-specific index for fast retrieval
			await this.updateTypeIndex(item.type, id);
			
			return id;
		} catch (error) {
			throw new Error(`KV storage failed: ${error}`);
		}
	}

	/**
	 * Retrieve memory item by ID
	 */
	async get(id: string): Promise<KVMemoryItem | null> {
		try {
			// Try different type prefixes since we don't know the type
			const types = ['claim', 'violation', 'rule', 'knowledge', 'protocol', 'session_state'];
			
			for (const type of types) {
				const key = `${this.keyPrefix}${type}:${id}`;
				const result = await this.kv.get(key);
				
				if (result) {
					return JSON.parse(result) as KVMemoryItem;
				}
			}
			
			return null;
		} catch (error) {
			console.error('KV retrieval failed:', error);
			return null;
		}
	}

	/**
	 * Search by type and content
	 */
	async searchByType(type: KVMemoryItem['type'], limit = 10): Promise<KVMemoryItem[]> {
		try {
			const prefix = `${this.keyPrefix}${type}:`;
			const list = await this.kv.list({ prefix, limit });
			
			const items: KVMemoryItem[] = [];
			for (const key of list.keys) {
				const value = await this.kv.get(key.name);
				if (value) {
					items.push(JSON.parse(value) as KVMemoryItem);
				}
			}
			
			// Sort by timestamp (newest first)
			return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		} catch (error) {
			console.error('KV search failed:', error);
			return [];
		}
	}

	/**
	 * Search across all types with text matching
	 */
	async search(query: string, limit = 10): Promise<KVMemoryItem[]> {
		try {
			const allTypes = ['claim', 'violation', 'rule', 'knowledge', 'protocol', 'session_state'];
			const allItems: KVMemoryItem[] = [];
			
			for (const type of allTypes) {
				const typeItems = await this.searchByType(type as KVMemoryItem['type'], 50);
				allItems.push(...typeItems);
			}
			
			// Simple text matching (can be enhanced with better search later)
			const queryLower = query.toLowerCase();
			const filtered = allItems.filter(item => 
				item.content.toLowerCase().includes(queryLower) ||
				JSON.stringify(item.metadata).toLowerCase().includes(queryLower)
			);
			
			return filtered
				.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
				.slice(0, limit);
		} catch (error) {
			console.error('KV search failed:', error);
			return [];
		}
	}

	/**
	 * Store terminal protocol in KV for guaranteed persistence
	 */
	async storeTerminalProtocol(protocol: string): Promise<string> {
		return this.store({
			content: protocol,
			type: 'protocol',
			tier: 'critical',
			metadata: {
				protocol_type: 'terminal_handling',
				importance: 'foundational',
				source: 'user_instruction'
			}
		});
	}

	/**
	 * Store violation in KV for guaranteed tracking
	 */
	async storeViolation(violation: {
		rule: string;
		context: string;
		severity: 'minor' | 'major' | 'critical';
	}): Promise<string> {
		return this.store({
			content: `VIOLATION: ${violation.rule} - ${violation.context}`,
			type: 'violation',
			tier: 'critical',
			metadata: {
				rule: violation.rule,
				severity: violation.severity,
				context: violation.context
			}
		});
	}

	/**
	 * Store session state for recovery
	 */
	async storeSessionState(state: Record<string, unknown>): Promise<string> {
		return this.store({
			content: JSON.stringify(state),
			type: 'session_state',
			tier: 'working',
			metadata: {
				session_type: 'working_memory',
				size: JSON.stringify(state).length
			}
		});
	}

	/**
	 * Get all critical items (for recovery scenarios)
	 */
	async getCriticalItems(): Promise<KVMemoryItem[]> {
		const allTypes = ['protocol', 'rule', 'violation'];
		const criticalItems: KVMemoryItem[] = [];
		
		for (const type of allTypes) {
			const items = await this.searchByType(type as KVMemoryItem['type'], 100);
			criticalItems.push(...items.filter(item => item.tier === 'critical'));
		}
		
		return criticalItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}

	/**
	 * Health check - verify KV is operational
	 */
	async healthCheck(): Promise<{ status: 'healthy' | 'failed'; details: string }> {
		try {
			const testId = await this.store({
				content: `Health check ${Date.now()}`,
				type: 'knowledge',
				tier: 'cache',
				metadata: { health_check: true }
			});
			
			const retrieved = await this.get(testId);
			
			if (retrieved && retrieved.content.startsWith('Health check')) {
				return { status: 'healthy', details: `KV operational - test item ${testId}` };
			} else {
				return { status: 'failed', details: 'KV store/retrieve cycle failed' };
			}
		} catch (error) {
			return { status: 'failed', details: `KV error: ${error}` };
		}
	}

	/**
	 * Update type index for faster searches
	 */
	private async updateTypeIndex(type: string, id: string): Promise<void> {
		try {
			const indexKey = `${this.keyPrefix}index:${type}`;
			const existing = await this.kv.get(indexKey);
			
			let index: string[] = existing ? JSON.parse(existing) : [];
			index.unshift(id); // Add to front (newest first)
			index = index.slice(0, 100); // Keep only recent 100
			
			await this.kv.put(indexKey, JSON.stringify(index));
		} catch (error) {
			console.error('Index update failed:', error);
			// Don't throw - index is optimization, not critical
		}
	}

	/**
	 * Export all memory for backup
	 */
	async exportAll(): Promise<KVMemoryItem[]> {
		const allTypes = ['claim', 'violation', 'rule', 'knowledge', 'protocol', 'session_state'];
		const allItems: KVMemoryItem[] = [];
		
		for (const type of allTypes) {
			const items = await this.searchByType(type as KVMemoryItem['type'], 1000);
			allItems.push(...items);
		}
		
		return allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}
}

// Singleton for consistent access
let kvMemoryInstance: KVMemoryLayer | null = null;

export function getKVMemoryLayer(env: KVMemoryEnv): KVMemoryLayer {
	if (!kvMemoryInstance) {
		kvMemoryInstance = new KVMemoryLayer(env);
	}
	return kvMemoryInstance;
}

export function resetKVMemoryLayer(): void {
	kvMemoryInstance = null;
}
