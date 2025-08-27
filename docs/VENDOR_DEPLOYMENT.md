# Vendor Deployment Guidance

Overview

This document summarizes deployment options (Cloudflare Workers, Azure Functions, containers) and provides actionable guidance for deploying Mnemosyne, with a focused section on Azure Functions and known "free‑tier traps." Operators should read this before production deployment.

High-level options
- Cloudflare Workers: good for edge latency and simple serverless deployments.
- Azure Functions: flexible serverless with strong platform integrations (Storage, Cosmos, App Insights).
- Containers / Kubernetes: recommended for high-throughput or long-running workloads.

Azure Functions guidance (practical)
- Recommended hosting: Premium Plan (or Elastic Premium) for production to avoid cold-starts and to support pre-warmed instances. Consumption can work for prototypes but expect variability.
- Required resources: Storage Account (for general app needs), Application Insights (telemetry), Key Vault (secret management), and optionally Cosmos DB or Azure Blob for vector/metadata storage.
- Example environment variables (not secrets): MNEMOSYNE_TIER_CONFIG, VECTOR_BACKUP_PATH, EMBEDDING_MODEL (document where embedding is performed — in-worker or external API).
- Deployment notes: avoid relying on the function filesystem for persistent vector indexes — use remote storage or a managed vector service. For long-running jobs, use durable functions or containerized workers.

Free‑tier traps and mitigations
- Cold starts and latency spikes: test under realistic load; consider Premium plan or keep-alive pings for critical endpoints.
- Ephemeral filesystem: do not assume local disk persistence; store vector indexes and metadata in durable storage (Blob, Cosmos, external vector DB).
- Execution timeouts: serverless functions have max execution times — move heavy index builds or long-running tasks to containerized jobs or Durable Functions.
- Connection limits / concurrency: serverless environments may limit outbound connections; use connection pooling and retry with exponential backoff.
- Hidden costs: watch for egress, per-request model/embedding API costs, and I/O charges; include cost monitoring in pilot.
- Quotas & throttling: benchmark against quotas, plan for backoff, and include fallback behaviors.

Operational checklist before production
- Choose hosting plan based on latency and scaling needs.
- Configure monitoring and alerts (Application Insights, custom metrics for vector-backup success).
- Implement backups and periodic exports to external durable storage.
- Test failure modes: storage unavailability, embedding API errors, and rate-limited conditions.

References & further reading
- Azure Functions hosting plans and cold start docs
- Provider cost and quota pages (Azure, Cloudflare, etc.)
