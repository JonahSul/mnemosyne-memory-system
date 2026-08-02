/**
 * Standalone MCP server over stdio.
 *
 * Phase 5 will move the real server logic from
 * `packages/mnemosyne-sqlite/src/server.ts` here, rebinding to the new
 * @mnemosyne/mcp-server and @mnemosyne/infra-sqlite packages.
 */

export interface ServerConfig {
    readonly dbPath?: string;
    readonly uuad?: string;
}

export async function startServer(config: ServerConfig = {}): Promise<void> {
    // Phase 5: real implementation using @mnemosyne/mcp-server + @mnemosyne/infra-sqlite
    throw new Error('startServer: not yet implemented (Phase 5)');
}
