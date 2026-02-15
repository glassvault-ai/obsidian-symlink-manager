---
note_id: 20260215-0334-e4d56d28
type: lesson
status: active
tags:
- node-fs
- symlink
- lstat
- existssync
- bugfix
scope: project
created_at: '2026-02-15T03:34:03.481162+00:00'
created_by: ai-agent
---

fs.existsSync() follows symlinks: if the symlink target doesn't exist (broken symlink), existsSync returns false even though the symlink pointer is still on disk. This caused removeSymlink() to skip cleanup of broken symlinks, thinking they were already gone. Fix: use lstatSync() which examines the symlink itself, not its target. lstatSync succeeds on broken symlinks and isSymbolicLink() returns true. This is the same statSync vs lstatSync distinction documented in the vault but applied to the removal path, not just detection. The lesson: anywhere you check 'does this symlink exist on disk,' use lstatSync, never existsSync.

Related:
[[Clean up broken symlinks on deactivation]]
[[Symlink vs Directory Detection with lstatSync]]