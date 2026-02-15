---
note_id: 20260215-0124-7cfc00a0
type: fact
status: active
tags:
- obsidian
- node-fs
- desktop-only
- platform
scope: project
created_at: '2026-02-15T01:24:55.984100+00:00'
created_by: ai-agent
---

Obsidian desktop runs on Electron, which means Node.js APIs are available. We use the fs module directly for symlink operations: symlinkSync, unlinkSync, existsSync, lstatSync, readlinkSync. We access it via require('fs') or import. This is the entire reason the plugin is desktop-only — mobile Obsidian runs on native iOS/Android without Node.js. The manifest.json flag isDesktopOnly: true enforces this at the Obsidian level so the plugin won't even appear on mobile. The path module is also available and needed for path resolution and normalization.

Related:
[[Why Desktop Only Mobile Cannot Symlink]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[Symlink vs Directory Detection with lstatSync]]