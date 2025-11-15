# Publishing Guide

## Publishing to npm

### Prerequisites

1. **npm Account**: Create an account at https://www.npmjs.com/
2. **npm Login**: Run `npm login` and enter your credentials
3. **Package Name**: Ensure `@mnemosyne/sqlite` is available (or choose another scope/name)

### Before Publishing

1. **Update Version**: Follow semantic versioning
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. **Build the Package**:
   ```bash
   npm run build
   ```

3. **Test Locally**:
   ```bash
   # In this directory
   npm pack
   
   # In another directory
   npm install /path/to/mnemosyne-sqlite-1.0.0.tgz
   ```

### Publishing

```bash
# Dry run to see what will be published
npm publish --dry-run

# Publish to npm (public)
npm publish --access public

# Or for scoped packages
npm publish
```

### After Publishing

Users can install with:
```bash
# Global installation (for MCP server)
npm install -g @mnemosyne/sqlite

# Then use directly
mnemosyne-sqlite

# Or local installation (for library usage)
npm install @mnemosyne/sqlite
```

### MCP Configuration After Global Install

```json
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "mnemosyne-sqlite",
      "env": {
        "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
      }
    }
  }
}
```

## Installing via npx (No Installation Required)

Users can run the MCP server without installing:

```json
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "npx",
      "args": ["-y", "@mnemosyne/sqlite"],
      "env": {
        "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
      }
    }
  }
}
```

## Publishing to VS Code Extension Marketplace

To create a VS Code extension that installs this MCP server:

### 1. Create Extension Package

Create a new directory `packages/mnemosyne-sqlite-vscode`:

```bash
cd packages
mkdir mnemosyne-sqlite-vscode
cd mnemosyne-sqlite-vscode
```

### 2. Extension Files Needed

- `package.json` - Extension manifest
- `extension.js` - Extension code (minimal, just configuration)
- `README.md` - Extension documentation
- `.vscodeignore` - Files to exclude from package

### 3. Extension Configuration

The extension would:
1. Bundle or depend on `@mnemosyne/sqlite`
2. Provide settings UI for database path
3. Auto-configure MCP settings for supported clients
4. Optionally provide VS Code commands to manage knowledge

### 4. Publishing Process

```bash
# Install vsce (VS Code Extension CLI)
npm install -g @vscode/vsce

# Package the extension
vsce package

# Publish to marketplace
vsce publish
```

### 5. User Installation

Users would:
1. Search for "Mnemosyne SQLite" in VS Code Extensions
2. Click Install
3. Configure database path in settings
4. Extension auto-configures MCP clients

## Alternative: GitHub Releases

For users who don't want npm:

### 1. Create Release Package

```bash
npm run build
tar -czf mnemosyne-sqlite-v1.0.0.tar.gz dist/ package.json README.md LICENSE
```

### 2. Upload to GitHub Releases

1. Go to repository releases page
2. Create new release (tag: v1.0.0)
3. Upload the `.tar.gz` file
4. Add installation instructions

### 3. Users Install From Release

```bash
# Download and extract
curl -L https://github.com/JonahSul/mnemosyne-memory-system/releases/download/v1.0.0/mnemosyne-sqlite-v1.0.0.tar.gz -o mnemosyne-sqlite.tar.gz
tar -xzf mnemosyne-sqlite.tar.gz
cd mnemosyne-sqlite

# Install dependencies
npm install --production

# Use in MCP config
{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": {
        "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
      }
    }
  }
}
```

## Docker Distribution

For containerized deployment:

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

### 2. Build and Publish

```bash
docker build -t jonahsul/mnemosyne-sqlite:1.0.0 .
docker push jonahsul/mnemosyne-sqlite:1.0.0
```

### 3. Users Run Container

```bash
docker run -v $(pwd)/knowledge.db:/data/knowledge.db \
  -e MNEMOSYNE_DB_PATH=/data/knowledge.db \
  jonahsul/mnemosyne-sqlite:1.0.0
```

## Recommended Distribution Strategy

1. **Primary: npm Package** (easiest for users)
   - Global install via `npm install -g @mnemosyne/sqlite`
   - Or use with `npx` (zero install)

2. **Secondary: GitHub Releases** (for non-npm users)
   - Provides standalone archives
   - Good for enterprise users

3. **Future: VS Code Extension** (best UX)
   - One-click install from marketplace
   - Automatic configuration
   - Integrated settings UI

4. **Optional: Docker** (for containerized environments)
   - Good for server deployments
   - Isolated environments

## Current Status

- ✅ Package is ready for npm publishing
- ✅ Binary is configured (`mnemosyne-sqlite` command)
- ✅ Files field specifies what to include
- ✅ Keywords for discoverability
- ✅ Repository links configured
- ⏳ Need to publish to npm registry
- ⏳ VS Code extension not yet created

## Next Steps

1. Choose your distribution method(s)
2. For npm: run `npm publish --access public`
3. For VS Code: create extension package (see below)
4. For GitHub: create release with packaged files
5. Update main README with installation instructions
