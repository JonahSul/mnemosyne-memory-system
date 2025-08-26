/**
 * Copyright © 2025, Jonah Sullivan
 * Foundation v1.8.0 Memory System Tests - Updated for mcp-tools architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MnemosyneMemorySystem } from '../src/memory-tool.js';
import { initializeWithEnv } from '../src/tools/simplified-registry.js';

describe('Memory System - Foundation v1.8.0', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(() => {
    // Initialize with mock environment for testing
    initializeWithEnv({
      MEMORY_KV: null, // Mock KV for testing
      VECTORIZE_INDEX: null, // Mock vectorize for testing
      AI: null // Mock AI for testing
    });
    
    memorySystem = new MnemosyneMemorySystem();
    // Set up global memory instance for tool handlers
    (globalThis as any).getMemoryInstance = () => memorySystem;
  });

  describe('Foundation v1.8.0 Memory Storage', () => {
    it('should store memory with evidence using Foundation v1.8.0 patterns', async () => {
      const content = "Memory system integration test successful";
      const evidence = ["Test execution completed", "No errors detected"];
      
      // Use the memory storage directly instead of old claim/verification pattern
      const result = await memorySystem.storeMemory(content, {
        source: "test_suite",
        evidence: evidence,
        confidence: 0.9,
        importance: 0.8
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should search stored memories', async () => {
      // Store a memory first
      await memorySystem.storeMemory("Test memory for search", {
        source: "test_search",
        evidence: ["Search test evidence"],
        confidence: 0.9
      });
      
      // Search for it
      const results = await memorySystem.searchMemory("test memory");
      expect(results.length).toBeGreaterThan(0);
    });

    it('should track behavioral patterns in Foundation v1.8.0', () => {
      // Test that behavioral system is working
      const rules = memorySystem.getFoundationRules();
      expect(rules.length).toBeGreaterThan(0);
      
      // Foundation v1.8.0 should have evidence-based rules
      const evidenceRule = rules.find(rule => 
        rule.rule.toLowerCase().includes('evidence') || 
        rule.rule.toLowerCase().includes('verifiable')
      );
      expect(evidenceRule).toBeDefined();
    });
  });

  describe('Memory Tools Integration', () => {
    it('should provide proper tool definitions', () => {
      expect(memoryTools).toHaveLength(12); // Updated count to include vector tools and multi-tier memory tools
      expect(memoryTools.find(t => t.name === 'memory_log_claim')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_verify_claim')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_check_behavioral_status')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_view_foundation')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_record_violation')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_admin')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_export_state')).toBeDefined();
      // Vector tools
      expect(memoryTools.find(t => t.name === 'memory_store_knowledge')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_search_knowledge')).toBeDefined();
      // Multi-tier memory tools
      expect(memoryTools.find(t => t.name === 'memory_store_tiered')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_search_tiered')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_stats_tiered')).toBeDefined();
    });

    it('should handle log_claim tool execution', async () => {
      const logTool = memoryTools.find(t => t.name === 'memory_log_claim')!;
      
      const result = await logTool.handler({
        claim: "Test claim",
        context: { test: "Test context" }
      });
      
      expect(result.content[0].text).toContain("Claim logged");
      expect(result.content[0].text).toContain("Test claim");
    });

    it('should handle verify_claim tool execution', async () => {
      const logTool = memoryTools.find(t => t.name === 'memory_log_claim')!;
      const verifyTool = memoryTools.find(t => t.name === 'memory_verify_claim')!;
      
      // First log a claim
      const logResult = await logTool.handler({
        claim: "Test verification claim",
        context: { test: "Test context" }
      });
      
      // Extract claim ID from the log result
      const claimIdMatch = logResult.content[0].text.match(/ID: ([a-zA-Z0-9_]+)/);
      const claimId = claimIdMatch ? claimIdMatch[1] : 'test-id';
      
      // Then verify it
      const result = await verifyTool.handler({
        claimId: claimId,
        evidence: "Test evidence",
        success: true
      });
      
      expect(result.content[0].text).toContain("verified");
    });

    it('should handle check_behavioral_status tool execution', async () => {
      const statusTool = memoryTools.find(t => t.name === 'memory_check_behavioral_status')!;
      
      const result = await statusTool.handler({});
      
      expect(result.content[0].text).toContain("Behavioral Status");
    });
  });

  describe('Behavioral Rule Enforcement', () => {
    it('should enforce claim verification workflow', async () => {
      const initialStatus = memorySystem.getBehavioralStatus();
      expect(initialStatus.unverifiedClaims).toBe(0);
      
      // Log a claim
      const claimId = await memorySystem.logClaim("New claim", { test: "Context" });
      let status = memorySystem.getBehavioralStatus();
      expect(status.unverifiedClaims).toBe(1);
      
      // Verify the claim
      await memorySystem.verifyClaim(claimId, true, "Evidence");
      status = memorySystem.getBehavioralStatus();
      expect(status.unverifiedClaims).toBe(0);
    });

    it('should track systematic debugging approach', () => {
      memorySystem.recordViolation("systematic-approach", "Engaged in desperate debugging without systematic approach");
      
      const status = memorySystem.getBehavioralStatus();
      expect(status.recentViolations).toHaveLength(1);
      expect(status.recentViolations[0].rule).toContain("Break down complex problems");
    });
  });
});
