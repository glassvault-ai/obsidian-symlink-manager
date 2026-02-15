---
note_id: 20260215-0126-6f432a07
type: fact
status: active
tags:
- esbuild
- build
- toolchain
- obsidian
scope: project
created_at: '2026-02-15T01:26:51.883511+00:00'
created_by: ai-agent
---

Obsidian plugins use esbuild for bundling. The standard config from obsidian-sample-plugin outputs a single main.js in the project root. Key settings: bundle: true (bundle all imports), external: ['obsidian'] (Obsidian APIs are provided at runtime, not bundled), format: 'cjs' (CommonJS, required by Obsidian's plugin loader), platform: 'node' (gives access to Node.js built-ins like fs and path), target: 'es2018'. The build outputs main.js alongside manifest.json — these two files (plus optional styles.css) are what get installed into .obsidian/plugins/<plugin-id>/. Dev mode uses esbuild's watch feature for hot reload.

Related:
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[Symlink Plugin Build Phases]]