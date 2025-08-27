# Operator / SRE README

Audience

Operators and SRE teams responsible for deploying and operating Mnemosyne.

Operational considerations
- Backups: export vector indexes and metadata on a schedule; store in durable object storage.
- Monitoring: instrument latency, error rates, backup success, and embedding API costs.
- Scaling: choose hosting plan or cluster size based on expected query volume and retention index sizes.

See also
- docs/VENDOR_DEPLOYMENT.md for platform-specific guidance (Azure Functions, Cloudflare, containers)
- DEPLOYMENT.md for deployment recipes