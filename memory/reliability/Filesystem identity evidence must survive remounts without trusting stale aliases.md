---
note_id: 20261030-2102-90627556
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T21:02:01.376901Z
created_by: ai-agent
---

Filesystem identity serves two different purposes. Device and inode observations can prove two currently accessible paths refer to the same object, but volatile device assignments cannot be the sole identity persisted across remounts. The manager therefore retains the verified canonical source path while preserving the selected path for display and later revalidation.

A selected alias that resolves somewhere new is a conflict, not an automatic change of managed source. A disconnected source retains its last verified location and desired state. Removal of a dangling pointer can compare its normalized link text without requiring its target to be mounted. Permission failures must remain distinct from absence. The shared boundary is src/reliability/files.ts:45, with record validation in src/reliability/model.ts:39.

Related:
[[Managed link operations require physical destination containment]]
[[Desired symlink state survives unavailable sources]]