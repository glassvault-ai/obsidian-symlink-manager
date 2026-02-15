---
note_id: 20260215-0326-be445970
type: lesson
status: active
tags:
- validation
- broken-symlink
- safety
- bugfix
scope: project
created_at: '2026-02-15T03:26:43.709161+00:00'
created_by: ai-agent
---

When validateSymlinksOnLoad detects a missing source folder and deactivates an entry, it must also remove the broken symlink from disk. Without this, the dead symlink pointer sits in the vault folder and blocks re-creation when the user fixes the source and tries to toggle back on (overwrite protection sees the existing symlink and errors). The fix: call removeSymlink() on the entry before setting active=false when sourceExists is false but symlinkExists is true. This is safe — unlinkSync on a broken symlink just removes the dead pointer. Additionally, toggleSymlink's turn-on path now checks if a valid symlink already exists pointing to the correct source and accepts it as-is, as a belt-and-suspenders approach.

Related:
[[On-Load Validation of Symlinks]]
[[Symlink Safety Overwrite Protection]]