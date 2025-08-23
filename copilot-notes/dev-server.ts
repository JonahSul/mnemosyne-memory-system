#!/usr/bin/env node
/**
 * Local development server for Mnemosyne Memory System
 * Replaces Cloudflare Workers runtime with Express.js for local development
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from 'dotenv';

// Load development environment
config({ path: '.env.development' });

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: 'development',
    timestamp: new Date().toISOString(),
    services: {
      qdrant: process.env.QDRANT_URL,
      redis: process.env.REDIS_URL,
      embeddings: process.env.EMBEDDING_URL
    }
  });
});

// MCP endpoint (placeholder for now)
app.all('/mcp/*', (req, res) => {
  res.status(501).json({
    error: 'MCP endpoints not yet implemented in dev server',
    message: 'This will be implemented to match the Cloudflare Workers MCP handler'
  });
});

// Memory system endpoints (placeholder for now)
app.all('/memory/*', (req, res) => {
  res.status(501).json({
    error: 'Memory endpoints not yet implemented in dev server',
    message: 'This will be implemented to match the Cloudflare Workers memory system'
  });
});

// Foundation management endpoint
app.get('/foundation', (req, res) => {
  res.status(501).json({
    error: 'Foundation endpoint not yet implemented in dev server',
    message: 'This will be implemented to match the Cloudflare Workers foundation system'
  });
});

// Catch all
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'This endpoint is not implemented in the development server'
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Development server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🧠 Mnemosyne Development Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Qdrant UI: http://localhost:6333/dashboard`);
  console.log(`📈 Redis UI: http://localhost:8001`);
  console.log('');
  console.log('🚀 Ready for development!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
