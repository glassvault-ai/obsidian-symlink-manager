---
note_id: 20260215-1536-ab816d8e
type: lesson
status: resolved
tags:
- code-review
- symlink-plugin
- toggle
- path-normalization
- edge-case
scope: project
created_at: 2026-02-15T15:36:45.508043Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

# Toggle Path Normalization Edge Case

The February 2026 review hypothesized that the former toggle-on path could reject a correct link because of path spelling differences, particularly on Windows. Its suggestion to accept any valid directory symlink was a review proposal, not permission to trust an unrelated target. In source checked on 2026-11-01 at `25e2f38`, `src/symlink-manager.ts` only re-exports the shared reliability classes. `LinkFiles.link` resolves relative link text against the pointer's parent, compares it with the expected source, and tries canonical `realpath` comparison when necessary. Re-enabling first admits the source and accepts only a matching pointer; a different target remains a conflict. Preserve source-identity checks rather than bypassing them to normalize paths. This source account does not establish Windows or other native platform acceptance.

Source: `src/symlink-manager.ts:1–3`, `src/reliability/files.ts:47–56,59–75,77–97,107–115`, `src/reliability/coordinator.ts:162–180`.

Related:
[[Symlink Toggle Semantics]]
[[Clean up broken symlinks on deactivation]]
[[Symlink Safety Loop Prevention]]
[[Symlink Safety Overwrite Protection]]
