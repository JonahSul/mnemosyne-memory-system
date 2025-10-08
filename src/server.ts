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

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check if local services are available
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        qdrant: process.env.QDRANT_URL ? 'configured' : 'not configured',
        redis: process.env.REDIS_URL ? 'configured' : 'not configured',
        ollama: process.env.EMBEDDING_URL ? 'configured' : 'not configured'
      }
    };
    res.json(health);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      status: 'unhealthy',
      error: message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint with server information
app.get('/', (req, res) => {
  res.json({
    name: "Mnemosyne Memory System - Local Development Server",
    version: "1.0.0",
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
    const memorySystem = new MnemosyneLocalMemoryMCP();
    const response = await memorySystem.handleRequest(req.body);
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

  const memorySystem = new MnemosyneLocalMemoryMCP();

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

// Socket.IO for bidirectional communication
io.on('connection', (socket) => {
  console.log('Client connected via Socket.IO');

  socket.on('mcp_request', async (data) => {
    try {
      const memorySystem = new MnemosyneLocalMemoryMCP();
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