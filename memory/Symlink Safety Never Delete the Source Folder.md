---
note_id: 20260215-0125-a115af75
type: decision
status: active
tags:
- safety
- symlink
- fs
- critical
scope: project
created_at: '2026-02-15T01:25:16.786919+00:00'
created_by: ai-agent
---

The most critical safety constraint in this plugin. fs.unlinkSync() on a symlink removes the symlink pointer, NOT the target directory it points to. This is safe. But we must NEVER call fs.rmSync, fs.rmdirSync, or any recursive delete on a symlink path — if the symlink is resolved first, it would delete the actual source folder's contents. The rule: only ever use unlinkSync to remove symlinks. No rm, no rmdir, no recursive anything. This should be the only fs removal function in the entire codebase. A code review red flag is any import or use of rmSync or rmdirSync.

Related:
[[Symlink Safety Overwrite Protection]]
[[Symlink Safety Loop Prevention]]
[[On-Load Validation of Symlinks]]