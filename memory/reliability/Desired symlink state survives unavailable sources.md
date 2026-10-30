---
note_id: 20261030-2059-39231ace
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T20:59:07.494666Z
updated_at: 2026-10-30T20:59:11.462029337Z
created_by: ai-agent
---

The reliability model separates user intent from filesystem observation. An enabled preference survives a disconnected mount, a missing folder and permission failures; these conditions are not evidence that a user wanted to forget the mapping. Startup and explicit refresh retry verifiable operations without polling. Disabled intent stays disabled even when a matching pointer remains after interruption.

Existing 1.0.2 startup code in src/main.ts:98-105 deletes mappings for missing sources, contradicting the original retention decision. The approved reliability plan replaces that behavior. A conflict or unknown filesystem error preserves the record and the filesystem. Settings must show desired state alongside health, rather than rendering an active flag as proof of an existing link.

Related:
[[On-Load Validation of Symlinks]]
[[Handling Deleted Source Folders Gracefully]]
{extends}[[On-Load Validation of Symlinks]]