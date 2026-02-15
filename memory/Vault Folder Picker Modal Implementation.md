---
note_id: 20260215-0141-5d467992
type: fact
status: active
tags:
- phase-3
- modals
- vault-picker
- implementation
scope: project
created_at: '2026-02-15T01:41:38.569354+00:00'
created_by: ai-agent
---

The vault folder picker is a FuzzySuggestModal<TFolder> that lets users choose where to place a symlink inside their vault. It needs to list all folders in the vault including root. getItems() should return this.app.vault.getAllLoadedFiles().filter(f => f instanceof TFolder) — TFolder is imported from 'obsidian'. The root folder shows as '/' or the vault name. getItemText() returns f.path (or '/' for root where f.path is ''). The modal needs to communicate the selected folder back to the caller — use a callback pattern or Promise wrapper since FuzzySuggestModal is callback-based (onChooseItem). The selected TFolder's path becomes the vaultPath in the SymlinkEntry. Important: vault root has path '' not '/'.