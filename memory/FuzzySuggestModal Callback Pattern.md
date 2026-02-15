---
note_id: 20260215-0142-17fed898
type: lesson
status: active
tags:
- phase-3
- modal
- async-pattern
- implementation
scope: project
created_at: '2026-02-15T01:42:04.783622+00:00'
created_by: ai-agent
---

FuzzySuggestModal's onChooseItem is synchronous and void — it doesn't return a value to the caller. To use it in an async flow (like createSymlinkFromPicker where you need the selected folder before proceeding), wrap it in a Promise. Create a subclass that takes a resolve callback in its constructor, calls resolve(item) in onChooseItem, and resolve(null) in onClose (if nothing was chosen). The caller does: const folder = await new Promise(resolve => new VaultFolderModal(app, resolve).open()). This pattern lets the create flow await both the Electron picker and the vault picker sequentially.

Related:
[[FuzzySuggestModal for Vault Path Selection]]
[[Phase 2 createSymlinkFromPicker needs vault folder picker]]
[[The Create Symlink Flow]]