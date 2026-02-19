---
note_id: 20260219-2022-4ded896b
type: lesson
status: active
tags:
- obsidian
- electron
- typescript
- imports
scope: project
created_at: '2026-02-19T20:22:28.046604+00:00'
created_by: ai-agent
---

Use `import { remote } from "electron"` with a local type declaration at src/electron.d.ts. The electron module has no npm package or @types in the project — it's provided at runtime by Obsidian's Electron shell and marked as external in esbuild.config.mjs. The type declaration only needs to cover the APIs you actually use (e.g. remote.dialog.showOpenDialog). This passes both tsc (via the .d.ts) and esbuild (via the external). Do NOT use require('electron') — it triggers @typescript-eslint/no-require-imports. File: src/electron.d.ts in obsidian-symlink-plugin.

Related:
[[esbuild Config for Obsidian Plugins]]
[[Node.js fs Module Availability in Obsidian Desktop]]
[[Electron Dialog for Source Folder Selection]]