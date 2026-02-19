---
note_id: 20260219-2001-74a1ad19
type: lesson
status: active
tags:
- obsidian
- eslint
- community-review
- implementation
scope: project
created_at: '2026-02-19T20:01:35.773284+00:00'
created_by: ai-agent
---

The Obsidian community plugin review flagged 8 issues. Before fixing ANY code, install eslint-plugin-obsidianmd and run npx eslint src/ to capture exact violation locations. Critical reasons: (1) Issue 8 (promise in void callback) location is unknown — multiple async callbacks exist in settings.ts with mixed type signatures in obsidian.d.ts, so the lint output is the only reliable way to identify the exact site. (2) Issue 2 (sentence case) count is reported as 6 but we could only identify 5 from static analysis — lint confirms the actual count. (3) Issue 6 (require→ESM imports) — after converting to static import from electron, tsc may fail because there are no electron types in the project. Try the import first; if tsc fails, add a local declare module 'electron' type declaration before adding @types/electron as a heavy devDependency. Full plan at docs/plan-community-review-fixes.md.

Related:
[[eslint-plugin-obsidianmd Official Obsidian Community Plugin ESLint Rules]]
[[Obsidian ESLint require() and Electron access for desktop-only plugins]]
[[Obsidian ESLint sentence-case rule exact API calls inspected]]