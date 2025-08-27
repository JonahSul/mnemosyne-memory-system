# Architect README

Audience

System architects and solution designers evaluating integration and long-term architecture.

Guidance
- Review data flow: ingestion -> embeddings -> vector storage -> query/recall.
- Consider scalability: choose container/Kubernetes for high throughput; serverless for low budget prototypes.
- Governance: map data residency and retention policies to your compliance requirements.

Integration points
- Embedding/model provider, vector DB, authentication gateway, logging/telemetry.

Recommended reading
- docs/VENDOR_DEPLOYMENT.md for vendor-specific guidance
- docs/EXECUTIVE_SUMMARY.md for decision criteria and pilot recommendations