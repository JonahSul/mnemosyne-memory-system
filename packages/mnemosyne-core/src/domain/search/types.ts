import type { Embedding, ShardKey } from '../../shared/index.js';

export interface SearchSpec {
    readonly query: string;
    readonly embedding?: Embedding;
    readonly shardKey?: Partial<ShardKey>;
    readonly tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
    readonly threshold?: number;
    readonly limit?: number;
    readonly requireEvidence?: boolean;
    readonly verificationMethod?: 'manual' | 'automated' | 'cross_reference' | 'inference' | 'any';
}

export interface SearchOptions {
    readonly searchType?: 'exploration' | 'recall' | 'precision' | 'prewarming';
}

export interface RankedResult {
    readonly id: string;
    readonly score: number;
    readonly content: string;
    readonly metadata: Record<string, unknown>;
    readonly tier: string;
}
