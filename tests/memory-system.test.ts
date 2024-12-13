import { describe, it, expect, beforeEach } from 'vitest';
import { MnemosyneMemorySystem } from '../src/memory-tool.js';
import { memoryTools } from '../src/tools/registry.js';

describe('Memory System', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(() => {
    memorySystem = new MnemosyneMemorySystem();
    // Set up global memory instance for tool handlers
    (globalThis as any).getMemoryInstance = () => memorySystem;
  });

  describe('Claim Management', () => {
    it('should log and track claims', () => {
      const claim = "Territory coverage tool is working correctly";
      const context = { test: "After fixing API response handling" };
      
      const claimId = memorySystem.logClaim(claim, context);
      
      const unverifiedClaims = memorySystem.getUnverifiedClaims();
      expect(unverifiedClaims).toHaveLength(1);
      expect(unverifiedClaims[0].content).toBe(claim);
      expect(unverifiedClaims[0].id).toBe(claimId);
    });

    it('should verify claims and update status', () => {
      const claim = "API returns expected response format";
      
      const claimId = memorySystem.logClaim(claim, { test: "context" });
      memorySystem.verifyClaim(claimId, "Confirmed by test results", true);
      
      const unverifiedClaims = memorySystem.getUnverifiedClaims();
      expect(unverifiedClaims).toHaveLength(0);
    });

    it('should track behavioral violations', () => {
      memorySystem.recordViolation("no-unverified-claims", "Made claim without verification");
      
      const status = memorySystem.getBehavioralStatus();
      expect(status.recentViolations).toHaveLength(1);
      expect(status.recentViolations[0].rule).toContain("Never claim something is \"fixed\"");
    });
  });

  describe('Memory Tools Integration', () => {
    it('should provide proper tool definitions', () => {
      expect(memoryTools).toHaveLength(7); // Updated count to include memory_update_foundation
      expect(memoryTools.find(t => t.name === 'memory_log_claim')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_verify_claim')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_check_behavioral_status')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_view_foundation')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_record_violation')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_update_foundation')).toBeDefined();
      expect(memoryTools.find(t => t.name === 'memory_export_state')).toBeDefined();
    });

    it('should handle log_claim tool execution', async () => {
      const logTool = memoryTools.find(t => t.name === 'memory_log_claim')!;
      
      const result = await logTool.handler({
        claim: "Test claim",
        context: { test: "Test context" }
      });
      
      expect(result.content[0].text).toContain("Claim Logged");
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
      
      expect(result.content[0].text).toContain("Claim Verified");
    });

    it('should handle check_behavioral_status tool execution', async () => {
      const statusTool = memoryTools.find(t => t.name === 'memory_check_behavioral_status')!;
      
      const result = await statusTool.handler({});
      
      expect(result.content[0].text).toContain("Mnemosyne Memory System Status");
    });
  });

  describe('Behavioral Rule Enforcement', () => {
    it('should enforce claim verification workflow', () => {
      const initialStatus = memorySystem.getBehavioralStatus();
      expect(initialStatus.unverifiedClaims).toBe(0);
      
      // Log a claim
      const claimId = memorySystem.logClaim("New claim", { test: "Context" });
      let status = memorySystem.getBehavioralStatus();
      expect(status.unverifiedClaims).toBe(1);
      
      // Verify the claim
      memorySystem.verifyClaim(claimId, "Evidence", true);
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
