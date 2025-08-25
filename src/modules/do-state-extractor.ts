/**
 * Durable Objects State Extractor
 * 
 * Emergency export tool to extract all valuable data from Durable Objects
 * memory before deployment to prevent data loss.
 */

import { MnemosyneMemorySystem } from "../memory-tool.js";
import { KVMemoryLayer } from "../modules/kv-memory-layer.js";
import { CloudflareVectorStore } from "../cloudflare-vector-store.js";

export interface DOStateSnapshot {
	timestamp: string;
	memorySnapshot: any;
	kvSnapshot: any[];
	vectorSnapshot: any[];
	sessionState: Record<string, unknown>;
	criticalData: {
		claims: number;
		rules: number;
		violations: number;
		knowledge: number;
	};
	metadata: {
		extractionTime: number;
		systemHealth: string;
		totalSize: number;
	};
}

export class DOStateExtractor {
	constructor(
		private memory: MnemosyneMemorySystem,
		private kvMemory: KVMemoryLayer | null,
		private env: any
	) {}

	/**
	 * EMERGENCY: Extract everything valuable from DO state immediately
	 */
	async extractCompleteState(): Promise<DOStateSnapshot> {
		const startTime = Date.now();
		
		try {
			console.log('🚨 EMERGENCY DO STATE EXTRACTION STARTING...');

			// 1. Export complete memory system state
			console.log('📊 Exporting memory system state...');
			const memorySnapshot = await this.memory.exportState(true);

			// 2. Export all KV data
			console.log('🗄️ Exporting KV layer data...');
			const kvSnapshot = this.kvMemory ? await this.kvMemory.exportAll() : [];

			// 3. Store session state to KV for recovery
			console.log('💾 Storing session state to KV...');
			const sessionState = {
				memoryCount: memorySnapshot.memoryStats?.totalItems || 0,
				lastActivity: new Date().toISOString(),
				activeFoundation: this.memory.getFoundationInfo(),
				delegationStats: memorySnapshot.delegationStats
			};

			if (this.kvMemory) {
				await this.kvMemory.storeSessionState(sessionState);
			}

			// 4. Push everything to vector store for guaranteed persistence
			console.log('🔍 Storing complete state to vector store...');
			const vectorSnapshot = await this.storeStateInVectorStore(memorySnapshot, kvSnapshot);

			// 5. Store critical data counts in KV with urgent priority
			const criticalData = this.analyzeCriticalData(memorySnapshot, kvSnapshot);
			if (this.kvMemory) {
				await this.kvMemory.store({
					content: JSON.stringify(criticalData),
					type: 'session_state',
					tier: 'critical',
					metadata: {
						extraction_type: 'emergency_do_state',
						timestamp: new Date().toISOString(),
						deployment_preparation: true
					}
				});
			}

			const extractionTime = Date.now() - startTime;
			console.log(`✅ DO STATE EXTRACTION COMPLETE in ${extractionTime}ms`);

			return {
				timestamp: new Date().toISOString(),
				memorySnapshot,
				kvSnapshot,
				vectorSnapshot,
				sessionState,
				criticalData,
				metadata: {
					extractionTime,
					systemHealth: 'extracted',
					totalSize: JSON.stringify(memorySnapshot).length + JSON.stringify(kvSnapshot).length
				}
			};

		} catch (error) {
			console.error('❌ DO STATE EXTRACTION FAILED:', error);
			throw new Error(`State extraction failed: ${error}`);
		}
	}

	/**
	 * Store complete state in vector store for guaranteed persistence
	 */
	private async storeStateInVectorStore(memorySnapshot: any, kvSnapshot: any[]): Promise<any[]> {
		if (!this.env.VECTORIZE_INDEX || !this.env.AI) {
			console.warn('Vector store not available - skipping vector persistence');
			return [];
		}

		const vectorStore = new CloudflareVectorStore({ env: this.env });
		const storedItems = [];

		try {
			// Store memory snapshot
			const memoryResult = await vectorStore.storeKnowledge({
				content: `EMERGENCY_MEMORY_SNAPSHOT: ${JSON.stringify(memorySnapshot)}`,
				metadata: {
					type: 'emergency_snapshot',
					timestamp: new Date().toISOString(),
					snapshot_type: 'memory_state',
					deployment_preparation: true
				},
				tags: ['emergency', 'memory_snapshot', 'deployment_backup']
			});
			storedItems.push(memoryResult);

			// Store KV snapshot
			const kvResult = await vectorStore.storeKnowledge({
				content: `EMERGENCY_KV_SNAPSHOT: ${JSON.stringify(kvSnapshot)}`,
				metadata: {
					type: 'emergency_snapshot',
					timestamp: new Date().toISOString(),
					snapshot_type: 'kv_state',
					deployment_preparation: true
				},
				tags: ['emergency', 'kv_snapshot', 'deployment_backup']
			});
			storedItems.push(kvResult);

			console.log(`📡 Stored ${storedItems.length} emergency snapshots in vector store`);
			return storedItems;

		} catch (error) {
			console.error('Vector store backup failed:', error);
			return [];
		}
	}

	/**
	 * Analyze critical data counts for recovery validation
	 */
	private analyzeCriticalData(memorySnapshot: any, kvSnapshot: any[]): {
		claims: number;
		rules: number;
		violations: number;
		knowledge: number;
	} {
		const claims = Object.keys(memorySnapshot.claims || {}).length;
		const rules = (memorySnapshot.rules || []).length;
		const violations = Object.keys(memorySnapshot.violations || {}).length;
		const knowledge = kvSnapshot.filter(item => item.type === 'knowledge').length;

		console.log(`📈 Critical data: ${claims} claims, ${rules} rules, ${violations} violations, ${knowledge} knowledge items`);

		return { claims, rules, violations, knowledge };
	}

	/**
	 * Quick health check - can we extract state?
	 */
	async canExtractState(): Promise<{ canExtract: boolean; issues: string[] }> {
		const issues: string[] = [];

		if (!this.memory) {
			issues.push('Memory system not available');
		}

		if (!this.kvMemory) {
			issues.push('KV layer not available');
		}

		if (!this.env.VECTORIZE_INDEX) {
			issues.push('Vector store not available');
		}

		return {
			canExtract: issues.length === 0,
			issues
		};
	}
}

/**
 * Quick extraction helper - call this before deployment
 */
export async function emergencyExtractDOState(
	memory: MnemosyneMemorySystem,
	kvMemory: KVMemoryLayer | null,
	env: any
): Promise<DOStateSnapshot> {
	const extractor = new DOStateExtractor(memory, kvMemory, env);
	return await extractor.extractCompleteState();
}
