---
note_id: 20260215-0141-44697ee1
type: fact
status: active
tags:
- phase-3
- commands
- registration
- implementation
scope: project
created_at: '2026-02-15T01:41:57.069822+00:00'
created_by: ai-agent
---

Phase 3 registers four commands via this.addCommand() in onload(). (1) 'link-external-folder': triggers createSymlinkFromPicker() — the full create flow with both pickers. (2) 'toggle-symlink': opens the toggle FuzzySuggestModal to pick a symlink and flip it. Guard: if no symlinks exist, show Notice and return. (3) 'enable-all-symlinks': calls toggleAll(true). (4) 'disable-all-symlinks': calls toggleAll(false). Command names shown in palette should be prefixed with 'Symlink Manager: ' for discoverability. IDs are auto-prefixed by Obsidian with the plugin id, so use simple kebab-case. All four commands call existing public API methods on the plugin — no new logic needed, just wiring.