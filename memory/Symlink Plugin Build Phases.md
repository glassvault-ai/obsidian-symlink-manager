---
note_id: 20260214-2312-712945d2
type: fact
status: active
tags:
- obsidian
- symlink
- build-phases
- architecture
scope: project
created_at: '2026-02-14T23:12:47.298564+00:00'
created_by: ai-agent
---

Four build phases with explicit dependencies. Phase 1: Scaffold + core engine (no UI, just fs CRUD logic and data model). Phase 2: Settings tab UI (management dashboard, depends on Phase 1). Phase 3: Modals + commands (command palette, folder pickers, depends on Phases 1+2). Phase 4: Safety + polish + dev testing (depends on all prior phases). Each phase has a pause for maintainer review before proceeding.

Related:
[[Core Engine Module Separation]]
[[Obsidian PluginSettingTab Pattern]]
[[Command Registration and Routing]]