/**
 * Tests for Foundation v1.8.0 behavioral patterns and enhanced memory capabilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { MnemosyneMemorySystem } from '../packages/mnemosyne/src/memory-tool';
import { bootstrapTestMemorySystem, resetTestMemoryGlobals } from './setup/test-memory-environment';

describe('Enhanced Behavioral Foundation v1.8.0', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(async () => {
    const { memory } = await bootstrapTestMemorySystem();
    memorySystem = memory;
  });

  afterEach(() => {
    resetTestMemoryGlobals();
  });

  describe('Foundation v1.8.0 Behavioral Rules', () => {
    it('should have evidence-based behavioral rules', () => {
      const rules = memorySystem.getFoundationRules();
      expect(rules.length).toBeGreaterThan(0);
      
      // Foundation v1.8.0 should emphasize evidence-based patterns
      const evidenceRules = rules.filter((rule: any) => 
        rule.rule.toLowerCase().includes('evidence') ||
        rule.rule.toLowerCase().includes('verifiable') ||
        rule.rule.toLowerCase().includes('accountability')
      );
      
      expect(evidenceRules.length).toBeGreaterThan(0);
    });

    it('should track behavioral violations properly', () => {
      // Test violation recording
      memorySystem.recordViolation('test-rule', 'Test violation for Foundation v1.8.0');
      
      const status = memorySystem.getBehavioralStatus();
      expect(status).toBeDefined();
      expect(status.recentViolations).toBeDefined();
      expect(Array.isArray(status.recentViolations)).toBe(true);
    });

    it('should provide structured behavioral guidance', () => {
      const rules = memorySystem.getFoundationRules();
      
      // Each rule should have proper structure
      rules.forEach(rule => {
        expect(rule.id).toBeDefined();
        expect(rule.rule).toBeDefined();
        expect(rule.priority).toMatch(/^(critical|high|medium|low)$/);
        expect(typeof rule.violations).toBe('number');
      });
    });
  });

  describe('Enhanced Memory Integration', () => {
    it('should support causality tracking in Foundation v1.8.0', async () => {
      // Foundation v1.8.0 introduced causality tracking
      const content = "Test causality tracking in Foundation v1.8.0";
      
      const memoryId = await memorySystem.storeKnowledge(content, {
        causal_context: "test_causality",
        agent_personality: "analytical"
      }, ["causality", "foundation"], true);
      
      expect(memoryId).toBeDefined();
    });

    it('should handle enhanced temporal metadata', async () => {
      // Test enhanced temporal features from Foundation v1.8.0
      const content = "Enhanced temporal metadata test";
      
      const memoryId = await memorySystem.storeKnowledge(content, {
        temporal_precision: "microsecond",
        session_context: "v18_test"
      }, ["temporal", "enhancement"], true);
      
      expect(memoryId).toBeDefined();
    });
  });
});
