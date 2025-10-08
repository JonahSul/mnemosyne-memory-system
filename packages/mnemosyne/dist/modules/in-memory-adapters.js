/**
 * Lightweight in-memory KeyValue store for testing and local development.
 */
export class InMemoryKeyValueStore {
    store = new Map();
    async put(key, value) {
        this.store.set(key, value);
    }
    async get(key) {
        return this.store.has(key) ? this.store.get(key) : null;
    }
    async delete(key) {
        this.store.delete(key);
    }
    async list() {
        return Array.from(this.store.keys());
    }
    getSize() {
        return this.store.size;
    }
    clear() {
        this.store.clear();
    }
}
/**
 * Simple in-memory VectorStore adapter used to satisfy Mnemosyne dependencies during tests.
 */
export class InMemoryVectorStoreAdapter {
    records = new Map();
    async storeKnowledge(record) {
        const id = record.id ?? this.generateId();
        const stored = {
            ...record,
            id
        };
        this.records.set(id, stored);
        return stored;
    }
    async searchSimilar(query, options = {}) {
        const normalized = query.replace(/-testing/g, '').trim().toLowerCase();
        const matches = Array.from(this.records.values()).filter(record => {
            if (normalized === '' || normalized === '*') {
                return true;
            }
            const baseContent = record.content?.toLowerCase() ?? '';
            if (baseContent.includes(normalized)) {
                return true;
            }
            const metadataValues = Object.values(record.metadata ?? {});
            return metadataValues.some(value => typeof value === 'string' && value.toLowerCase().includes(normalized));
        });
        const limited = matches.slice(0, options.limit ?? matches.length);
        return limited.map(record => ({
            id: record.id,
            content: record.content,
            metadata: record.metadata ?? {},
            tags: record.tags ?? [],
            similarity: 0.9,
            ...(record.embedding ? { embedding: record.embedding } : {}),
            ...(record.timestamp ? { timestamp: record.timestamp } : {})
        }));
    }
    async getById(id) {
        const record = this.records.get(id);
        if (!record) {
            return [];
        }
        return [{
                id,
                content: record.content,
                metadata: record.metadata ?? {},
                tags: record.tags ?? [],
                similarity: 1,
                ...(record.embedding ? { embedding: record.embedding } : {}),
                ...(record.timestamp ? { timestamp: record.timestamp } : {})
            }];
    }
    getCount() {
        return this.records.size;
    }
    clear() {
        this.records.clear();
    }
    generateId() {
        const globalCrypto = globalThis;
        if (globalCrypto.crypto && typeof globalCrypto.crypto.randomUUID === 'function') {
            return globalCrypto.crypto.randomUUID();
        }
        return `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
}
