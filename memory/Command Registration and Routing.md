---
note_id: 20260215-0126-665129dd
type: fact
status: active
tags:
- obsidian
- commands
- command-palette
- architecture
scope: project
created_at: '2026-02-15T01:26:10.412243+00:00'
created_by: ai-agent
---

Obsidian commands are registered via this.addCommand() in onload(). Each command gets an id (kebab-case, prefixed by plugin id automatically) and a name (shown in command palette). The callback function is where we route to core engine logic. Four commands: (1) 'link-external-folder' opens the create flow (folder picker → vault picker → create symlink), (2) 'toggle-symlink' opens a FuzzySuggestModal listing all symlink names so the user can pick one to toggle, (3) 'toggle-all-on' activates all symlinks, (4) 'toggle-all-off' deactivates all. Commands should show Notice on success/failure. The command palette is Cmd+P — these are the power-user shortcuts that supplement the settings tab.

Related:
[[Core Engine Module Separation]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[The Create Symlink Flow]]