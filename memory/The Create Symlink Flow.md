---
note_id: 20260215-0126-eb206898
type: fact
status: implemented
tags:
- create-flow
- ux
- modal
- architecture
scope: project
created_at: 2026-02-15T01:26:30.985426Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

Creating a symlink spans modals and core logic. In source checked on 2026-11-01 at `25e2f38`: (1) The user starts from the command palette, ribbon or settings Add button; (2) the Electron folder picker selects the external source; (3) cancellation aborts silently; (4) a FuzzySuggestModal selects the vault destination folder; (5) the entry gets a unique ID, a name defaulting to the source folder's basename, and enabled intent; (6) the coordinator checks source admission, containment, overlap and destination occupancy; (7) it commits desired state and pending operation intent to the checksummed recovery store before mutating the filesystem; (8) the shared boundary rechecks admission and creates the pointer asynchronously if absent, then the coordinator commits completion and clears pending intent; (9) a Notice reports the result and an open settings tab refreshes. Legacy `data.json` is migration input and remains untouched; current state uses the two recovery snapshots. Failures show a meaningful Notice and preserve any durable pending intent for recovery. This describes source implementation, not a fresh installed/native flow test.

Source: `src/main.ts:27–28,33–38,50–75`, `src/modals.ts:39–57`, `src/settings.ts:9–20`, `src/reliability/coordinator.ts:36–55,129–160,199–205`, `src/reliability/files.ts:77–97,107–115`, `src/reliability/store.ts:25–30,98–147`.

Related:
[[Electron Dialog for Source Folder Selection]]
[[FuzzySuggestModal for Vault Path Selection]]
[[Symlink Safety Overwrite Protection]]
[[Durable operation intent prevents stale settings from resurrecting links]]
[[Incomplete recovery generations must never trigger legacy replay]]
