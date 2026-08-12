/**
 * Tier management service — domain service for multi-tier memory operations.
 *
 * KV-first write-through architecture with optional vector backup for semantic
 * search. Handles storage, search, promotion, demotion, and pruning across the
 * four-tier persistence model (axiom / long / intermediate / short).
 *
 * Extracted from the legacy `modules/persistent-tier-memory.ts` during Phase 2.
 * Delegates all I/O to injected KeyValueStoreAdapter and VectorStoreAdapter
 * ports from the shared kernel. No I/O knowledge lives inside this service.
 */

import type {
    Embedding,
    KeyValueStoreAdapter,
    MemoryId,
    MemoryTier,
    ShardKey,
    VectorEntry,
    VectorStoreAdapter,
} from '../../shared/index.js';
import type {
    PersistenceLevel,
    PromotionCandidate,
    PruningStrategy,
    TierItem,
    TierLimits,
    TierStats,
    WeightHistoryEntry,
} from './types.js';

export const DEFAULT_TIER_LIMITS: Record<MemoryTier, TierLimits> = {
    axiom: { maxItems: 100, retentionHours: Number.POSITIVE_INFINITY, accessThreshold: 0, pruningStrategy: 'importance', persistenceLevel: 'critical_protected' },
    long: { maxItems: 1000, retentionHours: 8760, accessThreshold: 0, pruningStrategy: 'importance', persistenceLevel: 'kv_vector' },
    intermediate: { maxItems: 200, retentionHours: 24, accessThreshold: 5, pruningStrategy: 'frequency', persistenceLevel: 'kv_vector' },
    short: { maxItems: 50, retentionHours: 2, accessThreshold: 3, pruningStrategy: 'lru', persistenceLevel: 'kv_only' },
};

const PROMOTION_PATHS: ReadonlyArray<{ readonly from: MemoryTier; readonly to: MemoryTier }> = [
    { from: 'short', to: 'intermediate' },
    { from: 'intermediate', to: 'long' },
    { from: 'long', to: 'axiom' },
];

const TIER_BOOST: Record<MemoryTier, number> = { axiom: 1.0, long: 0.8, intermediate: 0.6, short: 0.4 };
const ALL_TIERS: readonly MemoryTier[] = ['axiom', 'long', 'intermediate', 'short'];

export interface StoreKnowledgeParams {
    readonly content: string;
    readonly metadata?: Record<string, unknown>;
    readonly tags?: readonly string[];
    readonly importance: number;
    readonly targetTier?: MemoryTier;
    readonly embedding?: Embedding;
    readonly shardKey: ShardKey;
}

export interface TierServiceConfig {
    readonly kvStore: KeyValueStoreAdapter;
    readonly vectorStore: VectorStoreAdapter;
    readonly keyPrefix: string;
    readonly policies?: Partial<Record<MemoryTier, Partial<TierLimits>>>;
}

interface ItemLocation { readonly tenant: string; readonly tier: MemoryTier }

export class TierManagementService {
    private readonly kvStore: KeyValueStoreAdapter;
    private readonly vectorStore: VectorStoreAdapter;
    private readonly keyPrefix: string;
    private readonly limits: Map<MemoryTier, TierLimits>;

    constructor(config: TierServiceConfig) {
        this.kvStore = config.kvStore;
        this.vectorStore = config.vectorStore;
        this.keyPrefix = config.keyPrefix;
        this.limits = new Map<MemoryTier, TierLimits>();
        for (const tier of ALL_TIERS) {
            const base = DEFAULT_TIER_LIMITS[tier];
            const override = config.policies?.[tier];
            this.limits.set(tier, override ? { ...base, ...override } : base);
        }
    }

    async storeKnowledge(params: StoreKnowledgeParams): Promise<MemoryId> {
        const tier = params.targetTier ?? this.determineTier(params.importance);
        const limits = this.limits.get(tier) ?? DEFAULT_TIER_LIMITS[tier];
        const id = this.generateId(tier);
        const timestamp = new Date().toISOString();
        const kvKey = this.buildItemKey(params.shardKey.tenant, tier, id);

        const weightHistory: WeightHistoryEntry[] = [{ timestamp, significance: params.importance, semantic: 0.5, combined: params.importance * 0.8, reason: 'initial_storage' }];

        const item: TierItem = {
            id, content: params.content, embedding: params.embedding, metadata: params.metadata ?? {},
            tags: params.tags ? [...params.tags] : [], timestamp, tier, accessCount: 0, lastAccessed: timestamp,
            importance: params.importance, promotionEligible: tier !== 'axiom',
            significanceWeight: params.importance, semanticWeight: 0.5, combinedWeight: params.importance * 0.8,
            weightHistory, kvKey, persistenceLevel: limits.persistenceLevel,
            ttlSeconds: tier === 'short' && Number.isFinite(limits.retentionHours) ? limits.retentionHours * 3600 : undefined,
        };

        await this.kvStore.put<TierItem>(kvKey, item, { ttl: item.ttlSeconds });
        await this.kvStore.put<ItemLocation>(this.buildIdMapKey(id), { tenant: params.shardKey.tenant, tier });

        if (limits.persistenceLevel !== 'kv_only' && params.embedding && params.embedding.length > 0) {
            try {
                const entry: VectorEntry = { id, embedding: params.embedding, metadata: { ...item.metadata, id, content: params.content, tier, kvKey, timestamp, importance: params.importance, persistenceLevel: limits.persistenceLevel, tags: item.tags } };
                await this.vectorStore.store([entry], { ...params.shardKey, tier });
            } catch { /* KV is primary; vector is enhancement */ }
        }

        await this.updateTierIndex(params.shardKey.tenant, tier, id);
        return id;
    }

    async get(id: MemoryId): Promise<TierItem | null> {
        const location = await this.kvStore.get<ItemLocation>(this.buildIdMapKey(id));
        if (!location) return null;
        const kvKey = this.buildItemKey(location.tenant, location.tier, id);
        const item = await this.kvStore.get<TierItem>(kvKey);
        if (!item) return null;
        const updated: TierItem = { ...item, accessCount: item.accessCount + 1, lastAccessed: new Date().toISOString() };
        await this.kvStore.put<TierItem>(kvKey, updated, { ttl: updated.ttlSeconds });
        return updated;
    }

    async search(query: string, limit: number, shardKey: ShardKey): Promise<TierItem[]> {
        const needle = query.toLowerCase();
        const found = new Map<MemoryId, TierItem>();
        for (const tier of ALL_TIERS) {
            if (found.size >= limit) break;
            try {
                const ids = await this.readTierIndex(shardKey.tenant, tier);
                for (const id of ids) {
                    if (found.size >= limit) break;
                    const item = await this.fetchRaw(shardKey.tenant, tier, id);
                    if (item && item.content.toLowerCase().includes(needle)) found.set(id, item);
                }
            } catch { /* Continue to next tier */ }
        }
        if (found.size < limit) {
            const seed = [...found.values()].find((i) => i.embedding && i.embedding.length > 0);
            if (seed && seed.embedding) {
                try {
                    const results = await this.vectorStore.query(seed.embedding, { topK: limit - found.size }, { tenant: shardKey.tenant });
                    for (const r of results) {
                        const rid = r.metadata?.id;
                        if (typeof rid !== 'string' || found.has(rid)) continue;
                        const item = await this.get(rid);
                        if (item) found.set(rid, item);
                        if (found.size >= limit) break;
                    }
                } catch { /* Vector search is enhancement only */ }
            }
        }
        const ranked = [...found.values()].map((item) => ({ item, score: item.importance * (TIER_BOOST[item.tier] ?? 0.5) }));
        ranked.sort((a, b) => b.score - a.score);
        return ranked.slice(0, limit).map((r) => r.item);
    }

    async getStats(shardKey: ShardKey): Promise<TierStats[]> {
        const stats: TierStats[] = [];
        for (const tier of ALL_TIERS) {
            const items = await this.listTierItems(shardKey.tenant, tier);
            const config = this.limits.get(tier) ?? DEFAULT_TIER_LIMITS[tier];
            if (items.length === 0) { stats.push({ name: tier, itemCount: 0, config }); continue; }
            let oldest = items[0]!, newest = items[0]!;
            for (const it of items) { if (it.timestamp < oldest.timestamp) oldest = it; if (it.timestamp > newest.timestamp) newest = it; }
            stats.push({ name: tier, itemCount: items.length, config, oldestItem: oldest.timestamp, newestItem: newest.timestamp, averageImportance: items.reduce((s, it) => s + it.importance, 0) / items.length });
        }
        return stats;
    }

    async findPromotionCandidates(shardKey: ShardKey): Promise<PromotionCandidate[]> {
        const candidates: PromotionCandidate[] = [];
        for (const path of PROMOTION_PATHS) {
            const limits = this.limits.get(path.from) ?? DEFAULT_TIER_LIMITS[path.from];
            const items = await this.listTierItems(shardKey.tenant, path.from);
            for (const item of items) {
                if (item.promotionEligible && item.accessCount >= limits.accessThreshold) {
                    candidates.push({ id: item.id, fromTier: path.from, toTier: path.to, reason: 'frequency', score: item.accessCount });
                }
            }
        }
        return candidates;
    }

    async promote(candidate: PromotionCandidate): Promise<void> {
        const toLimits = this.limits.get(candidate.toTier) ?? DEFAULT_TIER_LIMITS[candidate.toTier];
        const location = await this.kvStore.get<ItemLocation>(this.buildIdMapKey(candidate.id));
        if (!location) throw new Error(`promote: item ${candidate.id} not found in id map`);
        const fromKey = this.buildItemKey(location.tenant, candidate.fromTier, candidate.id);
        const source = await this.kvStore.get<TierItem>(fromKey);
        if (!source) throw new Error(`promote: source item ${candidate.id} missing from ${candidate.fromTier}`);

        const timestamp = new Date().toISOString();
        const promotedImportance = Math.min(source.importance + 0.1, 1.0);
        const promotedSemantic = source.semanticWeight + 0.1;
        const promotedCombined = source.combinedWeight + 0.1;
        const history: WeightHistoryEntry[] = [...source.weightHistory, { timestamp, significance: source.significanceWeight, semantic: promotedSemantic, combined: promotedCombined, reason: `promoted_${candidate.fromTier}_to_${candidate.toTier}` }];

        const targetKey = this.buildItemKey(location.tenant, candidate.toTier, candidate.id);
        const promoted: TierItem = {
            ...source, tier: candidate.toTier, importance: promotedImportance, promotionEligible: candidate.toTier !== 'axiom',
            semanticWeight: promotedSemantic, combinedWeight: promotedCombined, weightHistory: history,
            metadata: { ...source.metadata, promotedFrom: candidate.fromTier, promotionTimestamp: timestamp },
            tags: [...source.tags, `promoted_from_${candidate.fromTier}`], kvKey: targetKey, persistenceLevel: toLimits.persistenceLevel,
            ttlSeconds: candidate.toTier === 'short' && Number.isFinite(toLimits.retentionHours) ? toLimits.retentionHours * 3600 : undefined,
        };

        await this.kvStore.put<TierItem>(targetKey, promoted, { ttl: promoted.ttlSeconds });
        await this.updateTierIndex(location.tenant, candidate.toTier, candidate.id);
        await this.kvStore.put<ItemLocation>(this.buildIdMapKey(candidate.id), { tenant: location.tenant, tier: candidate.toTier });

        if (toLimits.persistenceLevel !== 'kv_only' && source.embedding && source.embedding.length > 0) {
            try { await this.vectorStore.store([{ id: candidate.id, embedding: source.embedding, metadata: { ...promoted.metadata, id: candidate.id, tier: candidate.toTier } }], { tenant: location.tenant, tier: candidate.toTier }); } catch { /* enhancement only */ }
        }

        await this.kvStore.delete(fromKey);
        await this.removeTierIndex(location.tenant, candidate.fromTier, candidate.id);
    }

    async applyDecay(shardKey: ShardKey): Promise<number> {
        let removed = 0;
        for (const tier of ALL_TIERS) removed += await this.pruneTier(shardKey.tenant, tier);
        return removed;
    }

    determineTier(importance: number): MemoryTier {
        if (importance >= 0.9) return 'axiom';
        if (importance >= 0.7) return 'long';
        if (importance >= 0.4) return 'intermediate';
        return 'short';
    }

    private async pruneTier(tenant: string, tier: MemoryTier): Promise<number> {
        const limits = this.limits.get(tier) ?? DEFAULT_TIER_LIMITS[tier];
        const items = await this.listTierItems(tenant, tier);
        if (items.length <= limits.maxItems) return 0;
        const sorted = this.sortForPruning(items, limits.pruningStrategy);
        const toRemove = sorted.slice(0, items.length - limits.maxItems);
        let removed = 0;
        for (const item of toRemove) if (await this.removeItem(tenant, tier, item.id)) removed++;
        return removed;
    }

    private sortForPruning(items: TierItem[], strategy: PruningStrategy): TierItem[] {
        const copy = [...items];
        switch (strategy) {
            case 'lru': copy.sort((a, b) => Date.parse(a.lastAccessed) - Date.parse(b.lastAccessed)); break;
            case 'fifo': copy.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)); break;
            case 'frequency': copy.sort((a, b) => a.accessCount - b.accessCount); break;
            case 'importance': copy.sort((a, b) => a.importance - b.importance); break;
        }
        return copy;
    }

    private async removeItem(tenant: string, tier: MemoryTier, id: MemoryId): Promise<boolean> {
        const kvKey = this.buildItemKey(tenant, tier, id);
        const limits = this.limits.get(tier) ?? DEFAULT_TIER_LIMITS[tier];
        try {
            await this.kvStore.delete(kvKey);
            if (limits.persistenceLevel !== 'kv_only') { try { await this.vectorStore.delete([id], { tenant, tier }); } catch { /* best-effort */ } }
            await this.removeTierIndex(tenant, tier, id);
            await this.kvStore.delete(this.buildIdMapKey(id));
            return true;
        } catch { return false; }
    }

    private async updateTierIndex(tenant: string, tier: MemoryTier, id: MemoryId): Promise<void> {
        try {
            const indexKey = this.buildIndexKey(tenant, tier);
            const limits = this.limits.get(tier) ?? DEFAULT_TIER_LIMITS[tier];
            const existing = await this.kvStore.get<MemoryId[]>(indexKey);
            let index = existing ?? [];
            index = [id, ...index];
            index = [...new Set(index)];
            index = index.slice(0, limits.maxItems * 2);
            await this.kvStore.put<MemoryId[]>(indexKey, index);
        } catch { /* Index is an optimization */ }
    }

    private async removeTierIndex(tenant: string, tier: MemoryTier, id: MemoryId): Promise<void> {
        try {
            const indexKey = this.buildIndexKey(tenant, tier);
            const existing = await this.kvStore.get<MemoryId[]>(indexKey);
            if (!existing) return;
            await this.kvStore.put<MemoryId[]>(indexKey, existing.filter((x) => x !== id));
        } catch { /* Index is an optimization */ }
    }

    private async readTierIndex(tenant: string, tier: MemoryTier): Promise<MemoryId[]> {
        try { return (await this.kvStore.get<MemoryId[]>(this.buildIndexKey(tenant, tier))) ?? []; } catch { return []; }
    }

    private async listTierItems(tenant: string, tier: MemoryTier): Promise<TierItem[]> {
        const ids = await this.readTierIndex(tenant, tier);
        const items: TierItem[] = [];
        for (const id of ids) { const item = await this.fetchRaw(tenant, tier, id); if (item) items.push(item); }
        return items;
    }

    private async fetchRaw(tenant: string, tier: MemoryTier, id: MemoryId): Promise<TierItem | null> {
        return this.kvStore.get<TierItem>(this.buildItemKey(tenant, tier, id));
    }

    private buildItemKey(tenant: string, tier: MemoryTier, id: MemoryId): string { return `${this.keyPrefix}:${tenant}:${tier}:${id}`; }
    private buildIndexKey(tenant: string, tier: MemoryTier): string { return `${this.keyPrefix}:${tenant}:${tier}:_index`; }
    private buildIdMapKey(id: MemoryId): string { return `${this.keyPrefix}:_idmap:${id}`; }
    private generateId(tier: MemoryTier): MemoryId { return `${tier}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`; }
}
