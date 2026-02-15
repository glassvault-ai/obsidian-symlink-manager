---
note_id: 20260215-1536-e7e5378f
type: lesson
status: active
tags:
- code-review
- symlink-plugin
- startup
- persistence
- async
scope: project
created_at: '2026-02-15T15:36:42.490785+00:00'
created_by: ai-agent
---

# Startup Save Await

`validateSymlinksOnLoad` in `src/main.ts` is synchronous and calls `this.saveSettings()` fire-and-forget when `anyChanged` is true. If the plugin lifecycle interrupts before the write completes, startup repairs (removed broken entries, deactivated failed restorations) may not persist — leading to non-deterministic state drift across launches where the same repairs run again each startup. Converting the method to async and awaiting it from `onload` would make persistence deterministic. The save itself is fast (just JSON serialization to disk), so awaiting it won't meaningfully delay startup.

Related:
[[On-Load Validation of Symlinks]]
[[Handling Deleted Source Folders Gracefully]]
