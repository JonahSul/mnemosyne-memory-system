# Security Policy

## Reporting a Vulnerability

Report vulnerabilities to **https://github.com/JonahSul/mnemosyne-memory-system/security/advisories**.

Do not open public issues for security bugs.

## Scope

- Core domain model (`@mnemosyne/core`)
- Cloudflare adapters (`@mnemosyne/infra-cloudflare`)
- SQLite adapters (`@mnemosyne/infra-sqlite`)
- MCP server (`@mnemosyne/mcp-server`)
- Streaming (`@mnemosyne/streaming`)
- Pub/sub system (`@mnemosyne/pubsub`)
- SaaS Worker (`@mnemosyne/saas`)
- CLI (`@mnemosyne/cli`)

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
