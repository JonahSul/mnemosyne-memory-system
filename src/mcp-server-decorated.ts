/**
 * MCP Server Integration with Decorator-based Tool Registry
 * 
 * This file demonstrates how to replace manual ToolImplementation[] arrays
 * with automated decorator-based tool registration using the ToolRegistryBuilder.
 */

import { z } from "zod";
import { McpTool, ToolRegistryBuilder, ToolImplementation } from './modules/tool-registry';
import { MnemosyneMemorySystem } from './memory-tool';

/**
 * Example of how the existing memory tools can be refactored to use decorators
 */
export class DecoratedMemoryTools {
	private memory: MnemosyneMemorySystem;

	constructor(memory: MnemosyneMemorySystem) {
		this.memory = memory;
	}

	@McpTool({
		name: 'memory_log_claim',
		description: 'Log a claim or assertion made by the AI agent that requires verification. CRITICAL: Use this immediately after making any factual statement, assumption, or conclusion to enable later accountability and behavioral correction. This tool is essential for maintaining truth tracking and preventing false confidence in unverified statements.',
		schema: {
			claim: z.string().describe("The exact claim being made (e.g., 'The deployment was successful', 'The bug is in line 42', 'User wants feature X')"),
			context: z.record(z.unknown()).optional().describe("Additional context including reasoning, assumptions, or supporting data that led to this claim"),
			confidence: z.enum(['low', 'medium', 'high']).optional().describe("Agent's confidence level in this claim - use 'low' for assumptions, 'high' for verified facts"),
			source: z.string().optional().describe("Source of information supporting this claim (e.g., 'file analysis', 'user statement', 'documentation')")
		},
		category: 'memory',
		priority: 10,
		access: 'public'
	})
	async logClaim(params: {
		claim: string;
		context?: Record<string, unknown>;
		confidence?: 'low' | 'medium' | 'high';
		source?: string;
	}) {
		// Simulate claim logging to memory system
		const claimId = `claim_${Date.now()}`;
		
		return {
			content: [{
				type: "text" as const,
				text: `📝 **Claim Logged** (ID: ${claimId})

**Claim**: ${params.claim}
**Confidence**: ${params.confidence || 'not specified'}
**Source**: ${params.source || 'not specified'}
**Status**: ⏳ Pending Verification

⚠️ **IMPORTANT**: This claim is unverified until evidence is provided. Do not treat as confirmed fact.

**Next Action Required**: Verify this claim with concrete evidence using memory_verify_claim when information becomes available.`
			}]
		};
	}

	@McpTool({
		name: 'memory_verify_claim',
		description: 'Verify a previously logged claim with concrete evidence. ESSENTIAL: Use this when you obtain evidence that confirms or refutes a previous claim. This tool is critical for behavioral integrity and self-correction - it prevents the agent from maintaining false beliefs and enables learning from verification outcomes.',
		schema: {
			claimId: z.string().describe("The unique ID of the claim to verify (obtained from memory_log_claim)"),
			evidence: z.string().describe("Concrete evidence supporting or refuting the claim - be specific about what was observed, tested, or confirmed"),
			success: z.boolean().describe("Whether the claim was verified as TRUE (confirmed by evidence) or FALSE (refuted by evidence)"),
			notes: z.string().optional().describe("Additional notes about the verification process, lessons learned, or implications")
		},
		category: 'memory',
		priority: 9,
		access: 'public'
	})
	async verifyClaim(params: {
		claimId: string;
		evidence: string;
		success: boolean;
		notes?: string;
	}) {
		const statusIcon = params.success ? '✅' : '❌';
		const statusText = params.success ? 'CONFIRMED' : 'REFUTED';
		const implication = params.success ? 
			'✅ This claim is now verified and can be trusted.' : 
			'❌ This claim has been refuted. Update assumptions and avoid similar false conclusions.';
		
		return {
			content: [{
				type: "text" as const,
				text: `${statusIcon} **Claim Verified** (ID: ${params.claimId})

**Status**: ${statusText}
**Evidence**: ${params.evidence}
${params.notes ? `**Notes**: ${params.notes}` : ''}

**Behavioral Impact**: ${implication}

**Learning**: ${params.success ? 
	'Successful verification reinforces accurate reasoning patterns.' : 
	'Failed verification indicates need to improve claim accuracy and verification habits.'}`
			}]
		};
	}

	@McpTool({
		name: 'memory_check_behavioral_status',
		description: 'Check current behavioral status including unverified claims, rule violations, and compliance metrics. ESSENTIAL for self-monitoring: Use this tool regularly to assess behavioral performance and identify areas needing attention. This enables proactive behavioral correction and maintains awareness of memory system state.',
		schema: {
			focusArea: z.enum(['claims', 'violations', 'patterns', 'all']).optional().describe("Focus the status check on specific behavioral area"),
			includeHistory: z.string().optional().describe("Whether to include detailed historical behavioral data and patterns")
		},
		category: 'memory',
		priority: 8,
		access: 'public'
	})
	async checkBehavioralStatus(params: {
		focusArea?: 'claims' | 'violations' | 'patterns' | 'all';
		includeHistory?: string;
	}) {
		return {
			content: [{
				type: "text" as const,
				text: `🧠 **Behavioral Status Report**

Focus Area: ${params.focusArea || 'all'}

**📋 Claims Management**
• System operational and monitoring claims

**⚠️ Rule Compliance**
• Foundation rules active and enforced

**📊 Behavioral Patterns**
• Learning patterns being tracked
• Behavioral compliance maintained

**🎯 Recommendations**
• ✅ System functioning normally
• Continue monitoring claims and compliance`
			}]
		};
	}
}

/**
 * Demonstration of how to replace manual tool registry with decorator-based approach
 */
export class McpServerWithDecoratedTools {
	private memory: MnemosyneMemorySystem;
	private registry: ToolRegistryBuilder;
	private decoratedTools: DecoratedMemoryTools;

	constructor() {
		this.memory = new MnemosyneMemorySystem();
		this.registry = new ToolRegistryBuilder();
		this.decoratedTools = new DecoratedMemoryTools(this.memory);
		
		// Scan decorated tools and build registry
		this.registry.scanInstance(this.decoratedTools);
	}

	/**
	 * Get all tools in MCP format - replaces manual ToolImplementation[] array
	 */
	getTools(): ToolImplementation[] {
		return this.registry
			.filterByAccess('public')
			.excludeDeprecated()
			.sortByPriority()
			.getTools();
	}

	/**
	 * Get tool handlers for execution
	 */
	getToolsWithHandlers() {
		return this.registry.getToolsWithHandlers();
	}

	/**
	 * Execute a tool by name
	 */
	async executeTool(toolName: string, params: any) {
		const handler = this.registry.getHandler(toolName);
		if (!handler) {
			throw new Error(`Tool ${toolName} not found`);
		}
		return handler(params);
	}

	/**
	 * Get registry metadata for debugging
	 */
	getRegistryMetadata() {
		return this.registry.getMetadata();
	}

	/**
	 * Filter tools by category
	 */
	getToolsByCategory(category: string): ToolImplementation[] {
		return new ToolRegistryBuilder()
			.scanInstance(this.decoratedTools)
			.filterByCategory(category)
			.getTools();
	}

	/**
	 * Get available tool categories
	 */
	getToolCategories(): string[] {
		const metadata = this.registry.getMetadata();
		const categories = new Set(metadata
			.map(m => m.metadata.category)
			.filter(Boolean)
		);
		return Array.from(categories);
	}
}

/**
 * Example of how to migrate from manual registry
 * 
 * BEFORE (manual approach):
 * const tools: ToolImplementation[] = [
 *   {
 *     name: 'memory_log_claim',
 *     description: '...',
 *     inputSchema: { ... }
 *   },
 *   // ... more manual definitions
 * ];
 * 
 * AFTER (decorator approach):
 * const server = new McpServerWithDecoratedTools();
 * const tools = server.getTools(); // Automatically scanned from decorators
 */

// Export for integration with existing MCP server
export function createDecoratedToolRegistry(memory: MnemosyneMemorySystem): ToolRegistryBuilder {
	const registry = new ToolRegistryBuilder();
	const decoratedTools = new DecoratedMemoryTools(memory);
	registry.scanInstance(decoratedTools);
	return registry;
}

// Export individual tool class for manual integration if needed
export { DecoratedMemoryTools };
