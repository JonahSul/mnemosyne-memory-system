# Memory State Rehydration Process

## Overview
This document describes how to restore a Mnemosyne memory system from the exported state files in `.mnemosyne/`.

## Files to Process
1. `memory-state-export.json` - Behavioral memory (rules, violations, claims, patterns)
2. `knowledge-store-export.json` - Knowledge store (working memory items)

## Restoration Steps

### 1. Knowledge Store Restoration
For each item in `knowledge-store-export.json`:

```javascript
// Parse the export file
const knowledgeExport = JSON.parse(fs.readFileSync('.mnemosyne/knowledge-store-export.json'));

// Restore each knowledge item
for (const item of knowledgeExport.knowledge_store) {
    await memory_store_knowledge({
        content: item.content,
        metadata: item.metadata,
        tags: item.tags
    });
}
```

### 2. Behavioral Memory Restoration
For `memory-state-export.json`:

#### Claims Restoration
```javascript
const memoryExport = JSON.parse(fs.readFileSync('.mnemosyne/memory-state-export.json'));

// Restore verified claims
for (const [claimId, claim] of Object.entries(memoryExport.claims)) {
    if (claim.status === 'verified') {
        const logResult = await memory_log_claim({
            claim: claim.content,
            confidence: claim.context.confidence,
            context: claim.context.context,
            source: 'restored_from_export'
        });
        
        // Verify the claim with the evidence
        await memory_verify_claim({
            claimId: logResult.claimId,
            success: true,
            evidence: claim.evidence,
            notes: 'Restored from previous session'
        });
    }
}
```

#### Rules and Patterns Restoration
```javascript
// Foundation rules are automatically loaded, but custom rules would be restored here
// Violation patterns are rebuilt through memory_record_violation calls if needed

// Example for restoring violation patterns:
for (const pattern of memoryExport.patterns) {
    if (pattern.outcome === 'negative') {
        await memory_record_violation({
            ruleId: pattern.pattern.replace(' violations', ''),
            context: `Restored violation pattern: ${pattern.description}`,
            severity: 'moderate',
            correctionPlan: 'Pattern restored from previous session for learning continuity'
        });
    }
}
```

### 3. System State Validation
After restoration:

```javascript
// Verify restoration success
const stats = await memory_stats_tiered();
const behavioralStatus = await memory_check_behavioral_status();

console.log('Restoration Complete:');
console.log(`Knowledge items: ${stats.totalItems}`);
console.log(`Behavioral rules: ${behavioralStatus.totalRules}`);
console.log(`Claims restored: ${Object.keys(memoryExport.claims).length}`);
```

## Automated Restoration Tool Concept

```javascript
async function restoreMemoryFromSnapshots() {
    try {
        // 1. Load export files
        const knowledgeData = JSON.parse(
            fs.readFileSync('.mnemosyne/knowledge-store-export.json', 'utf8')
        );
        const memoryData = JSON.parse(
            fs.readFileSync('.mnemosyne/memory-state-export.json', 'utf8')
        );
        
        // 2. Restore knowledge store
        console.log('Restoring knowledge store...');
        for (const item of knowledgeData.knowledge_store) {
            await memory_store_knowledge({
                content: item.content,
                metadata: item.metadata,
                tags: item.tags
            });
        }
        
        // 3. Restore claims
        console.log('Restoring verified claims...');
        for (const [claimId, claim] of Object.entries(memoryData.claims)) {
            if (claim.status === 'verified') {
                const result = await memory_log_claim({
                    claim: claim.content,
                    confidence: claim.context.confidence,
                    context: { restored: true, original: claim.context.context }
                });
                
                await memory_verify_claim({
                    claimId: result.claimId,
                    success: true,
                    evidence: claim.evidence,
                    notes: 'Restored from export'
                });
            }
        }
        
        // 4. Restore violation patterns (if needed for learning)
        console.log('Restoring behavioral patterns...');
        for (const pattern of memoryData.patterns) {
            if (pattern.frequency > 0 && pattern.outcome === 'negative') {
                await memory_record_violation({
                    ruleId: pattern.pattern.replace(' violations', ''),
                    context: `Pattern restoration: ${pattern.description}`,
                    severity: 'minor',
                    correctionPlan: 'Restored for behavioral continuity'
                });
            }
        }
        
        // 5. Validation
        const finalStats = await memory_stats_tiered();
        console.log(`Restoration complete: ${finalStats.totalItems} items restored`);
        
        return { success: true, restored: finalStats.totalItems };
        
    } catch (error) {
        console.error('Memory restoration failed:', error);
        return { success: false, error: error.message };
    }
}
```

## Manual Restoration Checklist

1. ✅ Parse `.mnemosyne/knowledge-store-export.json`
2. ✅ Restore each knowledge item using `memory_store_knowledge`
3. ✅ Parse `.mnemosyne/memory-state-export.json` 
4. ✅ Restore verified claims using `memory_log_claim` + `memory_verify_claim`
5. ✅ Restore violation patterns using `memory_record_violation` (optional)
6. ✅ Validate restoration with `memory_stats_tiered` and `memory_check_behavioral_status`

## Notes
- Foundation rules are automatically active and don't need restoration
- Violation patterns can be optionally restored for behavioral learning continuity
- The restoration process maintains the semantic relationships through tags
- Export timestamps help track when the snapshot was taken

## Implementation Priority
This restoration process should be implemented as a dedicated tool or script to enable seamless memory persistence across sessions.
