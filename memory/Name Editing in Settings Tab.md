---
note_id: 20260215-0251-7d90c740
type: decision
status: implemented
tags:
- phase-4
- name-editing
- settings
- rename
scope: project
created_at: '2026-02-15T02:51:25.701961+00:00'
created_by: ai-agent
---

PLAN.md specifies that symlink names should be editable in the settings tab. Renaming is more than a display change — the name is part of the symlink's filesystem path (vaultBasePath + vaultPath + name). So renaming means: (1) remove the old symlink from disk if active, (2) update entry.name in data.json, (3) recreate the symlink at the new path if it was active. This is essentially an unlink-rename-relink operation. The UI is a text input field in each Setting row. On change (with debounce or on blur), validate the new name (no empty, no path separators, no duplicates at the same vault location), then perform the rename. If the rename fails (e.g., new name conflicts with existing file), revert the name and show a Notice. The text input replaces the static name display in the Setting's name field.

Related:
[[Obsidian PluginSettingTab Pattern]]
[[Vault Root Path Access]]
[[Symlink Safety Loop Prevention]]