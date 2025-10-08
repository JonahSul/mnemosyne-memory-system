/**
 * Copyright © 2025, Jonah Sullivan
 * Foundation v1.8.0 Memory System Tests - Updated for mcp-tools architecture
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { MnemosyneMemorySystem } from '../packages/mnemosyne/src/memory-tool';
import { bootstrapTestMemorySystem, resetTestMemoryGlobals } from './setup/test-memory-environment';
import type { MemoryEntry } from '../packages/mnemosyne/src/modules/memory-interfaces';

describe('Memory System - Foundation v1.8.0', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(async () => {
    const { memory } = await bootstrapTestMemorySystem();
    memorySystem = memory;
  });

  afterEach(() => {
    resetTestMemoryGlobals();
  });

  describe('Foundation v1.8.0 Memory Storage', () => {
    it('should store knowledge with the new API', async () => {
      const content = "Memory system integration test successful";
      
      // Use storeKnowledge which is the current API
      const memoryId = await memorySystem.storeKnowledge(content, {
        source: "test_suite",
        testing: true
      }, ["test", "integration"], true);
      
      expect(memoryId).toBeDefined();
      expect(typeof memoryId).toBe('string');
    });

    it('should store and retrieve memory entries', async () => {
      const memoryEntry: MemoryEntry = {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        type: 'claim',
        content: 'Test memory entry for Foundation v1.8.0',
        status: 'verified',
        evidence: 'Test evidence',
        context: { test: true }
      };
      
      await memorySystem.storeMemory(memoryEntry, true);
      
      // Search for the stored memory
      const results = await memorySystem.searchMemory("test memory", true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should access Foundation rules', () => {
      // Test that behavioral system is working
      const rules = memorySystem.getFoundationRules();
      expect(rules.length).toBeGreaterThan(0);
      
      // Foundation v1.8.0 should have evidence-based rules
      const evidenceRule = rules.find((rule: any) => 
        rule.rule.toLowerCase().includes('evidence') || 
        rule.rule.toLowerCase().includes('verifiable')
      );
      expect(evidenceRule).toBeDefined();
    });

    it('should track behavioral status', () => {
      const status = memorySystem.getBehavioralStatus();
      expect(status).toBeDefined();
      expect(status.recentViolations).toBeDefined();
      expect(Array.isArray(status.recentViolations)).toBe(true);
    });
  });

  describe('Knowledge Search', () => {
    it('should search knowledge using new API', async () => {
      // Store some knowledge first
      await memorySystem.storeKnowledge("TypeScript programming concepts", {
        topic: "programming"
      }, ["typescript", "programming"], true);
      
      // Search for it
      const results = await memorySystem.searchKnowledge("TypeScript", {
        limit: 5
      });
      
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
