/**
 * @mnemosyne/saas — Cloudflare Worker entry point.
 *
 * Composition root: binds Cloudflare infrastructure adapters to the domain
 * model. Routes incoming requests to MCP, streaming, or federation handlers.
 *
 * Phase 5 will implement the real routing. Unlike the legacy `src/index.ts`,
 * this uses an explicit route table — not a god Durable Object.
 */

export { MnemosyneWorker } from './worker.js';
export { MnemosyneDurableObject } from './durable-object.js';
