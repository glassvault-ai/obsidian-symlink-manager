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
created_at: 2026-02-15T15:36:48.473555Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

# Delete Inactive Orphan Risk

The February 2026 review recorded an orphan risk in the former removal path: trusting `entry.active` could leave a pointer on disk when metadata had drifted. Its proposed repair was to inspect the filesystem and remove only the expected symlink. In source checked on 2026-11-01 at `25e2f38`, `removeSymlinkEntry` delegates to `Coordinator.remove`, which checks the pointer regardless of the saved enabled preference, commits removal intent, and calls the shared checked unlink path. A matching pointer can be removed even for a disabled mapping; an absent pointer requires no unlink. Conflicting objects are preserved, and Forget removes metadata only. The continuing lesson is to verify disk identity rather than infer it from an enabled flag.

Source: `src/main.ts:95–96`, `src/reliability/coordinator.ts:136–160,207–222`, `src/reliability/files.ts:59–75,117–124`.

Related:
[[Symlink Safety Never Delete the Source Folder]]
[[On-Load Validation of Symlinks]]
[[Clean up broken symlinks on deactivation]]
[[Durable operation intent prevents stale settings from resurrecting links]]
