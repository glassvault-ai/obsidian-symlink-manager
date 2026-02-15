---
note_id: 20260215-0251-fd8d29e3
type: decision
status: active
tags:
- phase-4
- duplicate-detection
- validation
scope: project
created_at: '2026-02-15T02:51:19.978013+00:00'
created_by: ai-agent
---

Nothing currently prevents a user from linking the same source folder to the same vault location twice, which would fail at the fs level (EEXIST) but with a confusing error. The check belongs in addSymlink() in main.ts — before calling validateCreate, check if any existing entry in settings.symlinks has the same sourcePath AND vaultPath AND name combination. If a duplicate is found, show a Notice like 'Symlink Manager: This folder is already linked at that location' and return false. Only exact matches count — the same source linked to two different vault locations is a valid use case (the user might want a folder visible in multiple places). The check is on the trio of sourcePath + vaultPath + name.

Related:
[[On-Load Validation of Symlinks]]
[[Symlink Safety Loop Prevention]]