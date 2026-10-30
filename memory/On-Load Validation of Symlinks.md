---
note_id: 20260215-0125-2ebbe89c
type: decision
status: superseded
tags:
- validation
- startup
- symlink
- resilience
scope: project
created_at: 2026-02-15T01:25:38.887034Z
updated_at: 2026-05-09T23:21:28.509808Z
created_by: ai-agent
---

The original retention decision remains: an unavailable source is not a request to delete its mapping. The reliability implementation now retains desired enablement separately from observed health rather than changing an active flag to false. Startup and explicit Refresh reconcile safe configurations through the same operation coordinator; conflicts and I/O failures preserve evidence. There is no background poller.

The former 1.0.2 implementation deleted entries despite this original policy. The shared coordinator in src/reliability/coordinator.ts now provides recovery ordering before ordinary startup reconciliation.

Related:
[[Desired symlink state survives unavailable sources]]
[[Handling Deleted Source Folders Gracefully]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]
