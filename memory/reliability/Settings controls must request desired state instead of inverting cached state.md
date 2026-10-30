---
note_id: 20261030-2110-54a13709
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T21:10:36.466525Z
created_by: ai-agent
---

A toggle displayed in settings can be stale after a command or bulk action changes the model. Inverting the current value when the old control fires can reverse the latest intent. The control must submit the enabled or disabled value that the user selected, while the coordinator serializes and revalidates the request.

Visible settings subscribe to model changes and show health separately from the preference. Renames, failed rollback, commands and recovery completion refresh the same view. Pending operations expose explicit recovery choices; Forget removes metadata only and leaves all filesystem pointers untouched. This also gives a safe escape from a foreign-pointer conflict without treating a symlink type check as ownership.

The integration boundary is src/main.ts and src/settings.ts. tests/plugin.test.cjs exercises stale control requests against the compiled candidate in a mocked host; native window behavior requires separate validation.

Related:
[[Desired symlink state survives unavailable sources]]
[[Settings tab must refresh after create flow]]