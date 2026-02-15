---
note_id: 20260215-0126-eb206898
type: fact
status: active
tags:
- create-flow
- ux
- modal
- architecture
scope: project
created_at: '2026-02-15T01:26:30.985426+00:00'
created_by: ai-agent
---

Creating a symlink is a multi-step flow that spans modals and core logic: (1) User triggers via command palette or settings tab button, (2) Electron folder picker opens — user selects the external source folder, (3) If cancelled, abort silently, (4) FuzzySuggestModal opens — user picks where in the vault to place the symlink, (5) The symlink name defaults to the source folder's basename (e.g., /home/user/project/memory → 'memory'), (6) Run safety checks: source exists, no loop, no overwrite at target path, (7) Create the symlink via fs.symlinkSync, (8) Create a SymlinkEntry with a unique id, save to data.json, (9) Show success Notice, (10) If settings tab is open, refresh it. Each step that can fail should show a meaningful Notice and abort — don't leave the user guessing.

Related:
[[Electron Dialog for Source Folder Selection]]
[[FuzzySuggestModal for Vault Path Selection]]
[[Symlink Safety Overwrite Protection]]