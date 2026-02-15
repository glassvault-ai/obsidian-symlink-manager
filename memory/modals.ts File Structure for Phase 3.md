---
note_id: 20260215-0142-9f79fcd7
type: fact
status: active
tags:
- phase-3
- modal
- file-structure
- implementation
scope: project
created_at: '2026-02-15T01:42:20.678247+00:00'
created_by: ai-agent
---

Phase 3 creates src/modals.ts containing two modal classes: (1) VaultFolderModal — extends FuzzySuggestModal<TFolder>, used in the create flow to pick where in the vault to place the symlink. Uses the Promise/callback pattern to return the selected folder. (2) ToggleSymlinkModal — extends FuzzySuggestModal<SymlinkEntry>, used by the 'toggle-symlink' command to pick which symlink to toggle. Both modals are stateless — they receive data through constructor params and communicate results via callbacks. They don't import or depend on the plugin class directly, just the data types they display.

Related:
[[Vault Folder Picker Modal Implementation]]
[[FuzzySuggestModal Callback Pattern]]
[[The Create Symlink Flow]]