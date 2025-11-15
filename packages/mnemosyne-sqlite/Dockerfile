FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built distribution files
COPY dist ./dist

# Create data directory for database
RUN mkdir -p /data && \
    chown -R node:node /data

# Set default database path
ENV MNEMOSYNE_DB_PATH=/data/knowledge.db

# Run as non-root user
USER node

# Health check (optional - checks if server can start)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Server healthy')"

# Start the MCP server
CMD ["node", "dist/server.js"]
