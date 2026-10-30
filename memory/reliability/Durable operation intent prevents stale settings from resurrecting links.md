---
note_id: 20261030-2059-e80c8be9
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T20:59:07.747942Z
updated_at: 2026-10-30T21:02:02.196853054Z
created_by: ai-agent
---

Filesystem changes and settings writes are not one transaction. If removal succeeds and settings persistence fails, old active metadata can recreate the link on startup. The reliability design commits operation intent before mutation and retains it until the resulting filesystem state is durably acknowledged.

Two validated metadata generations preserve recovery evidence independently of legacy data.json. Startup recognizes completed operations from expected link identities and treats ambiguous or corrupt recovery data as read-only. It never silently replays an older generation or falls back to legacy settings after migration. This costs an explicit recovery component but avoids treating in-memory rollback as durability.

All UI, command and startup operations share one serialized coordinator. A failed final commit blocks further mutations until recovery, so a later request cannot erase unfinished intent. The original save path in src/main.ts:76-77 has no such contract.

Related:
[[data.json Persistence via Obsidian API]]
[[Desired symlink state survives unavailable sources]]
{supersedes}[[data.json Persistence via Obsidian API]]