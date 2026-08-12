/**
 * SqliteKVStore — key-value store backed by SQLite.
 *
 * Implements the {@link KeyValueStoreAdapter} port from `@mnemosyne/core`.
 * Uses a `(key TEXT PK, value TEXT, expires_at INTEGER)` table with
 * transparent TTL handling. Suitable for local/CLI use where Cloudflare KV
 * is unavailable.
 */

import Database from 'better-sqlite3';
import type { KeyValueStoreAdapter } from '@mnemosyne/core';

export interface SqliteKVStoreConfig {
    readonly dbPath: string;
    readonly tableName?: string; // default 'mnemosyne_kv'
    readonly useWAL?: boolean;
}

interface KVRow {
    readonly value: string;
    readonly expires_at: number | null;
}

export class SqliteKVStore implements KeyValueStoreAdapter {
    private readonly db: Database.Database;
    private readonly table: string;

    constructor(config: SqliteKVStoreConfig) {
        this.table = config.tableName ?? 'mnemosyne_kv';
        this.db = new Database(config.dbPath);
        if (config.useWAL !== false) {
            this.db.pragma('journal_mode = WAL');
        }
        this.initializeSchema();
    }

    private initializeSchema(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ${this.table} (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                expires_at INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_${this.table}_prefix ON ${this.table}(key);
            CREATE INDEX IF NOT EXISTS idx_${this.table}_expires ON ${this.table}(expires_at);
        `);
    }

    async get<T>(key: string): Promise<T | null> {
        const stmt = this.db.prepare(`SELECT value, expires_at FROM ${this.table} WHERE key = ?`);
        const row = stmt.get(key) as KVRow | undefined;
        if (!row) return null;
        if (row.expires_at !== null && row.expires_at < Date.now()) {
            await this.delete(key);
            return null;
        }
        return JSON.parse(row.value) as T;
    }

    async put<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
        const expiresAt = options?.ttl !== undefined ? Date.now() + options.ttl * 1000 : null;
        const stmt = this.db.prepare(`
            INSERT INTO ${this.table} (key, value, expires_at) VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at
        `);
        stmt.run(key, JSON.stringify(value), expiresAt);
    }

    async delete(key: string): Promise<void> {
        const stmt = this.db.prepare(`DELETE FROM ${this.table} WHERE key = ?`);
        stmt.run(key);
    }

    async list(prefix: string, options?: { limit?: number; cursor?: string }): Promise<{ keys: string[]; cursor?: string }> {
        const limit = options?.limit ?? 1000;
        // cursor is treated as an offset for SQLite (no native pagination cursors).
        const offset = options?.cursor ? Number.parseInt(options.cursor, 10) : 0;
        const stmt = this.db.prepare(`
            SELECT key FROM ${this.table}
            WHERE key LIKE ? AND (expires_at IS NULL OR expires_at > ?)
            ORDER BY key
            LIMIT ? OFFSET ?
        `);
        const rows = stmt.all(`${prefix}%`, Date.now(), limit, offset) as Array<{ key: string }>;
        const nextOffset = offset + rows.length;
        return {
            keys: rows.map((r) => r.key),
            cursor: rows.length === limit ? String(nextOffset) : undefined,
        };
    }

    /** Close the database connection. */
    close(): void {
        this.db.close();
    }
}
