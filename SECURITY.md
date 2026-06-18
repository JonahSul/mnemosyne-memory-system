# Security Policy

## Reporting a Vulnerability

Report vulnerabilities to **https://github.com/JonahSul/mnemosyne-memory-system/security/advisories**.

Do not open public issues for security bugs.

## Scope

- Core memory system (`@mnemosyne/core`)
- Cloudflare adapter (`@mnemosyne/cloudflare`)
- MCP server (`@mnemosyne/mcp`, `@mnemosyne/sqlite`)
- Pub/sub system (`@mnemosyne/pubsub`)
- VS Code extension (`mnemosyne-sqlite-vscode`)

## Supported Versions

| Version | Supported |
|---------|-----------|
| >= 1.0.0 (latest) | ✅ |
| < 1.0.0 | ❌ |

## Best Practices

- Keep dependencies updated via `pnpm audit`
- Use `npm_token` scoped to publish-only for CI
- Validate inputs to all MCP tool endpoints
- DB files written by `@mnemosyne/sqlite` are local-only; secure the parent directory
