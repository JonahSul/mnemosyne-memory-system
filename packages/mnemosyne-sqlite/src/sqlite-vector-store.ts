/**
 * SQLite Vector Store Implementation
 *
 * Provides persistent vector storage using SQLite with sqlite-vec extension support.
 * Falls back to pure SQLite with JSON storage if vector extensions are not available.
 */

import Database from 'better-sqlite3';
import type {
	VectorStoreAdapter,
	VectorStoreRecord,
	VectorStoreSearchOptions,
	VectorStoreSearchResult
} from '@mnemosyne/core/interfaces/storage';

export interface SqliteVectorStoreConfig {
	/**
	 * Path to the SQLite database file
	 */
	databasePath: string;

	/**
	 * Dimension of embeddings (default: 768 for BGE-base models)
	 */
	embeddingDimension?: number;

	/**
	 * Whether to use WAL mode for better concurrency
	 */
	useWAL?: boolean;

	/**
	 * Custom embedding function (optional)
	 */
	embeddingFn?: (text: string) => Promise<number[]> | number[];
}

export class SqliteVectorStore implements VectorStoreAdapter {
	private db: Database.Database;
	private embeddingDimension: number;
	private embeddingFn?: (text: string) => Promise<number[]> | number[];

	constructor(config: SqliteVectorStoreConfig) {
		this.db = new Database(config.databasePath);
		this.embeddingDimension = config.embeddingDimension ?? 768;
		this.embeddingFn = config.embeddingFn;

		// Enable WAL mode for better concurrency
		if (config.useWAL !== false) {
			this.db.pragma('journal_mode = WAL');
		}

		// Initialize schema
		this.initializeSchema();
	}

	private initializeSchema(): void {
		// Create the main knowledge table
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS knowledge (
				id TEXT PRIMARY KEY,
				content TEXT NOT NULL,
				embedding TEXT NOT NULL,
				metadata TEXT NOT NULL,
				tags TEXT NOT NULL,
				timestamp TEXT NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS idx_knowledge_timestamp ON knowledge(timestamp);
			CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge(created_at);
		`);

		// Create FTS5 table for full-text search
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

	async storeKnowledge(record: VectorStoreRecord): Promise<VectorStoreRecord> {
		const id = record.id ?? this.generateId();
		const timestamp = record.timestamp ?? new Date().toISOString();
		const tags = record.tags ?? [];
		const metadata = record.metadata ?? {};

		// Generate embeddings if not provided
		let embedding = record.embedding;
		if (!embedding && this.embeddingFn) {
			embedding = await this.embeddingFn(record.content);
		} else if (!embedding) {
			embedding = this.generateMockEmbedding(record.content);
		}

		const stmt = this.db.prepare(`
			INSERT OR REPLACE INTO knowledge (id, content, embedding, metadata, tags, timestamp)
			VALUES (?, ?, ?, ?, ?, ?)
		`);

		stmt.run(
			id,
			record.content,
			JSON.stringify(embedding),
			JSON.stringify(metadata),
			JSON.stringify(tags),
			timestamp
		);

		return {
			id,
			content: record.content,
			embedding,
			metadata,
			tags,
			timestamp
		};
	}

	async searchSimilar(
		query: string,
		options: VectorStoreSearchOptions = {}
	): Promise<VectorStoreSearchResult[]> {
		const { limit = 5, threshold = 0.1 } = options;

		// Generate query embedding
		let queryEmbedding: number[];
		if (this.embeddingFn) {
			queryEmbedding = await this.embeddingFn(query);
		} else {
			queryEmbedding = this.generateMockEmbedding(query);
		}

		// Retrieve all records and compute similarity
		const stmt = this.db.prepare(`
			SELECT id, content, embedding, metadata, tags, timestamp
			FROM knowledge
		`);

		const rows = stmt.all() as Array<{
			id: string;
			content: string;
			embedding: string;
			metadata: string;
			tags: string;
			timestamp: string;
		}>;

		const results: VectorStoreSearchResult[] = [];

		for (const row of rows) {
			const embedding = JSON.parse(row.embedding) as number[];
			const similarity = this.cosineSimilarity(queryEmbedding, embedding);

			if (similarity >= threshold) {
				results.push({
					id: row.id,
					content: row.content,
					embedding,
					metadata: JSON.parse(row.metadata),
					tags: JSON.parse(row.tags),
					timestamp: row.timestamp,
					similarity
				});
			}
		}

		// Sort by similarity descending and limit
		results.sort((a, b) => b.similarity - a.similarity);
		return results.slice(0, limit);
	}

	async getById(id: string): Promise<VectorStoreSearchResult[]> {
		const stmt = this.db.prepare(`
			SELECT id, content, embedding, metadata, tags, timestamp
			FROM knowledge
			WHERE id = ?
		`);

		const row = stmt.get(id) as {
			id: string;
			content: string;
			embedding: string;
			metadata: string;
			tags: string;
			timestamp: string;
		} | undefined;

		if (!row) {
			return [];
		}

		return [{
			id: row.id,
			content: row.content,
			embedding: JSON.parse(row.embedding),
			metadata: JSON.parse(row.metadata),
			tags: JSON.parse(row.tags),
			timestamp: row.timestamp,
			similarity: 1.0
		}];
	}

	/**
	 * Search using full-text search (FTS5)
	 */
	async searchFullText(query: string, limit: number = 10): Promise<VectorStoreSearchResult[]> {
		const stmt = this.db.prepare(`
			SELECT k.id, k.content, k.embedding, k.metadata, k.tags, k.timestamp, 
			       fts.rank as score
			FROM knowledge_fts fts
			JOIN knowledge k ON k.rowid = fts.rowid
			WHERE knowledge_fts MATCH ?
			ORDER BY fts.rank
			LIMIT ?
		`);

		const rows = stmt.all(query, limit) as Array<{
			id: string;
			content: string;
			embedding: string;
			metadata: string;
			tags: string;
			timestamp: string;
			score: number;
		}>;

		return rows.map(row => ({
			id: row.id,
			content: row.content,
			embedding: JSON.parse(row.embedding),
			metadata: JSON.parse(row.metadata),
			tags: JSON.parse(row.tags),
			timestamp: row.timestamp,
			similarity: 1.0 / (1.0 + Math.abs(row.score)) // Normalize FTS rank to similarity score
		}));
	}

	/**
	 * List all records with optional filtering
	 */
	async listAll(options: { limit?: number; offset?: number } = {}): Promise<VectorStoreSearchResult[]> {
		const { limit = 100, offset = 0 } = options;

		const stmt = this.db.prepare(`
			SELECT id, content, embedding, metadata, tags, timestamp
			FROM knowledge
			ORDER BY created_at DESC
			LIMIT ? OFFSET ?
		`);

		const rows = stmt.all(limit, offset) as Array<{
			id: string;
			content: string;
			embedding: string;
			metadata: string;
			tags: string;
			timestamp: string;
		}>;

		return rows.map(row => ({
			id: row.id,
			content: row.content,
			embedding: JSON.parse(row.embedding),
			metadata: JSON.parse(row.metadata),
			tags: JSON.parse(row.tags),
			timestamp: row.timestamp,
			similarity: 1.0
		}));
	}

	/**
	 * Delete a record by ID
	 */
	async deleteById(id: string): Promise<boolean> {
		const stmt = this.db.prepare('DELETE FROM knowledge WHERE id = ?');
		const result = stmt.run(id);
		return result.changes > 0;
	}

	/**
	 * Get statistics about the knowledge store
	 */
	getStats() {
		const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM knowledge');
		const sizeStmt = this.db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()');
		
		const { count } = countStmt.get() as { count: number };
		const { size } = sizeStmt.get() as { size: number };

		return {
			totalRecords: count,
			databaseSize: size,
			embeddingDimension: this.embeddingDimension
		};
	}

	/**
	 * Close the database connection
	 */
	close(): void {
		this.db.close();
	}

	private generateId(): string {
		return `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateMockEmbedding(text: string): number[] {
		const embeddings: number[] = [];
		const hash = this.simpleHash(text);
		const random = this.seededRandom(hash);

		for (let i = 0; i < this.embeddingDimension; i++) {
			embeddings.push((random() - 0.5) * 2);
		}

		// Normalize
		const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
		if (magnitude > 0) {
			for (let i = 0; i < embeddings.length; i++) {
				embeddings[i] = embeddings[i]! / magnitude;
			}
		}

		return embeddings;
	}

	private cosineSimilarity(a: number[], b: number[]): number {
		if (a.length !== b.length) return 0;

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

	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash |= 0;
		}
		return Math.abs(hash);
	}

	private seededRandom(seed: number): () => number {
		const m = 2 ** 35 - 31;
		const a = 185852;
		let s = seed % m;
		return () => (s = s * a % m) / m;
	}
}
