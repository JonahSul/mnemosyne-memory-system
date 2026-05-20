import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { MnemosyneMemorySystem } from '../packages/mnemosyne/src/memory-tool';
import { bootstrapTestMemorySystem, resetTestMemoryGlobals } from './setup/test-memory-environment';

describe('Memory Consultation Integration', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(async () => {
    const { memory } = await bootstrapTestMemorySystem();
    memorySystem = memory;
  });

  afterEach(() => {
    resetTestMemoryGlobals();
  });

  describe('Pre-Response Memory Consultation', () => {
    it('should automatically log context queries for user interactions', () => {
      // RED: Test for automatic context logging when processing user queries
      const userQuery = 'help me debug this TypeScript error';
      
      const queryId = memorySystem.logContextQuery(userQuery, { 
        type: 'user-request',
        domain: 'programming' 
      });
      
      expect(queryId).toBeDefined();
      
      const logs = memorySystem.getContextLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].query).toBe(userQuery);
      expect(logs[0].context?.type).toBe('user-request');
    });

    it('should generate memory search recommendations before responding', () => {
      // RED: Test recommendation generation for memory consultation
      memorySystem.logContextQuery('user wants to implement authentication');
      memorySystem.logContextQuery('previous discussion about JWT tokens');
      
      const recommendations = memorySystem.getRecommendedMemorySearches(
        'how to secure API endpoints with authentication'
      );
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('authentication'))).toBe(true);
    });

    it('should track consultation behavior compliance', () => {
      // RED: Test behavioral compliance tracking for memory consultation
      const userQuery = 'implement user registration feature';
      
      // Simulate not consulting memory before response
      memorySystem.recordViolation('consult-memory-before-response', 
        'Responded to user query without checking memory for related context or previous implementations'
      );
      
  const status = memorySystem.getBehavioralStatus();
  expect(status.recentViolations.length).toBeGreaterThan(0);
	expect(status.recentViolations[0].rule).toContain('Always consult memory systems');
    });
  });

  describe('Memory Pre-warming System', () => {
    it('should identify contextually relevant memory areas', () => {
      // RED: Test pre-warming system that identifies relevant memory areas
      const queryContext = {
        userQuery: 'fix deployment pipeline',
        domain: 'devops',
        previousTopics: ['CI/CD', 'Docker', 'testing']
      };
      
      memorySystem.logContextQuery('deployment pipeline issue', queryContext);
      
      const recommendations = memorySystem.getRecommendedMemorySearches(
        'deployment pipeline configuration problem'
      );
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((rec: string) => 
        rec.includes('deployment') || rec.includes('pipeline')
      )).toBe(true);
    });

    it('should suggest memory searches based on behavioral patterns', () => {
      // RED: Test pattern-based memory search suggestions
      // Simulate pattern of repeated testing issues
      memorySystem.recordViolation('no-unverified-claims', 'Made claim about fix without testing');
      memorySystem.recordViolation('ask-for-help', 'Attempted fix without asking for help');
      
      const recommendations = memorySystem.getRecommendedMemorySearches(
        'tests are failing'
      );
      
      expect(recommendations.some((rec: string) => 
        rec.includes('compliance') || rec.includes('no-unverified-claims')
      )).toBe(true);
    });
  });
});
