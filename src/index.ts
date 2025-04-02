/**
 * Mnemosyne Memory System MCP Server
 * 
 * Cloudflare Worker providing cognitive enhancement and behavioral regulation for AI agents
 * Uses Durable Objects for persistent memory storage
 */

import { MnemosyneMemoryMCP } from "./agent.js";

// Interface for environment variables
interface Env {
	MEMORY_API_KEY?: string;
	MNEMOSYNE_MCP_OBJECT?: DurableObjectNamespace;
	MNEMOSYNE_MCP_OBJECT_DEV?: DurableObjectNamespace;
	MNEMOSYNE_MCP_OBJECT_STAGE?: DurableObjectNamespace;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Determine which Durable Object binding to use based on environment
		const durableObject = env.MNEMOSYNE_MCP_OBJECT_STAGE || 
							  env.MNEMOSYNE_MCP_OBJECT_DEV || 
							  env.MNEMOSYNE_MCP_OBJECT;

		if (!durableObject) {
			return new Response("Durable Object binding not found", { status: 500 });
		}

		// Get or create Durable Object instance
		const id = durableObject.idFromName("default");
		const stub = durableObject.get(id);

		// Handle SSE endpoint for MCP communication
		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return stub.fetch(request);
		}

		// Handle standard MCP endpoint
		if (url.pathname === "/mcp") {
			return stub.fetch(request);
		}

		// Root endpoint with server information
		if (url.pathname === '/') {
			return new Response(JSON.stringify({
				name: "Mnemosyne Memory System MCP Server",
				version: "1.0.0",
				description: "Cognitive enhancement and behavioral regulation system for AI agents",
				protocol: "MCP 2024-11-05",
				capabilities: ["tools", "resources"],
				endpoints: {
					sse: "/sse",
					mcp: "/mcp"
				}
			}, null, 2), {
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		return new Response('Mnemosyne Memory System MCP Server\n\nEndpoints:\n- /sse (Server-Sent Events)\n- /mcp (Standard MCP)', {
			headers: { 
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			}
		});
	},
};

// Export the Durable Object class
export { MnemosyneMemoryMCP };
