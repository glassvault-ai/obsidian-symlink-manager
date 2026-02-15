---
note_id: 20260215-1714-b48f7ab8
type: lesson
status: active
tags:
- git
- gitignore
- obsidian
- gotcha
scope: project
created_at: '2026-02-15T17:14:25.428676+00:00'
created_by: ai-agent
---

The .gitignore pattern .obsidian/ only matches at the repo root. If a subfolder (like memory/) gets symlinked into an Obsidian vault, Obsidian writes .obsidian/ config files inside it (workspace.json, app.json, etc.). These show up as tracked changes. Fix: use **/.obsidian/ to match at any depth. Also need to run git rm -r --cached memory/.obsidian/ to untrack already-committed files. Discovered when memory/ was symlinked into /Users/dev/memory vault for live testing.

Related:
[[Memory folder is committed to repo]]
[[Symlink Safety Loop Prevention]]
[[On-Load Validation of Symlinks]]