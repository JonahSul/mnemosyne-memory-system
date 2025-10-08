name: JWT Ed25519 Validation (security/bug)
about: Implement robust JWT validation using Ed25519 signatures for federation sessions
labels: security, backend, high-priority

---

# JWT Ed25519 Validation

## Summary
Implement proper JWT validation in the federation authentication layer using Ed25519 signature verification. Replace the current development shim that accepts `dev-token-*` values and perform full JWS verification, key lookup, and claims validation.

## Background
Currently the `src/modules/federation-auth.ts` module contains a development-only token validation path with a TODO placeholder for Ed25519 verification. This leaves the production system vulnerable and prevents secure federation between clusters/agents.

## Proposed Change
- Add a dedicated JWT validation component that:
  - Parses JWS tokens in compact and JSON serialization formats
  - Validates the EdDSA/Ed25519 signature against a known public key or a key fetched from the identity registry
  - Validates required claims (iss, sub, exp, iat, roles/capabilities)
  - Properly handles key rotation, JWKS endpoint discovery, and caching
- Integrate this component into `FederationAuth.validateToken`
- Add environment-configured JWKS / identity registry key material and a secure caching layer

## Acceptance Criteria
- All incoming tokens are cryptographically validated using Ed25519 before a session is considered valid
- Unit tests cover:
  - Valid JWS with Ed25519 signature accepted
  - Invalid signatures rejected
  - Expired/early tokens rejected
  - Missing required claims rejected
- Integration test demonstrating a token signed by a test key being validated by the server
- Code paths for development/test environments are explicit and gated behind well-documented flags

## Implementation Notes
- Consider using a battle-tested library such as `jose` (supports EdDSA/Ed25519) or `tweetnacl` combined with a minimal JWS parser
- Provide a pluggable key provisioning interface so public keys may be sourced from:
  - Local test fixtures (for CI)
  - Configured JWKS URL
  - Identity registry KV store in Cloudflare Workers
- Provide a key rotation strategy with a grace period and clear logging

## Testing Plan
- Unit tests for signature verification and claim validation
- Property tests using randomly-generated Ed25519 keypairs and tokens
- CI job that runs the token validation tests with coverage gated

## Rollout & Migration
- Deploy JWT validation behind a feature flag
- Monitor logs for rejected valid tokens; increase logging during rollout
- Coordinate with any federated clusters for key propagation if a JWKS endpoint is used

## Security Considerations
- Ensure no token material is logged in plaintext
- Use constant-time signature verification to avoid timing attacks (library choice matters)
- Audit third-party crypto libraries for CVEs; pin versions

## Estimate
- 2–4 engineer days (investigate libs, implement, test, rollout)

---

Please include links to relevant design discussions or prior PRs.