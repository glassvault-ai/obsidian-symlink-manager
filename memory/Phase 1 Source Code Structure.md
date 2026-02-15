---
note_id: 20260215-0135-9c078e9b
type: fact
status: active
tags:
- source-code
- architecture
- phase-1
scope: project
created_at: '2026-02-15T01:35:46.228319+00:00'
created_by: ai-agent
---

src/types.ts — SymlinkEntry, PluginSettings interfaces, DEFAULT_SETTINGS. src/symlink-manager.ts — pure fs CRUD logic: validateCreate, createSymlink, removeSymlink, toggleSymlink, validateEntry. No Obsidian imports. Takes vaultBasePath as param. src/main.ts — SymlinkManagerPlugin extends Plugin. onload loads settings and validates existing symlinks. onunload is intentionally empty (symlinks persist). Public API: addSymlink, removeSymlinkEntry, toggleSymlinkEntry, toggleAll — these are the methods the settings tab, commands, and modals will call in Phases 2+3. All user feedback goes through new Notice(). The removeSymlink function in symlink-manager.ts checks isSymbolicLink() before unlinkSync — it will refuse to remove a real directory.