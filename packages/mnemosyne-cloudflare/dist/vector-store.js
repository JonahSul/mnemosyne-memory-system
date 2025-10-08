/**
 * Cloudflare Vectorize Integration
 *
 * Production-ready vector storage using Cloudflare AI Workers for embeddings
 * and Vectorize for vector database operations.
 */
export class CloudflareVectorStore {
    env;
    indexName;
    accountId;
    apiToken;
    localKnowledge = new Map();
    useFallbackLocal = false;
    constructor(config = {}) {
        this.env = config.env || {};
        this.indexName = config.indexName ?? this.indexName;
        this.accountId = config.accountId ?? this.accountId;
        this.apiToken = config.apiToken ?? this.apiToken;
        this.useFallbackLocal = !(this.env && this.env.VECTORIZE_INDEX && this.env.AI);
        const nodeEnv = globalThis.NODE_ENV || config.nodeEnv;
        const useShim = (globalThis.__VECTORIZE_TEST_SHIM === '1') || nodeEnv === 'test' || !!config.useTestShim;
        if (useShim) {
            const store = new Map();
            const ai = {
                run: async (_model, payload) => {
                    const text = Array.isArray(payload?.text) ? payload.text[0] : String(payload?.text || '');
                    return { data: [this.generateMockEmbeddings(text)] };
                }
            };
            const vectorIndex = {
                upsert: async (items) => {
                    for (const item of items) {
                        store.set(item.id, { id: item.id, values: item.values, metadata: item.metadata });
                    }
                    return { success: true };
                },
                query: async (embedding, options) => {
                    const topK = options?.topK || options?.top_k || 5;
                    const results = [];
                    for (const entry of store.values()) {
                        const score = this.cosineSimilarity(embedding, entry.values);
                        results.push({ id: entry.id, score, values: entry.values, metadata: entry.metadata });
                    }
                    results.sort((a, b) => b.score - a.score);
                    return { matches: results.slice(0, topK) };
                }
            };
            this.env = { VECTORIZE_INDEX: vectorIndex, AI: ai };
            this.useFallbackLocal = false;
        }
    }
    async generateEmbeddings(text) {
        if (!this.env || !this.env.AI || typeof this.env.AI.run !== 'function') {
            return this.generateMockEmbeddings(text);
        }
        const response = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [text] });
        if (!response?.data?.[0]) {
            console.warn('Cloudflare AI returned no embeddings; falling back to mock embeddings');
            return this.generateMockEmbeddings(text);
        }
        return response.data[0];
    }
    async storeKnowledge(record) {
        const id = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        const embedding = await this.generateEmbeddings(record.content);
        const vectorizeRecord = {
            id,
            values: embedding,
            metadata: {
                content: record.content,
                timestamp,
                tags: record.tags || [],
                ...record.metadata
            }
        };
        if (this.env && this.env.VECTORIZE_INDEX && typeof this.env.VECTORIZE_INDEX.upsert === 'function') {
            try {
                await this.env.VECTORIZE_INDEX.upsert([vectorizeRecord]);
            }
            catch (error) {
                console.warn('Vectorize storage upsert failed; falling back to local cache:', error);
            }
        }
        else if (!this.useFallbackLocal) {
            console.warn('Vectorize binding missing in non-dev environment; using local fallback (NOT persistent)');
        }
        const result = {
            id,
            content: record.content,
            embedding,
            metadata: record.metadata || {},
            tags: record.tags || [],
            timestamp,
            vectorizeId: id
        };
        if (this.useFallbackLocal) {
            this.localKnowledge.set(id, result);
        }
        return result;
    }
    async searchSimilar(query, options = {}) {
        const { limit = 5, threshold = 0.1 } = options;
        let queryEmbedding;
        try {
            queryEmbedding = await this.generateEmbeddings(query);
        }
        catch (error) {
            console.error('Failed to generate query embedding:', error);
            return [];
        }
        if (this.env && this.env.VECTORIZE_INDEX && typeof this.env.VECTORIZE_INDEX.query === 'function') {
            try {
                const matches = await this.env.VECTORIZE_INDEX.query(queryEmbedding, {
                    topK: limit,
                    returnValues: true,
                    returnMetadata: true
                });
                const results = [];
                for (const match of matches.matches) {
                    if (match.score >= threshold && match.metadata) {
                        results.push({
                            id: match.id,
                            content: match.metadata.content,
                            embedding: Array.from(match.values || []),
                            metadata: match.metadata,
                            tags: match.metadata.tags || [],
                            timestamp: match.metadata.timestamp,
                            vectorizeId: match.id,
                            similarity: match.score
                        });
                    }
                }
                return results;
            }
            catch (error) {
                console.warn('Vectorize query failed, falling back to local search:', error);
                return this.searchLocal(query, queryEmbedding, options);
            }
        }
        return this.searchLocal(query, queryEmbedding, options);
    }
    async getById(id) {
        if (this.useFallbackLocal) {
            const stored = this.localKnowledge.get(id);
            if (!stored)
                return [];
            return [{ ...stored, similarity: 1 }];
        }
        if (this.env && this.env.VECTORIZE_INDEX && typeof this.env.VECTORIZE_INDEX.query === 'function') {
            try {
                const embedding = await this.generateEmbeddings(id);
                const matches = await this.env.VECTORIZE_INDEX.query(embedding, {
                    topK: 1,
                    returnValues: true,
                    returnMetadata: true
                });
                if (!matches?.matches)
                    return [];
                return matches.matches.map((match) => ({
                    id: match.id,
                    content: match.metadata?.content,
                    embedding: Array.from(match.values || []),
                    metadata: match.metadata || {},
                    tags: match.metadata?.tags || [],
                    timestamp: match.metadata?.timestamp,
                    vectorizeId: match.id,
                    similarity: match.score
                }));
            }
            catch (error) {
                console.warn('Vectorize getById fallback failed:', error);
                return [];
            }
        }
        return [];
    }
    isConfigured() {
        if (this.indexName && this.apiToken)
            return true;
        return !!(this.env && this.env.VECTORIZE_INDEX && this.env.AI);
    }
    getIndexName() {
        return this.indexName || 'VECTORIZE_INDEX';
    }
    getStats() {
        return {
            localItems: this.localKnowledge.size,
            configured: this.isConfigured(),
            indexName: this.getIndexName(),
            embeddingDimensions: 768
        };
    }
    searchLocal(query, queryEmbedding, options) {
        const { limit = 5, threshold = 0.1 } = options;
        const results = [];
        for (const stored of this.localKnowledge.values()) {
            const similarity = this.cosineSimilarity(queryEmbedding, stored.embedding);
            if (similarity >= threshold) {
                results.push({ ...stored, similarity });
            }
        }
        return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
    }
    generateMockEmbeddings(text) {
        const dimension = 768;
        const embeddings = [];
        const hash = this.simpleHash(text);
        const random = this.seededRandom(hash);
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
    cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const valA = a[i];
            const valB = b[i];
            if (valA !== undefined && valB !== undefined) {
                dotProduct += valA * valB;
                normA += valA * valA;
                normB += valB * valB;
            }
        }
        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        return magnitude > 0 ? dotProduct / magnitude : 0;
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }
    seededRandom(seed) {
        let m = 2 ** 35 - 31;
        let a = 185852;
        let s = seed % m;
        return () => (s = s * a % m) / m;
    }
}
