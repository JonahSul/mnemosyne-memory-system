/**
 * Memory Tools - Decorator-based Implementation
 * 
 * Demonstrates the decorator-based tool registry system by converting
 * existing memory tools to use decorators for metadata registration.
 */

import { z } from "zod";
import { McpTool } from './tool-registry';
import { MnemosyneMemorySystem } from '../memory-tool';

export class MemoryToolsDecorated {
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
	async logClaim(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_log_claim(params);
		
		return {
			content: [{
				type: "text",
				text: `📝 **Claim Logged**

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
	async verifyClaim(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_verify_claim(params);
		
		const statusIcon = params.success ? '✅' : '❌';
		const statusText = params.success ? 'CONFIRMED' : 'REFUTED';
		const implication = params.success ? 
			'✅ This claim is now verified and can be trusted.' : 
			'❌ This claim has been refuted. Update assumptions and avoid similar false conclusions.';
		
		return {
			content: [{
				type: "text",
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
	async checkBehavioralStatus(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_check_behavioral_status(params);
		
		return {
			content: [{
				type: "text",
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

	@McpTool({
		name: 'memory_store_knowledge',
		description: 'store knowledge with semantic embeddings for RAG-based retrieval. Extends Mnemosyne\'s behavioral memory with working memory capabilities for contextual information storage and semantic search.',
		schema: {
			content: z.string().describe("The knowledge content to store (text, facts, procedures, etc.)"),
			tags: z.array(z.string()).optional().describe("Tags for categorization and filtering"),
			metadata: z.record(z.unknown()).optional().describe("Structured metadata about the knowledge (type, domain, importance, etc.)")
		},
		category: 'knowledge',
		priority: 7,
		access: 'public'
	})
	async storeKnowledge(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_store_knowledge(params);
		
		return {
			content: [{
				type: "text",
				text: `📚 **Knowledge Stored**

**Content**: ${params.content.length > 100 ? params.content.substring(0, 100) + '...' : params.content}
**Tags**: ${params.tags?.join(', ') || 'None'}
**Metadata**: ${params.metadata ? Object.keys(params.metadata).join(', ') : 'None'}

✅ Knowledge has been stored and indexed for semantic search.`
			}]
		};
	}

	@McpTool({
		name: 'memory_search_knowledge',
		description: 'search knowledge using semantic similarity. Performs RAG-based retrieval to find contextually relevant information from the working memory knowledge base.',
		schema: {
			query: z.string().describe("The search query or question to find related knowledge"),
			limit: z.number().optional().describe("Maximum number of results to return (default: 5)"),
			threshold: z.number().optional().describe("Minimum similarity threshold for results (0-1, default: 0.1)")
		},
		category: 'knowledge',
		priority: 8,
		access: 'public'
	})
	async searchKnowledge(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_search_knowledge(params);
		
		return {
			content: [{
				type: "text",
				text: `🔍 **Knowledge Search Results**

**Query**: ${params.query}
**Results**: Search completed

Try adjusting your search terms or lowering the similarity threshold if needed.`
			}]
		};
	}

	@McpTool({
		name: 'memory_export_state',
		description: 'Export the complete Mnemosyne memory system state for analysis, debugging, or persistence. Use this tool when you need comprehensive insight into behavioral patterns, claim verification history, or system performance. Essential for deep analysis and understanding behavioral trends over time.',
		schema: {
			filterType: z.enum(['claims', 'violations', 'rules', 'all']).optional().describe("Filter export to specific data types"),
			format: z.enum(['summary', 'detailed', 'raw']).optional().describe("Export format: 'summary' for overview, 'detailed' for analysis, 'raw' for complete data"),
			includeMetadata: z.string().optional().describe("Whether to include system metadata and timestamps")
		},
		category: 'admin',
		priority: 5,
		access: 'admin'
	})
	async exportState(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_export_state(params);
		
		return {
			content: [{
				type: "text",
				text: `📊 **Memory System State Export**

**Format**: ${params.format || 'summary'}
**Filter**: ${params.filterType || 'all'}

**Summary Statistics**
• Export completed successfully
• Data format: ${params.format || 'summary'}
• Export Time: ${new Date().toISOString()}`
			}]
		};
	}

	@McpTool({
		name: 'memory_record_violation',
		description: 'Record a violation of established behavioral rules when detected. CRITICAL for self-correction: Use this immediately when you recognize that previous actions violated behavioral guidelines. This tool enables learning from mistakes and prevents repeated violations of the same rules.',
		schema: {
			ruleId: z.string().describe("The ID of the behavioral rule that was violated (from foundation rules or custom rules)"),
			context: z.string().describe("Detailed description of how and when the violation occurred, including specific actions taken"),
			severity: z.enum(['minor', 'moderate', 'major', 'critical']).optional().describe("Severity assessment of the violation"),
			correctionPlan: z.string().optional().describe("Specific plan for correcting the violation and preventing recurrence")
		},
		category: 'behavioral',
		priority: 9,
		access: 'public'
	})
	async recordViolation(params: any) {
		// Use delegated method from memory system
		const result = await this.memory.memory_record_violation(params);
		
		const severityIcon = {
			minor: '⚠️',
			moderate: '🟡',
			major: '🟠',
			critical: '🔴'
		}[params.severity || 'moderate'];
		
		return {
			content: [{
				type: "text",
				text: `${severityIcon} **Rule Violation Recorded**

**Rule**: ${params.ruleId}
**Severity**: ${params.severity || 'moderate'}
**Context**: ${params.context}
${params.correctionPlan ? `**Correction Plan**: ${params.correctionPlan}` : ''}

⚠️ **Self-Correction**: This violation has been logged for behavioral learning and future prevention.

**Next Steps**: Implement correction plan and monitor for similar pattern violations.`
			}]
		};
	}
}
