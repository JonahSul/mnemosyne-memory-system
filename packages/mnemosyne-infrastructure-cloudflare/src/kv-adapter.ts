/**
 * KVAdapter — real Cloudflare KV Namespace key-value store.
 *
 * Replaces the legacy `kv: {} as any` stub in federation-auth.ts.
 * Requires a real KV namespace binding.
 */

import type { KeyValueStoreAdapter } from '@mnemosyne/core';

export interface KVAdapterConfig {
    readonly namespace: KVNamespace;
}

export class KVAdapter implements KeyValueStoreAdapter {
    private readonly kv: KVNamespace;

    constructor(config: KVAdapterConfig) {
        this.kv = config.namespace;
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.kv.get(key, 'json');
        return (value as T | null) ?? null;
    }

    async put<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
        const putOptions: KVNamespacePutOptions = {};
        if (options?.ttl !== undefined) {
            putOptions.expirationTtl = options.ttl;
        }
        await this.kv.put(key, JSON.stringify(value), putOptions);
    }

    async delete(key: string): Promise<void> {
        await this.kv.delete(key);
    }

    async list(prefix: string, options?: { limit?: number; cursor?: string }): Promise<{ keys: string[]; cursor?: string }> {
        const listOptions: KVNamespaceListOptions = { prefix };
        if (options?.limit !== undefined) listOptions.limit = options.limit;
        if (options?.cursor !== undefined) listOptions.cursor = options.cursor;
        const result = await this.kv.list(listOptions);
        return {
            keys: result.keys.map((k) => k.name),
            cursor: result.list_complete ? undefined : result.cursor,
        };
    }
}
