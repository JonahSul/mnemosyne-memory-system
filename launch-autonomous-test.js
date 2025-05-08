#!/usr/bin/env node

/**
 * Launch script for 8-hour autonomous forgetting validation test
 * 
 * This script will:
 * 1. Initialize the test environment
 * 2. Start the autonomous test
 * 3. Log progress to memory system
 * 4. Handle any interruptions gracefully
 */

import { AutonomousForgettingValidator } from './autonomous-forgetting-test.js';
import { MnemosyneMemorySystem } from './src/memory-tool.ts';
import fs from 'fs/promises';
import path from 'path';

class TestLauncher {
    constructor() {
        this.memory = new MnemosyneMemorySystem();
        this.startTime = new Date();
        this.testId = `autonomous_test_${this.startTime.toISOString().replace(/[:.]/g, '_')}`;
    }

    async launch() {
        console.log('🚀 Launching 8-Hour Autonomous Forgetting Validation Test');
        console.log(`📅 Start Time: ${this.startTime.toISOString()}`);
        console.log(`🆔 Test ID: ${this.testId}`);
        console.log('⏰ Expected Duration: 8 hours');
        console.log('🎯 Objective: Validate forgetting performance assertions\n');

        // Log the test start in memory system
        await this.logTestLaunch();

        // Set up graceful shutdown handlers
        this.setupShutdownHandlers();

        // Create test results directory
        await this.ensureTestResultsDirectory();

        try {
            // Launch the autonomous test
            const validator = new AutonomousForgettingValidator();
            await validator.runEightHourTest();

            // Log successful completion
            await this.logTestCompletion(true);

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            await this.logTestCompletion(false, error);
            process.exit(1);
        }
    }

    async logTestLaunch() {
        const claimId = await this.memory.logClaim(
            `Launching 8-hour autonomous forgetting validation test with ID ${this.testId}`,
            {
                testId: this.testId,
                startTime: this.startTime.toISOString(),
                expectedEndTime: new Date(this.startTime.getTime() + 8 * 60 * 60 * 1000).toISOString(),
                testType: 'autonomous_forgetting_validation',
                objective: 'validate_forgetting_performance_assertions',
                phases: [
                    'initial_population_15min',
                    'early_forgetting_1hour', 
                    'midterm_retention_3hours',
                    'longterm_stability_3hours',
                    'final_analysis_45min'
                ]
            },
            'autonomous_test_launcher',
            'high'
        );

        console.log(`📝 Test launch logged with claim ID: ${claimId}`);

        // Store additional context about the test
        await this.memory.storeKnowledge(
            `Autonomous forgetting test ${this.testId} will validate: (1) Ebbinghaus forgetting curve implementation, (2) importance-based retention exceptions, (3) tier-specific forgetting behaviors, (4) access pattern influences on retention, (5) probabilistic forgetting mechanisms, and (6) memory system self-healing and efficiency over 8 hours.`,
            {
                testId: this.testId,
                category: 'test_metadata',
                validationAreas: [
                    'ebbinghaus_forgetting_curve',
                    'importance_based_retention', 
                    'tier_specific_forgetting',
                    'access_pattern_influence',
                    'probabilistic_forgetting',
                    'system_self_healing'
                ]
            },
            ['autonomous_test', 'forgetting_validation', 'performance_test']
        );
    }

    async logTestCompletion(success, error = null) {
        const endTime = new Date();
        const duration = endTime - this.startTime;

        const claimId = await this.memory.logClaim(
            `Autonomous forgetting test ${this.testId} ${success ? 'completed successfully' : 'failed'}`,
            {
                testId: this.testId,
                startTime: this.startTime.toISOString(),
                endTime: endTime.toISOString(),
                actualDuration: duration,
                success,
                error: error ? error.message : null
            },
            'autonomous_test_launcher',
            'high'
        );

        if (success) {
            console.log(`✅ Test completion logged with claim ID: ${claimId}`);
            console.log(`🎉 Test completed successfully after ${Math.round(duration / (1000 * 60 * 60))} hours`);
        } else {
            console.log(`❌ Test failure logged with claim ID: ${claimId}`);
            console.log(`💥 Test failed after ${Math.round(duration / (1000 * 60 * 60))} hours`);
        }
    }

    async ensureTestResultsDirectory() {
        const testResultsDir = path.join(process.cwd(), 'test-results');
        try {
            await fs.mkdir(testResultsDir, { recursive: true });
            console.log(`📁 Test results directory ready: ${testResultsDir}`);
        } catch (error) {
            console.warn(`⚠️ Could not create test results directory: ${error.message}`);
        }
    }

    setupShutdownHandlers() {
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Attempting graceful shutdown...`);
            
            try {
                await this.memory.logClaim(
                    `Autonomous test ${this.testId} interrupted by ${signal}`,
                    {
                        testId: this.testId,
                        signal,
                        timestamp: new Date().toISOString(),
                        partialDuration: new Date() - this.startTime
                    },
                    'autonomous_test_launcher',
                    'medium'
                );
                
                console.log('📝 Interruption logged to memory system');
            } catch (error) {
                console.error('❌ Failed to log interruption:', error);
            }

            console.log('👋 Shutdown complete');
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        
        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
            console.error('💥 Uncaught exception:', error);
            await this.logTestCompletion(false, error);
            process.exit(1);
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
            await this.logTestCompletion(false, new Error(`Unhandled rejection: ${reason}`));
            process.exit(1);
        });
    }
}

// Show pre-launch information
console.log(`
🧪 AUTONOMOUS FORGETTING VALIDATION TEST
========================================

This test will run for approximately 8 hours and validate the memory system's
forgetting mechanisms through comprehensive automated testing.

TEST PHASES:
1. Initial Population (15 min) - Create test items across all memory tiers
2. Early Forgetting (1 hour) - Test immediate forgetting patterns  
3. Mid-term Retention (3 hours) - Validate forgetting curves over medium timeframes
4. Long-term Stability (3 hours) - Test long-term retention and stability
5. Final Analysis (45 min) - Comprehensive analysis and report generation

VALIDATION TARGETS:
✓ Ebbinghaus forgetting curve implementation
✓ Importance-based retention exceptions
✓ Tier-specific forgetting behaviors
✓ Access pattern influences on retention
✓ Probabilistic forgetting mechanisms
✓ Memory system self-healing and efficiency

OUTPUTS:
- Real-time progress logging
- Comprehensive JSON test report
- Human-readable summary document
- Memory system integration for future reference

Press Ctrl+C at any time for graceful shutdown.
`);

// Launch the test
const launcher = new TestLauncher();
launcher.launch().catch(console.error);
