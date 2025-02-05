/**
 * Tests for enhanced behavioral foundation with automatic memory consultation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MnemosyneMemorySystem } from '../src/memory-tool.js';

describe('Enhanced Behavioral Foundation - Memory Consultation', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(() => {
    memorySystem = new MnemosyneMemorySystem();
    // Set up global memory instance for tool handlers
    (globalThis as any).getMemoryInstance = () => memorySystem;
  });

  describe('Automatic Memory Consultation Rule', () => {
    it('should include memory consultation as a foundational behavioral rule', () => {
      // RED: This will fail because the rule doesn't exist yet
      const rules = memorySystem.getFoundationRules();
      const memoryRule = rules.find(rule => rule.id === 'consult-memory-before-response');
      
      expect(memoryRule).toBeDefined();
      expect(memoryRule?.rule).toContain('consult memory');
      expect(memoryRule?.priority).toBe('critical');
    });

    it('should record violation when responding without memory consultation', () => {
      // RED: This will fail because violation detection doesn't exist yet
      memorySystem.recordViolation('consult-memory-before-response', 'Responded to user query without consulting memory system first');
      
      const status = memorySystem.getBehavioralStatus();
      expect(status.recentViolations).toHaveLength(1);
      expect(status.recentViolations[0].rule).toContain('consult memory');
    });

    it('should provide guidance on when memory consultation is required', () => {
      // RED: This will fail because rule examples don't exist yet
      const rules = memorySystem.getFoundationRules();
      const memoryRule = rules.find(rule => rule.id === 'consult-memory-before-response');
      
      expect(memoryRule?.examples).toBeDefined();
      expect(memoryRule?.examples?.length).toBeGreaterThan(0);
      expect(memoryRule?.examples?.some(ex => ex.includes('❌'))).toBe(true);
      expect(memoryRule?.examples?.some(ex => ex.includes('✅'))).toBe(true);
    });
  });

  describe('Context Pre-warming Behavior', () => {
    it('should track when context queries are made', () => {
      // RED: This will fail because context tracking doesn't exist yet  
      memorySystem.logContextQuery('user asked about deployment status');
      
      const contextLogs = memorySystem.getContextLogs();
      expect(contextLogs).toHaveLength(1);
      expect(contextLogs[0].query).toBe('user asked about deployment status');
    });

    it('should recommend related memory searches based on context', () => {
      // RED: This will fail because recommendation system doesn't exist yet
      memorySystem.logContextQuery('user asked about testing framework');
      
      const recommendations = memorySystem.getRecommendedMemorySearches('user asked about testing framework');
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('test'))).toBe(true);
    });
  });
});
