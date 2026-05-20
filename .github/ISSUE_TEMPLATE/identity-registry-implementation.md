name: Identity Registry Implementation (feature)
about: Implement the identity registry for agent DIDs and role assertions (KV-backed)
labels: feature, backend, infra

---

# Identity Registry: KV-backed DID & Role Store

## Summary
Implement a persistent identity registry that stores agent DIDs, associated public keys, role assertions, reputation metadata, and lifecycle state (active, suspended, revoked). This registry will be used by federation, RBAC checks, and secure knowledge extraction workflows.

## Background
Multiple modules (federation-auth, simplified-registry, secured R2 extraction docs) reference an identity registry that does not yet exist. Current code uses development stubs. A robust KV-backed identity registry is required for production security and to enable role-based authorization checks across the system.

## Proposed Change
- Create an identity-registry module (e.g., `src/modules/identity-registry.ts`) exposing:
  - `registerIdentity(did, publicKey, roles[], metadata)`
  - `getIdentity(did)`
  - `updateRoles(did, roles[])`
  - `revokeIdentity(did, reason)`
  - `listIdentities(filter)`
- Store data in Cloudflare KV with a clear key schema and retention/backup plan
- Ensure the registry supports public-key lookups for JWT verification (JWKS-like behavior)
- Add migration tools and a small admin UI or CLI for identity onboarding and audit

## Acceptance Criteria
- KV schema defined and documented
- API implemented and exercised by unit and integration tests
- federation-auth uses the registry for token/public key lookups
- Role-based checks in `simplified-registry.ts` and `secured-r2-extraction` reference the registry APIs
- Admin procedures documented for onboarding and key rotation

## Implementation Notes
- Consider schema versioning in KV keys (prefix with `identity:v1:`)
- Provide TTL or soft-revocation flag to allow reversible suspension
- Include indexes or secondary KV keys for listing by role and cluster
- Define audit log entries for role changes and revocations (store in R2 or append-only KV key)

## Testing Plan
- Unit tests for CRUD operations, key lookups, and role changes
- Integration test showing token validation against a registry-provided key
- End-to-end test for secured extraction that denies access to non-delegate roles

## Rollout & Migration
- Seed registry with current dev identities
- Migrate any existing identity references from docs/examples into the registry
- Announce key rotation windows and provide tooling for rotating keys

## Security Considerations
- Strict access controls for who can register or modify roles (restrict via deploy-time secrets)
- Ensure public keys are served read-only to validation components
- Protect private keys outside repository (never store private keys in KV)

## Estimate
- 3–7 engineer days (schema design, KV APIs, integration with federation-auth)

---

Attach any design docs, KV size projections, or compliance requirements.