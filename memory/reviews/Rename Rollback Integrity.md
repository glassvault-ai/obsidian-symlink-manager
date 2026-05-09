---
note_id: 20260215-1536-e28ebb68
type: lesson
status: resolved
tags:
- code-review
- symlink-plugin
- rename
- rollback
- state-integrity
scope: project
created_at: 2026-02-15T15:36:39.501616Z
updated_at: 2026-05-09T23:21:28.528041Z
created_by: ai-agent
---

# Rename Rollback Integrity

`renameSymlinkEntry` in `src/main.ts` rolls back on failure by restoring `entry.name` and calling `createSymlink(restoreParams)`, but it doesn't check whether the restore actually succeeded. If both the rename and the rollback fail, `entry.active` stays true while no symlink exists on disk — the settings UI shows an active entry that's actually broken. The rollback should check the restore result and set `entry.active = false` with a clear notice if it fails, then persist state. This is a low-probability edge case (requires two consecutive fs failures) but the state divergence it creates is hard to debug.

Related:
[[Settings tab must refresh after create flow]]
[[Clean up broken symlinks on deactivation]]