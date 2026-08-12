# Local MCP Server — Troubleshooting & Diagnostics

This document captures practical diagnostics, common failure modes, and verification commands for running the local MCP server used by the Mnemosyne development workflow.

## Quick verification (what to run after starting the server)
- Check the server process is listening on the expected port (default 8000):
  - `lsof -iTCP:8000 -sTCP:LISTEN`
- Verify HTTP health and root endpoints:
  - `curl -sS http://localhost:8000/health | jq .`
  - `curl -sS http://localhost:8000/ | jq .`
- Verify MCP memory tools (server exposes these tools internally):
  - `curl -sS -X POST http://localhost:8000/mcp -H 'Content-Type: application/json' -d '{"tool":"foundation_info"}' | jq .`
  - `curl -sS -X POST http://localhost:8000/mcp -H 'Content-Type: application/json' -d '{"tool":"get_stats"}' | jq .`

If these commands return structured JSON and `foundation_info`/`get_stats` respond, the memory subsystem is operational.

## Interpreting the sample server startup log

Example lines you may see and what they mean:

- `Starting Mnemosyne SQLite MCP Server...` — server runtime has begun initialization.
- `Database: /path/to/mnemosyne-knowledge.db` — which SQLite file will be used.
- `Agent UUAD: ...` — the agent unique identifier used for causality/agent records. It can be provided via CLI `--agent-uuad`, env `MNEMOSYNE_AGENT_UUAD`, or a local file `.mnemosyne-agent-uuad`.
- `**AGENT ONRAMP: Call agent_identity first, then foundation_info.**` — Mnemosyne enforces strict onramp ordering for causality and metadata. Always register the agent identity before issuing foundation or memory writes.
- `Server ready for connections` — server completed initialization and accepted incoming requests.
- `Discovered X tools` — MCP tool registration succeeded; the number gives a quick sanity check.

## Common errors & remediation

- Error: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'better-sqlite3'`
  - Cause: the native dependency `better-sqlite3` is missing or the native build failed.
  - Fix:
    1. Run `npm install` at the repository root (or `npm --prefix packages/mnemosyne-sqlite install`).
    2. Ensure macOS build tools are present: `xcode-select --install`.
    3. If compilation fails, check Node version compatibility and consider using `nvm` to match the project's Node version.

- Symptom: `ERR_MODULE_NOT_FOUND` for ESM imports of local packages when using `import('file:...')`.
  - Cause: Node's ESM resolution is sensitive to the working directory and literal file URLs.
  - Fix: Use `import.meta.url` to resolve fallback paths reliably (the project helper `start-mcp.js` does this).

## Development notes (how the verification works)

- The local MCP server is provided by `@mnemosyne/cli` (package `packages/mnemosyne-cli`), which binds the `@mnemosyne/infra-sqlite` adapters to the `@mnemosyne/mcp-server` tool registry.
- Run the local server with `pnpm --filter @mnemosyne/cli start` (or `node packages/mnemosyne-cli/dist/server.js`).
- After the server starts, the recommended verification is to call `memory_init` then `memory_stats` to confirm the memory API is reachable. This is the authoritative verification because the server exposes the same memory tools used during development.

## Recommended additions for clearer UX

- Print a short verification summary to the server stdout after initialization, for example:
  - `Local MCP server verified via memory tools — health: healthy; totalRecords: 35; embeddingDimension: 768`.
- Provide a clearer error message in the VSCode helper when native dependencies are missing, listing the exact remediation steps above.

## Agent onramp (important)

Mnemosyne requires a small registration sequence before performing memory writes. Call order matters:

1. `agent_identity` — register the local agent identity (returns identity metadata and asserts UUAD).
2. `foundation_info` — retrieve foundation protocol and orientation guidance.

Calling `foundation_info` before `agent_identity` will typically result in a logged onramp warning and may block write operations. The server startup log already instructs this order — surface it prominently in developer docs and the VS Code extension UI.

## Where to look for logs

- The LocalProcess / extension-host will capture the server stdout/stderr (example logs shown above).
- The `@mnemosyne/cli` runtime prints early diagnostic lines; if you start the server directly with `node packages/mnemosyne-cli/dist/server.js`, the console will show the same messages.

---

If you want, I can:
- Add the short verification summary to the local CLI (`packages/mnemosyne-cli`) so it prints memory-tool results after startup, or
- Present a friendly remediation dialog when `better-sqlite3` is missing.

Choose one and I'll implement it and commit the change.
