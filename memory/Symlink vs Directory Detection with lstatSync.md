---
note_id: 20260215-0126-ab185094
type: fact
status: active
tags:
- node-fs
- symlink
- lstat
- technical
scope: project
created_at: '2026-02-15T01:26:15.814593+00:00'
created_by: ai-agent
---

A key technical detail: fs.statSync follows symlinks (resolves to the target), while fs.lstatSync does NOT follow symlinks (returns info about the link itself). This distinction is critical for us. To check if a path IS a symlink: lstatSync(path).isSymbolicLink(). To check if a symlink's target exists: existsSync(path) (which follows the link). To get where a symlink points: readlinkSync(path). We need lstatSync when removing symlinks (to confirm we're removing a symlink and not a real directory) and during validation. Never use statSync when you need to know about the symlink itself.

Related:
[[Symlink Safety Never Delete the Source Folder]]
[[Platform Detection Symlinks vs Windows Junctions]]