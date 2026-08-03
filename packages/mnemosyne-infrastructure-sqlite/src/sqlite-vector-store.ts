/**
 * SqliteVectorStore — real vector store backed by better-sqlite3.
 *
 * Implements the {@link VectorStoreAdapter} port from `@mnemosyne/core`.
 * Uses JSON-serialized embeddings in a single `knowledge` table plus an FTS5
 * virtual table for full-text search. Embeddings must be provided by the
 * caller (via the `EmbeddingProvider` port) — `generateMockEmbedding` from
 * the legacy implementation is NOT carried forward.
 *
 * Extracted from `packages/mnemosyne-sqlite/src/sqlite-vector-store.ts`
 * during Phase 4. The Delegator-style API (`storeKnowledge`, `searchSimilar`,
 * `getById`) is collapsed onto the simpler port methods.
 */

import Database from 'better-sqlite3';
import type {
    Embedding,
    QueryOptions,
    SearchResult,
    ShardKey,
    VectorEntry,
    VectorStoreAdapter,
} from '@mnemosyne/core';

export interface SqliteVectorStoreConfig {
    readonly dbPath: string;
    readonly dimension?: number; // default 768 (BGE-base)
    readonly useWAL?: boolean;
}

export class SqliteVectorStore implements VectorStoreAdapter {
    private readonly db: Database.Database;
    readonly dimension: number;

    constructor(config: SqliteVectorStoreConfig) {
        this.dimension = config.dimension ?? 768;
        this.db = new Database(config.dbPath);
        if (config.useWAL !== false) {
            this.db.pragma('journal_mode = WAL');
        }
        this.initializeSchema();
    }

    private initializeSchema(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS knowledge (
                id TEXT PRIMARY KEY,
                tenant TEXT NOT NULL,
                tier TEXT NOT NULL,
                topic TEXT,
                content TEXT NOT NULL,
                embedding TEXT NOT NULL,
                metadata TEXT NOT NULL,
                tags TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            );

            CREATE INDEX IF NOT EXISTS idx_knowledge_shard ON knowledge(tenant, tier, topic);
            CREATE INDEX IF NOT EXISTS idx_knowledge_timestamp ON knowledge(timestamp);
            CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge(created_at);
        `);

        this.db.exec(`
            CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
                content,
                content_rowid=id,
                tokenize='porter unicode61'
            );

            CREATE TRIGGER IF NOT EXISTS knowledge_fts_insert AFTER INSERT ON knowledge BEGIN
                INSERT INTO knowledge_fts(rowid, content) VALUES (new.rowid, new.content);
            END;

            CREATE TRIGGER IF NOT EXISTS knowledge_fts_delete AFTER DELETE ON knowledge BEGIN
                DELETE FROM knowledge_fts WHERE rowid = old.rowid;
            END;

            CREATE TRIGGER IF NOT EXISTS knowledge_fts_update AFTER UPDATE ON knowledge BEGIN
                DELETE FROM knowledge_fts WHERE rowid = old.rowid;
                INSERT INTO knowledge_fts(rowid, content) VALUES (new.rowid, new.content);
            END;
        `);
    }

    async store(entries: VectorEntry[], shardKey: ShardKey): Promise<void> {
        if (entries.length === 0) return;
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO knowledge
                (id, tenant, tier, topic, content, embedding, metadata, tags, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const tagList = JSON.stringify((shardKey as { tags?: string[] }).tags ?? []);
        const insertOne = this.db.transaction((entry: VectorEntry) => {
            const meta = entry.metadata ?? {};
            const content = typeof meta['content'] === 'string' ? (meta['content'] as string) : '';
            const timestamp = typeof meta['timestamp'] === 'string' ? (meta['timestamp'] as string) : new Date().toISOString();
            stmt.run(
                entry.id,
                shardKey.tenant,
                shardKey.tier,
                shardKey.topic ?? null,
                content,
                JSON.stringify(entry.embedding),
                JSON.stringify(meta),
                tagList,
                timestamp
            );
        });
        for (const entry of entries) insertOne(entry);
    }

    async query(embedding: Embedding, options: QueryOptions, shardKey?: Partial<ShardKey>): Promise<SearchResult[]> {
        const topK = options.topK;
        const threshold = options.threshold ?? 0;

        // Optional filter via shard key, plus optional user-supplied filter merged in.
        const clauses: string[] = [];
        const params: unknown[] = [];
        if (shardKey?.tenant !== undefined) { clauses.push('tenant = ?'); params.push(shardKey.tenant); }
        if (shardKey?.tier !== undefined) { clauses.push('tier = ?'); params.push(shardKey.tier); }
        if (shardKey?.topic !== undefined) { clauses.push('topic = ?'); params.push(shardKey.topic); }
        const where = clauses.length === 0 ? '' : `WHERE ${clauses.join(' AND ')}`;

        const stmt = this.db.prepare(`SELECT id, embedding, metadata FROM knowledge ${where}`);
        const rows = stmt.all(...params) as Array<{ id: string; embedding: string; metadata: string }>;

        const results: SearchResult[] = [];
        for (const row of rows) {
            const stored = JSON.parse(row.embedding) as number[];
            const score = cosineSimilarity(embedding, stored);
            if (score >= threshold) {
                results.push({
                    id: row.id,
                    score,
                    metadata: JSON.parse(row.metadata) as Record<string, unknown>,
                });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    async delete(ids: string[], shardKey?: Partial<ShardKey>): Promise<void> {
        if (ids.length === 0) return;
        const clauses: string[] = [`id IN (${ids.map(() => '?').join(', ')})`];
        const params: unknown[] = [...ids];
        if (shardKey?.tenant !== undefined) { clauses.push('tenant = ?'); params.push(shardKey.tenant); }
        if (shardKey?.tier !== undefined) { clauses.push('tier = ?'); params.push(shardKey.tier); }
        if (shardKey?.topic !== undefined) { clauses.push('topic = ?'); params.push(shardKey.topic); }
        const stmt = this.db.prepare(`DELETE FROM knowledge WHERE ${clauses.join(' AND ')}`);
        stmt.run(...params);
    }

    async count(shardKey?: Partial<ShardKey>): Promise<number> {
        const clauses: string[] = [];
        const params: unknown[] = [];
        if (shardKey?.tenant !== undefined) { clauses.push('tenant = ?'); params.push(shardKey.tenant); }
        if (shardKey?.tier !== undefined) { clauses.push('tier = ?'); params.push(shardKey.tier); }
        if (shardKey?.topic !== undefined) { clauses.push('topic = ?'); params.push(shardKey.topic); }
        const where = clauses.length === 0 ? '' : `WHERE ${clauses.join(' AND ')}`;
        const stmt = this.db.prepare(`SELECT COUNT(*) AS count FROM knowledge ${where}`);
        const row = stmt.get(...params) as { count: number };
        return row.count;
    }

    /** Full-text search (FTS5). Returns results ordered by rank, mapped to similarity in [0,1]. */
    async searchFullText(query: string, limit: number = 10, shardKey?: Partial<ShardKey>): Promise<SearchResult[]> {
        const clauses: string[] = ['knowledge_fts MATCH ?'];
        const params: unknown[] = [query];
        if (shardKey?.tenant !== undefined) { clauses.push('k.tenant = ?'); params.push(shardKey.tenant); }
        if (shardKey?.tier !== undefined) { clauses.push('k.tier = ?'); params.push(shardKey.tier); }
        if (shardKey?.topic !== undefined) { clauses.push('k.topic = ?'); params.push(shardKey.topic); }
        const sql = `
            SELECT k.id, k.metadata, fts.rank AS score
            FROM knowledge_fts fts
            JOIN knowledge k ON k.rowid = fts.rowid
            WHERE ${clauses.join(' AND ')}
            ORDER BY fts.rank
            LIMIT ?
        `;
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params, limit) as Array<{ id: string; metadata: string; score: number }>;
        return rows.map((row) => ({
            id: row.id,
            score: 1.0 / (1.0 + Math.abs(row.score)),
            metadata: JSON.parse(row.metadata) as Record<string, unknown>,
        }));
    }

    /** Close the database connection. */
    close(): void {
        this.db.close();
    }
}

function cosineSimilarity(a: Embedding, b: Embedding): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
        const ai = a[i]!;
        const bi = b[i]!;
        dot += ai * bi;
        na += ai * ai;
        nb += bi * bi;
    }
    const mag = Math.sqrt(na) * Math.sqrt(nb);
    return mag > 0 ? dot / mag : 0;
}
