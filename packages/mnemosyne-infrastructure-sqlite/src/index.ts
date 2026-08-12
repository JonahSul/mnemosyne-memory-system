/**
 * @mnemosyne/infra-sqlite — real SQLite infrastructure adapters.
 *
 * Phase 4 will move the real implementation from
 * `packages/mnemosyne-sqlite/src/sqlite-vector-store.ts` here.
 * The mock embedding fallback is NOT carried forward.
 */

export { SqliteVectorStore } from './sqlite-vector-store.js';
export { SqliteKVStore } from './sqlite-kv-store.js';
