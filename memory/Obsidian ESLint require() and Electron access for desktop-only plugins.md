---
note_id: 20260219-1906-cd29ef26
type: fact
status: implemented
tags:
- obsidian
- eslint
- electron
- require
- desktop-only
- summary
scope: project
created_at: '2026-02-19T19:06:17.660406+00:00'
created_by: ai-agent
---

## Summary
For Obsidian desktop-only plugins, Node.js module imports are allowed if `manifest.isDesktopOnly` is true, but bare `require()` calls are always an error. Use ES module imports like `import fs from 'fs'` and `import { remote } from '@electron/remote'` to access Electron APIs and Node.js modules, avoiding `require()`.

---

The eslint-plugin-obsidianmd recommended config handles Node.js/Electron access through two layered rules:

## 1. import/no-nodejs-modules (conditional)
In /tmp/package/dist/lib/index.js line 163:
  'import/no-nodejs-modules': manifest && manifest.isDesktopOnly ? 'off' : 'error'

This means:
- If manifest.json has isDesktopOnly: true -> Node.js module imports (fs, path, child_process, etc.) are ALLOWED
- If isDesktopOnly is false or missing -> Node.js module imports are ERRORS

## 2. @typescript-eslint/no-require-imports (inherited from recommendedTypeChecked)
This rule bans bare require() calls like: const fs = require('fs')
It is NOT overridden by the Obsidian eslint config, so it applies regardless of isDesktopOnly.
The approved pattern is ES module imports: import fs from 'fs' or import { readFileSync } from 'fs'

## Accessing Electron APIs
For Electron access (e.g., remote.dialog for native file pickers):
- Set isDesktopOnly: true in manifest.json (this disables import/no-nodejs-modules)
- Use ES module import syntax, not require()
- The @typescript-eslint/no-require-imports rule means you should NOT do: const { remote } = require('electron')
- Instead use: import { remote } from '@electron/remote' (or similar ES import)
- Note: Obsidian uses @electron/remote since the old remote module was deprecated

## Our plugin (obsidian-symlink-plugin)
We use require('fs') and require('path') — this will trigger both rules unless we either:
1. Refactor to ES imports (preferred)
2. Or configure allow exceptions

Since we already have isDesktopOnly: true, the import/no-nodejs-modules rule would be off. But no-require-imports would still flag require() calls.

Related:
[[eslint-plugin-obsidianmd Official Obsidian Community Plugin ESLint Rules]]
[[Node.js fs Module Availability in Obsidian Desktop]]