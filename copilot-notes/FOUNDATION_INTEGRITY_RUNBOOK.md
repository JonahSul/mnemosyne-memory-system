# Foundation Integrity Runbook (v1.2.0)

Objective: Ensure Foundation v1.2.0 remains applied and prevent fallback to v1.0.0.

Verification
- memory_view_foundation → expect Version: 1.2.0
- memory_sanity_check → expect HEALTHY and foundation.version=1.2.0

Repair (apply/lock v1.2.0)
- Deploy migration to lock v1.2.0 and forbid downgrade:
  - memory_update_foundation with migration:
    - version: 1.2.0
    - policy: allowDowngrade=false, stickyAcrossSessions=true
    - boot self-check: if version!=1.2.0 then reapply and record violation
    - snapshot on apply and shutdown

Post-Apply Checks
- memory_view_foundation → confirm 1.2.0
- memory_sanity_check → confirm healthy
- memory_export_state summary for evidence

Monitoring
- After cold start, immediately:
  - memory_view_foundation and memory_sanity_check
  - If auto-reapply occurred, review violation log and migration timestamp

Rollback
- Not recommended to downgrade below 1.2.0. If emergency rollback needed, document rationale in agent-coordination-checkpoint.md and create explicit migration reversing lock.

Notes
- Keep this runbook in copilot-notes to ensure availability even if memory retrieval is degraded.
