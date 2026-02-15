---
note_id: 20260215-1536-b60c5fe2
type: lesson
status: resolved
tags:
- code-review
- symlink-plugin
- delete
- orphaned-symlink
- state-drift
scope: project
created_at: '2026-02-15T15:36:48.473555+00:00'
created_by: ai-agent
---

# Delete Inactive Orphan Risk

`removeSymlinkEntry` in `src/main.ts` only calls `removeSymlink` when `entry.active` is true. If metadata has drifted (active is false but the symlink still exists on disk — possible after a crash or interrupted toggle), deleting the entry leaves an orphaned, unmanaged symlink in the vault with no settings entry tracking it. A safer approach would check the actual filesystem state with `lstat` during deletion and unlink if a symlink exists pointing to the expected source, regardless of the `active` flag. The existing `removeSymlink` function already has the safety guard against removing non-symlink paths, so this change would be low-risk.

Related:
[[Symlink Safety Never Delete the Source Folder]]
[[On-Load Validation of Symlinks]]
[[Clean up broken symlinks on deactivation]]
