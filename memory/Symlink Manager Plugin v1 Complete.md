---
note_id: 20260215-0339-8f0fc8a7
type: fact
status: implemented
tags:
- symlink-plugin
- v1
- milestone
- summary
scope: project
created_at: 2026-02-15T03:39:42.792284Z
updated_at: 2026-11-01T17:02:46.159968Z
created_by: ai-agent
---

At the v1 milestone recorded in this note (created 2026-02-15), the plugin was reported feature-complete and live-tested. The file layout, features and testing lessons below describe that historical milestone. The v1 source modules listed here: types.ts (data model), symlink-manager.ts (pure fs CRUD), main.ts (plugin class with settings, commands, validation), modals.ts (vault folder picker, toggle picker, delete confirmation), settings.ts (management dashboard). Key features at that milestone: create symlinks via Electron folder picker + vault folder picker, toggle on/off, delete with confirmation, editable names (unlink-rename-relink), duplicate detection on sourcePath, on-load validation that cleans up broken symlinks and removes stale entries. Safety: loop prevention, overwrite protection, lstat-based symlink detection, never uses rm/rmdir. Bugs found in live testing: FuzzySuggestModal onClose fires before onChooseItem (fix: setTimeout), existsSync follows symlinks missing broken pointers (fix: lstatSync), settings tab needs display() refresh after create flow, name onChange too aggressive (fix: blur event).

As of the 2026-11-01 read-only check of checkout `7f35066debe2b7c0dca89a4a1ef7349f91581a86` (version 1.0.3), startup and explicit Refresh retain unavailable mappings and their desired enabled preference rather than deleting them solely because the source is unavailable (`src/main.ts:21–29`, `src/reliability/coordinator.ts:44–55,72–95,162–180`, `src/reliability/files.ts:47–56`; `README.md:21–22`). See [[plan 1 — Symlink Manager reliability and review compliance|Plan: Symlink Manager reliability and review compliance]] for the recorded release/install outcome and remaining coverage limits, including pending second-Mac native acceptance; this source check does not establish installed behavior.

Related:
[[Obsidian Symlink Plugin — Project Overview]]
[[The Create Symlink Flow]]
[[Delete Confirmation Before Removing Symlink]]
[[plan 1 — Symlink Manager reliability and review compliance|Plan: Symlink Manager reliability and review compliance]]
