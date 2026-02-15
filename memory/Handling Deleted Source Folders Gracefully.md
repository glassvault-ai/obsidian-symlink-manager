---
note_id: 20260215-0127-0d270223
type: decision
status: implemented
tags:
- safety
- resilience
- source-deleted
- ux
scope: project
created_at: '2026-02-15T01:27:10.453344+00:00'
created_by: ai-agent
---

External source folders can disappear: drive disconnected, folder renamed, project moved. The plugin must handle this without crashing. When a source no longer exists: (1) at startup validation, mark the entry as active=false and warn via Notice, (2) in the settings tab, show a visual indicator (e.g., warning text) that the source is missing, (3) don't auto-delete the entry — the source might come back. The user can manually delete the entry if they know it's gone for good. When toggling on an entry whose source is missing, show a Notice explaining the source wasn't found and abort the toggle. This is a recoverable state, not an error.

Related:
[[Symlink Safety Never Delete the Source Folder]]
[[Symlink Safety Overwrite Protection]]