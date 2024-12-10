/**
 * Mnemosyne Memory System MCP Tools for Cloudflare Workers
 * Exposes the cognitive enhancement and behavioral regulation system as MCP tools
 */

import { z } from "zod";
import type { ToolImplementation } from "./src/tools/registry.js";
import { MnemosyneMemorySystem } from "./src/memory-tool.js";

// Global memory instance (in production, this would be in Durable Objects)
let memoryInstance: MnemosyneMemorySystem;

function getMemoryInstance(): MnemosyneMemorySystem {
	if (!memoryInstance) {
		memoryInstance = new MnemosyneMemorySystem();
	}
	return memoryInstance;
}

/**
 * Log a claim that requires verification
 */
export const logClaimTool: ToolImplementation = {
	name: "log_claim",
	description: "Log a claim about system state that requires verification before being considered true",
	schema: {
		claim: z.string().describe("The claim being made (e.g., 'The deployment was successful', 'The bug is fixed')"),
		context: z.record(z.unknown()).optional().describe("Additional context about the claim")
	},
	handler: async (params) => {
		const memory = getMemoryInstance();
		const claimId = memory.logClaim(params.claim, params.context);
		
		return {
			content: [{
				type: "text",
				text: `📝 **Claim Logged** (ID: ${claimId})

**Claim**: ${params.claim}
**Status**: ⏳ Pending Verification
**Next Step**: Provide evidence to verify this claim

⚠️ **Remember**: This claim is unverified until evidence is provided.`
			}]
		};
	}
};

/**
 * Log an assumption being made
 */
export const logAssumptionTool: ToolImplementation = {
	name: "log_assumption",
	description: "Log an assumption being made about the system state or user requirements",
	schema: {
		assumption: z.string().describe("The assumption being made"),
		context: z.record(z.unknown()).optional().describe("Additional context about the assumption")
	},
	handler: async (params) => {
		const memory = getMemoryInstance();
		const assumptionId = memory.logAssumption(params.assumption, params.context);
		
		return {
			content: [{
				type: "text",
				text: `🤔 **Assumption Logged** (ID: ${assumptionId})

**Assumption**: ${params.assumption}
**Status**: ⏳ Needs Validation
**Next Step**: Verify this assumption with user or through testing

⚠️ **Remember**: Assumptions should be validated before proceeding.`
			}]
		};
	}
};

/**
 * Verify a previously logged claim with evidence
 */
export const verifyClaimTool: ToolImplementation = {
	name: "verify_claim",
	description: "Provide evidence to verify a previously logged claim",
	schema: {
		claim_id: z.string().describe("The ID of the claim to verify"),
		evidence: z.string().describe("The evidence supporting or refuting the claim"),
		success: z.boolean().describe("Whether the evidence confirms the claim as true")
	},
	handler: async (params) => {
		const memory = getMemoryInstance();
		memory.verifyClaim(params.claim_id, params.evidence, params.success);
		
		return {
			content: [{
				type: "text",
				text: `${params.success ? '✅' : '❌'} **Claim Verified** (ID: ${params.claim_id})

**Status**: ${params.success ? 'CONFIRMED' : 'REFUTED'}
**Evidence**: ${params.evidence}

${params.success ? '✅ This claim is now verified and can be trusted.' : '❌ This claim has been refuted. Adjust understanding accordingly.'}`
			}]
		};
	}
};

/**
 * Check behavioral status before proceeding with actions
 */
export const checkBehavioralStatusTool: ToolImplementation = {
	name: "check_behavioral_status",
	description: "Check current behavioral status including unverified claims and rule violations before proceeding",
	schema: {},
	handler: async () => {
		const memory = getMemoryInstance();
		const status = memory.getBehavioralStatus();
		
		const hasIssues = status.unverifiedClaims > 0 || status.recentViolations.length > 0;
		
		return {
			content: [{
				type: "text",
				text: `🧠 **Behavioral Status Check**

**Status**: ${hasIssues ? '⚠️ Issues Found' : '✅ Clear'}

**Unverified Claims**: ${status.unverifiedClaims}
**Recent Violations**: ${status.recentViolations.length}

${status.recommendations.length > 0 ? `**Recommendations**:
${status.recommendations.map(r => `• ${r}`).join('\n')}` : ''}

${status.recentViolations.length > 0 ? `**Recent Rule Violations**:
${status.recentViolations.map(v => `• ${v.rule} (${v.violations} violations)`).join('\n')}` : ''}

${hasIssues ? '⚠️ **Action Required**: Address the above issues before making new claims or major changes.' : '✅ **Clear to Proceed**: No behavioral issues detected.'}`
			}]
		};
	}
};

/**
 * Record a rule violation (used when behavioral rules are broken)
 */
export const recordViolationTool: ToolImplementation = {
	name: "record_violation",
	description: "Record when a behavioral rule has been violated",
	schema: {
		rule_id: z.string().describe("The ID of the rule that was violated"),
		context: z.string().describe("Description of how/when the violation occurred")
	},
	handler: async (params) => {
		const memory = getMemoryInstance();
		memory.recordViolation(params.rule_id, params.context);
		
		return {
			content: [{
				type: "text",
				text: `❌ **Rule Violation Recorded**

**Rule ID**: ${params.rule_id}
**Context**: ${params.context}
**Timestamp**: ${new Date().toISOString()}

⚠️ **Impact**: This violation has been logged and will influence future behavioral checks.`
			}]
		};
	}
};

/**
 * Export memory state for analysis
 */
export const exportMemoryStateTool: ToolImplementation = {
	name: "export_memory_state",
	description: "Export current memory state for analysis and debugging",
	schema: {},
	handler: async () => {
		const memory = getMemoryInstance();
		const state = memory.exportState();
		
		return {
			content: [{
				type: "text",
				text: `🔍 **Memory State Export**

**Total Entries**: ${state.entries.length}
**Behavioral Rules**: ${state.rules.length}
**Tracked Patterns**: ${state.patterns.length}

**Recent Entries**:
${state.entries.slice(-5).map(e => `• [${e.type}] ${e.content} (${e.status})`).join('\n')}

**Active Rules**:
${state.rules.map(r => `• ${r.rule} (${r.violations} violations)`).join('\n')}

---
*Full export available in JSON format upon request*`
			}]
		};
	}
};

/**
 * All Mnemosyne memory tools
 */
export const memoryTools = [
	logClaimTool,
	logAssumptionTool,
	verifyClaimTool,
	checkBehavioralStatusTool,
	recordViolationTool,
	exportMemoryStateTool
] as const;
