import { describe, it, expect, beforeEach } from 'vitest';
import { MnemosyneMemorySystem } from '../src/memory-tool';

describe('MCP Tool Memory Integration', () => {
  let memorySystem: MnemosyneMemorySystem;

  beforeEach(() => {
    memorySystem = new MnemosyneMemorySystem();
  });

  describe('Tool Call Pre-processing', () => {
    it('should enhance tool calls with memory consultation', () => {
      // RED: Test automatic memory search before tool calls
      const toolCall = {
        name: 'memory_search_tiered',
        query: 'user authentication patterns'
      };
      
      const queryId = memorySystem.logContextQuery(
        `Tool call: ${toolCall.name} with query: ${toolCall.query}`,
        { toolName: toolCall.name, originalQuery: toolCall.query }
      );
      
      const enrichedRecommendations = memorySystem.getRecommendedMemorySearches(toolCall.query);
      
      expect(queryId).toBeDefined();
      expect(enrichedRecommendations.length).toBeGreaterThan(0);
      expect(enrichedRecommendations.some(rec => rec.includes('authentication'))).toBe(true);
    });

    it('should track memory consultation compliance for tool usage', () => {
      // RED: Test tracking when tools are used without memory consultation
      memorySystem.recordViolation('consult-memory-before-response', 
        'Used semantic_search tool without first consulting memory for related context'
      );
      
      const status = memorySystem.getBehavioralStatus();
      expect(status.recentViolations).toHaveLength(1);
      expect(status.recommendations.some(rec => 
        rec.includes('unverified') || rec.includes('violations')
      )).toBe(true);
    });
  });

  describe('Workflow Memory Checkpoints', () => {
    it('should create memory checkpoints at key workflow stages', () => {
      // RED: Test checkpoint creation for workflow stages
      const workflowStages = [
        'user_request_received',
        'context_analysis_complete', 
        'memory_consultation_done',
        'tool_selection_made',
        'response_generated'
      ];
      
      const checkpointIds = workflowStages.map(stage => 
        memorySystem.logContextQuery(`Workflow checkpoint: ${stage}`, {
          stage,
          timestamp: new Date().toISOString(),
          workflowId: 'test-workflow-123'
        })
      );
      
      expect(checkpointIds).toHaveLength(5);
      expect(checkpointIds.every(id => id.startsWith('mem_'))).toBe(true);
      
      const logs = memorySystem.getContextLogs();
      expect(logs.filter(log => log.context?.workflowId === 'test-workflow-123')).toHaveLength(5);
    });

    it('should analyze workflow patterns for optimization', () => {
      // RED: Test workflow pattern analysis
      // Simulate repeated pattern of user asking about similar topics
      memorySystem.logContextQuery('user asks about React hooks', { topic: 'react', subtopic: 'hooks' });
      memorySystem.logContextQuery('user asks about React state management', { topic: 'react', subtopic: 'state' });
      memorySystem.logContextQuery('user asks about React performance', { topic: 'react', subtopic: 'performance' });
      
      const recommendations = memorySystem.getRecommendedMemorySearches('React component optimization');
      
      expect(recommendations.some(rec => rec.includes('react'))).toBe(true);
      
      const logs = memorySystem.getContextLogs();
      const reactQueries = logs.filter(log => log.query.toLowerCase().includes('react'));
      expect(reactQueries.length).toBe(3);
    });
  });

  describe('Proactive Memory Consultation', () => {
    it('should suggest proactive memory searches based on context patterns', () => {
      // RED: Test proactive suggestion system
      // Set up context suggesting user is working on authentication
      memorySystem.logContextQuery('login endpoint returning 401', { 
        domain: 'authentication', 
        issue: 'authorization' 
      });
      memorySystem.logContextQuery('JWT token validation failing', { 
        domain: 'authentication', 
        issue: 'tokens' 
      });
      
      const proactiveRecommendations = memorySystem.getRecommendedMemorySearches(
        'user session management'
      );
      
      expect(proactiveRecommendations.length).toBeGreaterThan(0);
      expect(proactiveRecommendations.some(rec => 
        rec.includes('session') || rec.includes('management') || rec.includes('user')
      )).toBe(true);
    });

    it('should maintain consultation history for learning', () => {
      // RED: Test consultation history tracking
      const queries = [
        'database connection issues',
        'API rate limiting problems', 
        'cache invalidation strategies'
      ];
      
      const queryIds = queries.map(query => 
        memorySystem.logContextQuery(query, { 
          consultationType: 'proactive',
          priority: 'high' 
        })
      );
      
      expect(queryIds).toHaveLength(3);
      
      const consultationHistory = memorySystem.getContextLogs()
        .filter(log => log.context?.consultationType === 'proactive');
      
      expect(consultationHistory).toHaveLength(3);
      expect(consultationHistory.every(log => log.context?.priority === 'high')).toBe(true);
    });
  });
});
