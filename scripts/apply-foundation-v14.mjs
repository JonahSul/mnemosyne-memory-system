// JavaScript ESM worker-side script
// File: scripts/apply-foundation-v14.mjs
// Purpose: Apply Foundation v1.4.0 migration to an existing MnemosyneMemorySystem instance

async function tryImport(pathVariants) {
  for (const p of pathVariants) {
    try {
      return await import(p);
    } catch (e) {
      // continue
    }
  }
  throw new Error(`Failed to import any of: ${pathVariants.join(', ')}`);
}

async function main() {
  try {
    // Load migration module (try .js then .ts)
    const migrationMod = await tryImport([
      '../migrations/foundation-v1.4.0.js',
      '../migrations/foundation-v1.4.0.ts',
      './migrations/foundation-v1.4.0.js',
      './migrations/foundation-v1.4.0.ts'
    ]);

    const applyFn = migrationMod.applyFoundationMigrationV14 || migrationMod.applyFoundationMigrationV14 || migrationMod.applyFoundationMigrationV14;
    const migration = migrationMod.foundationMigrationV14 || migrationMod.foundationMigrationV14 || migrationMod.foundationMigrationV14;

    if (!applyFn) {
      throw new Error('applyFoundationMigrationV14 not found in migration module');
    }

    // Load MnemosyneMemorySystem (try compiled .js then .ts)
    const memoryMod = await tryImport([
      '../src/memory-tool.js',
      '../src/memory-tool.ts',
      './src/memory-tool.js',
      './src/memory-tool.ts'
    ]);

    const MnemosyneMemorySystem = memoryMod.MnemosyneMemorySystem || memoryMod.default || memoryMod.MnemosyneMemorySystem;

    if (!MnemosyneMemorySystem) {
      throw new Error('MnemosyneMemorySystem class not found in src/memory-tool');
    }

    // Resolve memory instance: prefer globalThis.getMemoryInstance() if available (Durable Object), else create local instance
    let memoryInstance;
    if (typeof globalThis.getMemoryInstance === 'function') {
      memoryInstance = globalThis.getMemoryInstance();
      console.log('Using existing global memory instance (getMemoryInstance)');
    } else if (typeof globalThis.getKVMemoryInstance === 'function') {
      // If KV-backed instance getter exists, try to obtain memory similarly
      try {
        memoryInstance = globalThis.getMemoryInstance ? globalThis.getMemoryInstance() : null;
      } catch (e) {
        memoryInstance = null;
      }
    }

    if (!memoryInstance) {
      // Fallback: create a local MnemosyneMemorySystem instance (affects only this runtime)
      memoryInstance = new MnemosyneMemorySystem();
      console.log('Created local MnemosyneMemorySystem instance (not persisted to Durable Object)');
    }

    // Apply migration
    console.log('Applying foundation v1.4.0...');
    await applyFn(memoryInstance);

    // If migration object present, log version
    const version = migration?.version || (migrationMod.foundationMigrationV14 && migrationMod.foundationMigrationV14.version) || 'unknown';
    console.log(`Migration ${version} applied successfully.`);

    return { success: true, version };
  } catch (err) {
    console.error('Failed to apply foundation v1.4.0:', err);
    return { success: false, error: String(err) };
  }
}

// If executed directly via node/npx tsx, run main
if (typeof process !== 'undefined' && process.argv && require.main === module) {
  main().then(res => {
    if (!res.success) process.exitCode = 1;
  });
}

export default main;
