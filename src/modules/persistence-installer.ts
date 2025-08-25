import { wrapPersistenceMethod, CircuitBreaker, debounce } from './persistence-wrappers.js';

export async function installPersistenceWrappers(doInstance: any) {
  try {
    const core = doInstance.memory?.coreMemory;
    if (!core) return;

    const cb = new CircuitBreaker({ failureThreshold: 5, successThreshold: 2, timeoutMs: 30_000 });

    // Fallback for storeMemory: write a persistent record to UnifiedStorageEngine if available
    const fallbackStore = async (entry: any, testing: boolean = false) => {
      try {
        const unified = (globalThis as any).getUnifiedStorageEngine ? (globalThis as any).getUnifiedStorageEngine() : null;
        if (unified && unified.storeKnowledge) {
          await unified.storeKnowledge({
            content: entry.content || JSON.stringify(entry),
            metadata: { id: entry.id, type: entry.type, timestamp: entry.timestamp },
            tags: ['fallback','core_memory']
          });
        }
      } catch (e) {
        console.warn('Fallback unified store failed:', e);
      }
      return entry.id;
    };

    wrapPersistenceMethod(core, 'storeMemory', {
      circuitBreaker: cb,
      attempts: 3,
      initialDelayMs: 200,
      fallback: fallbackStore
    });

    wrapPersistenceMethod(core, 'logClaim', {
      circuitBreaker: cb,
      attempts: 3,
      initialDelayMs: 200,
      fallback: async (claim: string, context?: any, source?: any, confidence?: any, testing?: any) => {
        try {
          const unified = (globalThis as any).getUnifiedStorageEngine ? (globalThis as any).getUnifiedStorageEngine() : null;
          if (unified && unified.storeKnowledge) {
            await unified.storeKnowledge({
              content: claim,
              metadata: { source, confidence, context },
              tags: ['fallback','claim']
            });
          }
        } catch (e) { console.warn('Fallback logClaim failed:', e); }
        // call original implementation (wrapped) - but since we replaced it, attempt to store to core directly
        return claim;
      }
    });

    wrapPersistenceMethod(core, 'verifyClaim', {
      circuitBreaker: cb,
      attempts: 3,
      initialDelayMs: 200
    });

    // Debounced snapshot persistence using DO state.storage if available
    if (doInstance.state && typeof doInstance.state.storage?.put === 'function') {
      const persistSnapshot = async () => {
        try {
          if (typeof core.exportSnapshot === 'function') {
            const snap = await core.exportSnapshot();
            await doInstance.state.storage.put('coreMemorySnapshot', snap);
          } else if (typeof doInstance.memory?.exportState === 'function') {
            const snap = await doInstance.memory.exportState(true);
            await doInstance.state.storage.put('coreMemorySnapshot', snap);
          }
        } catch (e) {
          console.warn('Persist snapshot failed:', e);
        }
      };
      (doInstance as any)._persistSnapshotDebounced = debounce(persistSnapshot, 2000);
    }

    console.log('Persistence wrappers installed');
  } catch (e) {
    console.error('installPersistenceWrappers failed', e);
  }
}
