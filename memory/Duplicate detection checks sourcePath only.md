---
note_id: 20260215-0320-00935405
type: lesson
status: active
tags:
- duplicate-detection
- validation
- ux
- lesson
scope: project
created_at: '2026-02-15T03:20:15.249538+00:00'
created_by: ai-agent
---

During live testing, we discovered that checking sourcePath + vaultPath + name for duplicates was too narrow. A user could link the same source folder to two different vault locations, which in Obsidian just duplicates all files in the file tree and graph with no benefit. The duplicate check was changed to match on sourcePath alone — the same source folder cannot be linked twice anywhere in the vault. The check runs in two places: (1) early in createSymlinkFromPicker() right after the Electron picker, before the vault folder picker even opens, and (2) as a safety net in addSymlink() in case it's called directly. The early check gives better UX — no point asking where to put a folder that's already linked.