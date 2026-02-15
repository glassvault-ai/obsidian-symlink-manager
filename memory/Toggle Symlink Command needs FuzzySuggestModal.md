---
note_id: 20260215-0141-705789d5
type: fact
status: active
tags:
- phase-3
- modals
- toggle
- commands
scope: project
created_at: '2026-02-15T01:41:44.674677+00:00'
created_by: ai-agent
---

The 'Toggle symlink...' command (Cmd+P → 'Symlink Manager: Toggle symlink...') opens a FuzzySuggestModal<SymlinkEntry> showing all managed symlinks by name. The user picks one, and its active state flips. This is a separate modal from the vault folder picker — it lists SymlinkEntry objects, not TFolder objects. getItems() returns plugin.settings.symlinks. getItemText() returns entry.name plus a status indicator (e.g., entry.active ? '(on)' : '(off)'). onChooseItem() calls plugin.toggleSymlinkEntry(entry.id). This modal only appears when there are symlinks to toggle — if the list is empty, show a Notice instead of opening an empty modal.

Related:
[[modals.ts File Structure for Phase 3]]
[[Vault Folder Picker Modal Implementation]]
[[FuzzySuggestModal for Vault Path Selection]]