---
note_id: 20260215-0125-606c4f22
type: decision
status: active
tags:
- safety
- symlink
- loops
- validation
scope: project
created_at: '2026-02-15T01:25:21.064702+00:00'
created_by: ai-agent
---

A symlink loop occurs when the source path is inside the vault (or IS the vault). If someone symlinks vault/notes/ into vault/links/notes/, Obsidian would recurse infinitely scanning files. We MUST validate before creating any symlink that the source path is not a subdirectory of the vault root, and the vault root is not a subdirectory of the source path. Use path.resolve() on both and check with startsWith() in both directions. The vault root is available via (this.app.vault.adapter as FileSystemAdapter).getBasePath(). This check runs at creation time — if it fails, show a Notice explaining why and abort.

Related:
[[Symlink Safety Overwrite Protection]]
[[On-Load Validation of Symlinks]]