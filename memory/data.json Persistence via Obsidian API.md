---
note_id: 20260215-0125-eb3f3ff1
type: fact
status: active
tags:
- obsidian
- data-persistence
- settings
- data-json
scope: project
created_at: '2026-02-15T01:25:11.625635+00:00'
created_by: ai-agent
---

Obsidian provides loadData() and saveData() on the Plugin class for persisting plugin state. This reads/writes to .obsidian/plugins/<plugin-id>/data.json automatically. We store the array of SymlinkEntry objects here. Important: saveData() is async and overwrites the entire file — there's no partial update. This means we should always save the full settings object after any mutation (add, remove, toggle, rename). There's no built-in debounce, so rapid toggling could cause multiple writes. In practice this is fine because the data is small, but if we ever batch-toggle we should save once at the end, not per-symlink. loadData() returns null if data.json doesn't exist yet (first install), so we need a default settings fallback.

Related:
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[Unique ID Generation for SymlinkEntry]]