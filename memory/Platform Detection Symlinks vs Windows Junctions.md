---
note_id: 20260215-0125-cd376226
type: fact
status: active
tags:
- platform
- windows
- symlink
- junctions
scope: project
created_at: '2026-02-15T01:25:00.718487+00:00'
created_by: ai-agent
---

macOS and Linux support directory symlinks natively via fs.symlinkSync(target, path, 'dir'). Windows does NOT support directory symlinks without elevated privileges (admin mode), but it does support 'junctions' which work similarly for local paths. fs.symlinkSync with type 'junction' on Windows creates a junction instead. We need to detect the platform (process.platform) and use 'junction' on win32, 'dir' on darwin/linux. This is a one-line difference in the create function but it's critical — without it, Windows users would get EPERM errors. Junctions have one limitation: they only work with absolute local paths (no network drives), which is fine for our use case since we're linking local folders.

Related:
[[Node.js fs Module Availability in Obsidian Desktop]]
[[Symlink vs Directory Detection with lstatSync]]
[[The Create Symlink Flow]]