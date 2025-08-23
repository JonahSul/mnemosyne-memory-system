#!/usr/bin/env node

/**
 * Status checker for autonomous forgetting test
 * 
 * Run this script to check the current status of any running autonomous tests
 */

import { MnemosyneMemorySystem } from './src/memory-tool.ts';
import fs from 'fs/promises';
import path from 'path';

class TestStatusChecker {
    constructor() {
        this.memory = new MnemosyneMemorySystem();
    }

    async checkStatus() {
        console.log('🔍 Checking Autonomous Test Status\n');

        try {
            // Search for test-related claims
            const testClaims = await this.memory.searchMemory('autonomous forgetting test');
            
            if (testClaims.length === 0) {
                console.log('ℹ️ No autonomous tests found in memory system');
                return;
            }

            console.log(`📋 Found ${testClaims.length} test-related memory entries:\n`);

            // Show recent test claims
            const sortedClaims = testClaims
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 5);

            for (const claim of sortedClaims) {
                const timeAgo = this.getTimeAgo(new Date(claim.timestamp));
                const status = claim.status === 'verified' ? '✅' : '⏳';
                
                console.log(`${status} ${timeAgo}: ${claim.content}`);
                
                if (claim.context && claim.context.testId) {
                    console.log(`   🆔 Test ID: ${claim.context.testId}`);
                }
                
                if (claim.context && claim.context.expectedEndTime) {
                    const expectedEnd = new Date(claim.context.expectedEndTime);
                    const now = new Date();
                    
                    if (expectedEnd > now) {
                        const remaining = this.formatDuration(expectedEnd - now);
                        console.log(`   ⏰ Expected completion: ${remaining} remaining`);
                    } else {
                        console.log(`   ⚠️ Expected completion time has passed`);
                    }
                }
                
                console.log('');
            }

            // Check for test result files
            await this.checkTestResultFiles();

        } catch (error) {
            console.error('❌ Error checking test status:', error);
        }
    }

    async checkTestResultFiles() {
        try {
            const testResultsDir = path.join(process.cwd(), 'test-results');
            const files = await fs.readdir(testResultsDir);
            
            const testFiles = files.filter(f => f.includes('autonomous-forgetting-test'));
            
            if (testFiles.length > 0) {
                console.log(`📁 Found ${testFiles.length} test result files:`);
                
                for (const file of testFiles.slice(0, 3)) {
                    const filePath = path.join(testResultsDir, file);
                    const stats = await fs.stat(filePath);
                    const timeAgo = this.getTimeAgo(stats.mtime);
                    
                    console.log(`   📄 ${file} (${timeAgo})`);
                }
                
                if (testFiles.length > 3) {
                    console.log(`   ... and ${testFiles.length - 3} more files`);
                }
                console.log('');
            }
            
        } catch (error) {
            console.log('📁 No test results directory found (no tests completed yet)\n');
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else {
            return 'just now';
        }
    }

    formatDuration(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
}

const checker = new TestStatusChecker();
checker.checkStatus().catch(console.error);
