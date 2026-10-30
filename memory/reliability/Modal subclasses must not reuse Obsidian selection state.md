---
note_id: 20261030-2333-61714ba3
type: lesson
status: active
tags:
- symlink
- obsidian
- reliability
scope: project
created_at: 2026-10-30T23:33:10.742713Z
created_by: ai-agent
---

Obsidian Modal owns a selection property for saved text selection and focus. Its constructor initializes that field, open replaces it with a host selection snapshot, and close uses the snapshot to restore focus. A TypeScript private property with the same name is still an ordinary runtime property; omitted host internals in public declarations do not make that name safe for a subclass.

The native folder-picker smoke exposed this collision in src/modals.ts:39. The plugin stored its settlement owner in selection, then the base open overwrote it. Closing the destination picker raised this.selection.attach is not a function before the chosen folder could reach link creation. Toggle and confirmation subclasses shared the same collision. Plugin lifecycle state must use a distinct symlinkSelection field without replacing host selection restoration.

The old tests/host.cjs Modal stub never assigned host selection, so its successful ordering tests could not detect the overwrite. A meaningful regression must have base open overwrite selection and base close consume that same host snapshot, while still checking plugin once-only settlement, close-before-choose, cancellation and owning-window cleanup. This validates a known host boundary, not native GUI rendering.

Related:
[[Modal cancellation belongs to the owning window and plugin lifetime]]
[[FuzzySuggestModal onClose fires before onChooseItem]]