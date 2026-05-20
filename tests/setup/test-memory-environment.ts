import { MnemosyneMemorySystem } from '../../packages/mnemosyne/src/memory-tool';
import { InMemoryKeyValueStore, InMemoryVectorStoreAdapter } from '../../packages/mnemosyne/src/modules/in-memory-adapters';
import { applyFoundationMigration, foundationMigrationV1, foundationMigrationV1_2, foundationMigrationV1_4_1, type FoundationMigration } from '../../packages/mnemosyne/src/migrations/foundation';
import { foundationMigrationV15 } from '../../packages/mnemosyne/src/migrations/foundation-v1.5.0-fixed';
import { initializeWithEnv, simplifiedMemoryTools } from '../../src/tools/simplified-registry';

type VectorRecord = { id: string; values: number[]; metadata: Record<string, unknown> };

export interface WorkerEnvStub {
	MEMORY_KV: InMemoryKeyValueStore;
	VECTORIZE_INDEX: {
		upsert: (items: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }>) => Promise<{ success: boolean }>;
		query: (embedding: number[], options?: Record<string, unknown>) => Promise<{ matches: Array<{ id: string; score: number; values: number[]; metadata: Record<string, unknown> }> }>;
	};
	AI: {
		run: (model: string, payload: { text: string[] }) => Promise<{ data: number[][] }>;
	};
}

export interface MemoryTestContext {
	memory: MnemosyneMemorySystem;
	kvStore: InMemoryKeyValueStore;
	vectorStore: InMemoryVectorStoreAdapter;
	workerEnv: WorkerEnvStub;
}

const DEFAULT_FOUNDATION_MIGRATIONS: FoundationMigration[] = [
	foundationMigrationV1,
	foundationMigrationV1_2,
	foundationMigrationV1_4_1,
	foundationMigrationV15 as unknown as FoundationMigration
];

export async function applyFoundationForTests(memory: MnemosyneMemorySystem, migrations?: FoundationMigration[]): Promise<void> {
	const selectedMigrations = migrations ?? DEFAULT_FOUNDATION_MIGRATIONS;
	for (const migration of selectedMigrations) {
		await applyFoundationMigration(memory as any, migration);
	}
}

export async function bootstrapTestMemorySystem(options: {
	applyFoundation?: boolean;
	migrations?: FoundationMigration[];
	exposeMemoryTools?: boolean;
} = {}): Promise<MemoryTestContext> {
	const kvStore = new InMemoryKeyValueStore();
	const vectorStore = new InMemoryVectorStoreAdapter();
	const workerEnv = createWorkerEnvStub(kvStore);

	initializeWithEnv(workerEnv);

	const memory = new MnemosyneMemorySystem({
		kvStore,
		vectorStore
	});

	(globalThis as any).getMemoryInstance = () => memory;

	if (options.exposeMemoryTools !== false) {
		(globalThis as any).memoryTools = simplifiedMemoryTools;
	}

	if (options.applyFoundation !== false) {
		await applyFoundationForTests(memory, options.migrations);
	}

	return { memory, kvStore, vectorStore, workerEnv };
}

export function resetTestMemoryGlobals(): void {
	delete (globalThis as any).getMemoryInstance;
	delete (globalThis as any).memoryTools;
}

function createWorkerEnvStub(kvStore: InMemoryKeyValueStore): WorkerEnvStub {
	const vectorRecords = new Map<string, VectorRecord>();

	const VECTORIZE_INDEX = {
		async upsert(items: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }>) {
			for (const item of items) {
				vectorRecords.set(item.id, {
					id: item.id,
					values: item.values,
					metadata: item.metadata
				});
			}
			return { success: true };
		},
		async query(embedding: number[], options: Record<string, unknown> = {}) {
			const topK = typeof options.topK === 'number' ? options.topK : typeof options.top_k === 'number' ? options.top_k : 5;
			const matches = Array.from(vectorRecords.values())
				.map(record => ({
					id: record.id,
					score: cosineSimilarity(embedding, record.values),
					values: record.values,
					metadata: record.metadata
				}))
				.sort((a, b) => b.score - a.score)
				.slice(0, topK);
			return { matches };
		}
	} as WorkerEnvStub['VECTORIZE_INDEX'];

	const AI = {
		async run(_model: string, payload: { text: string[] }) {
			const source = Array.isArray(payload?.text) ? payload.text.join(' ') : '';
			return { data: [generateDeterministicEmbedding(source)] };
		}
	} as WorkerEnvStub['AI'];

	return {
		MEMORY_KV: kvStore,
		VECTORIZE_INDEX,
		AI
	};
}

function generateDeterministicEmbedding(text: string, dimension = 64): number[] {
	const seed = simpleHash(text || 'mnemosyne');
	const random = seededRandom(seed);
	const vector: number[] = [];

	for (let i = 0; i < dimension; i++) {
		vector.push(random() * 2 - 1);
	}

	const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
	if (!magnitude) {
		return vector;
	}
	return vector.map(value => value / magnitude);
}

function cosineSimilarity(a: number[], b: number[]): number {
	if (!a.length || !b.length || a.length !== b.length) {
		return 0;
	}

	let dot = 0;
	let magA = 0;
	let magB = 0;

	for (let i = 0; i < a.length; i++) {
		const valueA = a[i] ?? 0;
		const valueB = b[i] ?? 0;
		dot += valueA * valueB;
		magA += valueA * valueA;
		magB += valueB * valueB;
	}

	const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
	return magnitude ? dot / magnitude : 0;
}

function simpleHash(value: string): number {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash) + 1;
}

function seededRandom(seed: number): () => number {
	let current = seed % 2147483647;
	if (current <= 0) {
		current += 2147483646;
	}
	return () => {
		current = (current * 16807) % 2147483647;
		return (current - 1) / 2147483646;
	};
}

