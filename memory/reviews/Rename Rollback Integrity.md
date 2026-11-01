---
note_id: 20260215-1536-e28ebb68
type: lesson
status: resolved
tags:
- code-review
- symlink-plugin
- rename
- rollback
- state-integrity
scope: project
created_at: 2026-02-15T15:36:39.501616Z
updated_at: 2026-11-01T17:39:58.985022Z
created_by: ai-agent
---

# Rename Rollback Integrity

The February 2026 review recorded an unchecked-rollback risk: a failed rename followed by a failed restoration could leave an active flag inconsistent with disk state. It proposed marking the entry inactive. In source checked on 2026-11-01 at `25e2f38`, rename delegates to the shared coordinator, which saves pending intent before changing pointers and checks the restoration attempt. If rename and rollback both fail, it reports that failure and retains pending recovery evidence instead of silently treating the rename as complete or forcing the desired enabled preference to false. Recovery examines both expected paths; ambiguous paths or neither path for an enabled mapping require explicit recovery. Settings show desired enablement alongside observed health and pending-operation controls. The continuing lesson is that attempted rollback is not proof of restoration.

Source: `src/main.ts:97`, `src/reliability/coordinator.ts:101–111,129–160,186–197,224–235`, `src/settings.ts:25–49`.

Related:
[[Settings tab must refresh after create flow]]
[[Clean up broken symlinks on deactivation]]
[[Durable operation intent prevents stale settings from resurrecting links]]
[[Desired symlink state survives unavailable sources]]
