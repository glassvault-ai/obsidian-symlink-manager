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
created_at: 2026-02-15T02:51:14.503634Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

The February 2026 decision called for a named confirmation before removing a managed link, to prevent accidental removal from a settings misclick. In source checked on 2026-11-01 at `25e2f38`, the settings trash button calls `confirmRemoval`, which awaits a `ConfirmDeleteModal` naming the entry and only then calls the coordinator's `remove`. Cancel or closing the modal does not start removal. The modal offers Remove and Cancel; Forget has a separate confirmation explaining that it removes metadata only and leaves pointers untouched. This records the implemented UI gate, not a fresh native acceptance result.

Source: `src/settings.ts:50–58`, `src/main.ts:87–96`, `src/modals.ts:76–99`.

Related:
[[Obsidian PluginSettingTab Pattern]]
[[Symlink Safety Never Delete the Source Folder]]
