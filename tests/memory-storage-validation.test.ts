import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MnemosyneMemorySystem } from '../packages/mnemosyne/src/memory-tool';
import { CloudflareVectorStore, type CloudflareSearchResult } from '@mnemosyne-cloudflare/vector-store';
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
        // Return all vectors for simplicity in this mock
        return { matches: Array.from(this.vectors.values()) };
    }
    get count() {
        return this.vectors.size;
    }
}

describe('Memory Storage and Retrieval Validation', () => {
    const mockAI = {
        run: async (_model: string, { text }: { text: string[] }) => {
            return text.map(() => Array(768).fill(0).map(() => Math.random()));
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
