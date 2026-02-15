---
note_id: 20260215-0125-fc824ea2
type: fact
status: active
tags:
- obsidian
- modals
- fuzzy-search
- ux
scope: project
created_at: '2026-02-15T01:25:54.491751+00:00'
created_by: ai-agent
---

After the user picks a source folder, they need to choose where in the vault to place the symlink. Obsidian provides FuzzySuggestModal — a built-in fuzzy search modal that we can populate with vault folder paths. We extend FuzzySuggestModal<TFolder>, override getItems() to return all folders in the vault (this.app.vault.getAllLoadedFiles().filter(f => f instanceof TFolder)), and override getItemText() to return the folder path. onChooseItem() receives the selected folder. The symlink gets created inside that folder with the source folder's name (or a user-specified name). This gives users fast, keyboard-driven folder selection consistent with Obsidian's UX patterns.

Related:
[[The Create Symlink Flow]]
[[Vault Root Path Access]]
[[Obsidian Symlink Plugin — Project Overview]]