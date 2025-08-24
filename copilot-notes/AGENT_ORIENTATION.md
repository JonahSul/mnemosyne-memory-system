h# Agent Orientation

Audience: All collaborating agents (Arch, Memory, Tools, etc.)
Status: Current for Foundation v1.2.0

1) Quickstart
- Verify foundation and health:
  - memory_view_foundation → expect Version: 1.2.0
  - memory_sanity_check → expect HEALTHY
- Retrieve orientation materials:
  - memory_search_tiered query="orientation" tierPreference="long-term" threshold=0.01 limit=50
  - memory_search_tiered query="AGENT ORIENTATION PACKAGE" tierPreference="long-term" threshold=0.01 limit=20

2) Behavioral Protocol (immutable intent)
- Request → Check Memory → Respond → Record
- Always: memory_log_claim after material assertions; verify when evidence obtained
- Record violations immediately when procedures are missed; include correction plan
- Synchronization checkpoints after major updates

3) Project Map
- Memory system: Mnemosyne with Cloudflare Vectorize; long-term orientation docs exist
- Key tools: memory_view_foundation, memory_check_behavioral_status, memory_search_tiered, memory_tune_search_thresholds, memory_export_state
- DPO tooling: .mnemosyne/dpo-batch-scheduler.ts; batch JSONL in .mnemosyne/fine-tuning/

4) Threshold Guidance
- 0.01–0.05: inclusive/exploration
- 0.05–0.15: balanced
- 0.15+: precise/selective

5) Troubleshooting Snapshot
- If search=0 results:
  - memory_tune_search_thresholds workloadType="exploration" customThreshold≈0.01–0.05
  - Re-run long-term filtered queries
  - memory_stats_tiered and compare counts vs. search outputs
  - memory_export_state summary for audit

6) Escalation
- If foundation mismatch or fallback:
  - Follow FOUNDATION_INTEGRITY_RUNBOOK.md
- If persistent retrieval inconsistencies:
  - Open checkpoint entry in agent-coordination-checkpoint.md and notify collaborating agents
