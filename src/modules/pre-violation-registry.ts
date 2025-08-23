/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Pre-Violation Assessment Tool Registry
 * 
 * MCP tool registration for proactive violation prevention tools.
 * Integrates pre-violation assessment capabilities with the MCP server.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { MnemosyneMemorySystem } from '../memory-tool.js';
import {
	memory_assess_terminal_command,
	memory_record_assessment_outcome,
	memory_check_violation_patterns,
	memory_get_preaction_guidance
} from './pre-violation-tools.js';

/**
 * Register pre-violation assessment tools with MCP server
 */
export function registerPreViolationTools(server: any, memory: MnemosyneMemorySystem): void {
	// Terminal Command Assessment Tool
	server.setRequestHandler('tools/call', async (request: any) => {
		const { name, arguments: args } = request.params;

		switch (name) {
			case 'memory_assess_terminal_command':
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								await memory_assess_terminal_command(
									memory,
									args.command,
									args.context
								),
								null,
								2
							)
						}
					]
				};

			case 'memory_record_assessment_outcome':
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								await memory_record_assessment_outcome(
									memory,
									args.command,
									args.assessmentLevel,
									args.actualOutcome,
									args.details
								),
								null,
								2
							)
						}
					]
				};

			case 'memory_check_violation_patterns':
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								await memory_check_violation_patterns(
									memory,
									args.actionType,
									args.actionDescription,
									args.context
								),
								null,
								2
							)
						}
					]
				};

			case 'memory_get_preaction_guidance':
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								await memory_get_preaction_guidance(
									memory,
									args.proposedAction,
									args.actionContext
								),
								null,
								2
							)
						}
					]
				};

			default:
				// Not a pre-violation tool, pass through
				throw new Error(`Unknown tool: ${name}`);
		}
	});
}

/**
 * Tool definitions for MCP server
 */
export const preViolationToolDefinitions: Tool[] = [
	{
		name: 'memory_assess_terminal_command',
		description: 'CRITICAL: Assess a terminal command for violation risk before execution. Use this before running any terminal command to prevent known violation patterns.',
		inputSchema: {
			type: 'object',
			properties: {
				command: {
					type: 'string',
					description: 'The terminal command to assess for violation risk'
				},
				context: {
					type: 'object',
					description: 'Additional context about the command execution (optional)',
					additionalProperties: true
				}
			},
			required: ['command']
		}
	},
	{
		name: 'memory_record_assessment_outcome',
		description: 'Record the actual outcome of an assessed action for learning and improvement. Use this after completing an assessed action to improve future assessments.',
		inputSchema: {
			type: 'object',
			properties: {
				command: {
					type: 'string',
					description: 'The command that was assessed and executed'
				},
				assessmentLevel: {
					type: 'string',
					enum: ['PROCEED', 'CAUTION', 'STOP', 'ASK'],
					description: 'The assessment level that was given'
				},
				actualOutcome: {
					type: 'string',
					enum: ['violation', 'success', 'user_intervention'],
					description: 'The actual outcome after execution'
				},
				details: {
					type: 'object',
					description: 'Additional details about the outcome (optional)',
					additionalProperties: true
				}
			},
			required: ['command', 'assessmentLevel', 'actualOutcome']
		}
	},
	{
		name: 'memory_check_violation_patterns',
		description: 'Check for violation patterns in proposed actions. Use this to identify potential risks based on historical violation data.',
		inputSchema: {
			type: 'object',
			properties: {
				actionType: {
					type: 'string',
					enum: ['terminal_command', 'file_operation', 'user_interaction'],
					description: 'The type of action being considered'
				},
				actionDescription: {
					type: 'string',
					description: 'Description of the specific action'
				},
				context: {
					type: 'object',
					description: 'Additional context about the action (optional)',
					additionalProperties: true
				}
			},
			required: ['actionType', 'actionDescription']
		}
	},
	{
		name: 'memory_get_preaction_guidance',
		description: 'Get comprehensive pre-action guidance based on memory patterns and behavioral rules. Use this for complex decisions that need memory-informed guidance.',
		inputSchema: {
			type: 'object',
			properties: {
				proposedAction: {
					type: 'string',
					description: 'The action being considered'
				},
				actionContext: {
					type: 'object',
					description: 'Context about the proposed action (optional)',
					additionalProperties: true
				}
			},
			required: ['proposedAction']
		}
	}
];

/**
 * Get tool list for MCP server tools/list handler
 */
export function getPreViolationToolList(): { tools: Tool[] } {
	return { tools: preViolationToolDefinitions };
}
