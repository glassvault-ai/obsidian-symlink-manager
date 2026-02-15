---
note_id: 20260215-0144-3e90cfbc
type: lesson
status: active
tags:
- fractal-decomposition
- agents
- workflow
- lesson
scope: project
created_at: '2026-02-15T01:44:07.099945+00:00'
created_by: ai-agent
---

During the obsidian-symlink-plugin build using fractal decomposition, the agent completed Phase 1 perfectly from the knowledge notes. But at Phase 2, when not explicitly told to write notes first, the agent skipped straight to building. Had to stop it and redirect to write Level 2/3 notes before continuing. This is a natural tendency — agents are built to code, not to plan. The two-phase workflow (write notes → pause → build → pause) needs to be explicitly stated in the prompt for EVERY phase, not just assumed. The agent prompt at ~/Desktop/PROMPTS/obsidian-symlink-plugin-agent-prompt.md does say 'write knowledge notes first,' but the agent still skipped it when not reminded. Future agent prompts should make this even more prominent, or the human should remind at each phase boundary.