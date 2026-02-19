---
note_id: 20260219-2022-13e1c8f2
type: lesson
status: active
tags:
- obsidian
- notice
- eslint
- sentence-case
scope: project
created_at: '2026-02-19T20:22:33.277523+00:00'
created_by: ai-agent
---

The obsidianmd/ui/sentence-case ESLint rule flags capitalized words mid-string in Notice messages. 'Symlink Manager: Some message' fails because 'Manager' is capitalized. More importantly, the prefix is redundant — Obsidian's notification system doesn't need it since there's sufficient context. Strip the prefix from ALL Notices (both plain strings and template literals) for consistency, even though the linter only flags plain strings. Template literals with ${} are skipped by the rule, but leaving mixed prefixed/unprefixed notices creates inconsistent UX and future lint issues if a template literal is converted to a plain string.

Related:
[[Obsidian Notice API for User Feedback]]
[[Obsidian ESLint sentence-case rule exact API calls inspected]]
[[Bulk Toggle Notice Accuracy]]