@echo off
REM Quick install script for Mnemosyne SQLite MCP Server (Windows)

echo 🧠 Mnemosyne SQLite MCP Server - Quick Install
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js detected
echo.

echo Choose installation method:
echo 1. Global installation (recommended for MCP server)
echo 2. Local installation (for library usage)
echo 3. Just show configuration (use with npx)
set /p choice="Enter choice [1-3]: "

if "%choice%"=="1" (
    echo.
    echo 📦 Installing globally...
    call npm install -g @mnemosyne/sqlite
    
    echo.
    echo ✅ Installation complete!
    echo.
    echo To use with MCP clients (e.g., Claude Desktop), add this configuration:
    echo.
    echo {
    echo   "mcpServers": {
    echo     "mnemosyne-sqlite": {
    echo       "command": "mnemosyne-sqlite",
    echo       "env": {
    echo         "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
    echo       }
    echo     }
    echo   }
    echo }
) else if "%choice%"=="2" (
    echo.
    echo 📦 Installing locally...
    call npm install @mnemosyne/sqlite
    
    echo.
    echo ✅ Installation complete!
    echo.
    echo Use in your code:
    echo.
    echo import { SqliteVectorStore } from '@mnemosyne/sqlite';
    echo.
    echo const store = new SqliteVectorStore({
    echo   databasePath: './knowledge.db'
    echo });
) else if "%choice%"=="3" (
    echo.
    echo 📋 Using with npx (no installation needed):
    echo.
    echo {
    echo   "mcpServers": {
    echo     "mnemosyne-sqlite": {
    echo       "command": "npx",
    echo       "args": ["-y", "@mnemosyne/sqlite"],
    echo       "env": {
    echo         "MNEMOSYNE_DB_PATH": "./project-knowledge.db"
    echo       }
    echo     }
    echo   }
    echo }
) else (
    echo Invalid choice
    exit /b 1
)

echo.
echo 📖 For more information, visit:
echo    https://github.com/JonahSul/mnemosyne-memory-system/tree/main/packages/mnemosyne-sqlite
