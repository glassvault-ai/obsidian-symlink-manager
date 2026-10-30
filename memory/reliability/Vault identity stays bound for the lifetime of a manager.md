---
note_id: 20261030-2125-69ae280f
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T21:25:22.331374Z
created_by: ai-agent
---

An aliased vault root is supported, but its canonical directory must not change beneath an already running manager. LinkFiles.canonicalRoot in src/reliability/files.ts:24 binds the first resolved root and its current device/inode evidence. Later probes reject an alias repoint or observable directory replacement before treating the new tree as the original vault. The regression in tests/safety.test.cjs uses two disposable roots and preserves both sentinels.

This binding is deliberately transient. Persisting device/inode as permanent identity would reject legitimate remounts; persisted recovery instead records the canonical vault path. A new session still needs to validate that location before reconciliation. The binding narrows observed drift, but cannot eliminate another process swapping an ancestor after a check. It is not a filesystem lock or a guarantee against every external race.

Related:
[[Filesystem identity evidence must survive remounts without trusting stale aliases]]
[[Managed link operations require physical destination containment]]