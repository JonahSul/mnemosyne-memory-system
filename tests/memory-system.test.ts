/**
 * Copyright © 2025, Jonah Sullivan
 * Foundation v1.8.0 Memory System Tests - Updated for mcp-tools architecture
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { MnemosyneMemorySystem } from '../packages/mnemosyne/src/memory-tool';
import { bootstrapTestMemorySystem, resetTestMemoryGlobals } from './setup/test-memory-environment';

declare const memoryTools: Array<{ name: string; handler: (args: any) => Promise<{ content: Array<{ type: string; text: string }> }> }>;

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
    it('should store memory with evidence using Foundation v1.8.0 patterns', async () => {
      const content = "Memory system integration test successful";
      const evidence = ["Test execution completed", "No errors detected"];
      
      // Use the memory storage directly instead of old claim/verification pattern
      const memoryId = await memorySystem.storeKnowledge(content, {
        source: "test_suite",
        evidence,
        confidence: 0.9,
        importance: 0.8
      }, ["integration", "test"], true);
      
      expect(memoryId).toBeDefined();
      expect(typeof memoryId).toBe("string");
    });

    it('should search stored memories', async () => {
      // Store a memory first
      await memorySystem.storeKnowledge("Test memory for search", {
        source: "test_search",
        evidence: ["Search test evidence"],
        confidence: 0.9
      }, ["search"], true);
      
      // Search for it
      const results = await memorySystem.searchMemory("test memory");
      expect(results.length).toBeGreaterThan(0);
    });

    it('should track behavioral patterns in Foundation v1.8.0', () => {
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
  });

  describe('Memory Tools Integration', () => {
    it('should expose the simplified toolset', () => {
      const expectedTools = [
        'memory_init',
        'memory_store',
        'memory_search',
        'memory_stats',
        'memory_admin',
        'memory_store_enhanced',
        'memory_analyze_causality'
      ];

      const toolNames = memoryTools.map(tool => tool.name);
      expect(toolNames.length).toBeGreaterThanOrEqual(expectedTools.length);
      expectedTools.forEach(name => {
        expect(toolNames).toContain(name);
      });
    });

    it('should store knowledge through the memory_store tool', async () => {
      const storeTool = memoryTools.find(t => t.name === 'memory_store');
      expect(storeTool).toBeDefined();

      const response = await storeTool!.handler({
        content: 'Integration memory entry',
        evidence: ['Vitest helper evidence'],
        source: 'test_suite',
        tags: ['integration']
      });

      expect(response.content[0].text).toContain('Successfully stored content');
    });

    it('should search stored knowledge through the memory_search tool', async () => {
      const storeTool = memoryTools.find(t => t.name === 'memory_store');
      const searchTool = memoryTools.find(t => t.name === 'memory_search');
      expect(storeTool && searchTool).toBeTruthy();

      await storeTool!.handler({
        content: 'Memory search integration entry',
        evidence: ['Search evidence'],
        source: 'test_suite',
        tags: ['search']
      });

      const searchResponse = await searchTool!.handler({
        query: 'integration entry',
        limit: 5
      });

      expect(searchResponse.content[0].text).toContain('results for "integration entry"');
    });

    it('should expose system statistics through the memory_stats tool', async () => {
      const statsTool = memoryTools.find(t => t.name === 'memory_stats');
      expect(statsTool).toBeDefined();

      const statsResponse = await statsTool!.handler({ includeTestingData: true });
      expect(statsResponse.content[0].text).toContain('MEMORY SYSTEM STATISTICS');
    });
  });

  describe('Behavioral Rule Enforcement', () => {
    it('should enforce claim verification workflow', async () => {
      const initialClaims = await memorySystem.getUnverifiedClaims();
      expect(initialClaims).toHaveLength(0);

      const claimId = await memorySystem.logClaim('New claim', { test: 'Context' });
      const pendingClaims = await memorySystem.getUnverifiedClaims();
      expect(pendingClaims.length).toBeGreaterThanOrEqual(1);

      await memorySystem.verifyClaim(claimId, true, 'Evidence');
      const remainingClaims = await memorySystem.getUnverifiedClaims();
      expect(remainingClaims).toHaveLength(0);
    });

    it('should track systematic debugging approach', () => {
      memorySystem.recordViolation('systematic-approach', 'Engaged in desperate debugging without systematic approach');

      const status = memorySystem.getBehavioralStatus();
      expect(status.recentViolations).toHaveLength(1);
      expect(status.recentViolations[0].rule).toContain('systematic-approach');
    });
  });
});
