---
note_id: 20260215-0320-54257632
type: lesson
status: active
tags:
- settings
- ux
- rename
- lesson
scope: project
created_at: '2026-02-15T03:20:21.046836+00:00'
created_by: ai-agent
---

The settings tab name field initially used onChange (fires every keystroke) for rename validation. This made it impossible to clear the field to type a new name — selecting all and deleting triggered the 'invalid name' error immediately and reverted. Fix: switched to an addEventListener('blur') on the input element instead. This lets the user freely edit the text, and validation only runs when they click/tab out of the field. If the field is empty on blur, it reverts with a Notice. This pattern applies to any Obsidian Setting text input where you need deferred validation.