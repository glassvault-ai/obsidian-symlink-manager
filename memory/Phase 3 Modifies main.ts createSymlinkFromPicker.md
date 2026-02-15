---
note_id: 20260215-0142-8bb38352
type: fact
status: active
tags:
- phase-3
- main-ts
- refactor
- create-flow
scope: project
created_at: '2026-02-15T01:42:16.763142+00:00'
created_by: ai-agent
---

The existing createSymlinkFromPicker() in main.ts (from Phase 2) handles Electron folder picking and places symlinks at vault root. Phase 3 upgrades this method to add the vault folder picker step between source selection and symlink creation. The method signature stays the same (no args, returns Promise<void>), and it's still called from the settings tab Add button, the ribbon icon click, and the 'link-external-folder' command. All callers are already wired — only the method body changes. The new flow: (1) Electron showOpenDialog, (2) VaultFolderModal for destination, (3) build SymlinkEntry with selected vaultPath, (4) call this.addSymlink(entry).

Related:
[[Phase 2 createSymlinkFromPicker needs vault folder picker]]
[[The Create Symlink Flow]]
[[modals.ts File Structure for Phase 3]]