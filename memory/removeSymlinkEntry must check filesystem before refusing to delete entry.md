---
note_id: 20260220-0426-428c54e6
type: lesson
status: active
tags:
- obsidian
- symlink
- bug-fix
- removesymlink
scope: project
created_at: '2026-02-20T04:26:27.592459+00:00'
created_by: ai-agent
---

Bug: removeSymlinkEntry (src/main.ts) called removeSymlink() unconditionally. When the path was a real directory (not a symlink) — e.g. from copied data.json settings — removeSymlink correctly refused to unlink it, but removeSymlinkEntry treated that as total failure and never removed the entry from data.json. Stale entries became permanently stuck with no way to delete them from the UI.

Fix: Use validateEntry() to check actual filesystem state before calling removeSymlink(). Only attempt unlink if status.symlinkExists is true. If the path is a real directory or nothing exists, skip the unlink and just remove the entry — the plugin doesn't own real directories, only symlinks it created.

Root cause: the original code comment said 'Always attempt unlink based on filesystem state, not just active flag' which was correct intent for handling metadata drift, but the implementation didn't account for the case where the path exists as a non-symlink.