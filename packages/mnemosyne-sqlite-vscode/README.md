# Mnemosyne SQLite MCP Server for VS Code

A VS Code extension that makes it easy to configure and use the Mnemosyne SQLite MCP Server for project-local knowledge storage.

## Features

- **One-Click Configuration**: Automatically sets up the MCP server for your workspace
- **Knowledge Base Management**: View statistics and manage your local knowledge database
- **MCP Integration**: Works with Claude Desktop, Cline, and other MCP clients
- **Zero Cloud Dependencies**: All data stored locally in SQLite

## Installation

1. Install from VS Code Marketplace (search for "Mnemosyne SQLite")
2. Or install from VSIX file: `code --install-extension mnemosyne-sqlite-vscode-1.0.0.vsix`

## Quick Start

1. Open a workspace/folder in VS Code
2. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
3. Run: `Mnemosyne: Configure MCP Server`
4. Copy the configuration to your MCP client settings
5. Start using the knowledge base with your AI assistant!

## Commands

- **Mnemosyne: Install MCP Server** - Install the server package globally
- **Mnemosyne: Configure MCP Server** - Generate configuration for your workspace
- **Mnemosyne: Show Knowledge Base Statistics** - View database stats

## Settings

- `mnemosyne.sqlite.databasePath` - Path to the SQLite database (default: `.mnemosyne/knowledge.db` in workspace)
- `mnemosyne.sqlite.autoInstall` - Automatically install the server package

## Usage with MCP Clients

### Claude Desktop

1. Run `Mnemosyne: Configure MCP Server` command
2. Copy the generated configuration
3. Open: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
4. Paste the configuration into the `mcpServers` section
5. Restart Claude Desktop

### Cline (VS Code)

1. Ensure Cline extension is installed
2. Run `Mnemosyne: Configure MCP Server` command
3. The extension will automatically work with Cline's MCP support

## What is MCP?

Model Context Protocol (MCP) is a standard for connecting AI assistants to external tools and data sources. This extension provides a local, persistent knowledge base that your AI can use to remember project-specific information.

## Example Usage

Once configured, you can tell your AI assistant:

- "Remember that our API endpoint is https://api.example.com/v1"
- "What do you know about our authentication system?"
- "Store this pattern: We always use async/await instead of promises"
- "Search for information about database migrations"

## Features

- **Semantic Search**: Find relevant information based on meaning, not just keywords
- **Full-Text Search**: Fast keyword-based search
- **Tags & Metadata**: Organize knowledge with tags and custom metadata
- **Persistent Storage**: Data survives across sessions
- **No External Services**: All processing happens locally

## Requirements

- VS Code 1.80.0 or higher
- Node.js 18.0.0 or higher

## Extension Settings

This extension contributes the following settings:

* `mnemosyne.sqlite.databasePath`: Configure where the knowledge database is stored
* `mnemosyne.sqlite.autoInstall`: Enable/disable automatic installation of the MCP server

## Known Issues

None currently. Report issues at: https://github.com/JonahSul/mnemosyne-memory-system/issues

## Release Notes

### 1.0.0

Initial release with:
- MCP server configuration commands
- Knowledge base statistics
- Automatic setup helpers
- Integration with Claude Desktop and Cline

## More Information

- [GitHub Repository](https://github.com/JonahSul/mnemosyne-memory-system)
- [MCP Server Documentation](https://github.com/JonahSul/mnemosyne-memory-system/tree/main/packages/mnemosyne-sqlite)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT License - see LICENSE file for details
