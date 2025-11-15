# Distribution & Deployment Guide

This guide covers all distribution methods for the Mnemosyne SQLite MCP Server.

## Table of Contents

- [npm Package Distribution](#npm-package-distribution)
- [VS Code Extension Distribution](#vs-code-extension-distribution)
- [GitHub Releases](#github-releases)
- [Docker Distribution](#docker-distribution)
- [Self-Hosted Installation](#self-hosted-installation)

---

## npm Package Distribution

### Prerequisites

1. npm account: https://www.npmjs.com/signup
2. Access to publish `@mnemosyne/sqlite` (or choose different name)
3. npm CLI installed and logged in

### Publishing Steps

1. **Login to npm**
   ```bash
   npm login
   ```

2. **Update version** (if needed)
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   # or
   npm version minor  # 1.0.0 -> 1.1.0
   # or
   npm version major  # 1.0.0 -> 2.0.0
   ```

3. **Test the package**
   ```bash
   # Build
   npm run build
   
   # Test pack (doesn't publish)
   npm pack
   
   # Test the tarball
   npm install -g ./mnemosyne-sqlite-1.0.0.tgz
   mnemosyne-sqlite --help
   ```

4. **Dry run**
   ```bash
   npm publish --dry-run
   ```

5. **Publish**
   ```bash
   # For scoped packages
   npm publish --access public
   
   # Check it's live
   npm view @mnemosyne/sqlite
   ```

### Post-Publishing

Users can now install with:

```bash
# Global (for MCP server)
npm install -g @mnemosyne/sqlite

# Local (for library)
npm install @mnemosyne/sqlite

# With npx (no install)
npx @mnemosyne/sqlite
```

---

## VS Code Extension Distribution

### Prerequisites

1. VS Code Marketplace publisher account: https://marketplace.visualstudio.com/manage
2. Personal Access Token (PAT) from Azure DevOps
3. `vsce` CLI tool installed globally

### Setup Publisher

1. **Install vsce**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Create Publisher** (first time only)
   ```bash
   vsce create-publisher your-publisher-name
   ```

3. **Login**
   ```bash
   vsce login your-publisher-name
   # Enter your Personal Access Token
   ```

### Package the Extension

```bash
cd packages/mnemosyne-sqlite-vscode

# Install dependencies
npm install

# Package the extension
vsce package

# This creates: mnemosyne-sqlite-vscode-1.0.0.vsix
```

### Test Locally

```bash
# Install the .vsix file in VS Code
code --install-extension mnemosyne-sqlite-vscode-1.0.0.vsix

# Test the commands
# Open Command Palette and search for "Mnemosyne"
```

### Publish to Marketplace

```bash
# From the extension directory
vsce publish

# Or publish a specific version
vsce publish 1.0.1

# Or publish the .vsix file
vsce publish mnemosyne-sqlite-vscode-1.0.0.vsix
```

### Post-Publishing

- Extension will be available at: `https://marketplace.visualstudio.com/items?itemName=your-publisher.mnemosyne-sqlite-vscode`
- Users can install with: `code --install-extension your-publisher.mnemosyne-sqlite-vscode`
- Or search in VS Code Extensions view

---

## GitHub Releases

### Create Release Package

```bash
cd packages/mnemosyne-sqlite

# Build
npm run build

# Create tarball
npm pack

# Create additional archives
tar -czf mnemosyne-sqlite-v1.0.0-linux.tar.gz dist/ package.json README.md LICENSE node_modules/
zip -r mnemosyne-sqlite-v1.0.0-windows.zip dist/ package.json README.md LICENSE node_modules/
```

### Publish Release

1. **Go to GitHub repository**
   - Navigate to: https://github.com/JonahSul/mnemosyne-memory-system/releases

2. **Create new release**
   - Click "Create a new release"
   - Tag version: `v1.0.0`
   - Release title: `Mnemosyne SQLite v1.0.0`
   - Description: Copy from CHANGELOG.md

3. **Upload assets**
   - `mnemosyne-sqlite-1.0.0.tgz` (npm package)
   - `mnemosyne-sqlite-v1.0.0-linux.tar.gz` (bundled for Linux)
   - `mnemosyne-sqlite-v1.0.0-windows.zip` (bundled for Windows)
   - `install.sh` (installation script)
   - `install.bat` (Windows installation script)

4. **Publish release**

### User Installation from Release

```bash
# Download and install from GitHub release
curl -L https://github.com/JonahSul/mnemosyne-memory-system/releases/download/v1.0.0/mnemosyne-sqlite-1.0.0.tgz -o mnemosyne-sqlite.tgz
npm install -g mnemosyne-sqlite.tgz
```

---

## Docker Distribution

### Create Dockerfile

Already prepared at `packages/mnemosyne-sqlite/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --production

# Copy built files
COPY dist ./dist

# Create data directory
RUN mkdir -p /data

# Set environment variable
ENV MNEMOSYNE_DB_PATH=/data/knowledge.db

# Expose no ports (stdio-based MCP)

CMD ["node", "dist/server.js"]
```

### Build and Publish

```bash
cd packages/mnemosyne-sqlite

# Build the Docker image
docker build -t jonahsul/mnemosyne-sqlite:1.0.0 .
docker tag jonahsul/mnemosyne-sqlite:1.0.0 jonahsul/mnemosyne-sqlite:latest

# Test locally
docker run -v $(pwd)/test-knowledge.db:/data/knowledge.db jonahsul/mnemosyne-sqlite:1.0.0

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push jonahsul/mnemosyne-sqlite:1.0.0
docker push jonahsul/mnemosyne-sqlite:latest
```

### User Installation (Docker)

```bash
# Pull and run
docker pull jonahsul/mnemosyne-sqlite:latest
docker run -v $(pwd)/knowledge.db:/data/knowledge.db jonahsul/mnemosyne-sqlite:latest
```

---

## Self-Hosted Installation

For enterprise or private deployments.

### Create Bundle

```bash
cd packages/mnemosyne-sqlite

# Build
npm run build

# Create full bundle with dependencies
npm pack
mkdir -p bundle
tar -xzf mnemosyne-sqlite-1.0.0.tgz -C bundle
cd bundle/package
npm install --production

# Archive the bundle
cd ..
tar -czf ../mnemosyne-sqlite-bundle-1.0.0.tar.gz package/
```

### Deploy to Private Server

```bash
# On the target server
scp mnemosyne-sqlite-bundle-1.0.0.tar.gz user@server:/opt/

# SSH to server
ssh user@server

# Extract
cd /opt
tar -xzf mnemosyne-sqlite-bundle-1.0.0.tar.gz
cd package

# Test
node dist/server.js

# Create systemd service (optional)
sudo nano /etc/systemd/system/mnemosyne-sqlite.service
```

systemd service file:
```ini
[Unit]
Description=Mnemosyne SQLite MCP Server
After=network.target

[Service]
Type=simple
User=mnemosyne
WorkingDirectory=/opt/mnemosyne-sqlite
Environment="MNEMOSYNE_DB_PATH=/var/lib/mnemosyne/knowledge.db"
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## Distribution Checklist

Before distributing any version:

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version number is bumped appropriately
- [ ] Package builds successfully
- [ ] README has correct installation instructions
- [ ] License file is included
- [ ] No sensitive data in published files

---

## Current Status

| Distribution Method | Status | Ready to Publish? |
|-------------------|---------|------------------|
| npm Package | ✅ Configured | ⏳ Need npm account |
| VS Code Extension | ✅ Created | ⏳ Need publisher account |
| GitHub Releases | ✅ Scripts ready | ⏳ Need to create release |
| Docker | ✅ Dockerfile ready | ⏳ Need Docker Hub account |
| Self-Hosted | ✅ Instructions ready | ✅ Ready |

---

## Recommended Distribution Strategy

1. **Primary: npm Package**
   - Easiest for developers
   - Works with npx for zero-install
   - Standard Node.js distribution

2. **Secondary: VS Code Extension**
   - Best user experience for VS Code users
   - One-click setup
   - Automatic configuration

3. **Tertiary: GitHub Releases**
   - For users without npm access
   - Provides bundled archives
   - Includes installation scripts

4. **Optional: Docker**
   - For containerized environments
   - Server deployments
   - Isolated testing

---

## Support & Updates

After publishing:

1. Monitor GitHub issues
2. Respond to npm package issues
3. Update documentation based on user feedback
4. Regular security updates
5. Version releases following semantic versioning
