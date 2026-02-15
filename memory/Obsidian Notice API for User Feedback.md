---
note_id: 20260215-0126-389f9ce0
type: fact
status: active
tags:
- obsidian
- notice
- ux
- feedback
scope: project
created_at: '2026-02-15T01:26:56.113746+00:00'
created_by: ai-agent
---

new Notice('message') shows a temporary toast notification in Obsidian. It auto-dismisses after a few seconds. We use this throughout the plugin for feedback: symlink created, symlink toggled, error messages, validation failures. Notices are non-blocking — they don't interrupt the user's workflow. For errors, prefix with clear language: 'Symlink Manager: Source folder not found'. For success, keep it brief: 'Symlink created: memory → vault/projects'. The Notice constructor accepts an optional duration parameter in milliseconds for controlling how long it displays.

Related:
[[Obsidian Symlink Plugin — Project Overview]]
[[On-Load Validation of Symlinks]]
[[Symlink Safety Loop Prevention]]