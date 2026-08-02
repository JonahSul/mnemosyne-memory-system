/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Mnemosyne Memory System MCP Agent
 *
 * Implements MCP server using the standard MCP SDK for transport handling.
 * Provides cognitive enhancement and behavioral regulation through persistent memory.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { MnemosyneMemorySystem, type MnemosyneConfig } from "@mnemosyne/legacy-core/memory-tool";
import type { KeyValueStoreAdapter } from "@mnemosyne/legacy-core/interfaces/storage";
import { MemoryNotFoundError } from "@mnemosyne/legacy-core/modules/core-memory";
import { applyFoundationMigration, type FoundationMigration } from "@mnemosyne/legacy-core/migrations/foundation";
import { foundationMigrationV1_0_0 } from "@mnemosyne/legacy-core/migrations/foundation-v1.0.0";
import { registerSimplifiedMemoryTools } from "./tools/simplified-registry";
import { CloudflareVectorStore } from "@mnemosyne/legacy-cloudflare/vector-store";
import { KVMemoryLayer, getKVMemoryLayer } from "@mnemosyne/legacy-core/modules/kv-memory-layer";
import { processFederationOperation } from "@mnemosyne/legacy-core/modules/federation-rag";
import { getFederationAuth, AgentRole } from "@mnemosyne/legacy-core/modules/federation-auth";

/**
 * Mnemosyne Memory System MCP Agent
 * 
 * Implements MCP server as a Durable Object for persistent memory storage.
 * Provides cognitive enhancement and behavioral regulation through persistent memory.
 */
export class MnemosyneMemoryMCP {
	private memory: MnemosyneMemorySystem | null = null;
	private server: Server;
	private kvMemory: KVMemoryLayer | null = null;
	private vectorStore?: CloudflareVectorStore;
	private kvBinding?: KVNamespace;
	private initialized = false;

	constructor(private state: DurableObjectState, private env: any) {
		console.log('DEBUG: MnemosyneMemoryMCP constructor starting...');
		console.log('DEBUG: env.VECTORIZE_INDEX available:', !!env.VECTORIZE_INDEX);
		console.log('DEBUG: env.AI available:', !!env.AI);

		// CRITICAL FIX: Defer memory system creation until after environment bindings are initialized
		// this.memory = new MnemosyneMemorySystem(); // Moved to initialization method
		this.server = new Server({
			name: "mnemosyne-memory-system",
			version: "1.0.0",
		}, {
			capabilities: {
				tools: {}
			}
		});

		// Initialize KV Memory Layer as foundation
		if (env.MEMORY_KV) {
			try {
				console.log('DEBUG: Initializing KV Memory Layer...');
				this.kvMemory = getKVMemoryLayer({ MEMORY_KV: env.MEMORY_KV });
				this.kvBinding = env.MEMORY_KV;
				console.log('DEBUG: KV Memory Layer initialized successfully');
			} catch (error) {
				console.error('DEBUG: Error initializing KV Memory Layer:', error);
			}
		} else {
			console.warn('KV Memory Layer not initialized - missing MEMORY_KV binding');
		}

		// Initialize CloudflareVectorStore with Worker environment bindings
		if (env.VECTORIZE_INDEX && env.AI) {
			try {
				console.log('DEBUG: Creating CloudflareVectorStore instance...');
				this.vectorStore = new CloudflareVectorStore({ env });
				console.log('DEBUG: CloudflareVectorStore instance created successfully');
			} catch (error) {
				console.error('DEBUG: Error creating CloudflareVectorStore:', error);
			}
		} else {
			console.warn('CloudflareVectorStore not initialized - missing VECTORIZE_INDEX or AI bindings');
		}
	}

	/**
	 * Gets the memory instance for tool execution context
	 * @returns The memory system instance
	 */
	getMemoryInstance(): MnemosyneMemorySystem {
		if (!this.memory) {
			throw new Error('Memory system not initialized. Call initialize() first.');
		}
		return this.memory;
	}

	/**
	 * Gets the KV memory layer for guaranteed persistence
	 * @returns The KV memory layer instance
	 */
	getKVMemoryLayer(): KVMemoryLayer | null {
		return this.kvMemory;
	}

	private getKvAdapter(): KeyValueStoreAdapter | undefined {
		if (!this.kvBinding) {
			return undefined;
		}
		const binding = this.kvBinding;
		return {
			put: (key, value, options) => binding.put(key, value, options as any),
			get: (key) => binding.get(key),
			delete: (key) => binding.delete(key),
			list: async (options?: Record<string, unknown>) => {
				const result = await binding.list(options as any);
				return result.keys.map((entry) => entry.name);
			}
		};
	}

	/**
	 * Initialize all memory tools using the modular registry
	 */
	async init() {
		if (this.initialized) return;

		try {
			// CRITICAL FIX: Initialize environment bindings FIRST
			const { initializeWithEnv } = await import('./tools/simplified-registry');
			initializeWithEnv(this.env);
			console.log('✅ Tools initialized with Worker environment bindings');

			// CRITICAL FIX: Create memory system AFTER environment bindings are initialized
			if (!this.vectorStore) {
				if (this.env.VECTORIZE_INDEX && this.env.AI) {
					this.vectorStore = new CloudflareVectorStore({ env: this.env });
				} else {
					throw new Error('MnemosyneMemorySystem requires VECTORIZE_INDEX and AI bindings to initialize the vector store.');
				}
			}
			const kvAdapter = this.getKvAdapter();
			const memoryConfig: MnemosyneConfig = { vectorStore: this.vectorStore };
			if (kvAdapter) {
				memoryConfig.kvStore = kvAdapter;
			}
			this.memory = new MnemosyneMemorySystem(memoryConfig);
			console.log('✅ Memory system created with proper environment bindings');

			// =====================================================================================
			// FOUNDATION v1.0.0 — Canonical Behavioural Foundation
			// =====================================================================================
			// The Foundation version is kept in **lockstep** with the library
			// packages.  Both the library version and the Foundation version
			// are `1.0.0` for this initial public release.
			//
			// Every CI bump to the library packages MUST bump the Foundation
			// version number to match.
			//
			// APPLY via the standard migration path so that core rules,
			// essential patterns and safety constraints are registered in
			// the behavioural rule manager.
			// =====================================================================================

			console.log(`Applying Foundation v${foundationMigrationV1_0_0.version} — ${foundationMigrationV1_0_0.description}`);
			await applyFoundationMigration(this.memory, foundationMigrationV1_0_0);
			console.log(`✅ Foundation v${foundationMigrationV1_0_0.version} applied (${foundationMigrationV1_0_0.coreRules.length} rules, ${foundationMigrationV1_0_0.essentialPatterns.length} patterns, ${foundationMigrationV1_0_0.safetyConstraints.length} constraints)`);

			// Set up global memory instance getter for tools
			(globalThis as any).getMemoryInstance = () => this.memory;
			(globalThis as any).getKVMemoryInstance = () => this.kvMemory;
			(globalThis as any).getWorkerEnvironment = () => this.env;

			// Re-enable tools registry
			registerSimplifiedMemoryTools(this.server);

			// Environment bindings already initialized above
			// (Removed duplicate initializeWithEnv call)

			// Install persistence wrappers (disabled - module not found)
			// try {
			// 	const { installPersistenceWrappers } = await import('./modules/persistence-installer');
			// 	await installPersistenceWrappers(this);
			// } catch (e) {
			// 	console.warn('Failed to install persistence wrappers:', e);
			// }

			// Initialize CloudflareVectorStore with Worker environment bindings
			console.log('DEBUG: Checking CloudflareVectorStore initialization...');
			console.log('DEBUG: env.VECTORIZE_INDEX available:', !!this.env.VECTORIZE_INDEX);
			console.log('DEBUG: env.AI available:', !!this.env.AI);

			if (this.env.VECTORIZE_INDEX && this.env.AI) {
				try {
					console.log('DEBUG: Creating CloudflareVectorStore instance...');
					const vectorStore = new CloudflareVectorStore({ env: this.env });
					console.log('DEBUG: CloudflareVectorStore instance created successfully');
					console.log('DEBUG: CloudflareVectorStore configured:', vectorStore.isConfigured());
				} catch (error) {
					console.error('DEBUG: Error creating CloudflareVectorStore:', error);
				}
			} else {
				console.warn('DEBUG: CloudflareVectorStore not initialized - missing VECTORIZE_INDEX or AI bindings');
			}

			this.initialized = true;
			console.log('Mnemosyne Memory System initialized successfully with Foundation v1.8.0');
		} catch (error) {
			console.error('Failed to initialize Mnemosyne Memory System:', error);
			throw error;
		}
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

			// Handle private federation endpoints for cluster agents
			if (url.pathname.startsWith("/federation/v1/")) {
				return this.handleFederationRequest(request, corsHeaders);
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
				const { simplifiedMemoryTools } = await import('./tools/simplified-registry');

				return new Response(JSON.stringify({
					jsonrpc: "2.0",
					id: body.id,
					result: {
						tools: simplifiedMemoryTools.map(tool => ({
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
				const { simplifiedMemoryTools } = await import('./tools/simplified-registry');
				const tool = simplifiedMemoryTools.find(t => t.name === toolName);

				if (!tool) {
					return new Response(JSON.stringify({
						jsonrpc: "2.0",
						id: body.id,
						error: {
							code: -32601,
							message: `Tool not found: ${toolName}`,
							data: {
								availableTools: simplifiedMemoryTools.map(t => t.name)
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

	/**
	 * Handle private federation requests for cluster agents
	 */
	async handleFederationRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
		try {
			const url = new URL(request.url);

			// Parse operation from URL path
			const pathParts = url.pathname.split('/');
			if (pathParts.length < 4) {
				return new Response(JSON.stringify({
					success: false,
					error: 'Invalid federation endpoint format. Expected: /federation/v1/{role}/{operation}'
				}), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

			const role = pathParts[3];
			const operation = pathParts[4];
			const federationOperation = `${role}:${operation}`;

			// Extract Bearer token from Authorization header
			const authHeader = request.headers.get('Authorization');
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return new Response(JSON.stringify({
					success: false,
					error: 'Missing or invalid Authorization header. Expected: Bearer {token}'
				}), {
					status: 401,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

			const sessionToken = authHeader.substring(7); // Remove "Bearer "

			// Parse request body for operation payload
			let payload = {};
			if (request.method === 'POST') {
				try {
					payload = await request.json();
				} catch (error) {
					return new Response(JSON.stringify({
						success: false,
						error: 'Invalid JSON payload'
					}), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
				}
			}

			// Process federation operation
			const response = await processFederationOperation(
				federationOperation,
				payload,
				sessionToken
			);

			return new Response(JSON.stringify(response), {
				status: response.success ? 200 : 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});

		} catch (error) {
			console.error('Federation request error:', error);
			return new Response(JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error',
				agentId: 'unknown',
				operationId: `error_${Date.now()}`,
				timestamp: Date.now()
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
		}
	}
}
