/**
 * Cloudflare AutoRAG Integration
 * 
 * Next-generation RAG using AutoRAG for automated indexing from R2
 * and AI-powered response generation.
 */

export interface CloudflareAutoRAGEnv {
	AI: Ai;
	R2_BUCKET?: R2Bucket;
}

export interface AutoRAGConfig {
	env: CloudflareAutoRAGEnv;
	autoragName: string; // e.g., "square-darkness-6e04"
}

export class CloudflareAutoRAGStore {
	private env: CloudflareAutoRAGEnv;
	private autoragName: string;

	constructor(config: AutoRAGConfig) {
		this.env = config.env;
		this.autoragName = config.autoragName;
	}

	/**
	 * AI-powered search with generated responses
	 * Uses AutoRAG to search corpus and generate contextual answers
	 */
	async aiSearch(query: string, options: {
		model?: string;
		rewrite_query?: boolean;
		max_num_results?: number;
		score_threshold?: number;
		stream?: boolean;
	} = {}) {
		const searchParams = {
			query,
			model: options.model || "@cf/meta/llama-3.3-70b-instruct-sd",
			rewrite_query: options.rewrite_query ?? true,
			max_num_results: options.max_num_results || 10,
			ranking_options: {
				score_threshold: options.score_threshold || 0.3
			},
			stream: options.stream || false
		};

		try {
			const result = await this.env.AI.autorag(this.autoragName).aiSearch(searchParams);
			return result;
		} catch (error) {
			console.error('AutoRAG aiSearch failed:', error);
			throw new Error(`AutoRAG search failed: ${error}`);
		}
	}

	/**
	 * Pure retrieval search without response generation
	 * Returns relevant document chunks based on semantic similarity
	 */
	async search(query: string, options: {
		rewrite_query?: boolean;
		max_num_results?: number;
		score_threshold?: number;
	} = {}) {
		const searchParams = {
			query,
			rewrite_query: options.rewrite_query ?? true,
			max_num_results: options.max_num_results || 10,
			ranking_options: {
				score_threshold: options.score_threshold || 0.3
			}
		};

		try {
			const result = await this.env.AI.autorag(this.autoragName).search(searchParams);
			return result;
		} catch (error) {
			console.error('AutoRAG search failed:', error);
			throw new Error(`AutoRAG retrieval failed: ${error}`);
		}
	}

	/**
	 * Upload content to R2 for automatic indexing
	 * AutoRAG will automatically process and index the content
	 */
	async uploadToR2(content: string, filename: string, folder: string = "memory"): Promise<void> {
		if (!this.env.R2_BUCKET) {
			throw new Error('R2_BUCKET binding not available');
		}

		const key = `${folder}/${filename}`;
		const metadata = {
			'uploaded-by': 'mnemosyne-memory-system',
			'timestamp': new Date().toISOString(),
			'folder': folder
		};

		try {
			await this.env.R2_BUCKET.put(key, content, {
				httpMetadata: {
					contentType: 'text/plain',
				},
				customMetadata: metadata
			});

			console.log(`Content uploaded to R2: ${key}`);
		} catch (error) {
			console.error('R2 upload failed:', error);
			throw new Error(`R2 upload failed: ${error}`);
		}
	}

	/**
	 * Store knowledge by uploading to R2 for AutoRAG indexing
	 * Alternative to direct Vectorize storage
	 */
	async storeKnowledge(knowledge: {
		content: string;
		metadata?: Record<string, unknown>;
		tags?: string[];
		folder?: string;
	}): Promise<string> {
		const filename = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`;
		const folder = knowledge.folder || "memory";
		
		// Create enhanced content with metadata
		const enhancedContent = [
			knowledge.content,
			'',
			'=== METADATA ===',
			`Tags: ${(knowledge.tags || []).join(', ')}`,
			`Timestamp: ${new Date().toISOString()}`,
			...(knowledge.metadata ? Object.entries(knowledge.metadata).map(([k, v]) => `${k}: ${v}`) : [])
		].join('\n');

		await this.uploadToR2(enhancedContent, filename, folder);
		return `${folder}/${filename}`;
	}

	/**
	 * Search with folder-based filtering
	 */
	async searchMemory(query: string, options: {
		folder?: string;
		generateResponse?: boolean;
		threshold?: number;
		maxResults?: number;
	} = {}) {
		// Note: For folder filtering, we would need to implement proper
		// ComparisonFilter structure. For now, using basic search.
		const searchOptions = {
			rewrite_query: true,
			max_num_results: options.maxResults || 20,
			score_threshold: options.threshold || 0.3
		};

		if (options.generateResponse !== false) {
			return this.aiSearch(query, searchOptions);
		} else {
			return this.search(query, searchOptions);
		}
	}

	/**
	 * Multi-tier search combining AutoRAG with different folders
	 */
	async searchTiered(query: string, tiers: string[] = ["long-term", "intermediate", "short-term"]) {
		const promises = tiers.map(async (tier) => ({
			tier,
			results: await this.searchMemory(query, { folder: tier, generateResponse: false })
		}));

		return Promise.all(promises);
	}

	/**
	 * Check if AutoRAG is properly configured
	 */
	isConfigured(): boolean {
		return !!(this.env.AI && this.autoragName);
	}

	/**
	 * Get configuration information
	 */
	getConfig() {
		return {
			autoragName: this.autoragName,
			hasR2: !!this.env.R2_BUCKET,
			hasAI: !!this.env.AI,
			configured: this.isConfigured()
		};
	}
}
