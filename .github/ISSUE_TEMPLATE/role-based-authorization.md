name: Role-Based Authorization & Secured Extraction (feature)
about: Enforce RBAC across secured extraction and administrative tools using identity registry and capabilities
labels: feature, security, medium-priority

---

# Role-Based Authorization & Secured R2 Extraction

## Summary
Implement role-based authorization checks that leverage the identity registry and federation capability definitions. Secure sensitive operations such as knowledge extraction to R2, bulk ingestion, and administrative actions behind capability checks.

## Background
`src/tools/simplified-registry.ts` contains TODO comments to implement role-based checks for secured R2 extraction flows. The system's design defines roles (AGENT, ARBITER, ARCHIVIST, CURATOR, CUSTODIAN) and capabilities, but actual enforcement is incomplete.

## Proposed Change
- Add an RBAC enforcement module that:
  - Resolves an identity's capabilities via the identity registry
  - Checks capabilities against required capability strings
  - Supports policy composition (e.g., "cluster:delegate AND memory:bulk-operations")
- Integrate RBAC checks into:
  - `simplified-registry.ts` secure extraction endpoints
  - Administrative tools (memory_admin, migration endpoints)
- Add an audit trail for authorization decisions

## Acceptance Criteria
- Authorization middleware usable in both Cloudflare Worker and Express server contexts
- Unit tests for positive and negative authorization flows
- Secure extraction flow refuses requests from identities without `cluster:delegate` or similar capability
- Audit logs show requester, action, outcome, and reason

## Implementation Notes
- Use capability strings defined in `ROLE_CAPABILITIES` to avoid duplicate definitions
- Implement short-circuit caching for capability lookups with a TTL
- Provide a way to express capability requirements (simple sets and small DSL for AND/OR)

## Testing Plan
- Unit tests for capability resolution and enforcement
- Integration test exercising extraction flow with a dev-session identity and with a non-authorized identity
- Security review and threat model update

## Rollout & Migration
- Start by enforcing RBAC on low-risk endpoints behind a feature flag
- Widen enforcement gradually to critical flows after monitoring

## Estimate
- 3–6 engineer days (design, implement, test, roll out)

---

Attach policy examples and expected log formats.