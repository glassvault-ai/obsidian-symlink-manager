---
note_id: 20260215-0125-666e3112
type: decision
status: implemented
tags:
- safety
- symlink
- overwrite
- validation
scope: project
created_at: 2026-02-15T01:25:30.444782Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

Never overwrite an occupied destination when creating a managed symlink. In source checked on 2026-11-01 at `25e2f38`, the shared filesystem boundary uses asynchronous `lstat` and `readlink` checks, so a broken pointer still counts as an existing object. Adding a mapping requires an absent destination; a real file, directory or existing link is rejected. Enabling an existing mapping may accept a pointer only after source admission and verification that it matches the expected source. A foreign pointer is a conflict and is preserved. There is no offer-to-replace flow: Forget removes metadata only. These checks and the filesystem create operation enforce refusal rather than silent overwrite; they do not certify immunity to every concurrent filesystem race.

Source: `src/reliability/files.ts:59–75,77–97,107–124`, `src/reliability/coordinator.ts:162–180,199–222,224–235`.

Related:
[[Symlink vs Directory Detection with lstatSync]]
[[The Create Symlink Flow]]
[[Symlink Safety Loop Prevention]]
