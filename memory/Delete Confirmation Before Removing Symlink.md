---
note_id: 20260215-0251-20664c41
type: decision
status: implemented
tags:
- phase-4
- delete-confirmation
- safety
- ux
scope: project
created_at: '2026-02-15T02:51:14.503634+00:00'
created_by: ai-agent
---

The settings tab trash icon currently removes a symlink immediately with no confirmation. For a community plugin this is too risky — one misclick permanently deletes the managed entry and unlinks from disk. Add a confirmation step before calling plugin.removeSymlinkEntry(). Obsidian doesn't have a built-in confirm dialog, but we can use a simple Modal subclass with 'Delete' and 'Cancel' buttons, or use the native confirm() which works in Electron. The confirmation should name the symlink being deleted so the user knows what they're confirming. The delete button in settings.ts calls this confirmation, and only proceeds to removeSymlinkEntry on confirm. Keep it simple — this is a safety gate, not a feature.

Related:
[[Obsidian PluginSettingTab Pattern]]
[[Symlink Safety Never Delete the Source Folder]]