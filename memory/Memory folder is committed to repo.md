---
note_id: 20260214-2323-7dcc129c
type: lesson
status: active
tags:
- git
- memory-vault
- conventions
scope: project
created_at: '2026-02-14T23:23:32.743385+00:00'
created_by: ai-agent
---

The memory/ folder contains vault notes that carry architectural context for the fractal decomposition build method. These notes MUST be committed to the repo — they are not gitignored. The symlink to the global Obsidian vault lives in the global location (pointing into the project), not inside the project itself, so there's no symlink in the codebase to worry about.

Related:
[[Obsidian Symlink Plugin — Project Overview]]
[[On-Load Validation of Symlinks]]
[[Symlink Safety Overwrite Protection]]