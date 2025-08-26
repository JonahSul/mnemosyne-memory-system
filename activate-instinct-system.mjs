#!/usr/bin/env node

/**
 * Instinctual Behavioral Priority System Activation Script
 * Foundation v1.6.0 - Production Activation
 */

import { InstinctManager, checkTerminalInstincts, interceptTerminalAction } from './src/modules/instinct-manager.ts';

async function activateInstinctSystem() {
    console.log('🚀 [ACTIVATION] Instinctual Behavioral Priority System - Foundation v1.6.0');
    console.log('📋 [INFO] Activating scaffold system with production safety controls...\n');
    
    // Get the singleton instance
    const manager = InstinctManager.getInstance();
    
    // Show initial status (should be disabled)
    const initialStatus = manager.getStatus();
    console.log('📊 [STATUS] Initial System State:');
    console.log(`   • Enabled: ${initialStatus.enabled}`);
    console.log(`   • Hooks Registered: ${initialStatus.hooks_registered}`);
    console.log(`   • Contexts: ${initialStatus.contexts.join(', ')}`);
    console.log('');
    
    // Enable the system
    console.log('⚡ [ACTIVATION] Enabling Instinctual Behavioral Priority System...');
    manager.setEnabled(true);
    console.log('');
    
    // Show activated status
    const activatedStatus = manager.getStatus();
    console.log('✅ [STATUS] System Activated:');
    console.log(`   • Enabled: ${activatedStatus.enabled}`);
    console.log(`   • Hooks Registered: ${activatedStatus.hooks_registered}`);
    console.log(`   • Active Contexts: ${activatedStatus.contexts.join(', ')}`);
    console.log('');
    
    // Demonstrate instinct checking
    console.log('🧠 [DEMO] Testing Instinct System...\n');
    
    // Test 1: Terminal operation instinct
    console.log('📍 [TEST 1] Terminal Operation Safety Check:');
    const terminalInstincts = await checkTerminalInstincts('git');
    console.log(`   • Instincts Triggered: ${terminalInstincts.length}`);
    terminalInstincts.forEach((instinct, index) => {
        console.log(`   • [${index + 1}] ${instinct.action}`);
        if (instinct.result) {
            console.log(`     - Guidance: ${instinct.result.guidance.join(', ')}`);
            console.log(`     - Priority Override: ${instinct.priority_override || false}`);
            console.log(`     - Blocking: ${instinct.result.action_blocked || false}`);
        }
    });
    console.log('');
    
    // Test 2: Action interception
    console.log('📍 [TEST 2] Action Interception for High-Risk Operations:');
    const interceptionResult = await interceptTerminalAction('sendCommand', { 
        command: 'rm -rf /', 
        context: 'dangerous_operation' 
    });
    console.log(`   • Action Allowed: ${interceptionResult.allowed}`);
    console.log(`   • Acknowledgment Required: ${interceptionResult.acknowledgment_required}`);
    console.log(`   • Instincts Triggered: ${interceptionResult.instincts_triggered.length}`);
    if (interceptionResult.blocking_reason) {
        console.log(`   • Blocking Reason: ${interceptionResult.blocking_reason}`);
    }
    interceptionResult.instincts_triggered.forEach((instinct, index) => {
        console.log(`   • [${index + 1}] ${instinct.action}`);
        if (instinct.result?.guidance) {
            instinct.result.guidance.forEach(guidance => {
                console.log(`     - ${guidance}`);
            });
        }
    });
    console.log('');
    
    // Test 3: Memory operation instincts
    console.log('📍 [TEST 3] Memory Operation Protocol Check:');
    const memoryInstincts = await manager.checkInstincts('memory_operations', ['memory_store']);
    console.log(`   • Instincts Triggered: ${memoryInstincts.length}`);
    memoryInstincts.forEach((instinct, index) => {
        console.log(`   • [${index + 1}] ${instinct.action}`);
        if (instinct.result) {
            console.log(`     - Confidence: ${instinct.confidence_threshold}`);
            console.log(`     - Mandatory: ${instinct.mandatory_surfacing || false}`);
        }
    });
    console.log('');
    
    console.log('🎯 [SUCCESS] Instinctual Behavioral Priority System is now ACTIVE');
    console.log('📋 [INFO] System will now provide behavioral guidance and safety interventions');
    console.log('⚠️  [SAFETY] Critical operations may require acknowledgment before proceeding');
    console.log('🔧 [NEXT] Integrate with terminal tools and memory operations for full protection');
    
    return {
        activated: true,
        system_status: activatedStatus,
        demo_results: {
            terminal_instincts: terminalInstincts.length,
            action_interception_working: !interceptionResult.allowed,
            memory_instincts: memoryInstincts.length
        }
    };
}

// Run activation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        const result = await activateInstinctSystem();
        console.log('\n📊 [SUMMARY] Activation Results:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('❌ [ERROR] Activation failed:', error);
        process.exit(1);
    }
}

export { activateInstinctSystem };
