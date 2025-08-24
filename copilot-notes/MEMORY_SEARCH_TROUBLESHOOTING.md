# Memory Search Troubleshooting

Symptoms
- Expected items return 0 results
- Inconsistent counts between search results and tier stats
- Guidance mentions different foundation version than system reports

Checklist
1) Tune thresholds
- memory_tune_search_thresholds workloadType="exploration" customThreshold=0.01–0.05
2) Target long-term orientation items
- memory_search_tiered query="orientation" tierPreference="long-term" threshold=0.01 limit=50
- memory_search_tiered query="AGENT ORIENTATION PACKAGE" tierPreference="long-term" threshold=0.01 limit=20
3) Validate stats vs. results
- memory_stats_tiered → compare counts to search outputs
4) Sanity and export
- memory_sanity_check (autoCorrect=true)
- memory_export_state format="summary"
5) Backfill / Snapshot restore (when available)
- memory_backfill_from_vector_store preserveTimestamps=true restoreFoundation=true
- memory_restore_from_snapshots (if snapshots exist)

Escalation
- Record claims for discrepancies and verification evidence
- Add a checkpoint entry in agent-coordination-checkpoint.md if inconsistency persists across sessions
