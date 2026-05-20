#!/bin/bash
# Quick install script for Mnemosyne SQLite MCP Server

set -e

echo "🧠 Mnemosyne SQLite MCP Server - Quick Install"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required (found: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Ask for installation method
echo "Choose installation method:"
echo "1. Global installation (recommended for MCP server)"
echo "2. Local installation (for library usage)"
echo "3. Just show configuration (use with npx)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Installing globally..."
        npm install -g @mnemosyne/sqlite
        
        echo ""
        echo "✅ Installation complete!"
        echo ""
        echo "To use with MCP clients (e.g., Claude Desktop), add this configuration:"
        echo ""
        cat << 'EOF'
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
EOF
        ;;
    2)
        echo ""
        echo "📦 Installing locally..."
        npm install @mnemosyne/sqlite
        
        echo ""
        echo "✅ Installation complete!"
        echo ""
        echo "Use in your code:"
        echo ""
        cat << 'EOF'
import { SqliteVectorStore } from '@mnemosyne/sqlite';

const store = new SqliteVectorStore({
  databasePath: './knowledge.db'
});
EOF
        ;;
    3)
        echo ""
        echo "📋 Using with npx (no installation needed):"
        echo ""
        cat << 'EOF'
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
EOF
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📖 For more information, visit:"
echo "   https://github.com/JonahSul/mnemosyne-memory-system/tree/main/packages/mnemosyne-sqlite"
