/**
 * CloudflareAutoRAGClient
 * Minimal adapter to use Cloudflare AutoRAG from env.AI.autorag(serviceName).
 * Implements AutoRAGClient for HybridRetriever.
 */

import type { AutoRAGClient } from './hybrid-retriever.js';

export class CloudflareAutoRAGClient implements AutoRAGClient {
	private env: any;
	private serviceName: string;

	constructor(env: any, serviceName = 'square-darkness-6e04') {
		this.env = env;
		this.serviceName = serviceName;
	}

	async aiSearch(args: { query: string; max_results?: number }): Promise<Array<{ id?: string; score?: number; content?: string; title?: string; url?: string; metadata?: any }>> {
		if (!this.env?.AI?.autorag) {
			throw new Error('AutoRAG binding not available on env.AI');
		}
		try {
			const client = this.env.AI.autorag(this.serviceName);
			// Align with Cloudflare AutoRAG expected api: aiSearch({ query })
			const results = await client.aiSearch({ query: args.query, max_results: args.max_results });
			return Array.isArray(results) ? results : (results?.results ?? []);
		} catch (err) {
			// Surface error; HybridRetriever will annotate failure
			throw err;
		}
	}
}
