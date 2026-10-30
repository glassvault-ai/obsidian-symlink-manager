---
note_id: 20260215-0125-eb3f3ff1
type: fact
status: outdated
tags:
- obsidian
- data-persistence
- settings
- data-json
scope: project
created_at: 2026-02-15T01:25:11.625635Z
updated_at: 2026-05-09T23:21:28.522729Z
created_by: ai-agent
---

Historical 1.0.2 behavior used Obsidian loadData/saveData to replace the entire settings object after filesystem changes. Awaiting each save was necessary but insufficient: a rejected save could leave old active metadata that recreated a removed link on restart.

The reliability implementation reads legacy data.json once but preserves it. Validated metadata generations become authoritative, with durable operation intent committed before pointer mutation. A missing or corrupt recovery generation cannot silently fall back to legacy settings. This changes downgrade behavior: reverting to the old plugin without reviewing its old settings can replay stale intent. See src/reliability/store.ts and the recovery documentation.

Related:
[[Durable operation intent prevents stale settings from resurrecting links]]
[[Incomplete recovery generations must never trigger legacy replay]]
