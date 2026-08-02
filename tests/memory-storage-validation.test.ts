import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MnemosyneMemorySystem } from '../packages/mnemosyne/src/memory-tool';
import { CloudflareVectorStore, type CloudflareSearchResult } from '@mnemosyne/legacy-cloudflare/vector-store';
import { PersistentCoreMemoryManager } from '../packages/mnemosyne/src/modules/persistent-core-memory';
import { applyFoundationForTests, resetTestMemoryGlobals } from './setup/test-memory-environment';

// Mock Cloudflare Bindings
class MockKVStore {
    private store = new Map<string, string>();
    async put(key: string, value: string): Promise<void> {
        this.store.set(key, value);
    }
    async get(key: string): Promise<string | null> {
        const value = this.store.get(key);
        return value === undefined ? null : value;
    }
    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }
    getSize(): number {
        return this.store.size;
    }
    getValues(): IterableIterator<string> {
        return this.store.values();
    }
}

class MockVectorizeIndex {
    private vectors = new Map<string, any>();
    async upsert(vectors: any[]) {
        vectors.forEach(v => this.vectors.set(v.id, v));
    }
    async query(vector: number[], options: { topK: number }) {
        // Return all vectors with similarity scores
        const topK = options?.topK || 5;
        const results: any[] = [];
        for (const entry of this.vectors.values()) {
            const score = cosineSimilarity(vector, entry.values);
            results.push({ id: entry.id, score, values: entry.values, metadata: entry.metadata });
        }
        results.sort((a, b) => b.score - a.score);
        return { matches: results.slice(0, topK) };
    }
    get count() {
        return this.vectors.size;
    }
}

// Cosine similarity function for mock vector index
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

describe('Memory Storage and Retrieval Validation', () => {
    // Deterministic embedding generation for consistent test results
    function generateDeterministicEmbedding(text: string, dimension = 768): number[] {
        const hash = simpleHash(text);
        const random = seededRandom(hash);
        const embeddings: number[] = [];
        for (let i = 0; i < dimension; i++) {
            embeddings.push((random() - 0.5) * 2);
        }
        const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < embeddings.length; i++) {
                embeddings[i] = embeddings[i] / magnitude;
            }
        }
        return embeddings;
    }

    function simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    function seededRandom(seed: number): () => number {
        let m = 2 ** 35 - 31;
        let a = 185852;
        let s = seed % m;
        return () => (s = s * a % m) / m;
    }

    const mockAI = {
        run: async (_model: string, { text }: { text: string[] }) => {
            return { data: text.map(t => generateDeterministicEmbedding(t)) };
        }
    };

    let memorySystem: MnemosyneMemorySystem;
    let kvStore: MockKVStore;
    let vectorStore: CloudflareVectorStore;
    let env: { AI: typeof mockAI; VECTORIZE_INDEX: MockVectorizeIndex; MEMORY_KV: MockKVStore };

    beforeEach(async () => {
        kvStore = new MockKVStore();
        env = {
            AI: mockAI,
            VECTORIZE_INDEX: new MockVectorizeIndex(),
            MEMORY_KV: kvStore
        };

        vectorStore = new CloudflareVectorStore({ env: env as any });

        // Instantiate PersistentCoreMemoryManager with both mocks
        const persistentMemory = new PersistentCoreMemoryManager(vectorStore, kvStore);

        // Instantiate the main memory system, passing the persistent manager
        memorySystem = new MnemosyneMemorySystem({
            persistentMemoryManager: persistentMemory,
        });

        await applyFoundationForTests(memorySystem);
    });

    afterEach(() => {
        resetTestMemoryGlobals();
    });

    it('should store a memory entry in both KV and Vectorize stores', async () => {
        // 1. Store a new memory item
        const content = "This is a test memory item for validation.";
        const memoryId = await memorySystem.logClaim(content, { testId: 'validation-123' }, 'validation-test');

        expect(memoryId).toBeDefined();

        // 2. Verify KV Storage
        const kvData = await kvStore.get(`memory:${memoryId}`);
        expect(kvData).toBeDefined();
        const parsedKvData = JSON.parse(kvData!);
        expect(parsedKvData.id).toBe(memoryId);
        expect(parsedKvData.content).toBe(content);
        expect(parsedKvData.type).toBe('claim');
        expect(kvStore.getSize()).toBeGreaterThan(0);

        // 3. Verify Vectorize Storage
        const vectorResults: CloudflareSearchResult[] = await vectorStore.searchSimilar(content, { limit: 5, threshold: 0 });
        expect(vectorResults.length).toBeGreaterThan(0);
        expect(vectorResults.some(result => result.metadata?.id === memoryId)).toBe(true);

        // 4. Retrieve the memory to ensure it can be read back
        const searchResults = await memorySystem.searchMemory(content);
        expect(searchResults.length).toBeGreaterThan(0);
        const foundMemory = searchResults.find(m => (m.context as any).id === memoryId);
        expect(foundMemory).toBeDefined();
        expect(foundMemory!.content).toContain(content); // Use toContain for backfilled content
    });

    it('should show correct counts in memory_stats', async () => {
        // Store one item
        await memorySystem.logClaim("Stats test item 1", {}, "stats-test");

        // Get stats
        const stats = await memorySystem.getMemoryStats();

        // The mock implementation of getMemoryStats in PersistentCoreMemoryManager
        // relies on vector search, so we check the total.
        expect(stats.totalMemories).toBeGreaterThan(0);
        expect(stats.claims).toBeGreaterThan(0);
        expect(stats.pending).toBeGreaterThanOrEqual(1);

        // Also check the underlying mock stores directly
        expect(kvStore.getSize()).toBeGreaterThan(0);
        const vectorSearchResults: CloudflareSearchResult[] = await vectorStore.searchSimilar('Stats test item 1', { limit: 5, threshold: 0 });
        expect(vectorSearchResults.length).toBeGreaterThan(0);
    });
});
