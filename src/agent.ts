/**
 * Mnemosyne Memory System MCP Agent
 * 
 * Implements MCP server using the McpAgent framework for proper transport handling.
 * Provides cognitive enhancement and behavioral regulation through persistent memory.
 */

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MnemosyneMemorySystem } from "./memory-tool.js";
import { foundationMigrationV1, applyFoundationMigration } from "../migrations/foundation.js";
import { registerMemoryTools } from "./tools/registry.js";

/**
 * Mnemosyne Memory System MCP Agent
 * 
 * Extends McpAgent to provide behavioral memory tools through proper MCP transport.
 * Implements cognitive enhancement and long-term behavioral consistency for AI agents.
 */
export class MnemosyneMemoryMCP extends McpAgent {
	server = new McpServer({
		name: "mnemosyne-memory-system",
		version: "1.0.0",
	});

	private memory = new MnemosyneMemorySystem();

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
		// Apply foundation migration to establish core behavioral rules
		applyFoundationMigration(this.memory, foundationMigrationV1);
		
		// Set up global memory instance getter for tools
		(globalThis as any).getMemoryInstance = () => this.memory;
		
		// Register all memory tools using the modular registry
		registerMemoryTools(this.server, this);
	}
}
