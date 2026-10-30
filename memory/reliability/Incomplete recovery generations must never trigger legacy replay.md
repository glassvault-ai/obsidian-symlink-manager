---
note_id: 20261030-2107-1e835af2
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T21:07:32.160228Z
created_by: ai-agent
---

The recovery directory marks an attempted migration. Both metadata slots are required, including two equal initial generations. A crash between creating them therefore opens read-only recovery instead of importing legacy settings again. Later commits alternate slots, preserving adjacent revisions and checking each checksum and state schema before using it.

Treating a missing or corrupt slot as permission to use the other slot is unsafe: the unavailable slot could contain the newer removal intent, so replaying an older enabled entry could resurrect a link. The manager exposes the last readable state for review while refusing mutations when commit ordering is ambiguous. Temporary files are evidence of interrupted writes, never committed generations.

The contract lives in src/reliability/store.ts:50 and is exercised by tests/recovery.test.cjs. Legacy data.json remains untouched. This intentionally makes recovery conservative and requires explicit repair rather than silently guessing at user intent.

Related:
[[Durable operation intent prevents stale settings from resurrecting links]]