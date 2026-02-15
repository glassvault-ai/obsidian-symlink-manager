---
note_id: 20260215-0209-150d661b
type: lesson
status: active
tags:
- obsidian
- modal
- bug-fix
- gotcha
scope: project
created_at: '2026-02-15T02:09:40.222561+00:00'
created_by: ai-agent
---

In Obsidian's FuzzySuggestModal, onClose() can fire BEFORE onChooseItem() when a user selects an item. If you wrap the modal in a Promise using a picked flag pattern (resolve(item) in onChooseItem, resolve(null) in onClose if \!picked), the Promise resolves with null before the selection arrives. Fix: wrap the onClose null-resolve in setTimeout(0) to defer it to the next tick, giving onChooseItem time to set the flag. This affects both VaultFolderModal and ToggleSymlinkModal in src/modals.ts. Discovered during live testing — the create flow appeared to silently fail because the vault folder selection was lost.

Related:
[[FuzzySuggestModal Callback Pattern]]
[[FuzzySuggestModal for Vault Path Selection]]