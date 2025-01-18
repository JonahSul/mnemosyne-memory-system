/**
 * Mnemosyne Memory System Tools Registry
 * 
 * Centralizes all cognitive enhancement and behavioral regulation tools for clean separation of concerns.
 * Extracted from monolithic MCP server for better maintainability and modular development.
 */

import { z } from "zod";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MnemosyneMemorySystem } from "../memory-tool.js";
import { VectorStore } from "../vector-store.js";
import { MultiTierMemorySystem } from "../multi-tier-memory.js";
import { foundationMigrationV1 } from "../../migrations/foundation.js";

// Tool implementation interface
export interface ToolImplementation {
	name: string;
	description: string;
	schema: Record<string, z.ZodType>;
	handler: (params: any) => Promise<{
		content: Array<{
			type: "text";
			text: string;
		}>;
		isError?: boolean;
	}>;
}

// Helper functions for singleton instances
let memoryInstance: MnemosyneMemorySystem | null = null;
function getMnemosyneMemoryInstance(): MnemosyneMemorySystem {
	if (!memoryInstance) {
		memoryInstance = new MnemosyneMemorySystem();
		// Foundation is applied during initialization
	}
	return memoryInstance;
}

let vectorStoreInstance: VectorStore | null = null;
function getVectorStoreInstance(): VectorStore {
	if (!vectorStoreInstance) {
		vectorStoreInstance = new VectorStore();
	}
	return vectorStoreInstance;
}

let multiTierMemoryInstance: MultiTierMemorySystem | null = null;
function getMultiTierMemoryInstance(): MultiTierMemorySystem {
	if (!multiTierMemoryInstance) {
		multiTierMemoryInstance = new MultiTierMemorySystem();
	}
	return multiTierMemoryInstance;
}

// Memory tools definitions with full behavioral and vector capabilities
export const memoryTools: ToolImplementation[] = [
	{
		name: "memory_log_claim",
		description: "Log a claim or assertion made by the AI agent that requires verification. CRITICAL: Use this immediately after making any factual statement, assumption, or conclusion to enable later accountability and behavioral correction. This tool is essential for maintaining truth tracking and preventing false confidence in unverified statements.",
		schema: {
			claim: z.string().describe("The exact claim being made (e.g., 'The deployment was successful', 'The bug is in line 42', 'User wants feature X')"),
			confidence: z.enum(["low", "medium", "high"]).optional().describe("Agent's confidence level in this claim - use 'low' for assumptions, 'high' for verified facts"),
			source: z.string().optional().describe("Source of information supporting this claim (e.g., 'file analysis', 'user statement', 'documentation')"),
			context: z.record(z.unknown()).optional().describe("Additional context including reasoning, assumptions, or supporting data that led to this claim")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const claimId = memory.logClaim(params.claim, {
				confidence: params.confidence || "medium",
				source: params.source || "ai-agent",
				context: params.context || {},
				timestamp: new Date().toISOString()
			});

			return {
				content: [{
					type: "text" as const,
					text: `Claim logged (ID: ${claimId}): ${params.claim} [Confidence: ${params.confidence || "medium"}]`
				}]
			};
		}
	},

	{
		name: "memory_verify_claim",
		description: "Verify a previously logged claim with concrete evidence. ESSENTIAL: Use this when you obtain evidence that confirms or refutes a previous claim. This tool is critical for behavioral integrity and self-correction - it prevents the agent from maintaining false beliefs and enables learning from verification outcomes.",
		schema: {
			claimId: z.string().describe("The unique ID of the claim to verify (obtained from memory_log_claim)"),
			success: z.boolean().describe("Whether the claim was verified as TRUE (confirmed by evidence) or FALSE (refuted by evidence)"),
			evidence: z.string().describe("Concrete evidence supporting or refuting the claim - be specific about what was observed, tested, or confirmed"),
			notes: z.string().optional().describe("Additional notes about the verification process, lessons learned, or implications")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			memory.verifyClaim(params.claimId, params.evidence, params.success);

			return {
				content: [{
					type: "text" as const,
					text: `Claim ${params.claimId} verified as ${params.success ? "CONFIRMED" : "REFUTED"} with evidence: ${params.evidence}`
				}]
			};
		}
	},

	{
		name: "memory_check_behavioral_status",
		description: "Check current behavioral status including unverified claims, rule violations, and compliance metrics. ESSENTIAL for self-monitoring: Use this tool regularly to assess behavioral performance and identify areas needing attention. This enables proactive behavioral correction and maintains awareness of Mnemosyne memory state.",
		schema: {
			focusArea: z.enum(["claims", "violations", "patterns", "all"]).optional().describe("Focus the status check on specific behavioral area"),
			includeHistory: z.string().optional().describe("Whether to include detailed historical behavioral data and patterns")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const status = memory.getBehavioralStatus();
			
			const responseText = `Behavioral Status: HEALTHY | Unverified Claims: ${status.unverifiedClaims} | Recent Violations: ${status.recentViolations.length}`;

			return {
				content: [{
					type: "text" as const,
					text: responseText
				}]
			};
		}
	},

	{
		name: "memory_view_foundation",
		description: "View the foundational behavioral rules that are automatically active in the Mnemosyne memory system. ESSENTIAL FIRST STEP: Use this tool immediately when connecting to understand the behavioral framework and constraints that govern AI actions. These rules form the safety and operational foundation for all agent behavior.",
		schema: {
			ruleId: z.string().optional().describe("View details for a specific foundation rule by ID"),
			includeExamples: z.string().optional().describe("Include practical examples of rule application"),
			checkCompliance: z.string().optional().describe("Include current compliance status for each rule")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const foundation = memory.getFoundationInfo();
			
			return {
				content: [{
					type: "text" as const,
					text: `Foundation Version: ${foundation.version} | Applied: ${foundation.timestamp}`
				}]
			};
		}
	},

	{
		name: "memory_record_violation",
		description: "Record a violation of established behavioral rules when detected. CRITICAL for self-correction: Use this immediately when you recognize that previous actions violated behavioral guidelines. This tool enables learning from mistakes and prevents repeated violations of the same rules.",
		schema: {
			ruleId: z.string().describe("The ID of the behavioral rule that was violated (from foundation rules or custom rules)"),
			context: z.string().describe("Detailed description of how and when the violation occurred, including specific actions taken"),
			severity: z.enum(["minor", "moderate", "major", "critical"]).optional().describe("Severity assessment of the violation"),
			correctionPlan: z.string().optional().describe("Specific plan for correcting the violation and preventing recurrence")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			memory.recordViolation(params.ruleId, params.context);

			return {
				content: [{
					type: "text" as const,
					text: `Violation recorded for rule ${params.ruleId}: ${params.context}`
				}]
			};
		}
	},

	{
		name: "memory_update_foundation",
		description: "Deploy a new foundation migration to the running server. POWERFUL: This tool enables hot-deployment of behavioral rule changes without server restart. Use for A/B testing behavioral rules, emergency corrections, or gradual rollouts of foundation updates. Validate carefully before deployment.",
		schema: {
			migration: z.record(z.unknown()).describe("Complete foundation migration object with rules, patterns, and metadata"),
			options: z.record(z.unknown()).optional().describe("Update options and behavior controls")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			
			try {
				const result = memory.updateFoundation(params.migration, params.options || {});
				return {
					content: [{
						type: "text" as const,
						text: `Foundation updated successfully. Changes: ${result.changes.length}, Success: ${result.success}`
					}]
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
				return {
					content: [{
						type: "text" as const,
						text: `Foundation update failed: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	},

	{
		name: "memory_export_state",
		description: "Export the complete Mnemosyne memory system state for analysis, debugging, or persistence. Use this tool when you need comprehensive insight into behavioral patterns, claim verification history, or system performance. Essential for deep analysis and understanding behavioral trends over time.",
		schema: {
			format: z.enum(["summary", "detailed", "raw"]).optional().describe("Export format: 'summary' for overview, 'detailed' for analysis, 'raw' for complete data"),
			filterType: z.enum(["claims", "violations", "rules", "all"]).optional().describe("Filter export to specific data types"),
			includeMetadata: z.string().optional().describe("Whether to include system metadata and timestamps")
		},
		handler: async (params) => {
			const memory = getMnemosyneMemoryInstance();
			const exportData = memory.exportState();

			return {
				content: [{
					type: "text" as const,
					text: `Memory state exported: ${JSON.stringify(exportData, null, 2)}`
				}]
			};
		}
	},

	// Vector Knowledge Tools for RAG-based working memory
	{
		name: "memory_store_knowledge",
		description: "store knowledge with semantic embeddings for RAG-based retrieval. Extends Mnemosyne's behavioral memory with working memory capabilities for contextual information storage and semantic search.",
		schema: {
			content: z.string().describe("The knowledge content to store (text, facts, procedures, etc.)"),
			metadata: z.record(z.unknown()).optional().describe("Structured metadata about the knowledge (type, domain, importance, etc.)"),
			tags: z.array(z.string()).optional().describe("Tags for categorization and filtering")
		},
		handler: async (params) => {
			const vectorStore = getVectorStoreInstance();
			const knowledge = {
				content: params.content,
				metadata: params.metadata || {},
				tags: params.tags || []
			};

			const result = await vectorStore.storeKnowledge(knowledge);

			return {
				content: [{
					type: "text" as const,
					text: `Knowledge stored with ID: ${result.id}, embedding dimension: ${result.embedding.length}`
				}]
			};
		}
	},

	{
		name: "memory_search_knowledge",
		description: "search knowledge using semantic similarity. Performs RAG-based retrieval to find contextually relevant information from the working memory knowledge base.",
		schema: {
			query: z.string().describe("The search query or question to find related knowledge"),
			limit: z.number().optional().describe("Maximum number of results to return (default: 5)"),
			threshold: z.number().optional().describe("Minimum similarity threshold for results (0-1, default: 0.1)")
		},
		handler: async (params) => {
			const vectorStore = getVectorStoreInstance();
			const results = await vectorStore.searchSimilar(params.query, {
				limit: params.limit || 5,
				threshold: params.threshold || 0.1
			});

			const summaryText = `Found ${results.length} knowledge items for query: "${params.query}"`;
			const detailsText = results.map((result, index) => 
				`${index + 1}. [${(result.similarity * 100).toFixed(1)}%] ${result.content}`
			).join('\n');

			return {
				content: [{
					type: "text" as const,
					text: `${summaryText}\n${detailsText}`
				}]
			};
		}
	},

	// Multi-Tier Memory Tools for hierarchical knowledge management
	{
		name: "memory_store_tiered",
		description: "Store knowledge in the multi-tier memory system with automatic tier placement based on importance. Provides hierarchical memory with short-term (working), intermediate-term (frequent), and long-term (important) storage.",
		schema: {
			content: z.string().describe("The knowledge content to store"),
			importance: z.number().optional().describe("Importance score 0-1 (determines tier placement: <0.3=short, 0.3-0.7=intermediate, >0.7=long)"),
			targetTier: z.enum(["short", "intermediate", "long"]).optional().describe("Override automatic tier placement"),
			metadata: z.record(z.unknown()).optional().describe("Additional metadata"),
			tags: z.array(z.string()).optional().describe("Tags for categorization")
		},
		handler: async (params) => {
			const multiTierMemory = getMultiTierMemoryInstance();
			const result = await multiTierMemory.storeKnowledge({
				content: params.content,
				importance: params.importance,
				targetTier: params.targetTier,
				metadata: params.metadata || {},
				tags: params.tags || []
			});

			return {
				content: [{
					type: "text" as const,
					text: `Knowledge stored in ${result.tier} tier with ID: ${result.id}`
				}]
			};
		}
	},

	{
		name: "memory_search_tiered",
		description: "Search across all memory tiers or target specific tiers with tier-aware ranking. Higher tiers (long-term) receive ranking boosts for better recall of important information.",
		schema: {
			query: z.string().describe("The search query"),
			tierPreference: z.enum(["short", "intermediate", "long", "all"]).optional().describe("Which tier(s) to search (default: all)"),
			limit: z.number().optional().describe("Maximum results (default: 5)"),
			threshold: z.number().optional().describe("Similarity threshold (default: 0.1)")
		},
		handler: async (params) => {
			const multiTierMemory = getMultiTierMemoryInstance();
			const results = await multiTierMemory.searchSimilar(params.query, {
				tierPreference: params.tierPreference || "all",
				limit: params.limit || 5,
				threshold: params.threshold || 0.1
			});

			const summaryText = `Found ${results.length} items across memory tiers for: "${params.query}"`;
			const detailsText = results.map((result, index) => 
				`${index + 1}. [${result.tier.toUpperCase()}] ${(result.similarity * 100).toFixed(1)}% - ${result.content}`
			).join('\n');

			return {
				content: [{
					type: "text" as const,
					text: `${summaryText}\n${detailsText}`
				}]
			};
		}
	},

	{
		name: "memory_stats_tiered",
		description: "Get memory statistics across all tiers including usage, capacity, and access patterns. Useful for monitoring memory system performance and tier utilization.",
		schema: {},
		handler: async (params) => {
			const multiTierMemory = getMultiTierMemoryInstance();
			const stats = multiTierMemory.getMemoryStats();

			const statsText = [
				"=== MULTI-TIER MEMORY STATISTICS ===",
				"",
				`SHORT-TERM MEMORY:`,
				`  Items: ${stats.short.count}/${stats.short.capacity}`,
				`  Utilization: ${stats.short.utilizationPercent.toFixed(1)}%`,
				"",
				`INTERMEDIATE-TERM MEMORY:`,
				`  Items: ${stats.intermediate.count}/${stats.intermediate.capacity}`,
				`  Utilization: ${stats.intermediate.utilizationPercent.toFixed(1)}%`,
				"",
				`LONG-TERM MEMORY:`,
				`  Items: ${stats.long.count}/${stats.long.capacity}`,
				`  Utilization: ${stats.long.utilizationPercent.toFixed(1)}%`,
				"",
				`TOTAL: ${stats.total.count} items across all tiers`
			].join('\n');

			return {
				content: [{
					type: "text" as const,
					text: statsText
				}]
			};
		}
	}
];

/**
 * Register memory tools with an MCP server
 * 
 * This function integrates all Mnemosyne memory tools with the Model Context Protocol
 * server, enabling cognitive enhancement capabilities through the standard MCP interface.
 */
export function registerMemoryTools(server: Server): void {
	// Register list_tools handler
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: memoryTools.map(tool => ({
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

		const tool = memoryTools.find(t => t.name === toolName);
		if (!tool) {
			throw new Error(`Tool not found: ${toolName}`);
		}

		try {
			return await tool.handler(args);
		} catch (error) {
			throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});
}
