/**
 * InstinctManager Foundation v1.6.0 Test Suite
 * Tests enhanced priority override and blocking behavior system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InstinctManager } from '../packages/mnemosyne/src/modules/instinct-manager';

describe('InstinctManager - Foundation v1.6.0 Instinctual Behavioral Priority System', () => {
  let manager: InstinctManager;
  
  beforeEach(() => {
    // Reset singleton for clean test environment
    InstinctManager.resetInstance();
    manager = InstinctManager.getInstance();
  });

  describe('System Initialization and Status', () => {
    it('should initialize with enhanced bootstrap instincts', () => {
      const status = manager.getStatus();
      
      expect(status).toBeDefined();
      expect(status.enabled).toBe(false); // Disabled by default for safety
      expect(status.hooks_registered).toBeGreaterThan(0);
      expect(status.contexts).toBeDefined();
      expect(Array.isArray(status.contexts)).toBe(true);
    });

    it('should enable system when requested', () => {
      manager.setEnabled(true);
      const status = manager.getStatus();
      
      expect(status.enabled).toBe(true);
    });
  });

  describe('Priority Override Terminal Safety', () => {
    beforeEach(() => {
      manager.setEnabled(true);
    });

    it('should trigger terminal safety instinct with priority override', async () => {
      const terminalHooks = await manager.checkInstincts("terminal_operations", ["terminal", "command"]);
      
      expect(terminalHooks.length).toBeGreaterThan(0);
      
      const terminalSafetyHook = terminalHooks.find(hook => hook.priority_override);
      expect(terminalSafetyHook).toBeDefined();
      expect(terminalSafetyHook?.priority_override).toBe(true);
      expect(terminalSafetyHook?.confidence_threshold).toBe(0.99);
    });

    it('should surface guidance for terminal operations', async () => {
      const terminalHooks = await manager.checkInstincts("terminal_operations", ["terminal", "command"]);
      
      const primaryHook = terminalHooks[0];
      expect(primaryHook?.result?.guidance).toBeDefined();
      expect(Array.isArray(primaryHook?.result?.guidance)).toBe(true);
      expect(primaryHook?.result?.guidance.length).toBeGreaterThan(0);
    });
  });

  describe('Blocking Behavior and Acknowledgment System', () => {
    beforeEach(() => {
      manager.setEnabled(true);
    });

    it('should block terminal actions requiring acknowledgment', async () => {
      const interceptionResult = await manager.interceptAction("terminal_sendCommand", { command: "git status" });
      
      expect(interceptionResult.allowed).toBe(false);
      expect(interceptionResult.blocking_reason).toBeDefined();
      expect(interceptionResult.acknowledgment_required).toBe(true);
      expect(interceptionResult.instincts_triggered.length).toBeGreaterThan(0);
    });

    it('should accept acknowledgments for instincts', () => {
      const ackResult = manager.acknowledgeInstincts(["terminal_safety_firewall"]);
      
      expect(ackResult).toBe(true);
    });

    it('should allow non-terminal actions without blocking', async () => {
      const memoryResult = await manager.interceptAction("memory_search", {});
      
      expect(memoryResult.allowed).toBe(true);
      expect(memoryResult.acknowledgment_required).toBe(false);
    });
  });

  describe('Instinct Sorting and Priority Management', () => {
    beforeEach(() => {
      manager.setEnabled(true);
    });

    it('should sort instincts by priority override first', async () => {
      // Register a lower priority instinct without blocking behavior for comparison
      manager.registerHook({
        context: "test_context",
        tags: ["test"],
        priority: 0.90,
        action: "low_priority_action",
        triggered: false,
        priority_override: false,
        blocking_behavior: false,
        confidence_threshold: 0.90
      });

      // Register a high priority instinct with priority override but non-blocking
      manager.registerHook({
        context: "test_context", 
        tags: ["test"],
        priority: 0.95,
        action: "high_priority_action",
        triggered: false,
        priority_override: true,
        blocking_behavior: false,
        confidence_threshold: 0.95
      });

      const sortedHooks = await manager.checkInstincts("test_context", ["test"]);
      
      expect(sortedHooks.length).toBeGreaterThan(1);
      
      // First instinct should have priority override (sorted first)
      expect(sortedHooks[0]?.priority_override).toBe(true);
      expect(sortedHooks[0]?.action).toBe('high_priority_action');
      
      // Second instinct should not have priority override
      expect(sortedHooks[1]?.priority_override).toBe(false);
      expect(sortedHooks[1]?.action).toBe('low_priority_action');
    });
  });

  describe('Factual Claims Evidence Requirements', () => {
    beforeEach(() => {
      manager.setEnabled(true);
    });

    it('should surface evidence requirements for factual claims', async () => {
      const claimHooks = await manager.checkInstincts("factual_claims", ["claim", "fact"]);
      
      expect(claimHooks.length).toBeGreaterThan(0);
      
      const claimHook = claimHooks[0];
      expect(claimHook?.action).toBeDefined();
      expect(claimHook?.mandatory_surfacing).toBe(true);
    });
  });

  describe('Foundation v1.6.0 Enhanced Features Validation', () => {
    beforeEach(() => {
      manager.setEnabled(true);
    });

    it('should validate all Foundation v1.6.0 claims', async () => {
      // Test priority override flags
      const terminalHooks = await manager.checkInstincts("terminal_operations", ["terminal"]);
      const hasHighConfidenceTerminalSafety = terminalHooks.some(h => h.confidence_threshold === 0.99);
      expect(hasHighConfidenceTerminalSafety).toBe(true);
      
      // Test blocking behavior with acknowledgment
      const blockingResult = await manager.interceptAction("terminal_sendCommand", { command: "test" });
      expect(blockingResult.acknowledgment_required).toBe(true);
      
      // Test mandatory pre-action surfacing via interceptAction
      expect(blockingResult.instincts_triggered.length).toBeGreaterThan(0);
      
      // Test context-triggered activation
      const contextResult = await manager.checkInstincts("factual_claims", ["fact"]);
      expect(contextResult.length).toBeGreaterThan(0);
      
      // All validation checks passed
      console.log("✅ Foundation v1.6.0 enhanced features validated");
    });

    it('should maintain Foundation v1.6.0 safety protocols', () => {
      // Reset and get fresh manager instance
      InstinctManager.resetInstance();
      const freshManager = InstinctManager.getInstance();
      
      // Disabled by default for production safety
      expect(freshManager.getStatus().enabled).toBe(false);
      
      // Requires explicit activation
      freshManager.setEnabled(true);
      expect(freshManager.getStatus().enabled).toBe(true);
    });
  });
});
