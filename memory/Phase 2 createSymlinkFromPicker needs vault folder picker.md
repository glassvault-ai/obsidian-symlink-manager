---
note_id: 20260215-0141-35609a62
type: fact
status: active
tags:
- phase-3
- create-flow
- vault-picker
- upgrade
scope: project
created_at: '2026-02-15T01:41:32.565009+00:00'
created_by: ai-agent
---

In Phase 2, createSymlinkFromPicker() in main.ts was built with a shortcut: it places all new symlinks at the vault root (vaultPath: ''). This is because the vault folder picker modal doesn't exist yet — it's a Phase 3 deliverable. Phase 3 must upgrade this method to open a FuzzySuggestModal after the Electron folder picker so the user can choose where in the vault the symlink goes. The Electron picker (source selection) is already wired and working. The flow should be: Electron picker → if not cancelled → vault folder picker modal → if not cancelled → create entry. Both steps can cancel, and each cancellation should silently abort.

Related:
[[Phase 3 Modifies main.ts createSymlinkFromPicker]]
[[Vault Folder Picker Modal Implementation]]
[[FuzzySuggestModal for Vault Path Selection]]