#!/usr/bin/env node
// Start local MCP server helper for mnemosyne-sqlite-vscode
// Tries to import the installed package by name, falls back to local file path.

(async () => {
  try {
    let pkg = null;
    try {
      pkg = await import('@mnemosyne/mcp');
    } catch (e) {
      // fallback to local package path (workspace) — resolve relative to this file
      const localUrl = new URL('../../mnemosyne-mcp/index.js', import.meta.url).href;
      pkg = await import(localUrl);
    }

    const start = pkg && (pkg.startLocalServer || pkg.startLocalServer?.default);
    if (!start) {
      console.error('startLocalServer() not found in @mnemosyne/mcp. Make sure the package is built.');
      process.exit(1);
    }

    const port = process.env.MNEMOSYNE_MCP_PORT ? Number(process.env.MNEMOSYNE_MCP_PORT) : 8000;
    console.log(`Starting local MCP server on port ${port}...`);
    start(port);
  } catch (err) {
    console.error('Failed to start local MCP server:', err);
    process.exit(1);
  }
})();
