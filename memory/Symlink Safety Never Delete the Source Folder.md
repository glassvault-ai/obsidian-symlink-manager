---
note_id: 20260215-0125-a115af75
type: decision
status: implemented
tags:
- safety
- symlink
- fs
- critical
scope: project
created_at: 2026-02-15T01:25:16.786919Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

The critical safety constraint is to remove only a verified managed symlink pointer, never its source directory or contents. Unlinking the pointer does not delete its target. Do not resolve the pointer and then delete that target, or use recursive removal for managed-link operations. In source checked on 2026-11-01 at `25e2f38`, `LinkFiles.disable` uses asynchronous `disk.unlink`, backed by Node's `fs.promises`, after checking that the pointer matches the expected source and rechecking its filesystem identity. A real file, directory or foreign link is a conflict and must be preserved. The rule is pointer-only unlink with those checks, not a requirement to use `unlinkSync`. These checks are not a universal guarantee against concurrent filesystem changes.

Source: `src/reliability/files.ts:1–12,21,59–75,117–124`.

Related:
[[Symlink Safety Overwrite Protection]]
[[Symlink Safety Loop Prevention]]
[[On-Load Validation of Symlinks]]
