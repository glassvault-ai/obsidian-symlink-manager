---
note_id: 20260215-0125-afc6dfb6
type: fact
status: active
tags:
- obsidian
- settings-tab
- ui
- architecture
scope: project
created_at: '2026-02-15T01:25:59.235217+00:00'
created_by: ai-agent
---

The settings tab is the management dashboard for all symlinks. It extends PluginSettingTab and implements display(), which is called every time the user opens the settings tab. display() clears the container (containerEl.empty()) and re-renders everything — there's no persistent DOM state. Each symlink entry becomes a Setting with: name field (text input for renaming), description showing source → vault path, a toggle for active state, and a delete button via addExtraButton. The 'Add new symlink' button at the top or bottom triggers the create flow (folder picker modal). Since display() rebuilds from scratch, any mutation to the data model just needs to call display() again to refresh.

Related:
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[Obsidian Symlink Plugin — Project Overview]]
[[data.json Persistence via Obsidian API]]