---
note_id: 20260215-0126-ee7aca51
type: fact
status: active
tags:
- obsidian
- ribbon
- ui
- ux
scope: project
created_at: '2026-02-15T01:26:40.134886+00:00'
created_by: ai-agent
---

A ribbon icon gives one-click access to the most common action. The ribbon is the left sidebar icon strip in Obsidian. Register via this.addRibbonIcon(iconId, tooltip, callback). Obsidian uses Lucide icons — 'link' or 'folder-symlink' are good candidates. The click callback should open the create-symlink flow (same as the 'Link external folder' command). This is a convenience shortcut — the same action is available via command palette and settings tab. The ribbon icon is optional but makes the plugin feel more integrated.

Related:
[[The Create Symlink Flow]]
[[Command Registration and Routing]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]