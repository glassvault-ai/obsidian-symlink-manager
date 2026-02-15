---
note_id: 20260215-0125-2ebbe89c
type: decision
status: active
tags:
- validation
- startup
- symlink
- resilience
scope: project
created_at: '2026-02-15T01:25:38.887034+00:00'
created_by: ai-agent
---

When the plugin loads (onload), it should validate every SymlinkEntry marked as active=true. Two checks per entry: (1) does the symlink still exist at the vault path? (fs.existsSync + lstatSync.isSymbolicLink), and (2) does the source folder still exist? If the symlink is gone but source exists, silently recreate it (the user may have manually deleted it or another tool removed it). If the source folder is gone, mark the entry as active=false and show a Notice warning the user. Don't delete the entry — the source might come back (external drive reconnected, etc). This validation runs once at startup, not on a timer.

Related:
[[Symlink Safety Overwrite Protection]]
[[Handling Deleted Source Folders Gracefully]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]