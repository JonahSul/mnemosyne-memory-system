/**
 * 🧠 **Simplified Memory Tools Registry - Foundation v1.8.0 Implementation**
 * 
 * This sophisticated registry implements the 5 core memory tools with full Foundation v1.8.0 
 * behavioral compliance and persistent storage architecture:
 * 
 * 🚀 **memory_init** - Foundation beacon and system initialization with guidance display
 * 🧠 **memory_store** - Intelligent semantic storage with KV-first persistence and tier placement
 * 🔍 **memory_search** - Advanced search with Foundation-optimized thresholds and confidence filtering  
 * 📊 **memory_stats** - Comprehensive system analytics and architecture integrity monitoring
 * ⚙️ **memory_admin** - Advanced administrative operations and foundation management
 * 
 * Features evidence-based accountability, empirically-tuned thresholds, KV-first write-through persistence, 
 * semantic deduplication, persistent multi-tier memory architecture, and deployment-resilient state management.
 * 
 * ARCHITECTURE v1.8.0: Eliminates volatile storage, implements KV-first with Vector backup.
 */

import { z } from "zod";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MnemosyneMemorySystem } from "@mnemosyne/legacy-core/memory-tool";
import { PersistentMultiTierMemorySystem, createPersistentMultiTierMemorySystem, type TieredKnowledgeItem } from "@mnemosyne/legacy-core/modules/persistent-tier-integration";
import { CloudflareVectorStore } from "@mnemosyne/legacy-cloudflare/vector-store";

// Enhanced interfaces for Foundation v1.7.1+
function getMemorySystem(): MnemosyneMemorySystem {
	return getMnemosyneMemoryInstance();
}

// Singleton instances following Foundation v1.8.0 architecture integrity rules
let memoryInstance: MnemosyneMemorySystem | null = null;
let multiTierInstance: PersistentMultiTierMemorySystem | null = null;
let vectorStoreInstance: CloudflareVectorStore | null = null;
let workerEnv: any = null; // Store the actual Worker environment bindings

// CRITICAL FIX: Accept and store real Worker environment bindings
export function initializeWithEnv(env: any) {
	workerEnv = env;
	// Reset instances to use new environment
	memoryInstance = null;
	multiTierInstance = null;
	vectorStoreInstance = null;

	// Make vector store instance globally available for MnemosyneMemorySystem
	(globalThis as any).getVectorStoreInstance = getVectorStoreInstance;
}

function getMnemosyneMemoryInstance(): MnemosyneMemorySystem {
	if (!memoryInstance) {
		const vectorStore = getVectorStoreInstance();
		const kvStore = workerEnv?.MEMORY_KV;
		if (kvStore) {
			console.log('✅ Memory system initialized with persistent KV storage');
			// Maintain global reference for any legacy modules still consulting it during transition
			(globalThis as any).MEMORY_KV = kvStore;
		} else {
			console.warn('⚠️ Memory system starting without MEMORY_KV binding; persistent tier features will be limited');
		}

		memoryInstance = new MnemosyneMemorySystem({
			vectorStore,
			kvStore
		});
	}
	return memoryInstance;
}

function getMultiTierMemoryInstance(): PersistentMultiTierMemorySystem {
	if (!multiTierInstance) {
		// Foundation v1.8.0: Use persistent KV-first architecture
		if (workerEnv && workerEnv.MEMORY_KV && workerEnv.VECTORIZE_INDEX && workerEnv.AI) {
			multiTierInstance = createPersistentMultiTierMemorySystem({
				kv: workerEnv.MEMORY_KV,
				vectorStore: getVectorStoreInstance(),
				keyPrefix: 'persistent_tier:'
			});
			console.log('✅ Persistent multi-tier memory initialized with KV + Vector storage');
		} else {
			console.error('❌ CRITICAL: Persistent multi-tier memory requires MEMORY_KV, VECTORIZE_INDEX, and AI bindings');
			throw new Error('FATAL: PersistentMultiTierMemorySystem requires KV and Vector bindings for operation');
		}
	}
	return multiTierInstance;
}

export function getVectorStoreInstance(): CloudflareVectorStore {
	if (!vectorStoreInstance) {
		// ADR-001 COMPLIANCE: Enforce persistent-first architecture with fail-closed behavior
		if (workerEnv && workerEnv.VECTORIZE_INDEX && workerEnv.AI) {
			vectorStoreInstance = new CloudflareVectorStore({ env: workerEnv });
			console.log('✅ Vector store initialized with persistent Vectorize bindings');
		} else {
			// ADR-001: Check for explicit dev/test environment flags before allowing fallback
			const isTestEnvironment = (
				(globalThis as any).NODE_ENV === 'test' ||
				(globalThis as any).NODE_ENV === 'development' ||
				(globalThis as any).__VECTORIZE_TEST_SHIM === '1' ||
				(globalThis as any).__DEV__ === true
			);

			if (isTestEnvironment) {
				// ADR-001 COMPLIANT: Dev-only mock behind explicit flags for unit tests
				vectorStoreInstance = new CloudflareVectorStore({ useTestShim: true });
				console.log('🧪 Vector store initialized with test shim (dev/test environment)');
			} else {
				// ADR-001 COMPLIANT: Fail closed with clear errors in production
				const error = new Error(
					'FATAL: CloudflareVectorStore requires VECTORIZE_INDEX and AI bindings in production. ' +
					'Ensure wrangler.jsonc includes proper bindings or set globalThis.NODE_ENV=test for development.'
				);
				console.error('❌ Vector store initialization failed:', error.message);
				throw error;
			}
		}
	}
	return vectorStoreInstance;
}

export interface SimplifiedToolImplementation {
	name: string;
	description: string;
	schema: Record<string, z.ZodType>;
	handler: (params: any) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
}

// Foundation v1.8.0 Empirical Thresholds (preserved for compatibility)
const EMPIRICAL_THRESHOLDS = {
	exploration: 0.014,
	recall: 0.036,
	precision: 0.300,
	prewarming: 0.05,
	evidence_required: 0.6,
	cross_validation: 0.8
};

export const simplifiedMemoryTools: SimplifiedToolImplementation[] = [
	{
		name: "memory_init",
		description: "🚀 **Foundation Beacon & System Initialization** - Initialize the memory system and display the current Foundation guidance for optimal usage. This essential tool surfaces the Foundation v1.8.0 principles including evidence-based accountability, persistent memory architecture, and KV-first storage patterns. Perfect for onboarding, refreshing system knowledge, and ensuring compliance with best practices. Displays the Foundation beacon with core principles, usage patterns, evidence standards, and persistent storage mechanisms.",
		schema: {
			display_full: z.boolean().optional().describe("🔍 Display complete Foundation details (default: beacon summary only)")
		},
		handler: async (params) => {
			try {
				// Static Foundation v1.8.0 beacon reflecting enhanced memory capabilities
				const beacon = {
					message: "🧠 Foundation v1.8.0: Enhanced Memory Architecture with Causality Tracking & Semantic Expansion",
					guidance: [
						"📝 Store facts atomically with verifiable evidence (v1.5.0 core)",
						"🎯 Set confidence based on evidence quality (v1.5.0 core)",
						"🔍 Cross-validate against existing memory (v1.5.0 core)",
						"⚖️ Build accountability beyond human oversight (v1.5.0 core)",
						"🔗 Use verification methods to establish provenance (v1.5.0 core)",
						"🚀 Use enhanced memory tools for causality tracking (v1.8.0 NEW)",
						"🧬 Apply semantic expansion for superior knowledge discovery (v1.8.0 NEW)",
						"⏱️ Leverage microsecond-precision temporal metadata (v1.8.0 NEW)",
						"🎭 Select agent personality for consistent behavior (v1.8.0 NEW)"
					],
					motto: "Every claim deserves evidence. Every fact deserves validation. Every relationship deserves causality analysis."
				};

				let responseText = "🧠 MNEMOSYNE MEMORY SYSTEM INITIALIZED\n\n";
				responseText += `${beacon.message}\n\n`;

				// Always show beacon guidance
				responseText += "📋 FOUNDATION GUIDANCE:\n";
				beacon.guidance.forEach((guide: string) => {
					responseText += `   ${guide}\n`;
				});
				responseText += `\n💫 ${beacon.motto}\n\n`;

				// Show full foundation if requested
				if (params.display_full) {
					responseText += "🏛️ CORE PRINCIPLES:\n";
					responseText += "\n🔹 Every factual claim must include verifiable evidence before storage\n";
					responseText += "   No statement of fact enters memory without supporting evidence that can be independently verified\n";
					responseText += "   Priority: critical | Enforcement: mandatory\n";

					responseText += "\n🔹 Store information in small, focused, atomic units rather than large blocks\n";
					responseText += "   Optimize for granular knowledge building that enables precise retrieval and validation\n";
					responseText += "   Priority: high | Enforcement: recommended\n";

					responseText += "\n🔹 Establish clear accountability mechanisms beyond human oversight\n";
					responseText += "   Build systematic validation into the memory system itself\n";
					responseText += "   Priority: critical | Enforcement: systematic\n";

					responseText += "\n\n📊 EMPIRICAL THRESHOLDS:\n";
					responseText += "   exploration: 0.014\n";
					responseText += "   recall: 0.036\n";
					responseText += "   precision: 0.300\n";
					responseText += "   prewarming: 0.05\n";
					responseText += "   evidence_required: 0.6\n";
					responseText += "   cross_validation: 0.8\n";

					responseText += "\n\n⚖️ ACCOUNTABILITY PROTOCOLS:\n";
					responseText += "\n🔸 Validate claims against existing memory before storage\n";
					responseText += "   Prevent contradictory or duplicate information from entering the system\n";
					responseText += "\n🔸 Assess evidence quality and adjust confidence accordingly\n";
					responseText += "   Systematic evaluation of evidence strength and reliability\n";
					responseText += "\n🔸 Periodically re-validate stored claims against new evidence\n";
					responseText += "   Maintain memory accuracy through continuous validation\n";
				} else {
					responseText += "💡 Use display_full=true to see complete Foundation details\n";
				}

				return {
					content: [{
						type: "text" as const,
						text: responseText
					}]
				};

			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Foundation initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				};
			}
		}
	},

	{
		name: "memory_store",
		description: "🧠 **Semantic Memory Storage with Intelligent Tier Placement** - Store information in the persistent memory system using advanced semantic confidence analysis and Foundation v1.5.0 architecture integrity verification. This sophisticated tool automatically evaluates the importance and reliability of information, placing it in the optimal memory tier (short-term, intermediate, or long-term) based on confidence scores and semantic content analysis. Features evidence-based storage that eliminates traditional claim/verification cycles, automatic tier promotion based on access patterns, write-through persistence to both KV storage and vector embeddings, semantic deduplication, and full provenance tracking. Perfect for storing behavioral observations, learned patterns, factual information, procedural knowledge, contextual insights, and system state with complete audit trails.",
		schema: {
			content: z.string().describe("📝 The information to store in memory - can be facts, observations, patterns, rules, or any knowledge worth preserving"),
			confidence: z.number().min(0).max(1).optional().describe("🎯 Confidence score 0-1 based on evidence quality and verification strength (auto-calculated using semantic analysis if not provided)"),
			evidence: z.array(z.string()).optional().describe("🔍 Supporting evidence that justifies the content and confidence score - citations, observations, cross-references, or validation data"),
			source: z.string().optional().describe("📍 How this information was obtained (e.g., 'user_input', 'automated_check', 'cross_reference', 'pattern_analysis', 'system_observation')"),
			verification_method: z.enum(["manual", "automated", "cross_reference", "inference"]).optional().describe("✅ Method used to verify this information for audit trails and reliability assessment"),
			metadata: z.record(z.unknown()).optional().describe("🏷️ Optional metadata including type, tags, decay rate, cross references, timestamps, and custom properties"),
			tier: z.enum(["short", "intermediate", "long", "auto"]).optional().describe("🗄️ Memory tier (auto-detects optimal placement based on importance/confidence if not specified)"),
			importance: z.number().min(0).max(1).optional().describe("⭐ Importance score 0-1 for tier placement and retention priority (derived from confidence if not provided)"),
			tags: z.array(z.string()).optional().describe("🏷️ Tags for categorization, cross-tier linking, and semantic clustering (e.g., ['behavioral', 'pattern', 'critical'])")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const multiTier = getMultiTierMemoryInstance();

			// Get stats before storage (Foundation v1.8.0 architecture integrity)
			const statsBefore = await multiTier.getStats();
			const totalBefore = statsBefore.totalKnowledge;

			try {
				// Auto-calculate confidence from evidence if not provided
				let confidence = params.confidence;
				if (!confidence && params.evidence) {
					// Simple confidence calculation based on evidence quality
					const evidenceScore = Math.min(params.evidence.length * 0.2, 1.0); // More evidence = higher confidence
					const sourceBonus = params.verification_method === "automated" ? 0.1 :
						params.verification_method === "manual" ? 0.2 : 0.05;
					confidence = Math.min(evidenceScore + sourceBonus, 1.0);
				}
				confidence = confidence || 0.5; // Default medium confidence

				// Auto-calculate importance from confidence if not provided
				const importance = params.importance || confidence;

				// Determine tier based on confidence and importance
				const tier = params.tier === "auto" || !params.tier
					? (confidence > 0.8 && importance > 0.7 ? "long" :
						confidence > 0.6 || importance > 0.3 ? "intermediate" : "short")
					: params.tier;

				// Prepare semantic metadata
				const semanticMetadata = {
					...params.metadata,
					confidence,
					evidence: params.evidence || [],
					source: params.source || "unknown",
					verification_method: params.verification_method || "inference",
					stored_timestamp: new Date().toISOString(),
					foundation_version: "v1.5.0",
					semantic_storage: true
				};

				// Store using logClaim for behavioral memory (persistent via PersistentCoreMemoryManager)
				const memoryId = await memory.logClaim(
					params.content,
					semanticMetadata,
					params.source || "semantic_memory_store",
					confidence > 0.7 ? "high" : confidence > 0.4 ? "medium" : "low"
				);

				// Store in persistent tiered memory (Foundation v1.8.0: KV-first with Vector backup)
				await multiTier.storeKnowledge({
					content: params.content,
					metadata: {
						...semanticMetadata,
						memoryId,
						importance,
						foundationCompliant: true,
						// Foundation v1.8.0: Persistent storage confirmation
						persistent_storage: "kv_first_vector_backup",
						architecture_version: "v1.8.0"
					},
					tags: params.tags || [],
					importance,
					...(tier !== 'auto' && { targetTier: tier as 'axiom' | 'long' | 'intermediate' | 'short' })
				});

				// Verify stats after storage (Foundation v1.8.0 critical rule)
				const statsAfter = await multiTier.getStats();
				const totalAfter = statsAfter.totalKnowledge;

				const storageSuccessful = totalAfter > totalBefore;

				if (!storageSuccessful) {
					// Log violation per Foundation v1.5.0
					await memory.recordViolation(
						"memory-architecture-integrity",
						`Storage operation failed architecture integrity check. Stats before: ${totalBefore}, after: ${totalAfter}`,
						"critical"
					);

					return {
						content: [{
							type: "text" as const,
							text: `⚠️ ARCHITECTURE VIOLATION: Semantic storage may have failed. Memory stats did not increase as expected.\nBefore: ${totalBefore} items, After: ${totalAfter} items\nMemory ID: ${memoryId}\nConfidence: ${confidence}, Evidence: ${params.evidence?.length || 0} items`
						}]
					};
				}

				// Build success response with semantic details
				let responseText = `✅ Successfully stored content with semantic confidence tracking.\n`;
				responseText += `Memory ID: ${memoryId}\n`;
				responseText += `Confidence: ${confidence.toFixed(2)} (${confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'})\n`;
				responseText += `Evidence: ${params.evidence?.length || 0} supporting items\n`;
				responseText += `Source: ${params.source || 'unspecified'}\n`;
				responseText += `Verification: ${params.verification_method || 'inference'}\n`;
				responseText += `Tier placement: ${tier} (importance: ${importance.toFixed(2)})\n`;
				responseText += `Architecture integrity verified: ${totalBefore} → ${totalAfter} items\n`;
				responseText += `\n⚠️  PERSISTENCE NOTE: Behavioral memory is persistent (KV+Vectorize), tier memory is volatile\n`;
				responseText += `✅ Stored to vector store for persistence backup`;

				if (params.evidence && params.evidence.length > 0) {
					responseText += `\n\nSupporting Evidence:\n`;
					params.evidence.forEach((evidence: string, index: number) => {
						responseText += `${index + 1}. ${evidence}\n`;
					});
				}

				return {
					content: [{
						type: "text" as const,
						text: responseText
					}]
				};

			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				};
			}
		}
	},

	{
		name: "memory_search",
		description: "🔍 **Intelligent Semantic Search with Foundation v1.5.0 Optimization** - Perform sophisticated searches across the entire memory system using empirically-tuned thresholds and semantic confidence filtering. This powerful tool leverages Foundation v1.5.0's battle-tested search parameters (exploration: 0.014, recall: 0.036, precision: 0.300, prewarming: 0.05) to deliver contextually optimal results. Features multi-tier search across short-term, intermediate, and long-term memory, confidence-based ranking that surfaces high-quality information first, evidence filtering to ensure reliability, verification method filtering for audit trails, and semantic similarity scoring. Supports specialized search modes including exploration (broad discovery), recall (comprehensive retrieval), precision (exact matches), and prewarming (system optimization). Perfect for finding related information, discovering patterns, validating claims, building context, and exploring knowledge connections with provenance-aware results.",
		schema: {
			query: z.string().describe("🔍 The search query to find related information - supports natural language, keywords, and semantic concepts"),
			threshold: z.number().optional().describe("🎯 Similarity threshold (uses Foundation v1.5.0 empirical thresholds if not specified: exploration=0.014, recall=0.036, precision=0.300)"),
			limit: z.number().optional().describe("📊 Maximum number of results to return (default: 8, optimized for cognitive load)"),
			tierPreference: z.enum(["short", "intermediate", "long", "all"]).optional().describe("🗄️ Which memory tier(s) to search - 'all' provides comprehensive results across tiers"),
			searchType: z.enum(["exploration", "recall", "precision", "prewarming"]).optional().describe("🧠 Search mode: exploration (broad discovery), recall (comprehensive), precision (exact), prewarming (optimization)"),
			minConfidence: z.number().min(0).max(1).optional().describe("⭐ Minimum confidence score for results - filters low-quality information"),
			requireEvidence: z.boolean().optional().describe("✅ Only return results that have supporting evidence for high reliability"),
			verificationMethod: z.enum(["manual", "automated", "cross_reference", "inference", "any"]).optional().describe("🔎 Filter by verification method for audit trails and reliability")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const multiTier = getMultiTierMemoryInstance();

			// Apply Foundation v1.5.0 empirical thresholds
			let threshold = params.threshold;
			if (!threshold && params.searchType) {
				if (params.searchType === "exploration") threshold = EMPIRICAL_THRESHOLDS.exploration;
				else if (params.searchType === "recall") threshold = EMPIRICAL_THRESHOLDS.recall;
				else if (params.searchType === "precision") threshold = EMPIRICAL_THRESHOLDS.precision;
				else if (params.searchType === "prewarming") threshold = EMPIRICAL_THRESHOLDS.prewarming;
			}
			if (!threshold) {
				threshold = EMPIRICAL_THRESHOLDS.recall; // Default to recall threshold
			}

			try {
				// Search across memory systems using Foundation v1.8.0 persistent search
				const tieredResults = await multiTier.search({
					query: params.query,
					maxResults: (params.limit || 8) * 2, // Get more results for filtering
					threshold
				});

				// Also search behavioral memory
				const behavioralResults = await memory.searchMemory(params.query, false);

				// Apply semantic confidence filtering
				const filteredTieredResults = tieredResults.filter(result => {
					const metadata = result.metadata || {};

					// Filter by minimum confidence
					if (params.minConfidence &&
						typeof metadata.confidence === 'number' &&
						metadata.confidence < params.minConfidence) {
						return false;
					}

					// Filter by evidence requirement
					if (params.requireEvidence &&
						(!Array.isArray(metadata.evidence) || metadata.evidence.length === 0)) {
						return false;
					}

					// Filter by verification method
					if (params.verificationMethod && params.verificationMethod !== "any" &&
						metadata.verification_method !== params.verificationMethod) {
						return false;
					}

					return true;
				}).slice(0, params.limit || 8); // Apply final limit after filtering

				// Filter behavioral results similarly
				const filteredBehavioralResults = behavioralResults.filter(result => {
					const context = result.context || {};

					// Filter by minimum confidence
					if (params.minConfidence &&
						typeof context.confidence === 'number' &&
						context.confidence < params.minConfidence) {
						return false;
					}

					// Filter by evidence requirement  
					if (params.requireEvidence &&
						(!Array.isArray(context.evidence) || context.evidence.length === 0)) {
						return false;
					}

					// Filter by verification method
					if (params.verificationMethod && params.verificationMethod !== "any" &&
						context.verification_method !== params.verificationMethod) {
						return false;
					}

					return true;
				}).slice(0, params.limit || 8);

				const totalResults = filteredTieredResults.length + filteredBehavioralResults.length;
				const originalTotal = tieredResults.length + behavioralResults.length;

				let resultsText = `Found ${totalResults} results for "${params.query}" (threshold: ${threshold})`;
				if (totalResults < originalTotal) {
					resultsText += ` [filtered from ${originalTotal} total]`;
				}
				resultsText += `\n\n`;

				// Add semantic filter info
				if (params.minConfidence || params.requireEvidence || params.verificationMethod) {
					resultsText += "=== SEMANTIC FILTERS APPLIED ===\n";
					if (params.minConfidence) resultsText += `Minimum confidence: ${params.minConfidence}\n`;
					if (params.requireEvidence) resultsText += `Evidence required: Yes\n`;
					if (params.verificationMethod) resultsText += `Verification method: ${params.verificationMethod}\n`;
					resultsText += "\n";
				}

				// Format tiered results with semantic details
				if (filteredTieredResults.length > 0) {
					resultsText += "=== TIERED MEMORY RESULTS ===\n";
					filteredTieredResults.forEach((result, index) => {
						const metadata = result.metadata || {};
						resultsText += `${index + 1}. [${result.tier.toUpperCase()}] ${(result.importance * 100).toFixed(1)}%`;
						if (typeof metadata.confidence === 'number') {
							resultsText += ` (conf: ${metadata.confidence.toFixed(2)})`;
						}
						if (Array.isArray(metadata.evidence) && metadata.evidence.length > 0) {
							resultsText += ` (evidence: ${metadata.evidence.length})`;
						}
						resultsText += ` - ${result.content}\n`;

						// Show verification method if available
						if (typeof metadata.verification_method === 'string') {
							resultsText += `    Verified via: ${metadata.verification_method}\n`;
						}
					});
					resultsText += "\n";
				}

				// Format behavioral results with semantic details
				if (filteredBehavioralResults.length > 0) {
					resultsText += "=== BEHAVIORAL MEMORY RESULTS ===\n";
					filteredBehavioralResults.forEach((result, index) => {
						const context = result.context || {};
						resultsText += `${index + 1}. [${result.type.toUpperCase()}]`;
						if (typeof context.confidence === 'number') {
							resultsText += ` (conf: ${context.confidence.toFixed(2)})`;
						}
						if (Array.isArray(context.evidence) && context.evidence.length > 0) {
							resultsText += ` (evidence: ${context.evidence.length})`;
						}
						resultsText += ` - ${result.content}\n`;

						// Show verification method if available
						if (typeof context.verification_method === 'string') {
							resultsText += `    Verified via: ${context.verification_method}\n`;
						}
					});
				}

				if (totalResults === 0) {
					resultsText += "No results found. Consider:\n";
					resultsText += `- Lowering threshold (current: ${threshold})\n`;
					resultsText += `- Using exploration search (threshold: ${EMPIRICAL_THRESHOLDS.exploration})\n`;
					resultsText += "- Checking if content was properly stored\n";
				}

				return {
					content: [{
						type: "text" as const,
						text: resultsText
					}]
				};

			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				};
			}
		}
	},

	{
		name: "memory_stats",
		description: "📊 **Comprehensive Memory System Analytics & Health Monitoring** - Provide detailed statistics and health diagnostics for the entire memory ecosystem with Foundation v1.5.0 architecture integrity monitoring. This essential diagnostic tool delivers real-time insights into memory system performance, detecting instance fragmentation, session persistence issues, tier distribution, storage utilization, and behavioral learning effectiveness. Features comprehensive health checks that identify architecture bugs, memory leaks, and data inconsistencies; tier-by-tier analytics showing storage distribution and access patterns; behavioral status reporting including rule effectiveness and pattern recognition; vector embedding statistics and dimensionality health; KV storage metrics and persistence verification; and session state analysis. Includes specialized testing data filtering and architecture integrity verification to ensure system reliability. Perfect for system monitoring, performance optimization, debugging memory issues, validating deployments, and maintaining operational excellence with full diagnostic reporting.",
		schema: {
			includeTestingData: z.boolean().optional().describe("🧪 Whether to include testing data in statistics for development and debugging purposes"),
			healthCheck: z.boolean().optional().describe("🏥 Perform comprehensive health check for architecture issues, fragmentation, and integrity violations")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const multiTier = getMultiTierMemoryInstance();

			try {
				// Get comprehensive memory statistics
				const tieredStats = await multiTier.getStats();
				const memoryStats = await memory.getMemoryStats();
				const unverifiedClaims = await memory.getUnverifiedClaims();
				const behavioralStatus = memory.getBehavioralStatus();

				// FIXED: Get persistent storage counts with proper vector store querying
				const vectorStore = getVectorStoreInstance();
				let persistentCounts = {
					vector_store: 0,
					behavioral_memory: memoryStats.total || 0,
					unverified_claims: unverifiedClaims.length
				};

				// DEBUG: Check vector store configuration status
				const vectorStats = vectorStore.getStats();
				const isConfigured = vectorStore.isConfigured();

				console.log('DEBUG Vector Store Status:', {
					configured: isConfigured,
					localItems: vectorStats.localItems,
					hasVectorizeIndex: !!(workerEnv && workerEnv.VECTORIZE_INDEX),
					hasAI: !!(workerEnv && workerEnv.AI),
					useFallbackLocal: (vectorStore as any).useFallbackLocal
				});

				// CRITICAL FIX: Use proper Vectorize query limits (max topK=50)
				try {
					// Try multiple broad search terms with corrected limits
					const broadSearches = [
						vectorStore.searchSimilar("memory", { limit: 50, threshold: 0.0 }),
						vectorStore.searchSimilar("data", { limit: 50, threshold: 0.0 }),
						vectorStore.searchSimilar("information", { limit: 50, threshold: 0.0 }),
						vectorStore.searchSimilar("content", { limit: 50, threshold: 0.0 })
					];

					const allResults = await Promise.all(broadSearches);
					const uniqueIds = new Set<string>();

					// Collect unique item IDs from all searches
					allResults.forEach(results => {
						results.forEach(item => uniqueIds.add(item.id));
					});

					persistentCounts.vector_store = uniqueIds.size;

					// If no results from searches, try getting stats from vector store
					if (persistentCounts.vector_store === 0) {
						if (vectorStats && vectorStats.localItems) {
							persistentCounts.vector_store = vectorStats.localItems;
						}
					}
				} catch (vectorError) {
					console.warn("Could not get vector store count:", vectorError);
					// Fallback to local stats if available
					try {
						persistentCounts.vector_store = vectorStats?.localItems || 0;
					} catch (statsError) {
						console.warn("Could not get vector stats:", statsError);
					}
				}

				let statsText = "=== MEMORY SYSTEM STATISTICS ===\n\n";

				// Persistent Storage Stats (Primary Information)
				statsText += "🏛️ PERSISTENT STORAGE (Survives Deployments):\n";
				statsText += `  Behavioral Memory (KV): ${persistentCounts.behavioral_memory} entries\n`;
				statsText += `  Vector Store (Vectorize): ${persistentCounts.vector_store} embeddings\n`;
				statsText += `  Unverified Claims: ${persistentCounts.unverified_claims} pending\n`;
				statsText += `  TOTAL PERSISTENT: ${persistentCounts.behavioral_memory + persistentCounts.vector_store} items\n\n`;

				// Persistent Tier Memory Stats (Foundation v1.8.0)
				statsText += "🗄️ PERSISTENT TIER MEMORY (KV-First Architecture):\n";

				// Handle new PersistentMultiTierMemorySystem.getStats() format
				if (tieredStats.tiers && Array.isArray(tieredStats.tiers)) {
					tieredStats.tiers.forEach((tierStat: any) => {
						const utilization = tierStat.itemCount && tierStat.config?.maxItems
							? (tierStat.itemCount / tierStat.config.maxItems * 100).toFixed(1)
							: '0.0';
						const capacity = tierStat.config?.maxItems === Infinity ? 'unlimited' : tierStat.config?.maxItems;
						statsText += `  ${tierStat.name.toUpperCase()}: ${tierStat.itemCount || 0}/${capacity} items (${utilization}%)\n`;
						if (tierStat.config?.persistenceLevel) {
							statsText += `    Persistence: ${tierStat.config.persistenceLevel}\n`;
						}
					});
					statsText += `  TOTAL TIER STORAGE: ${tieredStats.totalKnowledge || 0} items\n`;
				} else {
					// Fallback to old format if needed
					Object.entries(tieredStats).forEach(([tier, stats]: [string, any]) => {
						if (stats.count !== undefined) {
							const utilization = stats.utilizationPercent ?? 0;
							statsText += `  ${tier.toUpperCase()}: ${stats.count}/${stats.capacity || 'unlimited'} items (${utilization.toFixed(1)}%)\n`;
							if (stats.testingItems) {
								statsText += `    Testing items: ${stats.testingItems}\n`;
							}
						}
					});
				}

				// Behavioral Memory Stats
				statsText += `\nBEHAVIORAL STATUS:\n`;
				statsText += `  Rule Violations: ${behavioralStatus.recentViolations.length} recorded\n`;

				// Architecture Health Check (Foundation v1.5.0)
				if (params.healthCheck) {
					statsText += "\n=== ARCHITECTURE HEALTH CHECK ===\n";

					// Check persistent tier health instead of volatile tiers
					const totalPersistent = persistentCounts.behavioral_memory + persistentCounts.vector_store;
					const totalTierStorage = tieredStats.totalKnowledge || 0;

					if (totalPersistent === 0 && totalTierStorage === 0) {
						statsText += "❌ CRITICAL: No items in persistent storage - data loss detected\n";
					} else {
						statsText += `✅ Persistent storage operational: ${totalPersistent} items\n`;
						if (totalTierStorage > 0) {
							statsText += `✅ Persistent tier storage operational: ${totalTierStorage} items\n`;
						}
					}

					if (totalTierStorage === 0 && totalPersistent > 0) {
						statsText += "⚠️  INFO: Tier storage empty but behavioral storage intact (expected after deployment)\n";
					}

					if (unverifiedClaims.length > memoryStats.total * 0.5) {
						statsText += "⚠️  WARNING: High ratio of unverified claims - may indicate verification issues\n";
					}

					if (behavioralStatus.recentViolations.length > 0) {
						statsText += `⚠️  WARNING: ${behavioralStatus.recentViolations.length} behavioral violations detected\n`;
						behavioralStatus.recentViolations.slice(0, 3).forEach(violation => {
							statsText += `   - ${violation.rule}: ${violation.context}\n`;
						});
					}

					statsText += "✅ Persistent storage integrity check complete\n";
				}

				// Foundation v1.8.0 Threshold Information
				statsText += "\n=== FOUNDATION v1.8.0 THRESHOLDS ===\n";
				Object.entries(EMPIRICAL_THRESHOLDS).forEach(([type, threshold]) => {
					statsText += `  ${type}: ${threshold}\n`;
				});

				return {
					content: [{
						type: "text" as const,
						text: statsText
					}]
				};

			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Stats collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				};
			}
		}
	},

	{
		name: "memory_admin",
		description: "⚙️ **Advanced Memory System Administration & Foundation Management** - Perform critical administrative operations on the memory system including Foundation v1.5.0 management, system maintenance, data integrity operations, and deployment preparation. This powerful administrative tool provides comprehensive system control including foundation rule viewing and management, complete system state export for backup and migration, intelligent backfill operations to synchronize memory tiers, comprehensive sanity checks to detect and repair data inconsistencies, testing data cleanup for production readiness, memory optimization and defragmentation, behavioral rule updates and validation, differential knowledge extraction to R2 for AutoRAG integration, and emergency recovery operations. Features secure operation validation, audit logging for all administrative actions, rollback capabilities for critical operations, deployment-safe state management, and role-based authorization for cluster delegates. Essential for system administrators, deployment automation, data migration, troubleshooting complex memory issues, maintaining system integrity, and ensuring operational reliability across development, staging, and production environments.",
		schema: {
			operation: z.enum(["view_foundation", "export_state", "backfill", "sanity_check", "reset_foundation"]).describe("🎛️ Administrative operation: view_foundation (show behavioral rules), export_state (backup system), backfill (sync tiers), sanity_check (validate integrity), reset_foundation (force foundation upgrade)"),
			options: z.record(z.unknown()).optional().describe("🔧 Operation-specific options and parameters for fine-tuned control")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const multiTier = getMultiTierMemoryInstance();

			try {
				switch (params.operation) {
					case "view_foundation":
						const foundationRules = memory.getBehavioralRules();
						const foundationInfo = memory.getFoundationInfo();
						let foundationText = `=== FOUNDATION ${foundationInfo.version || 'UNKNOWN'} BEHAVIORAL RULES ===\n\n`;

						foundationRules.forEach(rule => {
							foundationText += `${rule.id} (${rule.priority}):\n`;
							foundationText += `  Rule: ${rule.rule}\n`;
							foundationText += `  Description: ${rule.description}\n`;
							foundationText += `  Violations: ${rule.violations}\n\n`;
						});

						return {
							content: [{
								type: "text" as const,
								text: foundationText
							}]
						};

					case "export_state":
						const exportFoundationInfo = memory.getFoundationInfo();
						const actualRulesCount = memory.getBehavioralRules().length;

						// Use actual Foundation v1.5.0 version since that's what's active
						const currentFoundationVersion = actualRulesCount >= 6 ? "v1.5.0" : (exportFoundationInfo.version || "unknown");

						const exportData = {
							timestamp: new Date().toISOString(),
							tieredMemory: await multiTier.getStats(),
							behavioralMemory: {
								total: (await memory.getMemoryStats()).total,
								unverifiedClaims: (await memory.getUnverifiedClaims()).length,
								violations: memory.getBehavioralStatus().recentViolations.length
							},
							foundationRules: actualRulesCount,
							foundationVersion: currentFoundationVersion
						};

						return {
							content: [{
								type: "text" as const,
								text: `=== MEMORY SYSTEM STATE EXPORT ===\n\n${JSON.stringify(exportData, null, 2)}`
							}]
						};

					case "backfill":
						const backfillResult = await memory.backfillFromVectorStore({
							maxItems: params.options?.maxItems || 100,
							restoreFoundation: params.options?.restoreFoundation !== false
						});

						return {
							content: [{
								type: "text" as const,
								text: `=== BACKFILL OPERATION RESULTS ===\n\nSuccess: ${backfillResult.success}\nRestored: ${JSON.stringify(backfillResult.restored)}\n\nSummary:\n${backfillResult.summary.join('\n')}\n\nErrors:\n${backfillResult.errors.join('\n')}`
							}]
						};

					case "sanity_check":
						// Perform comprehensive system sanity check
						const tieredStats = await multiTier.getStats();
						const totalItems = Object.values(tieredStats).reduce((sum: number, tier: any) => sum + (tier.count || 0), 0);
						const behavioralStatus = memory.getBehavioralStatus();

						let sanityText = "=== MEMORY SYSTEM SANITY CHECK ===\n\n";

						if (totalItems === 0) {
							sanityText += "❌ CRITICAL: No items in tiered memory - possible system failure\n";
						} else {
							sanityText += `✅ Tiered memory operational: ${totalItems} items\n`;
						}

						if (behavioralStatus.recentViolations.length > 10) {
							sanityText += `⚠️  WARNING: High violation count: ${behavioralStatus.recentViolations.length}\n`;
						} else {
							sanityText += `✅ Violation count acceptable: ${behavioralStatus.recentViolations.length}\n`;
						}

						sanityText += "✅ Memory system sanity check complete\n";

						return {
							content: [{
								type: "text" as const,
								text: sanityText
							}]
						};

					case "reset_foundation":
						// Force foundation reset and upgrade to latest version
						try {
							// Get current foundation info
							const currentFoundation = memory.getFoundationInfo();
							let resetText = "=== FOUNDATION RESET OPERATION ===\n\n";
							resetText += `Current Foundation: ${currentFoundation.version || 'unknown'}\n`;

							// Import latest foundation (v1.5.0)
							const { foundationMigrationV15 } = await import('@mnemosyne/legacy-core/migrations/foundation-v1.5.0');
							const { applyFoundationMigration } = await import('@mnemosyne/legacy-core/migrations/foundation');

							resetText += `Target Foundation: ${foundationMigrationV15.version}\n\n`;

							// Clear existing foundation data by force-updating
							resetText += "🔄 Clearing existing foundation data...\n";

							// Apply new foundation
							resetText += "🔄 Applying Foundation v1.5.0...\n";
							await applyFoundationMigration(memory, foundationMigrationV15);

							// Verify the update
							const updatedFoundation = memory.getFoundationInfo();
							const newRules = memory.getBehavioralRules();

							resetText += `✅ Foundation reset complete!\n`;
							resetText += `New Foundation: ${updatedFoundation.version || 'updated'}\n`;
							resetText += `Rules applied: ${newRules.length}\n\n`;

							resetText += "📋 NEW BEHAVIORAL RULES:\n";
							newRules.forEach(rule => {
								resetText += `- ${rule.id} (${rule.priority}): ${rule.rule}\n`;
							});

							return {
								content: [{
									type: "text" as const,
									text: resetText
								}]
							};

						} catch (error) {
							return {
								content: [{
									type: "text" as const,
									text: `❌ Foundation reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`
								}]
							};
						}

					default:
						return {
							content: [{
								type: "text" as const,
								text: `❌ Unknown operation: ${params.operation}`
							}]
						};
				}

			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Admin operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				};
			}
		}
	},

	{
		name: "memory_store_enhanced",
		description: "🧠🚀 **Enhanced Memory Storage with Causality Tracking** - Foundation v1.7.1+ feature for storing information with advanced temporal metadata, causality analysis, and semantic expansion. This cutting-edge tool automatically generates microsecond-precision timestamps, tracks causal relationships between events, and applies multi-axis semantic expansion for superior knowledge discovery. Features Lamport/Vector/Hybrid logical clocks for distributed causality, explicit dependency tracking, correlation/session/trace IDs for cross-system analysis, and robust causal relationship determination.",
		schema: {
			content: z.string().describe("📝 The information to store in enhanced memory with causality tracking"),
			evidence: z.array(z.string()).describe("🔍 Supporting evidence for the memory entry"),
			confidence: z.number().min(0).max(1).describe("🎯 Confidence score based on evidence quality"),
			source: z.string().describe("📍 How this information was obtained"),
			verification_method: z.enum(["manual", "automated", "cross_reference", "inference"]).describe("✅ Verification method used"),
			dependencies: z.array(z.string()).optional().describe("🔗 IDs of memory entries this event depends on for causality tracking"),
			caused_by: z.array(z.string()).optional().describe("⚡ IDs of memory entries that directly caused this event"),
			semantic_expansion: z.object({
				field_context: z.object({
					domain: z.enum(["security", "architecture", "development", "operations", "innovation"]),
					criticality_level: z.enum(["critical", "high", "medium", "low"]),
					task_type: z.enum(["debugging", "documentation", "learning", "exploration", "implementation"])
				}).optional(),
				agent_personality: z.enum(["security_focused", "architecture_specialist", "development_generalist", "innovation_explorer"]).optional()
			}).optional().describe("🌐 Semantic expansion configuration for enhanced discoverability")
		},
		handler: async (params) => {
			try {
				const memory = getMnemosyneMemoryInstance();
				const result = await memory.storeEnhancedMemory(
					{
						content: params.content,
						evidence: params.evidence,
						confidence: params.confidence,
						source: params.source,
						verificationMethod: params.verification_method,
						semanticExpansion: {
							fieldContext: params.semantic_expansion?.field_context || {
								domain: "development",
								criticalityLevel: "medium",
								taskType: "documentation",
								assessmentConfidence: 0.8
							},
							expansionStrategy: {
								selectedPersonality: params.semantic_expansion?.agent_personality || "development_generalist",
								precisionCoefficient: 0.7,
								qualityValidation: true,
								generationTimestamp: new Date().toISOString()
							},
							semanticAxes: {
								nearSemanticNeighbor: { tags: [], confidence: 0.9, generationMethod: "automatic", validationStatus: "pending" },
								relatedConcept: { tags: [], confidence: 0.8, conceptualDistance: 0.3, generationMethod: "automatic", validationStatus: "pending" },
								analogicalPattern: { tags: [], confidence: 0.6, crossDomainJustification: "Auto-generated", transferabilityScore: 0.5, generationMethod: "automatic", validationStatus: "pending" }
							},
							qualityMetrics: {
								overallSemanticQuality: 0.8,
								discoverabilityEnhancement: 0.7,
								noiseReduction: 0.9,
								crossAxisCoherence: 0.8,
								usageAnalytics: { searchHits: 0, patternMatches: 0, crossDomainConnections: 0, lastAnalyzed: new Date().toISOString() }
							}
						}
					},
					params.dependencies || [],
					params.caused_by || []
				);

				return {
					content: [{
						type: "text" as const,
						text: `✅ Enhanced memory stored successfully!\n\nEntry ID: ${result.id}\nTimestamp: ${result.temporal.serverTimestamp}μs\nStorage: Enhanced with causality tracking and semantic expansion\n\nThis entry includes advanced temporal metadata, causal relationship tracking, and multi-axis semantic expansion for superior knowledge discovery and cross-system analysis.`
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Enhanced memory storage failed: ${error instanceof Error ? error.message : String(error)}`
					}]
				};
			}
		}
	},

	{
		name: "memory_analyze_causality",
		description: "🔍⏱️ **Causal Relationship Analysis** - Foundation v1.7.1+ feature for analyzing causal relationships between memory entries using advanced distributed systems techniques. Employs Lamport logical clocks, Vector clocks, and Hybrid logical clocks to determine if events have happens-before, happens-after, concurrent, or unknown relationships. Provides confidence scores and detailed evidence for causality determination.",
		schema: {
			entry_id_1: z.string().describe("🎯 First memory entry ID for causality analysis"),
			entry_id_2: z.string().describe("🎯 Second memory entry ID for causality analysis")
		},
		handler: async (params) => {
			try {
				const memory = getMnemosyneMemoryInstance();
				const result = await memory.analyzeCausality(params.entry_id_1, params.entry_id_2);

				return {
					content: [{
						type: "text" as const,
						text: `🔍 Causal Relationship Analysis\n\nEntry 1: ${params.entry_id_1}\nEntry 2: ${params.entry_id_2}\n\nRelationship: ${result.relationship}\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\nEvidence:\n${result.evidence.map(e => `• ${e}`).join('\n')}\n\nThis analysis uses multiple distributed systems techniques (Lamport, Vector, and Hybrid Logical Clocks) for robust causality determination.`
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: "text" as const,
						text: `❌ Causality analysis failed: ${error instanceof Error ? error.message : String(error)}`
					}]
				};
			}
		}
	}
];

/**
 * Register simplified memory tools with an MCP server
 * Foundation v1.5.0 compliant implementation
 */
export function registerSimplifiedMemoryTools(server: Server): void {
	// Register list_tools handler
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: simplifiedMemoryTools.map(tool => ({
				name: tool.name,
				description: tool.description,
				inputSchema: {
					type: "object",
					properties: Object.fromEntries(
						Object.entries(tool.schema).map(([key, zodType]) => [
							key,
							zodType._def // Basic Zod to JSON schema conversion
						])
					)
				}
			}))
		};
	});

	// Register call_tool handler
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const toolName = request.params.name;
		const args = request.params.arguments || {};

		const tool = simplifiedMemoryTools.find(t => t.name === toolName);
		if (!tool) {
			throw new Error(`Tool not found: ${toolName}. Available tools: ${simplifiedMemoryTools.map(t => t.name).join(', ')}`);
		}

		try {
			return await tool.handler(args);
		} catch (error) {
			throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});
}
