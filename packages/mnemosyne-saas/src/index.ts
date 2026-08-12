/**
 * @mnemosyne/saas — Cloudflare Worker entry point.
 *
 * Composition root: binds Cloudflare infrastructure adapters to the domain
 * model. Routes incoming requests to MCP, streaming, or federation handlers.
 *
 * Replaces the legacy `src/index.ts` and `src/agent.ts`. Uses an explicit
 * route table and a real MCP server — not a god Durable Object.
 */

export { MnemosyneWorker } from './worker.js';
export type { WorkerEnv } from './worker.js';
export { MnemosyneDurableObject } from './durable-object.js';
export { composeSaas } from './composition-root.js';
export type { SaasEnv, SaasComposition } from './composition-root.js';
export { EventBusPublisher } from './event-bus-publisher.js';
