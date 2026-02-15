---
note_id: 20260215-0126-5891c539
type: fact
status: active
tags:
- obsidian
- vault-path
- api
- filesystem
scope: project
created_at: '2026-02-15T01:26:20.013600+00:00'
created_by: ai-agent
---

To get the vault's absolute filesystem path in an Obsidian plugin, use: (this.app.vault.adapter as FileSystemAdapter).getBasePath(). FileSystemAdapter must be imported from 'obsidian'. This returns the absolute path to the vault root directory. We need this for: (1) resolving relative vault paths to absolute paths when creating symlinks, (2) loop prevention checks (ensuring source isn't inside vault), (3) constructing the full symlink target path (vaultRoot + vaultPath + symlinkName). The vaultPath stored in SymlinkEntry is relative to the vault root, so we always join it with the base path for fs operations.

Related:
[[FuzzySuggestModal for Vault Path Selection]]
[[Obsidian Symlink Plugin — Project Overview]]