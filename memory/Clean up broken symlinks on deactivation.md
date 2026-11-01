---
note_id: 20260215-0326-be445970
type: lesson
status: resolved
tags:
- validation
- broken-symlink
- safety
- bugfix
scope: project
created_at: 2026-02-15T03:26:43.709161Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

The February 2026 note prescribed unlinking a broken pointer when the old startup validator deactivated a missing-source entry, because a leftover pointer could block later recreation. This is historical implementation guidance, not the current missing-source policy. In source checked on 2026-11-01 at `25e2f38`, startup and Refresh use the shared coordinator, retain the mapping and desired enabled preference when a source is unavailable, and report observed health separately. Missing source alone does not request pointer deletion or disablement. Reconciliation of saved disabled intent, explicit disable, or Remove checks the expected pointer identity before unlinking; an existing matching pointer can be accepted on enable once source admission succeeds. Preserve the lesson that metadata and disk state can diverge, without restoring the old automatic-deactivation recipe.

Source: `src/main.ts:27–28,98–102`, `src/reliability/coordinator.ts:44–59,84–95,162–180`, `src/reliability/files.ts:47–56,99–124`.

Related:
[[On-Load Validation of Symlinks]]
[[Symlink Safety Overwrite Protection]]
[[Desired symlink state survives unavailable sources]]
