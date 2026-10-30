---
note_id: 20261030-2116-7810bb29
type: decision
status: active
tags:
- symlink
- reliability
scope: project
created_at: 2026-10-30T21:16:39.941945Z
updated_at: 2026-10-30T21:25:22.553441021Z
created_by: ai-agent
---

The folder and toggle pickers must defer close cancellation because Obsidian can close a fuzzy modal before delivering its selected item. The deferral belongs to the modal’s window, not an unrelated global window. A single settlement owner clears its timer and window/lifetime listeners when selection, cancellation, page hide or plugin unload wins.

A modal can be constructed in one document and attached to another window when opened. Selection ownership is therefore rebound after open, removing the old window listener and moving any pending cancellation timer; the constructor window alone is insufficient (src/modals.ts:18).

Native operating-system dialogs may remain visible after plugin unload. The manager detaches their pending result and ignores a later response; it does not try to control other application windows. A delayed filesystem preflight likewise cannot admit a new mutation after unload. Already durable intent can finish safely or recover at the next load.

These boundaries are implemented in src/modals.ts and src/main.ts, with close-before-choose, page-hide and delayed-unload tests in tests/lifecycle.test.cjs. Mocked window events validate ordering, not native popout rendering; minimum/current host verification remains distinct.

Related:
[[FuzzySuggestModal onClose fires before onChooseItem]]
[[Obsidian Plugin Lifecycle and Symlink Implications]]