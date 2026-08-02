/**
 * R2Adapter — Cloudflare R2 object storage adapter for AutoRAG.
 *
 * Phase 4 will implement the real R2 integration for the AutoRAG bucket.
 */

export interface R2AdapterConfig {
    readonly bucket: R2Bucket;
}

export class R2Adapter {
    private readonly bucket: R2Bucket;

    constructor(config: R2AdapterConfig) {
        this.bucket = config.bucket;
    }

    async put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<void> {
        await this.bucket.put(key, value);
    }

    async get(key: string): Promise<ReadableStream | null> {
        const object = await this.bucket.get(key);
        return object?.body ?? null;
    }

    async delete(key: string): Promise<void> {
        await this.bucket.delete(key);
    }

    async list(prefix?: string): Promise<string[]> {
        const listOptions: R2ListOptions = {};
        if (prefix !== undefined) listOptions.prefix = prefix;
        const result = await this.bucket.list(listOptions);
        return result.objects.map((o) => o.key);
    }
}
