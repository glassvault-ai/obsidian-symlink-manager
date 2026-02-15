---
note_id: 20260215-0127-8fb3b298
type: decision
status: implemented
tags:
- desktop-only
- mobile
- platform
- manifest
scope: project
created_at: '2026-02-15T01:27:00.248026+00:00'
created_by: ai-agent
---

This plugin is desktop-only (isDesktopOnly: true in manifest.json). Mobile Obsidian runs on native iOS/Android runtimes without Node.js, so fs.symlinkSync is unavailable. But there's a deeper reason: neither iOS nor Android supports user-created symlinks at the filesystem level due to sandboxing. This plugin is explicitly a desktop tool. The GlassVault mobile app will solve the mobile graph-view-connection problem differently — this plugin is a prototype for the concept, not a cross-platform solution. Setting isDesktopOnly prevents confusing mobile users who would see a broken plugin.

Related:
[[Obsidian Symlink Plugin — Project Overview]]
[[Symlink vs Directory Detection with lstatSync]]
[[Platform Detection Symlinks vs Windows Junctions]]