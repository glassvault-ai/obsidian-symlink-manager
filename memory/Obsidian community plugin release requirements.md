---
note_id: 20260215-1714-568308ea
type: fact
status: active
tags:
- obsidian
- release
- community-plugin
- open-source
scope: project
created_at: '2026-02-15T17:14:20.729852+00:00'
created_by: ai-agent
---

To release an Obsidian community plugin: (1) repo needs README.md, LICENSE, manifest.json, versions.json, (2) create a GitHub Release with tag matching the version, attaching main.js, manifest.json, and styles.css as assets, (3) submit a PR to obsidianmd/obsidian-releases adding an entry to community-plugins.json with id, name, author, description, and repo fields. The repo URL in community-plugins.json is permanent — it should be the final org/repo name. Obsidian team reviews for: working plugin, no malicious code, proper manifest, README exists, LICENSE exists, no bundled node_modules. Review takes days to weeks. Future version updates only need a new GitHub Release with bumped versions in manifest.json, package.json, and versions.json — no PR needed. Full guide at docs/public-release/release-guide.md.

Related:
[[Obsidian Plugin Lifecycle and Symlink Implications]]
[[Nested .obsidian folders need glob pattern in gitignore]]