---
note_id: 20260215-0339-8f0fc8a7
type: fact
status: active
tags:
- symlink-plugin
- v1
- milestone
- summary
scope: project
created_at: '2026-02-15T03:39:42.792284+00:00'
created_by: ai-agent
---

The Obsidian Symlink Manager plugin is feature-complete and live-tested. Four source files: types.ts (data model), symlink-manager.ts (pure fs CRUD), main.ts (plugin class with settings, commands, validation), modals.ts (vault folder picker, toggle picker, delete confirmation), settings.ts (management dashboard). Key features: create symlinks via Electron folder picker + vault folder picker, toggle on/off, delete with confirmation, editable names (unlink-rename-relink), duplicate detection on sourcePath, on-load validation that cleans up broken symlinks and removes stale entries. Safety: loop prevention, overwrite protection, lstat-based symlink detection, never uses rm/rmdir. Bugs found in live testing: FuzzySuggestModal onClose fires before onChooseItem (fix: setTimeout), existsSync follows symlinks missing broken pointers (fix: lstatSync), settings tab needs display() refresh after create flow, name onChange too aggressive (fix: blur event).

Related:
[[Obsidian Symlink Plugin — Project Overview]]
[[The Create Symlink Flow]]
[[Delete Confirmation Before Removing Symlink]]