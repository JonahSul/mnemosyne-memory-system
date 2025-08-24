/**
 * HybridRetriever
 * 
 * Orchestrates hybrid retrieval across Vectorize (structured behavioral/knowledge) and
 * AutoRAG (artifact/document knowledge) consistent with ADR-002 and hybrid-search-policy.
 */

import { VectorKnowledgeTools, SemanticSearchResult } from './vector-knowledge-tools.js';

export type WorkloadType = 'exploration' | 'precision' | 'recall' | 'balanced' | 'debugging' | 'document' | 'behavioral';

export interface HybridRetrieverOptions {
	workloadType?: WorkloadType;
	expectedResults?: number;
	tierPreference?: 'short' | 'intermediate' | 'long' | 'all';
	allowAutoRAG?: boolean;
	allowVectorize?: boolean;
	threshold?: number;
}

export interface HybridItem {
	id?: string;
	source: 'vectorize' | 'autorag';
	tier?: 'short' | 'intermediate' | 'long' | 'axiom';
	score: number;
	title?: string;
	snippet?: string;
	uri?: string;
	metadata?: Record<string, any>;
}

export interface HybridResult {
	query: string;
	results: HybridItem[];
	latencyMs: number;
	annotations: string[];
	sourceLatencies: Record<string, number>;
	stats: {
		dedupeRate: number;
		sourceMix: Record<'vectorize' | 'autorag', number>;
	};
}

export interface AutoRAGClient {
	aiSearch(args: { query: string; max_results?: number }): Promise<Array<{ id?: string; score?: number; content?: string; title?: string; url?: string; metadata?: any }>>;
}

export class HybridRetriever {
	private vector: VectorKnowledgeTools;
	private autorag?: AutoRAGClient;
	private flags: { boosts?: { autorag?: number; vectorize?: number; tiers?: Record<string, number> } };

	constructor(deps?: { vector?: VectorKnowledgeTools; autorag?: AutoRAGClient; flags?: { boosts?: { autorag?: number; vectorize?: number; tiers?: Record<string, number> } } }) {
		this.vector = deps?.vector ?? new VectorKnowledgeTools();
		this.autorag = deps?.autorag;
		this.flags = deps?.flags ?? {};
	}

	async retrieve(query: string, options: HybridRetrieverOptions = {}): Promise<HybridResult> {
		const start = performance.now();
		const allowVectorize = options.allowVectorize !== false;
		const allowAutoRAG = options.allowAutoRAG !== false && !!this.autorag;

		const annotations: string[] = [];
		const sourceLatencies: Record<string, number> = {};

		const promises: Array<Promise<{ source: 'vectorize' | 'autorag'; payload: any }>> = [];

		if (allowVectorize) {
			promises.push((async () => {
				const s = performance.now();
				const vec: SemanticSearchResult = await this.vector.searchKnowledge(query, {
					limit: options.expectedResults ?? 8,
					threshold: options.threshold
				});
				sourceLatencies.vectorize = Math.round((performance.now() - s) * 1000) / 1000;
				return { source: 'vectorize' as const, payload: vec };
			})());
		}

		if (allowAutoRAG && this.autorag) {
			promises.push((async () => {
				const s = performance.now();
				const results = await this.autorag!.aiSearch({ query });
				sourceLatencies.autorag = Math.round((performance.now() - s) * 1000) / 1000;
				return { source: 'autorag' as const, payload: results };
			})());
		}

		const settled = await Promise.allSettled(promises);

		let vectorItems: HybridItem[] = [];
		let autoragItems: HybridItem[] = [];

		for (const s of settled) {
			if (s.status === 'fulfilled') {
				if (s.value.source === 'vectorize') {
					const vec = s.value.payload as SemanticSearchResult;
					vectorItems = vec.results.map(r => ({
						id: r.metadata?.id,
						source: 'vectorize',
						// Normalize similarity (already 0..1 typically); we clamp to [0,1]
						score: Math.max(0, Math.min(1, r.similarity)),
						title: r.metadata?.title,
						snippet: r.content?.slice(0, 280),
						uri: r.metadata?.uri,
						metadata: r.metadata
					}));
				} else if (s.value.source === 'autorag') {
					const ar = s.value.payload as Array<any>;
					autoragItems = ar.map(item => ({
						id: item.id,
						source: 'autorag',
						score: Math.max(0, Math.min(1, item.score ?? 0.5)),
						title: item.title,
						snippet: item.content?.slice(0, 280),
						uri: item.url,
						metadata: item.metadata
					}));
				}
			} else {
				annotations.push(`Source failed: ${s.reason}`);
			}
		}

		// Apply boosts
		vectorItems = this.applyBoosts(vectorItems, options);
		autoragItems = this.applyBoosts(autoragItems, options);

		// Merge and dedupe
		let combined = [...vectorItems, ...autoragItems];
		const before = combined.length;
		combined = this.dedupe(combined);
		const after = combined.length;

		// Rank and cap
		combined.sort((a, b) => b.score - a.score);
		const k = options.expectedResults ?? 10;
		combined = combined.slice(0, k);

		const latencyMs = Math.round((performance.now() - start) * 1000) / 1000;

		return {
			query,
			results: combined,
			latencyMs,
			annotations,
			sourceLatencies,
			stats: {
				dedupeRate: before ? (before - after) / before : 0,
				sourceMix: {
					vectorize: vectorItems.length,
					autorag: autoragItems.length
				}
			}
		};
	}

	private applyBoosts(items: HybridItem[], options: HybridRetrieverOptions): HybridItem[] {
		const boosts = this.flags.boosts ?? {};
		return items.map(item => {
			let score = item.score;
			// Tier-aware boosts for vector items
			if (item.source === 'vectorize' && item.tier) {
				const tierBoost = boosts.tiers?.[item.tier] ?? this.defaultTierBoost(item.tier);
				score = Math.min(1, score + tierBoost);
			}
			// Source/context boosts
			if (options.workloadType === 'document' && item.source === 'autorag') {
				score = Math.min(1, score + (boosts.autorag ?? 0.05));
			}
			if (options.workloadType === 'behavioral' && item.source === 'vectorize') {
				score = Math.min(1, score + (boosts.vectorize ?? 0.05));
			}
			return { ...item, score };
		});
	}

	private defaultTierBoost(tier: NonNullable<HybridItem['tier']>): number {
		switch (tier) {
			case 'axiom': return 0.15;
			case 'long': return 0.10;
			case 'intermediate': return 0.05;
			default: return 0;
		}
	}

	private dedupe(items: HybridItem[]): HybridItem[] {
		const seen: HybridItem[] = [];
		for (const it of items) {
			const dup = seen.find(s => this.isDuplicate(s, it));
			if (!dup) seen.push(it);
			else if (it.score > dup.score) {
				// Replace lower-scored duplicate
				const idx = seen.indexOf(dup);
				seen[idx] = it;
			}
		}
		return seen;
	}

	private isDuplicate(a: HybridItem, b: HybridItem): boolean {
		// Prefer strict keys first
		if (a.id && b.id && a.id === b.id) return true;
		if (a.uri && b.uri && a.uri === b.uri) return true;
		if (a.title && b.title && a.title === b.title) return true;
		// Fallback: fuzzy on snippet/title length
		if (a.snippet && b.snippet && a.snippet.length > 20 && b.snippet.length > 20) {
			const sim = this.stringSimilarity(a.snippet, b.snippet);
			return sim >= 0.9;
		}
		return false;
	}

	private stringSimilarity(x: string, y: string): number {
		// Jaccard over word sets as a simple approximation
		const xs = new Set(x.toLowerCase().split(/\W+/).filter(Boolean));
		const ys = new Set(y.toLowerCase().split(/\W+/).filter(Boolean));
		let inter = 0;
		xs.forEach(w => { if (ys.has(w)) inter++; });
		const union = xs.size + ys.size - inter;
		return union === 0 ? 0 : inter / union;
	}
}
