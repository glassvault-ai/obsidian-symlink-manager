---
note_id: 20260215-1536-ab816d8e
type: lesson
status: active
tags:
- code-review
- symlink-plugin
- toggle
- path-normalization
- edge-case
scope: project
created_at: '2026-02-15T15:36:45.508043+00:00'
created_by: ai-agent
---

# Toggle Path Normalization Edge Case

In `src/symlink-manager.ts`, toggle-on checks whether an existing symlink points to the correct source by comparing `path.resolve(linkTarget)` against `path.resolve(entry.sourcePath)`. If platform-specific path formatting creates normalization differences (trailing slashes, case sensitivity on Windows, relative vs absolute link targets), the comparison returns false even though the symlink is correct. The code then falls through to `validateCreate`, which rejects because the target already exists — blocking reactivation with a confusing "already exists" error. Normalizing both sides more aggressively (realpath, consistent separators) or treating an existing valid directory symlink as success regardless of exact path string equality would prevent this dead end. Most likely to surface on Windows where junctions store paths differently.

Related:
[[Symlink Toggle Semantics]]
[[Clean up broken symlinks on deactivation]]
[[Symlink Safety Loop Prevention]]
