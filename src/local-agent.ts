/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Mnemosyne Memory System - Local Agent Implementation
 *
 * Local development version that uses Docker services instead of Cloudflare bindings
 * - Qdrant instead of Vectorize
 * - Redis instead of Durable Objects
 * - Ollama/Local embeddings instead of Cloudflare AI
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import Redis from 'redis';
import { QdrantClient } from '@qdrant/js-client-rest';

// Environment configuration
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const EMBEDDING_URL = process.env.EMBEDDING_URL || 'http://localhost:11434';
const LOCAL_EMBEDDING_URL = process.env.LOCAL_EMBEDDING_URL || 'http://localhost:8002';

// Initialize clients
const qdrant = new QdrantClient({ url: QDRANT_URL });
const redis = Redis.createClient({ url: REDIS_URL });

// Collection name for vectors
const VECTOR_COLLECTION = 'mnemosyne-memory-vectors';

// Embedding dimensions (matches the model)
const EMBEDDING_DIMENSIONS = 384;

interface MemoryEntry {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  importance: number;
  tier: 'short' | 'intermediate' | 'long';
}

interface ClaimEntry {
  id: string;
  claim: string;
  evidence: string[];
  verified: boolean;
  timestamp: number;
  confidence: number;
}

interface ViolationEntry {
  id: string;
  rule: string;
  violation: string;
  context: Record<string, any>;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class MnemosyneLocalMemoryMCP {
  private redisConnected = false;

  constructor() {
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      // Connect to Redis
      await redis.connect();
      this.redisConnected = true;
      console.log('✅ Connected to Redis');

      // Initialize Qdrant collection
      await this.initializeQdrantCollection();
      console.log('✅ Initialized Qdrant collection');

    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
    }
  }

  private async initializeQdrantCollection() {
    try {
      // Check if collection exists
      const collections = await qdrant.getCollections();
      const exists = collections.collections.some((c: any) => c.name === VECTOR_COLLECTION);

      if (!exists) {
        await qdrant.createCollection(VECTOR_COLLECTION, {
          vectors: {
            size: EMBEDDING_DIMENSIONS,
            distance: 'Cosine'
          }
        });
        console.log(`Created Qdrant collection: ${VECTOR_COLLECTION}`);
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant collection:', error);
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Try Ollama first
      const response = await fetch(`${EMBEDDING_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'all-minilm',
          prompt: text
        })
      });

      if (response.ok) {
        const data = await response.json() as { embedding: number[] };
        return data.embedding;
      }
    } catch (error) {
      console.warn('Ollama embedding failed, trying local service:', error);
    }

    // Fallback to local embedding service
    try {
      const response = await fetch(LOCAL_EMBEDDING_URL + '/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [text],
          model: 'sentence-transformers/all-MiniLM-L6-v2'
        })
      });

      if (response.ok) {
        const data = await response.json() as { embeddings: number[][] };
        return data.embeddings?.[0] || new Array(EMBEDDING_DIMENSIONS).fill(0);
      }
    } catch (error) {
      console.error('All embedding services failed:', error);
    }

    // Return zero vector as fallback
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  async handleRequest(request: any): Promise<any> {
    const { method, params } = request;

    switch (method) {
      case 'tools/list':
        return this.listTools();

      case 'tools/call':
        return this.callTool(params);

      case 'resources/list':
        return this.listResources();

      case 'resources/read':
        return this.readResource(params);

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown method: ${method}`);
    }
  }

  private listTools() {
    return {
      tools: [
        // Core Memory Operations
        {
          name: 'memory_log_claim',
          description: 'Track claims and assertions for later verification',
          inputSchema: {
            type: 'object',
            properties: {
              claim: { type: 'string' },
              evidence: { type: 'array', items: { type: 'string' } },
              confidence: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['claim']
          }
        },
        {
          name: 'memory_verify_claim',
          description: 'Verify previously logged claims with evidence',
          inputSchema: {
            type: 'object',
            properties: {
              claimId: { type: 'string' },
              verificationResult: { type: 'boolean' },
              additionalEvidence: { type: 'array', items: { type: 'string' } }
            },
            required: ['claimId', 'verificationResult']
          }
        },
        {
          name: 'memory_record_violation',
          description: 'Log behavioral rule violations for learning',
          inputSchema: {
            type: 'object',
            properties: {
              rule: { type: 'string' },
              violation: { type: 'string' },
              context: { type: 'object' },
              severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
            },
            required: ['rule', 'violation']
          }
        },
        {
          name: 'memory_check_behavioral_status',
          description: 'Monitor behavioral performance and compliance',
          inputSchema: {
            type: 'object',
            properties: {
              timeRange: { type: 'string', enum: ['hour', 'day', 'week', 'month'] }
            }
          }
        },

        // Semantic Knowledge Management
        {
          name: 'memory_store_knowledge',
          description: 'Store information with semantic embeddings for RAG retrieval',
          inputSchema: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              metadata: { type: 'object' },
              importance: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['content']
          }
        },
        {
          name: 'memory_search_knowledge',
          description: 'Perform semantic similarity search across knowledge base',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              limit: { type: 'number', minimum: 1, maximum: 50 },
              threshold: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['query']
          }
        },
        {
          name: 'memory_store_tiered',
          description: 'Store knowledge in multi-tier system with automatic placement',
          inputSchema: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              metadata: { type: 'object' },
              importance: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['content']
          }
        },
        {
          name: 'memory_search_tiered',
          description: 'Search across memory tiers with tier-aware ranking',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              tiers: { type: 'array', items: { type: 'string', enum: ['short', 'intermediate', 'long'] } },
              limit: { type: 'number', minimum: 1, maximum: 50 }
            },
            required: ['query']
          }
        },
        {
          name: 'memory_stats_tiered',
          description: 'Get memory utilization statistics across all tiers',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },

        // Foundation Management
        {
          name: 'memory_admin',
          description: 'Administrative operations and foundation management',
          inputSchema: {
            type: 'object',
            properties: {
              operation: { type: 'string', enum: ['view_foundation', 'export_state', 'get_stats'] }
            },
            required: ['operation']
          }
        }
      ]
    };
  }

  private async callTool(params: any) {
    const { name, arguments: args } = params;

    try {
      switch (name) {
        case 'memory_log_claim':
          return await this.logClaim(args);
        case 'memory_verify_claim':
          return await this.verifyClaim(args);
        case 'memory_record_violation':
          return await this.recordViolation(args);
        case 'memory_check_behavioral_status':
          return await this.checkBehavioralStatus(args);
        case 'memory_store_knowledge':
          return await this.storeKnowledge(args);
        case 'memory_search_knowledge':
          return await this.searchKnowledge(args);
        case 'memory_store_tiered':
          return await this.storeTiered(args);
        case 'memory_search_tiered':
          return await this.searchTiered(args);
        case 'memory_stats_tiered':
          return await this.getTieredStats(args);
        case 'memory_admin':
          return await this.adminOperation(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error(`Tool ${name} error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
    }
  }

  private async logClaim(args: any) {
    const { claim, evidence = [], confidence = 0.5 } = args;
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const claimEntry: ClaimEntry = {
      id: claimId,
      claim,
      evidence,
      verified: false,
      timestamp: Date.now(),
      confidence
    };

    if (this.redisConnected) {
      await redis.set(`claim:${claimId}`, JSON.stringify(claimEntry));
    }

    return {
      content: [{
        type: 'text',
        text: `Claim logged successfully with ID: ${claimId}`
      }]
    };
  }

  private async verifyClaim(args: any) {
    const { claimId, verificationResult, additionalEvidence = [] } = args;

    if (!this.redisConnected) {
      throw new Error('Redis not connected');
    }

    const claimData = await redis.get(`claim:${claimId}`);
    if (!claimData) {
      throw new Error(`Claim ${claimId} not found`);
    }

    const claim: ClaimEntry = JSON.parse(claimData);
    claim.verified = verificationResult;
    claim.evidence = [...claim.evidence, ...additionalEvidence];

    await redis.set(`claim:${claimId}`, JSON.stringify(claim));

    return {
      content: [{
        type: 'text',
        text: `Claim ${claimId} verification updated: ${verificationResult ? 'VERIFIED' : 'UNVERIFIED'}`
      }]
    };
  }

  private async recordViolation(args: any) {
    const { rule, violation, context = {}, severity = 'medium' } = args;
    const violationId = `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const violationEntry: ViolationEntry = {
      id: violationId,
      rule,
      violation,
      context,
      timestamp: Date.now(),
      severity
    };

    if (this.redisConnected) {
      await redis.set(`violation:${violationId}`, JSON.stringify(violationEntry));
    }

    return {
      content: [{
        type: 'text',
        text: `Violation recorded: ${rule} - ${violation} (Severity: ${severity})`
      }]
    };
  }

  private async checkBehavioralStatus(args: any) {
    const { timeRange = 'day' } = args;

    if (!this.redisConnected) {
      return {
        content: [{
          type: 'text',
          text: 'Behavioral status check unavailable - Redis not connected'
        }]
      };
    }

    // Get recent violations
    const keys = await redis.keys('violation:*');
    const violations = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        violations.push(JSON.parse(data));
      }
    }

    const recentViolations = violations.filter(v => {
      const age = Date.now() - v.timestamp;
      switch (timeRange) {
        case 'hour': return age < 3600000;
        case 'day': return age < 86400000;
        case 'week': return age < 604800000;
        case 'month': return age < 2592000000;
        default: return true;
      }
    });

    const stats = {
      totalViolations: recentViolations.length,
      bySeverity: {
        critical: recentViolations.filter(v => v.severity === 'critical').length,
        high: recentViolations.filter(v => v.severity === 'high').length,
        medium: recentViolations.filter(v => v.severity === 'medium').length,
        low: recentViolations.filter(v => v.severity === 'low').length
      },
      timeRange
    };

    return {
      content: [{
        type: 'text',
        text: `Behavioral Status (${timeRange}):\n${JSON.stringify(stats, null, 2)}`
      }]
    };
  }

  private async storeKnowledge(args: any) {
    const { content, metadata = {}, importance = 0.5 } = args;

    // Generate embedding
    const embedding = await this.generateEmbedding(content);

    // Create memory entry
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const memoryEntry: MemoryEntry = {
      id: memoryId,
      content,
      metadata,
      timestamp: Date.now(),
      importance,
      tier: importance > 0.8 ? 'long' : importance > 0.5 ? 'intermediate' : 'short'
    };

    // Store in Qdrant
    await qdrant.upsert(VECTOR_COLLECTION, {
      points: [{
        id: memoryId,
        vector: embedding,
         payload: memoryEntry as unknown as Record<string, unknown>
      }]
    });

    // Store metadata in Redis
    if (this.redisConnected) {
      await redis.set(`memory:${memoryId}`, JSON.stringify(memoryEntry));
    }

    return {
      content: [{
        type: 'text',
        text: `Knowledge stored successfully with ID: ${memoryId} (Tier: ${memoryEntry.tier})`
      }]
    };
  }

  private async searchKnowledge(args: any) {
    const { query, limit = 10, threshold = 0.7 } = args;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Search Qdrant
    const searchResult = await qdrant.search(VECTOR_COLLECTION, {
      vector: queryEmbedding,
      limit,
      score_threshold: threshold
    });

    const results = searchResult.map((hit: any) => ({
      id: hit.id,
      content: hit.payload?.content,
      metadata: hit.payload?.metadata,
      score: hit.score,
      tier: hit.payload?.tier
    }));

    return {
      content: [{
        type: 'text',
        text: `Found ${results.length} relevant knowledge entries:\n${JSON.stringify(results, null, 2)}`
      }]
    };
  }

  private async storeTiered(args: any) {
    // For now, delegate to storeKnowledge with tier determination
    return await this.storeKnowledge(args);
  }

  private async searchTiered(args: any) {
    const { query, tiers = ['short', 'intermediate', 'long'], limit = 10 } = args;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Search with filter for tiers
    const searchResult = await qdrant.search(VECTOR_COLLECTION, {
      vector: queryEmbedding,
      limit: limit * 2, // Get more results to filter
      filter: {
        must: [
          {
            key: 'tier',
            match: {
              any: tiers
            }
          }
        ]
      }
    });

    const results = searchResult
      .slice(0, limit)
      .map((hit: any) => ({
        id: hit.id,
        content: hit.payload?.content,
        metadata: hit.payload?.metadata,
        score: hit.score,
        tier: hit.payload?.tier
      }));

    return {
      content: [{
        type: 'text',
        text: `Found ${results.length} tiered knowledge entries (${tiers.join(', ')}):\n${JSON.stringify(results, null, 2)}`
      }]
    };
  }

  private async getTieredStats(args: any) {
    if (!this.redisConnected) {
      return {
        content: [{
          type: 'text',
          text: 'Tiered stats unavailable - Redis not connected'
        }]
      };
    }

    const keys = await redis.keys('memory:*');
    const memories = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        memories.push(JSON.parse(data));
      }
    }

    const stats = {
      total: memories.length,
      byTier: {
        short: memories.filter(m => m.tier === 'short').length,
        intermediate: memories.filter(m => m.tier === 'intermediate').length,
        long: memories.filter(m => m.tier === 'long').length
      },
      averageImportance: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length || 0
    };

    return {
      content: [{
        type: 'text',
        text: `Memory Tier Statistics:\n${JSON.stringify(stats, null, 2)}`
      }]
    };
  }

  private async adminOperation(args: any) {
    const { operation } = args;

    switch (operation) {
      case 'view_foundation':
        return {
          content: [{
            type: 'text',
            text: 'Foundation view not implemented in local mode'
          }]
        };

      case 'export_state':
        return {
          content: [{
            type: 'text',
            text: 'State export not implemented in local mode'
          }]
        };

      case 'get_stats':
        const stats = {
          redis: this.redisConnected ? 'connected' : 'disconnected',
          qdrant: 'configured',
          embedding: 'configured'
        };
        return {
          content: [{
            type: 'text',
            text: `System Statistics:\n${JSON.stringify(stats, null, 2)}`
          }]
        };

      default:
        throw new Error(`Unknown admin operation: ${operation}`);
    }
  }

  private listResources() {
    return {
      resources: []
    };
  }

  private readResource(params: any) {
    throw new McpError(ErrorCode.MethodNotFound, 'Resource reading not implemented');
  }
}