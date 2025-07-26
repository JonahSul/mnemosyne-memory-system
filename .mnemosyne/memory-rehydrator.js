#!/usr/bin/env node

/**
 * Memory State Rehydration Tool
 * Restores Mnemosyne memory system from exported snapshots
 */

import fs from 'fs';
import path from 'path';

const MNEMOSYNE_DIR = '.mnemosyne';
const KNOWLEDGE_EXPORT = 'knowledge-store-export.json';
const MEMORY_EXPORT = 'memory-state-export.json';

class MemoryRehydrator {
    constructor() {
        this.restored = {
            knowledge: 0,
            claims: 0,
            violations: 0
        };
    }

    async restoreFromSnapshots() {
        try {
            console.log('🧠 Starting memory restoration from snapshots...');
            
            // 1. Load export files
            const knowledgeData = this.loadKnowledgeExport();
            const memoryData = this.loadMemoryExport();
            
            // 2. Restore knowledge store
            await this.restoreKnowledgeStore(knowledgeData);
            
            // 3. Restore claims
            await this.restoreVerifiedClaims(memoryData);
            
            // 4. Restore violation patterns (for learning continuity)
            await this.restoreViolationPatterns(memoryData);
            
            // 5. Validation
            await this.validateRestoration();
            
            console.log('✅ Memory restoration complete!');
            console.log(`📊 Restored: ${this.restored.knowledge} knowledge items, ${this.restored.claims} claims, ${this.restored.violations} violations`);
            
            return { success: true, restored: this.restored };
            
        } catch (error) {
            console.error('❌ Memory restoration failed:', error);
            return { success: false, error: error.message };
        }
    }

    loadKnowledgeExport() {
        const filePath = path.join(MNEMOSYNE_DIR, KNOWLEDGE_EXPORT);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Knowledge export not found: ${filePath}`);
        }
        
        console.log(`📖 Loading knowledge export: ${filePath}`);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    loadMemoryExport() {
        const filePath = path.join(MNEMOSYNE_DIR, MEMORY_EXPORT);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Memory export not found: ${filePath}`);
        }
        
        console.log(`🧠 Loading memory export: ${filePath}`);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    async restoreKnowledgeStore(knowledgeData) {
        console.log('🔄 Restoring knowledge store...');
        
        for (const item of knowledgeData.knowledge_store) {
            try {
                // Using the memory_store_knowledge tool equivalent
                await this.storeKnowledge({
                    content: item.content,
                    metadata: item.metadata,
                    tags: item.tags
                });
                
                this.restored.knowledge++;
                console.log(`  ✓ Restored: ${item.content.substring(0, 50)}...`);
                
            } catch (error) {
                console.warn(`  ⚠️  Failed to restore knowledge item: ${error.message}`);
            }
        }
    }

    async restoreVerifiedClaims(memoryData) {
        console.log('🔄 Restoring verified claims...');
        
        for (const [claimId, claim] of Object.entries(memoryData.claims || {})) {
            if (claim.status === 'verified') {
                try {
                    // Log the claim
                    const result = await this.logClaim({
                        claim: claim.content,
                        confidence: claim.context?.confidence || 'medium',
                        context: { restored: true, original: claim.context?.context },
                        source: 'restored_from_export'
                    });
                    
                    // Verify the claim with evidence
                    await this.verifyClaim({
                        claimId: result.claimId,
                        success: true,
                        evidence: claim.evidence,
                        notes: 'Restored from previous session export'
                    });
                    
                    this.restored.claims++;
                    console.log(`  ✓ Restored claim: ${claim.content.substring(0, 50)}...`);
                    
                } catch (error) {
                    console.warn(`  ⚠️  Failed to restore claim: ${error.message}`);
                }
            }
        }
    }

    async restoreViolationPatterns(memoryData) {
        console.log('🔄 Restoring violation patterns for learning continuity...');
        
        for (const pattern of memoryData.patterns || []) {
            if (pattern.frequency > 0 && pattern.outcome === 'negative') {
                try {
                    await this.recordViolation({
                        ruleId: pattern.pattern.replace(' violations', ''),
                        context: `Pattern restoration: ${pattern.description}`,
                        severity: 'minor',
                        correctionPlan: 'Restored for behavioral learning continuity'
                    });
                    
                    this.restored.violations++;
                    console.log(`  ✓ Restored pattern: ${pattern.pattern}`);
                    
                } catch (error) {
                    console.warn(`  ⚠️  Failed to restore violation pattern: ${error.message}`);
                }
            }
        }
    }

    async validateRestoration() {
        console.log('🔍 Validating restoration...');
        
        try {
            // Check memory stats
            const stats = await this.getMemoryStats();
            console.log(`  📊 Total memory items: ${stats.totalItems || 'unknown'}`);
            
            // Check behavioral status
            const behavioralStatus = await this.checkBehavioralStatus();
            console.log(`  🎯 Behavioral rules active: ${behavioralStatus.totalRules || 'unknown'}`);
            
        } catch (error) {
            console.warn(`  ⚠️  Validation partially failed: ${error.message}`);
        }
    }

    // Mock implementations - would need to connect to actual MCP tools
    async storeKnowledge(params) {
        // This would call memory_store_knowledge MCP tool
        console.log(`    📝 [MOCK] Storing knowledge: ${params.content.substring(0, 30)}...`);
        return { success: true };
    }

    async logClaim(params) {
        // This would call memory_log_claim MCP tool
        console.log(`    📋 [MOCK] Logging claim: ${params.claim.substring(0, 30)}...`);
        return { claimId: `mock_claim_${Date.now()}` };
    }

    async verifyClaim(params) {
        // This would call memory_verify_claim MCP tool
        console.log(`    ✅ [MOCK] Verifying claim: ${params.claimId}`);
        return { success: true };
    }

    async recordViolation(params) {
        // This would call memory_record_violation MCP tool
        console.log(`    ⚠️  [MOCK] Recording violation: ${params.ruleId}`);
        return { success: true };
    }

    async getMemoryStats() {
        // This would call memory_stats_tiered MCP tool
        return { totalItems: this.restored.knowledge };
    }

    async checkBehavioralStatus() {
        // This would call memory_check_behavioral_status MCP tool
        return { totalRules: 'foundation_rules_active' };
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const rehydrator = new MemoryRehydrator();
    rehydrator.restoreFromSnapshots()
        .then(result => {
            if (result.success) {
                console.log('🎉 Memory restoration completed successfully!');
                process.exit(0);
            } else {
                console.error('💥 Memory restoration failed:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

export default MemoryRehydrator;
