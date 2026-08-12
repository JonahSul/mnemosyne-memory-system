/**
 * @mnemosyne/cli — standalone MCP server over stdio with SQLite infrastructure.
 *
 * Composition root binding SQLite adapters to the domain model.
 * Replaces the legacy `mnemosyne-sqlite` server and `local-agent.ts`.
 */

export { startServer } from './server.js';
