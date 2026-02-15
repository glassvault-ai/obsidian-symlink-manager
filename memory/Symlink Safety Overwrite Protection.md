---
note_id: 20260215-0125-666e3112
type: decision
status: active
tags:
- safety
- symlink
- overwrite
- validation
scope: project
created_at: '2026-02-15T01:25:30.444782+00:00'
created_by: ai-agent
---

Before creating a symlink at a vault path, we must check that nothing already exists there. If a real folder (not a symlink) exists at the target path, creating a symlink would fail anyway (EEXIST), but we should catch this ourselves with a clear error message rather than letting the fs error bubble up. Check with fs.existsSync() first. If a symlink already exists at that path (from a previous session or manual creation), we should also detect this via lstatSync().isSymbolicLink() and handle it — either warn the user or offer to replace it. Never silently overwrite.

Related:
[[Symlink vs Directory Detection with lstatSync]]
[[The Create Symlink Flow]]
[[Symlink Safety Loop Prevention]]