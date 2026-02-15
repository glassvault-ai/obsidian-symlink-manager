---
note_id: 20260215-0127-bcf8eebc
type: decision
status: implemented
tags:
- architecture
- separation-of-concerns
- core-engine
scope: project
created_at: '2026-02-15T01:27:15.891169+00:00'
created_by: ai-agent
---

The symlink CRUD logic lives in its own module (symlink-manager.ts), separate from the plugin class, settings UI, and modals. This separation matters because: (1) the core engine is pure logic + fs operations with no Obsidian UI dependencies, making it testable and predictable, (2) multiple callers invoke it — settings tab toggle, command palette commands, on-load validation all use the same create/remove/toggle functions, (3) a fresh agent working on Phase 2 (UI) can call engine functions without understanding their internals. The engine takes the vault base path as a constructor parameter or function argument — it doesn't reach into Obsidian's app object directly.

Related:
[[Obsidian Symlink Plugin — Project Overview]]
[[The Create Symlink Flow]]