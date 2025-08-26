import { describe, it, expect, beforeEach } from 'vitest';
import { MnemosyneMemorySystem } from '../src/memory-tool';
import { CloudflareVectorStore } from '../src/cloudflare-vector-store';
import { PersistentCoreMemoryManager } from '../src/modules/persistent-core-memory';

// Mock Cloudflare Bindings
class MockKVStore {
    private store = new Map<string, string>();
    async put(key: string, value: string) {
        this.store.set(key, value);
    }
    async get(key: string) {
        return this.store.get(key);
    }
    get size() {
        return this.store.size;
    }
    values() {
        return this.store.values();
    }
}

class MockVectorizeIndex {
    private vectors = new Map<string, any>();
    async upsert(vectors: any[]) {
        vectors.forEach(v => this.vectors.set(v.id, v));
    }
    async query(vector: number[], options: { topK: number }) {
        // Return all vectors for simplicity in this mock
        return { matches: Array.from(this.vectors.values()) };
    }
    get count() {
        return this.vectors.size;
    }
}

const mockEnv = {
    AI: {
        run: async (model: string, { text }: { text: string[] }) => {
            // Return a fixed-size array of arrays of numbers
            return text.map(() => Array(768).fill(0).map(() => Math.random()));
        }
    },
    VECTORIZE_INDEX: new MockVectorizeIndex(),
    MEMORY_KV: new MockKVStore(),
};

describe('Memory Storage and Retrieval Validation', () => {
    let memorySystem: MnemosyneMemorySystem;
    let kvStore: MockKVStore;
    let vectorStore: CloudflareVectorStore;

    beforeEach(() => {
        kvStore = new MockKVStore();
        
        // Correctly instantiate the vector store with the mock environment
        vectorStore = new CloudflareVectorStore({ env: mockEnv as any });

        // Instantiate PersistentCoreMemoryManager with both mocks
        const persistentMemory = new PersistentCoreMemoryManager(vectorStore, kvStore);
        
        // Instantiate the main memory system, passing the persistent manager
        memorySystem = new MnemosyneMemorySystem({
            persistentMemoryManager: persistentMemory,
        });
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
        expect(kvStore.size).toBe(1);

        // 3. Verify Vectorize Storage
        // Note: We access the mock directly. A real test might query.
        const vectorizeIndex = mockEnv.VECTORIZE_INDEX;
        expect(vectorizeIndex.count).toBe(1);

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
        expect(stats.totalMemories).toBe(1);
        expect(stats.claims).toBe(1);
        expect(stats.pending).toBe(1);

        // Also check the underlying mock stores directly
        expect(kvStore.size).toBe(1);
        expect(mockEnv.VECTORIZE_INDEX.count).toBe(1);
    });
});
