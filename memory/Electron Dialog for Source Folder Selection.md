---
note_id: 20260215-0125-88f5bf19
type: fact
status: active
tags:
- electron
- folder-picker
- ux
- modals
scope: project
created_at: '2026-02-15T01:25:49.737290+00:00'
created_by: ai-agent
---

To let users pick an external folder, we use Electron's dialog.showOpenDialog() which opens the native OS file picker. In Obsidian's Electron context, access it via require('electron').remote.dialog or the newer @electron/remote. The call looks like: dialog.showOpenDialog({ properties: ['openDirectory'] }). This returns a promise with an array of selected paths (or empty if cancelled). This is the most natural UX — users get their OS's native folder picker, not some custom modal. Important: this only works on desktop, which is already enforced by isDesktopOnly. The folder picker is the first step in the 'create symlink' flow, followed by choosing where in the vault to place the link.

Related:
[[FuzzySuggestModal for Vault Path Selection]]
[[Vault Root Path Access]]