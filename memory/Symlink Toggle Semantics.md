---
note_id: 20260215-0125-14a0f6cc
type: decision
status: implemented
tags:
- symlink
- toggle
- ux
- architecture
scope: project
created_at: '2026-02-15T01:25:34.437741+00:00'
created_by: ai-agent
---

Toggling a symlink means creating or removing the filesystem symlink while keeping the SymlinkEntry in data.json. When active=true, the symlink exists on disk and the external folder appears in the vault. When active=false, the symlink is removed from disk (unlinkSync) but the entry persists in settings so the user can re-enable it later without re-configuring. This is the key UX insight: the plugin remembers your connections even when they're off. Toggle-all-on and toggle-all-off batch this operation across all entries, saving once at the end. The toggle operation should show a Notice confirming the action.

Related:
[[data.json Persistence via Obsidian API]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[Obsidian Symlink Plugin — Project Overview]]