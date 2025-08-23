/**
 * Mnemosyne Memory System MCP Server - HTTP/SSE Implementation
 * 
 * Implements Model Context Protocol with Server-Sent Events for real-time communication
 * and cognitive enhancement behavioral memory for AI agents.
 */

import { z } from "zod";
import { MnemosyneMemorySystem } from "./memory-tool.js";
import { foundationMigrationV1, applyFoundationMigration } from "../migrations/foundation.js";
import { foundationMigrationV12 } from "../migrations/foundation-v1.2.0.js";

// Tool implementation interface
interface ToolImplementation {
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

/**
 * Mnemosyne Memory System MCP Durable Object
 * Implements proper MCP HTTP/SSE transport with persistent memory
 */
export class MnemosyneMemorySystemMCP {
	private memory: MnemosyneMemorySystem;
	
	constructor(state: DurableObjectState, env: any) {
		this.memory = new MnemosyneMemorySystem();
		// Apply latest foundation migration to establish core behavioral rules
		// This ensures we always start with the most current foundation
		const latestFoundation = this.getLatestFoundationMigration();
		applyFoundationMigration(this.memory, latestFoundation);
		console.log(`MCP Server initialized with Foundation ${latestFoundation.version}`);
	}

	/**
	 * Get the latest available foundation migration
	 * Prioritizes the highest version available, ensuring latest features are always used
	 */
	private getLatestFoundationMigration() {
		// Available foundation migrations in order of preference (latest first)
		const availableFoundations = [
			foundationMigrationV12, // v1.2.0 - Collaborative Intelligence Framework
			foundationMigrationV1   // v1.0.0 - Base Foundation (fallback)
		];

		// Return the first available foundation (highest version)
		for (const foundation of availableFoundations) {
			if (foundation) {
				return foundation;
			}
		}

		// Fallback to v1.0.0 if somehow v1.2.0 is not available
		console.warn('MCP Server using fallback Foundation v1.0.0 - latest foundation not available');
		return foundationMigrationV1;
	}

	/**
	 * Log context query for memory consultation tracking
	 */
	private logToolCall(toolName: string, params: any): string {
		const queryText = `Tool call: ${toolName}`;
		const context = {
			toolName,
			params: JSON.stringify(params),
			timestamp: new Date().toISOString()
		};
		return this.memory.logContextQuery(queryText, context);
	}

	/**
	 * Check memory consultation compliance before tool execution
	 */
	private checkMemoryConsultation(toolName: string, params: any): string[] {
		// Get recommended memory searches for this tool call
		const query = params.query || params.content || toolName;
		return this.memory.getRecommendedMemorySearches(query);
	}

	/**
	 * Handle HTTP requests with proper MCP SSE transport
	 */
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response('', {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		// SSE endpoint for MCP communication
		if (url.pathname === '/sse') {
			return this.handleSSE(request);
		}

		// HTTP endpoint for MCP requests
		if (url.pathname === '/.well-known/oauth-protected-resource') {
			return this.handleMcpRequest(request);
		}

		// Foundation management endpoints
		if (url.pathname.startsWith('/foundation')) {
			return this.handleFoundationRequest(request, url);
		}

		// Root endpoint with server info
		if (url.pathname === '/') {
			return new Response(JSON.stringify({
				name: "Memory System MCP Server",
				version: "1.0.0",
				description: "Tool-enforced memory system for AI behavior regulation",
				protocol: "MCP 2024-11-05",
				transport: "HTTP/SSE",
				capabilities: ["tools", "resources"],
				endpoints: {
					mcp: "/.well-known/oauth-protected-resource",
					sse: "/sse"
				},
				tools: memoryTools.length,
				foundation: foundationMigrationV1.version
			}, null, 2), {
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		return new Response('Memory System MCP Server\n\nEndpoints:\n- POST /.well-known/oauth-protected-resource (MCP)\n- GET /sse (Server-Sent Events)', {
			headers: { 
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}

	/**
	 * Handle foundation management API requests
	 */
	private async handleFoundationRequest(request: Request, url: URL): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
			'Content-Type': 'application/json'
		};

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response('', { status: 200, headers: corsHeaders });
		}

		try {
			// GET /foundation - Get current foundation info
			if (url.pathname === '/foundation' && request.method === 'GET') {
				const foundationInfo = this.memory.getFoundationInfo();
				const state = await this.memory.exportState();
				
				return new Response(JSON.stringify({
					foundation: foundationInfo,
					rules: state.rules.filter((rule: any) => this.isFoundationRule(rule.id)),
					serverInfo: {
						name: "Mnemosyne Memory System",
						version: "1.0.0",
						capabilities: ["runtime-foundation-updates", "hot-deployment"]
					}
				}, null, 2), {
					headers: corsHeaders
				});
			}

			// POST /foundation/validate - Validate a foundation migration
			if (url.pathname === '/foundation/validate' && request.method === 'POST') {
				const migration = await request.json() as any;
				const validation = this.memory.validateFoundation(migration);
				
				return new Response(JSON.stringify({
					migration: {
						version: migration.version,
						description: migration.description,
						rulesCount: migration.coreRules?.length || 0
					},
					validation,
					timestamp: new Date().toISOString()
				}, null, 2), {
					status: validation.valid ? 200 : 400,
					headers: corsHeaders
				});
			}

			// POST /foundation/update - Deploy new foundation
			if (url.pathname === '/foundation/update' && request.method === 'POST') {
				const body = await request.json() as any;
				const { migration, options = {} } = body;
				
				// Validate first
				const validation = this.memory.validateFoundation(migration);
				if (!validation.valid) {
					return new Response(JSON.stringify({
						error: 'Validation failed',
						validation
					}, null, 2), {
						status: 400,
						headers: corsHeaders
					});
				}

				// Apply update
				const result = await this.memory.updateFoundation(migration, options);
				
				return new Response(JSON.stringify({
					success: result.success,
					migration: {
						version: migration.version,
						description: migration.description
					},
					result,
					newFoundation: this.memory.getFoundationInfo(),
					timestamp: new Date().toISOString()
				}, null, 2), {
					status: result.success ? 200 : 400,
					headers: corsHeaders
				});
			}

			// PUT /foundation/rollback - Rollback to previous foundation
			if (url.pathname === '/foundation/rollback' && request.method === 'PUT') {
				// This would require implementing foundation history/backup
				return new Response(JSON.stringify({
					error: 'Foundation rollback not yet implemented',
					suggestion: 'Deploy a previous foundation version using /foundation/update'
				}), {
					status: 501,
					headers: corsHeaders
				});
			}

			return new Response(JSON.stringify({
				error: 'Foundation endpoint not found',
				available: [
					'GET /foundation - Get current foundation',
					'POST /foundation/validate - Validate migration',
					'POST /foundation/update - Deploy new foundation',
					'PUT /foundation/rollback - Rollback foundation (planned)'
				]
			}), {
				status: 404,
				headers: corsHeaders
			});

		} catch (error) {
			return new Response(JSON.stringify({
				error: 'Foundation request failed',
				message: error instanceof Error ? error.message : 'Unknown error'
			}), {
				status: 500,
				headers: corsHeaders
			});
		}
	}

	/**
	 * Check if a rule ID belongs to the foundation (helper method)
	 */
	private isFoundationRule(ruleId: string): boolean {
		const foundationRuleIds = [
			'verify-before-claim',
			'ask-for-help-when-blocked', 
			'evidence-for-claims',
			'systematic-debugging',
			'acknowledge-limitations',
			'read-before-act'
		];
		
		return foundationRuleIds.includes(ruleId);
	}

	/**
	 * Handle Server-Sent Events connection for real-time MCP communication
	 * Also handles POST requests for MCP JSON-RPC calls to the same endpoint
	 */
	private async handleSSE(request: Request): Promise<Response> {
		// Handle OPTIONS for CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, Authorization, X-Requested-With',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		// Handle POST requests as MCP JSON-RPC calls
		if (request.method === 'POST') {
			return this.handleMcpRequest(request);
		}

		// Handle GET requests as SSE connections
		if (request.method === 'GET') {
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			
			// Set up SSE headers with comprehensive CORS
			const headers = new Headers({
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, Authorization, X-Requested-With',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
			});

			// Send initial connection event
			await writer.write(new TextEncoder().encode('event: connected\ndata: {"type":"connected","timestamp":"' + new Date().toISOString() + '"}\n\n'));

			// For HTTP/SSE MCP, most communication happens via POST requests
			// SSE is primarily for server-initiated events and notifications
			
			return new Response(readable, { headers });
		}

		// Method not allowed
		return new Response('Method not allowed', { 
			status: 405,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, Authorization, X-Requested-With',
				'Allow': 'GET, POST, OPTIONS'
			}
		});
	}

	/**
	 * Handle MCP JSON-RPC requests
	 */
	private async handleMcpRequest(request: Request): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32600, message: "Invalid Request: Only POST method supported" }
			}), {
				status: 405,
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		try {
			const body = await request.json() as any;
			
			// Handle initialization - establish MCP connection
			if (body.method === 'initialize') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						protocolVersion: "2024-11-05",
						capabilities: {
							tools: {
								listChanged: true
							},
							resources: {
								subscribe: true,
								listChanged: true,
								templates: true
							},
							prompts: {
								listChanged: false
							},
							logging: {
								level: "info"
							}
						},
						serverInfo: {
							name: "mnemosyne-memory-system",
							version: "1.0.0",
							description: "Tool-enforced memory system for AI behavior regulation with foundation migration",
							author: "Zenbooker AI Safety Initiative",
							license: "MIT"
						},
						instructions: "This MCP server provides behavioral memory tools for AI agents. Use memory_view_foundation first to understand available behavioral rules, then memory_check_behavioral_status to monitor compliance."
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle initialized notification - complete handshake
			if (body.method === 'notifications/initialized') {
				return new Response('', { 
					status: 200,
					headers: { 'Access-Control-Allow-Origin': '*' }
				});
			}
			
			// Handle ping for connection health
			if (body.method === 'ping') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle logging level setting
			if (body.method === 'logging/setLevel') {
				// Accept the logging level but don't actually change anything
				// since we're running in a serverless environment
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle tools list - return all available memory tools
			if (body.method === 'tools/list') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						tools: memoryTools.map(tool => ({
							name: tool.name,
							description: tool.description,
							inputSchema: this.buildJsonSchema(tool.schema)
						}))
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle prompts list - return empty list since we don't provide prompts
			if (body.method === 'prompts/list') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						prompts: []
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle resources list - return empty list since we don't provide resources
			if (body.method === 'resources/list') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						resources: []
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle resource templates list - return empty list since we don't provide resource templates
			if (body.method === 'resources/templates/list') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						resourceTemplates: []
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
			
			// Handle tool execution
			if (body.method === 'tools/call') {
				const toolName = body.params?.name;
				const toolArgs = body.params?.arguments || {};
				
				if (!toolName) {
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						error: { 
							code: -32602, 
							message: "Invalid params: missing tool name" 
						}
					}), {
						status: 400,
						headers: { 
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						}
					});
				}
				
				const tool = memoryTools.find(t => t.name === toolName);
				if (!tool) {
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						error: { 
							code: -32601, 
							message: `Tool not found: ${toolName}`,
							data: {
								availableTools: memoryTools.map(t => t.name)
							}
						}
					}), {
						status: 404,
						headers: { 
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						}
					});
				}
				
				try {
					// Execute tool with this instance's memory
					const result = await this.executeToolWithMemory(tool, toolArgs);
					
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						result
					}), {
						headers: { 
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						}
					});
				} catch (error) {
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						error: {
							code: -32603,
							message: "Internal error during tool execution",
							data: {
								tool: toolName,
								error: error instanceof Error ? error.message : 'Unknown error'
							}
						}
					}), {
						status: 500,
						headers: { 
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						}
					});
				}
			}
			
			// Handle resources and other methods...
			// (Additional methods omitted for brevity)
			
			// Handle unknown methods
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				id: body.id,
				error: { 
					code: -32601, 
					message: `Method not found: ${body.method}` 
				}
			}), {
				status: 404,
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
			
		} catch (error) {
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				id: null,
				error: { 
					code: -32700, 
					message: "Parse error",
					data: error instanceof Error ? error.message : 'Invalid JSON'
				}
			}), {
				status: 400,
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}
	}

	/**
	 * Build JSON Schema from Zod schema
	 */
	private buildJsonSchema(schema: Record<string, z.ZodType>): any {
		return {
			type: "object",
			properties: Object.fromEntries(
				Object.entries(schema).map(([key, zodSchema]: [string, any]) => {
					let type = 'string';
					let additionalProps: any = {};
					
					switch (zodSchema._def?.typeName) {
						case 'ZodString':
							type = 'string';
							break;
						case 'ZodBoolean':
							type = 'boolean';
							break;
						case 'ZodNumber':
							type = 'number';
							break;
						case 'ZodRecord':
						case 'ZodObject':
							type = 'object';
							break;
						case 'ZodArray':
							type = 'array';
							break;
						case 'ZodOptional':
							const innerType = zodSchema._def?.innerType;
							if (innerType) {
								switch (innerType._def?.typeName) {
									case 'ZodRecord':
									case 'ZodObject':
										type = 'object';
										break;
									case 'ZodEnum':
										type = 'string';
										if (innerType._def?.values) {
											additionalProps.enum = innerType._def.values;
										}
										break;
									default:
										type = 'string';
								}
							}
							break;
						case 'ZodEnum':
							type = 'string';
							if (zodSchema._def?.values) {
								additionalProps.enum = zodSchema._def.values;
							}
							break;
						default:
							type = 'string';
					}
					
					if (zodSchema.description) {
						additionalProps.description = zodSchema.description;
					}
					
					return [key, { type, ...additionalProps }];
				})
			),
			required: Object.entries(schema)
				.filter(([_, zodSchema]: [string, any]) => !zodSchema.isOptional?.())
				.map(([key]) => key),
			additionalProperties: false
		};
	}

	/**
	 * Execute tool with memory context and consultation tracking
	 */
	private async executeToolWithMemory(tool: ToolImplementation, args: any) {
		// Log the tool call for memory consultation tracking
		const toolCallId = this.logToolCall(tool.name, args);
		
		// Get memory consultation recommendations for this tool call
		const recommendations = this.checkMemoryConsultation(tool.name, args);
		
		// Create a memory context for this tool execution
		const memoryContext = this.memory;
		
		// Store recommendations in context for potential use
		if (recommendations.length > 0) {
			memoryContext.logContextQuery(
				`Tool ${tool.name} recommendations: ${recommendations.join('; ')}`,
				{ 
					toolCallId,
					recommendations,
					type: 'memory-consultation'
				}
			);
		}
		
		// Override global getter temporarily
		const originalGetter = getMemoryInstance;
		(globalThis as any).getMemoryInstance = () => memoryContext;
		
		try {
			const result = await tool.handler(args);
			
			// Log successful tool execution
			memoryContext.logContextQuery(
				`Tool ${tool.name} completed successfully`,
				{
					toolCallId,
					success: true,
					hasError: result.isError || false
				}
			);
			
			return result;
		} catch (error) {
			// Log tool execution failure
			memoryContext.logContextQuery(
				`Tool ${tool.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
				{
					toolCallId,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			);
			throw error;
		} finally {
			// Restore original getter
			(globalThis as any).getMemoryInstance = originalGetter;
		}
	}
}

// Tool definitions with comprehensive automated descriptions
const memoryTools: ToolImplementation[] = [
	{
		name: 'memory_log_claim',
		description: 'Log a claim or assertion made by the AI agent that requires verification. CRITICAL: Use this immediately after making any factual statement, assumption, or conclusion to enable later accountability and behavioral correction. This tool is essential for maintaining truth tracking and preventing false confidence in unverified statements.',
		schema: {
			claim: z.string().describe("The exact claim being made (e.g., 'The deployment was successful', 'The bug is in line 42', 'User wants feature X')"),
			context: z.record(z.unknown()).optional().describe("Additional context including reasoning, assumptions, or supporting data that led to this claim"),
			confidence: z.enum(['low', 'medium', 'high']).optional().describe("Agent's confidence level in this claim - use 'low' for assumptions, 'high' for verified facts"),
			source: z.string().optional().describe("Source of information supporting this claim (e.g., 'file analysis', 'user statement', 'documentation')")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			const claimId = memory.logClaim(params.claim, {
				context: params.context,
				confidence: params.confidence,
				source: params.source,
				timestamp: new Date().toISOString()
			});
			
			return {
				content: [{
					type: "text",
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
	},
	{
		name: 'memory_verify_claim',
		description: 'Verify a previously logged claim with concrete evidence. ESSENTIAL: Use this when you obtain evidence that confirms or refutes a previous claim. This tool is critical for behavioral integrity and self-correction - it prevents the agent from maintaining false beliefs and enables learning from verification outcomes.',
		schema: {
			claimId: z.string().describe("The unique ID of the claim to verify (obtained from memory_log_claim)"),
			evidence: z.string().describe("Concrete evidence supporting or refuting the claim - be specific about what was observed, tested, or confirmed"),
			success: z.boolean().describe("Whether the claim was verified as TRUE (confirmed by evidence) or FALSE (refuted by evidence)"),
			notes: z.string().optional().describe("Additional notes about the verification process, lessons learned, or implications")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			memory.verifyClaim(params.claimId, params.evidence, params.success);
			
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
	},
	{
		name: 'memory_check_behavioral_status',
		description: 'Check current behavioral status including unverified claims, rule violations, and compliance metrics. ESSENTIAL for self-monitoring: Use this tool regularly to assess behavioral performance and identify areas needing attention. This enables proactive behavioral correction and maintains awareness of memory system state.',
		schema: {
			includeHistory: z.boolean().optional().describe("Whether to include detailed historical behavioral data and patterns"),
			focusArea: z.enum(['claims', 'violations', 'patterns', 'all']).optional().describe("Focus the status check on specific behavioral area")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			const status = memory.getBehavioralStatus();
			
			const priorityAlert = status.unverifiedClaims > 3 ? '🚨 HIGH PRIORITY: Too many unverified claims!' : 
								 status.recentViolations.length > 2 ? '⚠️ ATTENTION: Multiple recent violations!' : '';
			
			return {
				content: [{
					type: "text",
					text: `🧠 **Memory System Behavioral Status**

${priorityAlert ? `${priorityAlert}\n\n` : ''}**📊 Current Metrics**:
• **Unverified Claims**: ${status.unverifiedClaims} ${status.unverifiedClaims > 2 ? '⚠️' : '✅'}
• **Recent Violations**: ${status.recentViolations.length} ${status.recentViolations.length > 0 ? '⚠️' : '✅'}
• **System Health**: ${status.unverifiedClaims === 0 && status.recentViolations.length === 0 ? 'EXCELLENT ✅' : 
					  status.unverifiedClaims < 3 && status.recentViolations.length < 2 ? 'GOOD 👍' : 
					  'NEEDS ATTENTION ⚠️'}

${status.recentViolations.length > 0 ? `
**⚠️ Rule Violations**:
${status.recentViolations.map((rule: any) => `• **${rule.rule}**: ${rule.violations} violations`).join('\n')}
` : ''}

${status.recommendations.length > 0 ? `
**💡 Behavioral Recommendations**:
${status.recommendations.map((rec: any) => `• ${rec}`).join('\n')}
` : '✅ No immediate behavioral concerns detected.'}

---
*Regular status checks enable proactive behavioral management and prevent patterns from deteriorating.*`
				}]
			};
		}
	},
	{
		name: 'memory_view_foundation',
		description: 'View the foundational behavioral rules that are automatically active in the memory system. ESSENTIAL FIRST STEP: Use this tool immediately when connecting to understand the behavioral framework and constraints that govern AI actions. These rules form the safety and operational foundation for all agent behavior.',
		schema: {
			ruleId: z.string().optional().describe("View details for a specific foundation rule by ID"),
			includeExamples: z.boolean().optional().describe("Include practical examples of rule application"),
			checkCompliance: z.boolean().optional().describe("Include current compliance status for each rule")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			const state = await memory.exportState();
			
			const foundationRules = state.rules.filter((rule: any) => 
				foundationMigrationV1.coreRules.some(coreRule => coreRule.id === rule.id)
			);

			if (params.ruleId) {
				const specificRule = foundationRules.find((rule: any) => rule.id === params.ruleId);
				if (!specificRule) {
					return {
						content: [{
							type: "text",
							text: `❌ **Foundation Rule Not Found**: ${params.ruleId}

**Available Foundation Rules**:
${foundationRules.map((r: any) => `• ${r.id} (${r.priority} priority)`).join('\n')}

Use memory_view_foundation without ruleId to see all foundation rules.`
						}]
					};
				}
				
				const complianceStatus = specificRule.violations === 0 ? '✅ COMPLIANT' : `⚠️ ${specificRule.violations} VIOLATIONS`;
				
				return {
					content: [{
						type: "text",
						text: `🧠 **Foundation Rule Details**

**Rule ID**: ${specificRule.id}
**Priority**: ${specificRule.priority.toUpperCase()}
**Compliance**: ${complianceStatus}

**Rule**: ${specificRule.rule}

**Description**: ${specificRule.description}`
					}]
				};
			}

			const totalViolations = foundationRules.reduce((sum: number, rule: any) => sum + rule.violations, 0);
			const systemHealth = totalViolations === 0 ? 'EXCELLENT ✅' : 
							   totalViolations < 3 ? 'GOOD 👍' : 
							   totalViolations < 6 ? 'NEEDS ATTENTION ⚠️' : 'CRITICAL 🚨';

			return {
				content: [{
					type: "text",
					text: `🧠 **Foundation Behavioral Rules**

**Migration**: ${foundationMigrationV1.version}
**System Health**: ${systemHealth}
**Description**: ${foundationMigrationV1.description}

**Active Foundation Rules** (${foundationRules.length}/${foundationMigrationV1.coreRules.length}):

${foundationRules.map((rule: any) => {
	const status = rule.violations === 0 ? '✅' : '⚠️';
	
	return `
**${rule.id}** - ${rule.priority.toUpperCase()} Priority ${status}
• **Rule**: ${rule.rule}
• **Description**: ${rule.description}`;
}).join('\n')}

**🎯 Key Behavioral Guidelines**:
• **verify-before-claim**: Always log claims for verification
• **ask-for-help-when-blocked**: Don't flail when stuck
• **evidence-for-claims**: Support statements with evidence
• **systematic-debugging**: Follow structured problem-solving
• **acknowledge-limitations**: Admit when uncertain
• **read-before-act**: Understand before making changes

---
*These rules are automatically enforced and form the safety foundation for all AI behavior.*`
				}]
			};
		}
	},
	{
		name: 'memory_record_violation',
		description: 'Record a violation of established behavioral rules when detected. CRITICAL for self-correction: Use this immediately when you recognize that previous actions violated behavioral guidelines. This tool enables learning from mistakes and prevents repeated violations of the same rules.',
		schema: {
			ruleId: z.string().describe("The ID of the behavioral rule that was violated (from foundation rules or custom rules)"),
			context: z.string().describe("Detailed description of how and when the violation occurred, including specific actions taken"),
			severity: z.enum(['minor', 'moderate', 'major', 'critical']).optional().describe("Severity assessment of the violation"),
			correctionPlan: z.string().optional().describe("Specific plan for correcting the violation and preventing recurrence")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			memory.recordViolation(params.ruleId, params.context);
			
			const severityIcons: Record<string, string> = {
				'critical': '🚨',
				'major': '⚠️',
				'moderate': '⚡',
				'minor': '📝'
			};
			const severityIcon = severityIcons[params.severity || 'moderate'] || '📝';
			
			return {
				content: [{
					type: "text",
					text: `${severityIcon} **Behavioral Violation Recorded**

**Rule**: ${params.ruleId}
**Severity**: ${params.severity || 'moderate'}
**Context**: ${params.context}
**Timestamp**: ${new Date().toISOString()}
${params.correctionPlan ? `**Correction Plan**: ${params.correctionPlan}` : ''}

**Impact**: This violation has been logged for behavioral pattern analysis.
**Next Steps**: 
1. Review foundation rules to understand why this occurred
2. Implement corrective measures to prevent recurrence
3. Monitor for similar patterns in future interactions

📈 **Learning Opportunity**: Use this violation data to improve decision-making processes.`
				}]
			};
		}
	},
	{
		name: 'memory_export_state',
		description: 'Export the complete memory system state for analysis, debugging, or persistence. Use this tool when you need comprehensive insight into behavioral patterns, claim verification history, or system performance. Essential for deep analysis and understanding behavioral trends over time.',
		schema: {
			format: z.enum(['summary', 'detailed', 'raw']).optional().describe("Export format: 'summary' for overview, 'detailed' for analysis, 'raw' for complete data"),
			includeMetadata: z.boolean().optional().describe("Whether to include system metadata and timestamps"),
			filterType: z.enum(['claims', 'violations', 'rules', 'all']).optional().describe("Filter export to specific data types")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			const state = await memory.exportState();
			
			if (params.format === 'summary') {
				const foundationRuleCount = state.rules.filter((rule: any) => 
					foundationMigrationV1.coreRules.some(coreRule => coreRule.id === rule.id)
				).length;
				
				return {
					content: [{
						type: "text",
						text: `📊 **Memory System Summary**

**System Health**: ${state.entries.filter((e: any) => e.type === 'claim' && e.status === 'pending').length === 0 ? 'HEALTHY ✅' : 'NEEDS ATTENTION ⚠️'}

**Data Overview**:
• **Total Entries**: ${state.entries.length}
• **Unverified Claims**: ${state.entries.filter((e: any) => e.type === 'claim' && e.status === 'pending').length}
• **Verified Claims**: ${state.entries.filter((e: any) => e.type === 'claim' && e.status === 'verified').length}
• **Foundation Rules**: ${foundationRuleCount}/${foundationMigrationV1.coreRules.length}
• **Custom Rules**: ${state.rules.length - foundationRuleCount}
• **Total Violations**: ${state.rules.reduce((sum: number, rule: any) => sum + rule.violations, 0)}

**Behavioral Patterns**: ${state.patterns.length} tracked patterns

**System Status**: ${state.entries.filter((e: any) => e.type === 'claim' && e.status === 'pending').length === 0 && 
				   state.rules.every((rule: any) => rule.violations === 0) ? 
				   'Excellent behavioral compliance' : 'Room for improvement identified'}`
					}]
				};
			}
			
			return {
				content: [{
					type: "text",
					text: `📤 **Memory State Export** (${params.format || 'detailed'})

**Claims**: ${state.entries.filter((e: any) => e.type === 'claim').length} total
**Rules**: ${state.rules.length} behavioral rules
**Patterns**: ${state.patterns.length} interaction patterns
**Export Time**: ${new Date().toISOString()}

---
\`\`\`json
${JSON.stringify(params.format === 'raw' ? state : {
	summary: {
		entries: state.entries.length,
		rules: state.rules.length,
		patterns: state.patterns.length
	},
	...(params.filterType !== 'violations' && params.filterType !== 'rules' ? { claims: state.entries.filter((e: any) => e.type === 'claim') } : {}),
	...(params.filterType !== 'claims' && params.filterType !== 'rules' ? { violations: state.rules.filter((r: any) => r.violations > 0) } : {}),
	...(params.filterType !== 'claims' && params.filterType !== 'violations' ? { rules: state.rules } : {}),
	patterns: state.patterns,
	...(params.includeMetadata ? { metadata: { exportTime: new Date().toISOString(), foundation: foundationMigrationV1.version } } : {})
}, null, 2)}
\`\`\``
				}]
			};
		}
	},

	// Pre-Violation Assessment Tools
	{
		name: 'memory_assess_terminal_command',
		description: 'CRITICAL: Assess a terminal command for violation risk before execution. Use this before running any terminal command to prevent known violation patterns.',
		schema: {
			command: z.string().describe("The terminal command to assess for violation risk"),
			context: z.record(z.unknown()).optional().describe("Additional context about the command execution")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			
			// Import and use pre-violation assessment
			const { PreViolationAssessment } = await import('./modules/pre-violation-assessment.js');
			const assessor = new PreViolationAssessment(memory);
			const assessment = await assessor.assessTerminalCommand(params.command, params.context);

			const shouldProceed = assessment.level === 'PROCEED' || 
				(assessment.level === 'CAUTION' && assessment.confidence < 0.8);

			let recommendation = '';
			switch (assessment.level) {
				case 'PROCEED':
					recommendation = 'Safe to proceed - no violation risk detected';
					break;
				case 'CAUTION':
					recommendation = `Proceed with caution - ${assessment.reasoning}`;
					break;
				case 'STOP':
					recommendation = `Do not proceed - ${assessment.reasoning}`;
					break;
				case 'ASK':
					recommendation = `Ask user for guidance - ${assessment.reasoning}`;
					break;
			}

			// Log this assessment
			memory.logClaim(
				`Terminal command assessment: "${params.command}" assessed as ${assessment.level}`,
				{
					command: params.command,
					assessmentLevel: assessment.level,
					confidence: assessment.confidence,
					evidenceCount: assessment.evidence?.length || 0
				},
				'pre-violation assessment',
				'medium'
			);

			return {
				content: [{
					type: "text",
					text: `## 🛡️ Pre-Violation Assessment

**Command**: \`${params.command}\`
**Risk Level**: ${assessment.level} (${Math.round(assessment.confidence * 100)}% confidence)
**Recommendation**: ${recommendation}
**Should Proceed**: ${shouldProceed ? '✅ Yes' : '❌ No'}

**Analysis**: ${assessment.reasoning}

${assessment.evidence && assessment.evidence.length > 0 ? `
**Evidence Found** (${assessment.evidence.length} items):
${assessment.evidence.map(e => `- **${e.type}**: ${e.description} (${Math.round(e.relevance * 100)}% relevant)`).join('\n')}
` : '**Evidence**: No violation patterns found in memory'}

${assessment.recommendations && assessment.recommendations.length > 0 ? `
**Recommendations**:
${assessment.recommendations.map(r => `- ${r}`).join('\n')}
` : ''}

⚠️ **Important**: This assessment is based on memory patterns. Use judgment and consider context.`
				}]
			};
		}
	},

	// Phase 2 - File Operation Assessment
	{
		name: 'memory_assess_file_operation',
		description: 'CRITICAL: Assess a file operation for violation risk before execution. Use this before creating, editing, deleting, moving, or copying files to prevent data loss and maintain project integrity.',
		schema: {
			operation: z.enum(['create', 'edit', 'delete', 'move', 'copy']).describe("The type of file operation to assess"),
			filePath: z.string().describe("The path of the file being operated on"),
			context: z.record(z.unknown()).optional().describe("Additional context about the file operation")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			
			// Import and use pre-violation assessment
			const { PreViolationAssessment } = await import('./modules/pre-violation-assessment.js');
			const assessor = new PreViolationAssessment(memory);
			const assessment = await assessor.assessFileOperation(params.operation, params.filePath, params.context);

			const shouldProceed = assessment.level === 'PROCEED' || 
				(assessment.level === 'CAUTION' && assessment.confidence < 0.8);

			let recommendation = '';
			switch (assessment.level) {
				case 'PROCEED':
					recommendation = 'Safe to proceed - no file operation risk detected';
					break;
				case 'CAUTION':
					recommendation = `Proceed with caution - ${assessment.reasoning}`;
					break;
				case 'STOP':
					recommendation = `Do not proceed - ${assessment.reasoning}`;
					break;
				case 'ASK':
					recommendation = `Ask user for guidance - ${assessment.reasoning}`;
					break;
			}

			// Log this assessment
			memory.logClaim(
				`File operation assessment: ${params.operation} "${params.filePath}" assessed as ${assessment.level}`,
				{
					operation: params.operation,
					filePath: params.filePath,
					assessmentLevel: assessment.level,
					confidence: assessment.confidence,
					evidenceCount: assessment.evidence?.length || 0
				},
				'pre-violation file assessment',
				'medium'
			);

			return {
				content: [{
					type: "text",
					text: `## 📁 File Operation Assessment

**Operation**: ${params.operation.toUpperCase()}
**File**: \`${params.filePath}\`
**Risk Level**: ${assessment.level} (${Math.round(assessment.confidence * 100)}% confidence)
**Recommendation**: ${recommendation}
**Should Proceed**: ${shouldProceed ? '✅ Yes' : '❌ No'}

**Analysis**: ${assessment.reasoning}

${assessment.evidence && assessment.evidence.length > 0 ? `
**Evidence Found** (${assessment.evidence.length} items):
${assessment.evidence.map(e => `- **${e.type}**: ${e.description} (${Math.round(e.relevance * 100)}% relevant)`).join('\n')}
` : '**Evidence**: No file operation violation patterns found in memory'}

${assessment.recommendations && assessment.recommendations.length > 0 ? `
**Recommendations**:
${assessment.recommendations.map(r => `- ${r}`).join('\n')}
` : ''}

⚠️ **Important**: File operations can be irreversible. Consider backups for critical files.`
				}]
			};
		}
	},

	// Phase 2 - Real-time Guidance
	{
		name: 'memory_get_realtime_guidance',
		description: 'Get real-time guidance for ongoing actions to prevent violations as they occur. Use this during complex operations that need continuous memory-informed guidance.',
		schema: {
			actionType: z.enum(['terminal_command', 'file_operation', 'user_interaction']).describe("The type of action currently being performed"),
			actionDetails: z.string().describe("Details of the current action"),
			currentContext: z.record(z.unknown()).optional().describe("Current context and state")
		},
		handler: async (params) => {
			const memory = (globalThis as any).getMemoryInstance();
			
			// Import and use pre-violation assessment
			const { PreViolationAssessment } = await import('./modules/pre-violation-assessment.js');
			const assessor = new PreViolationAssessment(memory);
			const guidance = await assessor.getRealtimeGuidance(params.actionType, params.actionDetails, params.currentContext);

			let urgencyIcon = '';
			switch (guidance.urgency) {
				case 'low': urgencyIcon = '🟢'; break;
				case 'medium': urgencyIcon = '🟡'; break;
				case 'high': urgencyIcon = '🟠'; break;
				case 'critical': urgencyIcon = '🔴'; break;
			}

			let guidanceIcon = '';
			switch (guidance.guidance) {
				case 'continue': guidanceIcon = '✅'; break;
				case 'pause': guidanceIcon = '⏸️'; break;
				case 'modify': guidanceIcon = '⚠️'; break;
				case 'stop': guidanceIcon = '🛑'; break;
			}

			return {
				content: [{
					type: "text",
					text: `## 🧭 Real-time Guidance

**Action**: ${params.actionType} - ${params.actionDetails}
**Guidance**: ${guidanceIcon} ${guidance.guidance.toUpperCase()}
**Urgency**: ${urgencyIcon} ${guidance.urgency.toUpperCase()}

**Reasoning**: ${guidance.reasoning}

${guidance.suggestions && guidance.suggestions.length > 0 ? `
**Suggestions**:
${guidance.suggestions.map(s => `- ${s}`).join('\n')}
` : ''}

**Next Step**: ${
	guidance.guidance === 'continue' ? 'Proceed with current action' :
	guidance.guidance === 'pause' ? 'Pause and review before continuing' :
	guidance.guidance === 'modify' ? 'Adjust approach based on memory patterns' :
	'Stop current action and reconsider approach'
}

⏱️ **Real-time**: This guidance is based on current memory state and ongoing action analysis.`
				}]
			};
		}
	}
];// Fallback memory getter for standalone usage
function getMemoryInstance(): MnemosyneMemorySystem {
	// This will be overridden during Durable Object execution
	throw new Error("Memory instance not available outside Durable Object context");
}

/**
 * Worker entry point - routes requests to Durable Object
 */
export default {
	async fetch(request: Request, env: any): Promise<Response> {
		// Get Durable Object instance
		const id = env.MEMORY_MCP_OBJECT.idFromName("memory-system");
		const obj = env.MEMORY_MCP_OBJECT.get(id);
		
		// Forward request to Durable Object
		return obj.fetch(request);
	}
};
