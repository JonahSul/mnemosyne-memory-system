/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Mnemosyne Memory System MCP Agent
 * 
 * Implements MCP server using the standard MCP SDK for proper transport handling.
 * Provides cognitive enhancement and behavioral regulation through persistent memory.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { MnemosyneMemorySystem } from "./memory-tool.js";
import { MemoryNotFoundError } from "./modules/core-memory.js";
import { foundationMigrationV1, applyFoundationMigration } from "../migrations/foundation.js";
import { foundationMigrationV12 } from "../migrations/foundation-v1.2.0.js";
import { registerMemoryTools } from "./tools/registry.js";

/**
 * Mnemosyne Memory System MCP Agent
 * 
 * Implements MCP server as a Durable Object for persistent memory storage.
 * Provides cognitive enhancement and behavioral regulation through persistent memory.
 */
export class MnemosyneMemoryMCP {
	private memory: MnemosyneMemorySystem;
	private server: Server;
	private initialized = false;

	constructor(private state: DurableObjectState, private env: any) {
		this.memory = new MnemosyneMemorySystem();
		this.server = new Server({
			name: "mnemosyne-memory-system",
			version: "1.0.0",
		}, {
			capabilities: {
				tools: {}
			}
		});
	}

	/**
	 * Gets the memory instance for tool execution context
	 * @returns The memory system instance
	 */
	getMemoryInstance(): MnemosyneMemorySystem {
		return this.memory;
	}

	/**
	 * Initialize all memory tools using the modular registry
	 */
	async init() {
		if (this.initialized) return;
		
		try {
			// Determine the latest foundation migration to use
			const latestFoundation = this.getLatestFoundationMigration();
			
			// Apply latest foundation migration to establish core behavioral rules
			// This ensures we always start with the most current foundation, regardless of version increment
			applyFoundationMigration(this.memory, latestFoundation);
			
			// Set up global memory instance getter for tools
			(globalThis as any).getMemoryInstance = () => this.memory;
			
			// Re-enable tools registry
			registerMemoryTools(this.server);
			
			this.initialized = true;
			console.log(`Mnemosyne Memory System initialized successfully with Foundation ${latestFoundation.version}`);
		} catch (error) {
			console.error('Failed to initialize Mnemosyne Memory System:', error);
			throw error;
		}
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
				console.log(`Selected Foundation ${foundation.version}: ${foundation.description}`);
				return foundation;
			}
		}

		// Fallback to v1.0.0 if somehow v1.2.0 is not available
		console.warn('Using fallback Foundation v1.0.0 - latest foundation not available');
		return foundationMigrationV1;
	}

	/**
	 * Handle fetch requests (required for Durable Object)
	 */
	async fetch(request: Request): Promise<Response> {
		try {
			await this.init();

			const url = new URL(request.url);

			// Add CORS headers to all responses
			const corsHeaders = {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
			};

			// Handle CORS preflight
			if (request.method === 'OPTIONS') {
				return new Response(null, { status: 200, headers: corsHeaders });
			}

			// Handle SSE endpoint for MCP communication
			if (url.pathname === "/sse" || url.pathname === "/sse/message") {
				return this.handleMcpRequest(request, corsHeaders);
			}

			// Handle standard MCP requests (legacy endpoint)
			if (url.pathname === "/mcp") {
				return this.handleMcpRequest(request, corsHeaders);
			}

			// Default response
			return new Response("Mnemosyne Memory System MCP Server - Runtime Foundation Updates Ready", {
				headers: { 
					'Content-Type': 'text/plain',
					...corsHeaders
				}
			});

		} catch (error) {
			// Log error and return a safe response
			console.error('Worker error:', error);
			return new Response(`Worker Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
				status: 500,
				headers: { 
					'Content-Type': 'text/plain',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}
	}

	/**
	 * Handle MCP JSON-RPC requests
	 */
	private async handleMcpRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32600, message: "Invalid Request: Only POST method supported" }
			}), {
				status: 405,
				headers: { 
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
		}

		try {
			const body = await request.json() as any;
			
			// Handle initialization
			if (body.method === 'initialize') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						protocolVersion: "2024-11-05",
						capabilities: {
							tools: { listChanged: true },
							resources: { subscribe: true, listChanged: true, templates: true },
							prompts: { listChanged: false },
							logging: { level: "info" }
						},
						serverInfo: {
							name: "mnemosyne-memory-system",
							version: "1.0.0",
							description: "Cognitive enhancement and behavioral regulation with runtime foundation updates"
						}
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}
			
			// Handle initialized notification
			if (body.method === 'notifications/initialized') {
				return new Response('', { 
					status: 200,
					headers: corsHeaders
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
						...corsHeaders
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
						...corsHeaders
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
						...corsHeaders
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
						...corsHeaders
					}
				});
			}
			
			// Handle tools list
			if (body.method === 'tools/list') {
				const { memoryTools } = await import('./tools/registry.js');
				
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						tools: memoryTools.map(tool => ({
							name: tool.name,
							description: tool.description || "No description available",
							inputSchema: {
								type: "object",
								properties: tool.schema || {},
								additionalProperties: false
							}
						}))
					}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						...corsHeaders
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
						error: { code: -32602, message: "Invalid params: missing tool name" }
					}), {
						status: 400,
						headers: { 
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
				}
				
				// Find tool in registry
				const { memoryTools } = await import('./tools/registry.js');
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
							...corsHeaders
						}
					});
				}
				
				try {
					// Execute tool using the registry handler
					const result = await tool.handler(toolArgs);
					
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						result
					}), {
						headers: { 
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
					
				} catch (error) {
					// Handle specific error types with appropriate status codes
					let statusCode = 500;
					let errorCode = -32603;
					let errorMessage = "Tool execution error";
					
					if (error instanceof MemoryNotFoundError) {
						statusCode = 404;
						errorCode = -32602; // Invalid params (the claim ID doesn't exist)
						errorMessage = "Resource not found";
					}
					
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						error: {
							code: errorCode,
							message: errorMessage,
							data: error instanceof Error ? error.message : 'Unknown error'
						}
					}), {
						status: statusCode,
						headers: { 
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
				}
			}			// Handle other methods
			if (body.method === 'ping') {
				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {}
				}), {
					headers: { 
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}
			
			// Method not found
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				id: body.id,
				error: { code: -32601, message: `Method not found: ${body.method}` }
			}), {
				status: 404,
				headers: { 
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
			
		} catch (error) {
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				id: null,
				error: { code: -32700, message: "Parse error" }
			}), {
				status: 400,
				headers: { 
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
		}
	}
}
