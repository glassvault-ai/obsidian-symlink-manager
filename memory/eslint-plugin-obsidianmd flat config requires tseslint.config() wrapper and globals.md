---
note_id: 20260219-2015-982a1ca0
type: lesson
status: active
tags:
- obsidian
- eslint
- config
- gotcha
scope: project
created_at: '2026-02-19T20:15:35.035897+00:00'
created_by: ai-agent
---

The eslint-plugin-obsidianmd recommended config uses extends: [tseslint.configs.recommendedTypeChecked] inside its yielded flat config objects. Plain [...obsidianmd.configs.recommended] fails with 'extends key not supported in flat config'. Fix: wrap with tseslint.config(...obsidianmd.configs.recommended). Also requires parserOptions.projectService for typed linting rules, and browser+node globals (from globals package) because the recommended config sets no-undef: error but doesn't include any environment globals. Working config at eslint.config.mjs in obsidian-symlink-plugin.

Related:
[[eslint-plugin-obsidianmd Official Obsidian Community Plugin ESLint Rules]]
[[Obsidian ESLint require() and Electron access for desktop-only plugins]]