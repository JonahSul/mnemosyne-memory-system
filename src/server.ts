/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Mnemosyne Memory System - Local Development Server
 *
 * Express.js server for local development that replaces Cloudflare Worker functionality
 * Uses local services (Qdrant, Redis, Ollama) instead of Cloudflare bindings
 */

import express from 'express';
import cors from 'cors';
import { MnemosyneLocalMemoryMCP } from './local-agent';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

// Global MCP runtime and diagnostics
const memorySystem = new MnemosyneLocalMemoryMCP();

const mcpDiagnostics: {
  startTime: number;
  totalRequests: number;
  totalTimeMs: number;
  byTool: Record<string, { count: number; totalTimeMs: number; maxMs: number; minMs: number }>;
} = {
  startTime: Date.now(),
  totalRequests: 0,
  totalTimeMs: 0,
  byTool: {}
};

// Middleware
app.use(cors());
app.use(express.json());

// (health endpoint is defined later with enhanced diagnostics)

// Root endpoint with server information
app.get('/', (req, res) => {
  res.json({
    name: "Mnemosyne Memory System - Local Development Server",
    version: "1.7.0",
    description: "Cognitive enhancement and behavioral regulation system for AI agents (Local Mode)",
    protocol: "MCP 2024-11-05",
    capabilities: ["tools", "resources"],
    endpoints: {
      sse: "/sse",
      mcp: "/mcp",
      health: "/health"
    },
    services: {
      qdrant: process.env.QDRANT_URL || "not configured",
      redis: process.env.REDIS_URL || "not configured",
      ollama: process.env.EMBEDDING_URL || "not configured"
    }
  });
});

// MCP endpoint
app.post('/mcp', async (req, res) => {
  try {
    const start = process.hrtime.bigint();
    const response = await memorySystem.handleRequest(req.body);
    const end = process.hrtime.bigint();
    const durationMs = Number((end - start) / 1000000n);

    // Update diagnostics
    mcpDiagnostics.totalRequests += 1;
    mcpDiagnostics.totalTimeMs += durationMs;

    // Determine tool name for aggregation
    let toolName = 'unknown';
    try {
      if (req.body?.method === 'tools/call') toolName = req.body.params?.name || 'tools/call';
      else toolName = req.body?.method || 'unknown';
    } catch (e) {
      toolName = 'unknown';
    }

    if (!mcpDiagnostics.byTool[toolName]) {
      mcpDiagnostics.byTool[toolName] = { count: 0, totalTimeMs: 0, maxMs: 0, minMs: Number.POSITIVE_INFINITY };
    }

    const t = mcpDiagnostics.byTool[toolName]!;
    t.count += 1;
    t.totalTimeMs += durationMs;
    t.maxMs = Math.max(t.maxMs, durationMs);
    t.minMs = Math.min(t.minMs, durationMs);

    // Optionally include timing metadata in the response for debugging
    if (process.env.MNEMOSYNE_INCLUDE_TIMINGS === 'true') {
      if (typeof response === 'object' && response !== null) {
        // attach non-invasive debug field
        (response as any)._diagnostics = (response as any)._diagnostics || {};
        (response as any)._diagnostics.timingMs = durationMs;
        (response as any)._diagnostics.tool = toolName;
      }
    }

    res.json(response);
  } catch (error: unknown) {
    console.error('MCP request error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: {
        type: 'internal_error',
        message
      }
    });
  }
});

// SSE endpoint for real-time communication
app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // reuse singleton memorySystem for SSE connections

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: 'Connected to Mnemosyne Memory System (Local)',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE client disconnected');
  });
});

// Enhanced health endpoint includes memory subsystem diagnostics and MCP timing summary
app.get('/health', async (req, res) => {
  try {
    // Attempt to fetch internal memory stats from the MCP runtime
    let memStats: any = { available: false };
    try {
      const reqObj = { method: 'tools/call', params: { name: 'memory_admin', arguments: { operation: 'get_stats' } } };
      const result = await memorySystem.handleRequest(reqObj);
      memStats = { available: true, result };
    } catch (err) {
      memStats = { available: false, error: (err instanceof Error) ? err.message : String(err) };
    }

    const uptimeMs = Date.now() - mcpDiagnostics.startTime;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeMs,
      server: {
        version: '1.7.0',
        protocol: 'MCP 2024-11-05'
      },
      services: {
        qdrant: process.env.QDRANT_URL ? 'configured' : 'not configured',
        redis: process.env.REDIS_URL ? 'configured' : 'not configured',
        ollama: process.env.EMBEDDING_URL ? 'configured' : 'not configured'
      },
      memory: memStats,
      mcpDiagnostics: {
        totalRequests: mcpDiagnostics.totalRequests,
        averageRequestMs: mcpDiagnostics.totalRequests ? Math.round(mcpDiagnostics.totalTimeMs / mcpDiagnostics.totalRequests) : 0,
        byTool: Object.fromEntries(Object.entries(mcpDiagnostics.byTool).map(([k, v]) => [k, {
          count: v.count,
          avgMs: Math.round(v.totalTimeMs / v.count),
          maxMs: v.maxMs,
          minMs: isFinite(v.minMs) ? v.minMs : 0
        }]))
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ status: 'unhealthy', error: message, timestamp: new Date().toISOString() });
  }
});

// Socket.IO for bidirectional communication
io.on('connection', (socket) => {
  console.log('Client connected via Socket.IO');

  socket.on('mcp_request', async (data) => {
    try {
      const response = await memorySystem.handleRequest(data);
      socket.emit('mcp_response', response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      socket.emit('mcp_error', {
        error: {
          type: 'internal_error',
          message
        }
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from Socket.IO');
  });
});

// Error handling middleware
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', error);
  res.status(500).json({
    error: {
      type: 'server_error',
      message: 'Internal server error'
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Mnemosyne Memory System - Local Development Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`🔌 Socket.IO ready for connections`);
  console.log(`\n📋 Service Configuration:`);
  console.log(`   Qdrant: ${process.env.QDRANT_URL || 'Not configured'}`);
  console.log(`   Redis: ${process.env.REDIS_URL || 'Not configured'}`);
  console.log(`   Ollama: ${process.env.EMBEDDING_URL || 'Not configured'}`);
});