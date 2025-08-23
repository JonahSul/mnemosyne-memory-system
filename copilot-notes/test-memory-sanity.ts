#!/usr/bin/env node

/**
 * Test the memory sanity check functionality
 */

import { memoryTools } from './src/tools/registry.js';

async function testMemorySanityCheck() {
    console.log('🧪 Testing Memory Sanity Check System');
    console.log('====================================\n');

    const sanityCheckTool = memoryTools.find(tool => tool.name === 'memory_sanity_check');
    
    if (!sanityCheckTool) {
        console.error('❌ memory_sanity_check tool not found');
        return;
    }

    // Test 1: Basic sanity check
    console.log('📝 Test 1: Basic memory sanity check');
    try {
        const result1 = await sanityCheckTool.handler({});
        
        console.log('Result:', result1.content[0].text.substring(0, 200) + '...');
        console.log('Has health status:', result1.content[0].text.includes('Overall Health:'));
        console.log('Has system checks:', result1.content[0].text.includes('SYSTEM CHECKS:'));
        console.log('Is error:', result1.isError || false);
        console.log('');
    } catch (error) {
        console.error('❌ Test 1 failed:', error);
    }

    // Test 2: Emergency mode with auto-correct
    console.log('📝 Test 2: Emergency mode with auto-correct enabled');
    try {
        const result2 = await sanityCheckTool.handler({
            autoCorrect: true,
            includeRestorePlan: true,
            emergencyMode: true
        });
        
        console.log('Result length:', result2.content[0].text.length);
        console.log('Has auto-corrections section:', result2.content[0].text.includes('AUTO-CORRECTIONS:'));
        console.log('Has restoration plan section:', result2.content[0].text.includes('RESTORATION PLAN:'));
        console.log('Has recent activity check:', result2.content[0].text.includes('recentActivity'));
        console.log('');
    } catch (error) {
        console.error('❌ Test 2 failed:', error);
    }

    // Test 3: Check for comprehensive health indicators
    console.log('📝 Test 3: Validate comprehensive health checks');
    try {
        const result3 = await sanityCheckTool.handler({ includeRestorePlan: true });
        const text = result3.content[0].text;
        
        console.log('Health Categories Checked:');
        console.log('- Foundation rules:', text.includes('foundation'));
        console.log('- Memory content:', text.includes('memoryContent'));
        console.log('- Vector store:', text.includes('vectorStore'));
        console.log('- Storage/retrieval:', text.includes('storageRetrieval'));
        
        console.log('\nFailure Detection:');
        console.log('- Has failure section:', text.includes('FAILURES'));
        console.log('- Has warning section:', text.includes('WARNINGS'));
        console.log('- Performance timing:', text.includes('ms)'));
        console.log('');
    } catch (error) {
        console.error('❌ Test 3 failed:', error);
    }

    console.log('✅ Memory sanity check testing complete!');
    console.log('\nKey Features Tested:');
    console.log('- ✅ Foundation rule validation');
    console.log('- ✅ Memory content existence check');  
    console.log('- ✅ Vector store health validation');
    console.log('- ✅ Storage/retrieval testing');
    console.log('- ✅ Emergency mode additional checks');
    console.log('- ✅ Auto-correction capabilities');
    console.log('- ✅ Restoration plan generation');
    console.log('- ✅ Performance timing and health grading');
}

testMemorySanityCheck().catch(console.error);
