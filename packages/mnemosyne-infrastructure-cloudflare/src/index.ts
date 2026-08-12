/**
 * @mnemosyne/infra-cloudflare — real Cloudflare infrastructure adapters.
 *
 * No mocks. No stubs. No fallback paths in production code. Test shims live
 * in tests/fixtures/, not here.
 *
 * Phase 4 will move the real implementation from
 * `packages/mnemosyne-cloudflare/src/vector-store.ts` and
 * `src/cloudflare-vector-store.ts` into these adapters.
 */

export { VectorizeAdapter } from './vectorize-adapter.js';
export { KVAdapter } from './kv-adapter.js';
export { WorkersAIEmbeddingAdapter } from './embedding-adapter.js';
export { R2Adapter } from './r2-adapter.js';
