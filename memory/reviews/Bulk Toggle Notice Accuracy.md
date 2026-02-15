---
note_id: 20260215-1536-232a4933
type: lesson
status: active
tags:
- code-review
- symlink-plugin
- ux
- notifications
- bulk-toggle
scope: project
created_at: '2026-02-15T15:36:51.475461+00:00'
created_by: ai-agent
---

# Bulk Toggle Notice Accuracy

The `toggleAll` method in `src/main.ts` always emits "All symlinks activated/deactivated" even when individual entries fail. Per-entry error notices fire correctly, but the global success notice at the end is unconditional — it runs regardless of how many entries actually succeeded. This creates a misleading success signal that can hide partial failure conditions from users. A better approach would track outcome counts and report accurately, e.g., "Activated 5 symlinks, 2 failed."

Related:
[[Command Registration and Routing]]
[[Obsidian Notice API for User Feedback]]
