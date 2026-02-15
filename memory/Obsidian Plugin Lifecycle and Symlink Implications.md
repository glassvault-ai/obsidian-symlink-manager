---
note_id: 20260215-0124-5a470511
type: decision
status: implemented
tags:
- obsidian
- plugin-lifecycle
- architecture
scope: project
created_at: '2026-02-15T01:24:51.012754+00:00'
created_by: ai-agent
---

Obsidian plugins have two critical lifecycle hooks: onload() and onunload(). onload() fires when the plugin activates — this is where we register commands, add the settings tab, add the ribbon icon, and run startup validation (checking if all managed symlinks are still intact on disk). onunload() fires when the plugin is disabled or Obsidian closes — we should NOT auto-remove symlinks here because the user may want them to persist even when the plugin is off. The symlinks are filesystem state managed by the plugin, not owned by it. The plugin is a manager, not the thing itself. This means toggling the plugin off in Obsidian settings should not nuke all the user's symlinks.

Related:
[[On-Load Validation of Symlinks]]
[[Command Registration and Routing]]
[[Ribbon Icon for Quick Access]]