---
note_id: 20260215-0320-38699e0f
type: lesson
status: active
tags:
- settings
- display-refresh
- ux
- lesson
scope: project
created_at: '2026-02-15T03:20:25.177866+00:00'
created_by: ai-agent
---

When the Add button in the settings tab triggers createSymlinkFromPicker(), the new entry doesn't appear in the settings list until the tab is closed and reopened. This is because display() rebuilds from data but isn't called after the create flow completes. Fix: the onClick handler must await createSymlinkFromPicker() then call this.display(). Same pattern as the toggle and delete handlers. Any settings tab action that mutates the symlinks array needs to end with this.display() to refresh.

Related:
[[Obsidian PluginSettingTab Pattern]]
[[Phase 3 Modifies main.ts createSymlinkFromPicker]]
[[data.json Persistence via Obsidian API]]