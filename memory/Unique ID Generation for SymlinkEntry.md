---
note_id: 20260215-0126-222d54b1
type: fact
status: active
tags:
- data-model
- id-generation
- architecture
scope: project
created_at: '2026-02-15T01:26:35.603259+00:00'
created_by: ai-agent
---

Each SymlinkEntry needs a unique id for reliable identification (paths can change if the user renames things). A simple approach: use a timestamp-based id or crypto.randomUUID(). crypto.randomUUID() is available in modern Electron/Node.js and is the cleanest option. The id is used internally for lookups and is never shown to the user. It must be stable — once assigned, it doesn't change for the lifetime of that entry. This is how the settings tab knows which entry to toggle or delete, and how commands reference specific symlinks.

Related:
[[Symlink Toggle Semantics]]
[[On-Load Validation of Symlinks]]
[[Symlink vs Directory Detection with lstatSync]]