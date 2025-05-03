// Debug the failing test scenario
import { MultiTierMemorySystem, DEFAULT_TIER_CONFIG } from './src/multi-tier-memory.js';

async function debugFailingTest() {
    console.log('🔍 Debugging the failing test scenario...\n');
    
    const memorySystem = new MultiTierMemorySystem();
    console.log('Config axiom tier:', memorySystem.config?.axiom ? 'PRESENT' : 'NOT PRESENT');
    
    // Set mock time
    const startTime = new Date('2025-08-21T12:00:00Z');
    console.log('Start time:', startTime.toISOString());
    
    // Store items exactly like the test
    console.log('\n1. Storing items in different tiers...');
    
    const shortItem = await memorySystem.storeKnowledge({
        content: 'Short-term item',
        targetTier: 'short',
        importance: 0.3
    });
    console.log(`✅ Short item stored in tier: ${shortItem.tier}`);
    
    const intermediateItem = await memorySystem.storeKnowledge({
        content: 'Intermediate item',
        targetTier: 'intermediate', 
        importance: 0.5
    });
    console.log(`✅ Intermediate item stored in tier: ${intermediateItem.tier}`);
    
    const longItem = await memorySystem.storeKnowledge({
        content: 'Long-term item',
        targetTier: 'long',
        importance: 0.7
    });
    console.log(`✅ Long item stored in tier: ${longItem.tier}`);
    
    // Check initial stats
    console.log('\n2. Initial memory stats:');
    let stats = memorySystem.getMemoryStats();
    if (stats.axiom) {
        console.log(`   Axiom: ${stats.axiom.count} items`);
    }
    console.log(`   Long: ${stats.long.count} items`);
    console.log(`   Intermediate: ${stats.intermediate.count} items`);
    console.log(`   Short: ${stats.short.count} items`);
    
    // Simulate the time advance (3 hours)
    console.log('\n3. Simulating 3 hours passing...');
    const futureTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
    console.log('Future time:', futureTime.toISOString());
    
    // Manually check what should expire
    console.log('\n4. Checking expiration logic...');
    console.log('Short-term retention hours:', DEFAULT_TIER_CONFIG.short.retentionHours);
    console.log('Intermediate retention hours:', DEFAULT_TIER_CONFIG.intermediate.retentionHours);
    console.log('Long retention hours:', DEFAULT_TIER_CONFIG.long.retentionHours);
    
    // Run garbage collection
    console.log('\n5. Running garbage collection...');
    const gcResult = await memorySystem.runGarbageCollection();
    
    console.log('GC Results:');
    console.log('   Items removed:', gcResult.expiredItemsRemoved);
    console.log('   Items spared:', gcResult.itemsSpared);
    
    // Check final stats
    console.log('\n6. Final memory stats:');
    stats = memorySystem.getMemoryStats();
    if (stats.axiom) {
        console.log(`   Axiom: ${stats.axiom.count} items`);
    }
    console.log(`   Long: ${stats.long.count} items`);
    console.log(`   Intermediate: ${stats.intermediate.count} items`);
    console.log(`   Short: ${stats.short.count} items`);
    
    console.log('\n❌ Expected: intermediate.count = 1');
    console.log(`✅ Actual: intermediate.count = ${stats.intermediate.count}`);
    
    if (stats.intermediate.count === 0) {
        console.log('\n🔍 Intermediate tier is empty! Something went wrong...');
    }
}

// Run immediately
debugFailingTest().catch(console.error);

// Export not needed in ES modules
export { debugFailingTest };
