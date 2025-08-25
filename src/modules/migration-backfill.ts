import { CloudflareVectorStore } from '../cloudflare-vector-store';

/**
 * Migration / Backfill helper
 * Scans in-memory managers for transient state and writes them to KV + VectorStore
 * Idempotent: keys are deterministic where possible
 */
export async function backfillPrewarmingState(manager: any, vectorStore?: CloudflareVectorStore, kvStore?: any) {
    // manager is expected to be an instance of VectorPrewarmingManager
    try {
        const vs = vectorStore || (manager && manager.vectorStore);
        const kv = kvStore || (manager && manager.kvStore);

        if (!manager) return { migrated: 0 };

        let migrated = 0;

        if (manager.getActivePrewarming) {
            const active = manager.getActivePrewarming();
            for (const [id, status] of active.entries()) {
                try {
                    if (kv) await kv.put(`prewarming:${id}`, JSON.stringify(status));
                    if (vs && vs.storeKnowledge) await vs.storeKnowledge({ content: JSON.stringify(status), metadata: { id, type: 'prewarming' }, tags: ['prewarming', 'backfill'] });
                    migrated++;
                } catch (e) {
                    // continue
                }
            }
        }

        if (manager.getEffectivenessHistory) {
            const hist = manager.getEffectivenessHistory();
            for (const h of hist) {
                try {
                    const id = `effectiveness_${(h && (h as any).strategy) || Date.now()}`;
                    if (kv) await kv.put(`prewarming:effectiveness:${id}`, JSON.stringify(h));
                    if (vs && vs.storeKnowledge) await vs.storeKnowledge({ content: JSON.stringify(h), metadata: { id, type: 'prewarming_effectiveness' }, tags: ['prewarming', 'backfill'] });
                    migrated++;
                } catch (e) {}
            }
        }

        return { migrated };
    } catch (e) {
        return { migrated: 0, error: String(e) };
    }
}
