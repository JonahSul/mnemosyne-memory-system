/**
 * SqliteKVStore — key-value store backed by SQLite tables.
 *
 * A real alternative to Cloudflare KV for local/CLI use.
 */

import type { KeyValueStoreAdapter } from '@mnemosyne/core';

export interface SqliteKVStoreConfig {
    readonly dbPath: string;
    readonly tableName?: string;
}

export class SqliteKVStore implements KeyValueStoreAdapter {
    constructor(config: SqliteKVStoreConfig) {
        // Phase 4: real implementation
        throw new Error('SqliteKVStore: not yet implemented (Phase 4)');
    }

    async get<T>(key: string): Promise<T | null> {
        throw new Error('SqliteKVStore.get: not yet implemented (Phase 4)');
    }

    async put<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
        throw new Error('SqliteKVStore.put: not yet implemented (Phase 4)');
    }

    async delete(key: string): Promise<void> {
        throw new Error('SqliteKVStore.delete: not yet implemented (Phase 4)');
    }

    async list(prefix: string, options?: { limit?: number; cursor?: string }): Promise<{ keys: string[]; cursor?: string }> {
        throw new Error('SqliteKVStore.list: not yet implemented (Phase 4)');
    }
}
