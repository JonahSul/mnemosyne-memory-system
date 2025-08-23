# Use Node.js 20 Alpine for development
FROM node:20-alpine

# Install development dependencies
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install global development tools
RUN npm install -g tsx nodemon

# Copy source code
COPY . .

# Expose ports
EXPOSE 8000 9229

# Development command with hot reload
CMD ["npm", "run", "dev:docker"]
