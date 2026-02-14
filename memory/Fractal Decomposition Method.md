---
note_id: 20260214-2312-e1fc075c
type: decision
status: active
tags:
- fractal-decomposition
- methodology
- planning
scope: project
created_at: '2026-02-14T23:12:51.566896+00:00'
created_by: ai-agent
---

The build method used for the symlink plugin and other GlassVault projects. Three levels: Level 1 is the plan doc (PLAN.md) — full picture. Level 2 is system notes — one per build area, covering dependency order, API choices, safety boundaries. Level 3 is implementation notes — one per component, the WHAT and WHY only, no code. Key principle: notes carry product decisions, agents make engineering decisions. The test: if an agent with zero prior context can build from the notes without asking product questions, they're good enough.