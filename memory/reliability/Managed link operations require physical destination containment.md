---
note_id: 20261030-2059-63e909db
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T20:59:07.622627Z
updated_at: 2026-10-30T21:02:02.198402364Z
created_by: ai-agent
---

A folder visible beneath a vault can physically belong to an external tree when one of its ancestors is a symlink. Allowing a destination there writes into source data and can create cycles even when both displayed paths look valid. The reliability design permits an aliased vault root but rejects symlink or junction ancestors below that canonical root.

Every mutation must validate the destination and recognize the expected pointer; picker-only checks cannot protect startup, restored settings or inactive renames. Canonical source roots must be disjoint from the vault and other configured roots. Missing or unreadable paths are uncertainty, not permission to substitute lexical guesses. The old checks in src/symlink-manager.ts:35-68 compare only path spelling.

These checks cannot guarantee atomic exclusion against a separate process swapping ancestors, or prove that arbitrary nested unmanaged symlinks are acyclic. That residual boundary must remain explicit.

Related:
[[Symlink Safety Loop Prevention]]
[[Symlink Safety Never Delete the Source Folder]]
{extends}[[Symlink Safety Loop Prevention]]