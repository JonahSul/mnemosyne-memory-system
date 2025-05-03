// Quick test of axiom tier functionality
const { MultiTierMemorySystem } = require('./src/multi-tier-memory.ts');

async function testAxiomTier() {
    console.log('🧪 Testing Axiom Tier Implementation...\n');
    
    const memorySystem = new MultiTierMemorySystem();
    
    // Test 1: Store axiom
    console.log('1. Storing an axiom...');
    const axiom = await memorySystem.storeAxiom(
        'I always prefer detailed explanations over brevity',
        { source: 'user_preference' },
        ['communication', 'preference']
    );
    console.log(`✅ Axiom stored with ID: ${axiom.id}`);
    console.log(`   Tier: ${axiom.tier}`);
    console.log(`   Importance: ${axiom.importance}`);
    
    // Test 2: Store regular memory
    console.log('\n2. Storing regular memory...');
    const regular = await memorySystem.storeKnowledge({
        content: 'This is a regular memory item',
        importance: 0.5
    });
    console.log(`✅ Regular memory stored in tier: ${regular.tier}`);
    
    // Test 3: Search - axiom should surface first
    console.log('\n3. Searching for "prefer"...');
    const searchResults = await memorySystem.searchSimilar('prefer detailed', { 
        limit: 5, 
        threshold: 0.01 
    });
    
    searchResults.forEach((result, index) => {
        console.log(`   ${index + 1}. [${result.tier.toUpperCase()}] ${result.similarity.toFixed(1)}% - ${result.content.substring(0, 50)}...`);
    });
    
    // Test 4: Memory stats
    console.log('\n4. Memory statistics:');
    const stats = memorySystem.getMemoryStats();
    if (stats.axiom) {
        console.log(`   Axiom tier: ${stats.axiom.count}/${stats.axiom.capacity} items`);
    }
    console.log(`   Long tier: ${stats.long.count}/${stats.long.capacity} items`);
    console.log(`   Intermediate tier: ${stats.intermediate.count}/${stats.intermediate.capacity} items`);
    console.log(`   Short tier: ${stats.short.count}/${stats.short.capacity} items`);
    
    // Test 5: Garbage collection (axioms should never be removed)
    console.log('\n5. Running garbage collection...');
    const gcResult = await memorySystem.runGarbageCollection();
    console.log(`   Items removed: ${gcResult.expiredItemsRemoved.total}`);
    console.log(`   Axioms removed: ${gcResult.expiredItemsRemoved.axiom || 0}`);
    
    const finalStats = memorySystem.getMemoryStats();
    if (finalStats.axiom) {
        console.log(`   Axioms remaining: ${finalStats.axiom.count}`);
    }
    
    console.log('\n🎉 Axiom tier test complete!');
}

// Run test if this file is executed directly
if (require.main === module) {
    testAxiomTier().catch(console.error);
}

module.exports = { testAxiomTier };
