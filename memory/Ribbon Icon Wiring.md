---
note_id: 20260215-0142-87f8304b
type: fact
status: active
tags:
- phase-3
- ribbon
- ui
- implementation
scope: project
created_at: '2026-02-15T01:42:01.077965+00:00'
created_by: ai-agent
---

The ribbon icon is registered via this.addRibbonIcon() in onload(). It triggers the same action as the 'link-external-folder' command — opens the create symlink flow. Use the 'link' Lucide icon (Obsidian ships Lucide). The tooltip should say 'Link external folder'. The ribbon click callback is simply: () => this.createSymlinkFromPicker(). This is pure convenience — same action as Cmd+P → 'Symlink Manager: Link external folder'.