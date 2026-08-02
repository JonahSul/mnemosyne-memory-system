/**
 * WorkersAIEmbeddingAdapter — real embedding provider backed by Workers AI.
 *
 * Uses `@cf/baai/bge-base-en-v1.5` (768-dimensional). No mock fallback —
 * the mock embedding generator from the legacy code is NOT carried forward.
 */

import type { EmbeddingProvider, Embedding } from '@mnemosyne/core';

export interface WorkersAIEmbeddingAdapterConfig {
    readonly ai: Ai;
    readonly model?: string; // default '@cf/baai/bge-base-en-v1.5'
}

export class WorkersAIEmbeddingAdapter implements EmbeddingProvider {
    private readonly ai: Ai;
    private readonly model: string;
    readonly dimension = 768;

    constructor(config: WorkersAIEmbeddingAdapterConfig) {
        this.ai = config.ai;
        this.model = config.model ?? '@cf/baai/bge-base-en-v1.5';
    }

    async embed(text: string): Promise<Embedding> {
        const result = await this.ai.run(this.model, { text: [text] }) as { data: number[][] };
        return result.data[0]!;
    }

    async embedBatch(texts: string[]): Promise<Embedding[]> {
        const result = await this.ai.run(this.model, { text: texts }) as { data: number[][] };
        return result.data;
    }
}
