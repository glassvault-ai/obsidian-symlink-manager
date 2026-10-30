---
note_id: 20260215-0125-606c4f22
type: decision
status: superseded
tags:
- safety
- symlink
- loops
- validation
scope: project
created_at: 2026-02-15T01:25:21.064702Z
updated_at: 2026-05-09T23:21:28.516118Z
created_by: ai-agent
---

The original loop-prevention design compared resolved path spelling against the vault root. That admits aliases of the vault and overlooks overlapping external roots and linked destination ancestors. The reliability design requires canonical source identity, disjoint configured roots, and physical destination containment before creation or restoration.

An unavailable path is uncertainty rather than evidence of safety. Previously verified canonical locations help preserve reservations, while uncertain legacy aliases defer admission. Source trees are not recursively scanned, so arbitrary unmanaged nested cycles remain outside this guarantee. See src/reliability/files.ts for the shared boundary.

Related:
[[Managed link operations require physical destination containment]]
[[Filesystem identity evidence must survive remounts without trusting stale aliases]]
