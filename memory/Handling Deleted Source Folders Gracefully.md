---
note_id: 20260215-0127-0d270223
type: decision
status: superseded
tags:
- safety
- resilience
- source-deleted
- ux
scope: project
created_at: 2026-02-15T01:27:10.453344Z
updated_at: 2026-05-09T23:21:28.501336Z
created_by: ai-agent
---

A disconnected drive, renamed folder or permission failure must preserve the mapping. The reliability model preserves the enabled preference as well: health communicates that it cannot currently be realized. On startup or explicit Refresh, accessible sources are revalidated before restoring a missing pointer. Conflicts never authorize automatic replacement.

This extends the original instruction to keep unavailable entries rather than delete them. The old instruction to set active=false is superseded by separate desired state and observed health, so reconnecting a source does not silently lose the user’s preference. See src/reliability/coordinator.ts for reconciliation and src/settings.ts for the presentation.

Related:
[[Desired symlink state survives unavailable sources]]
[[On-Load Validation of Symlinks]]
[[Symlink Safety Never Delete the Source Folder]]
