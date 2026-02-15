# Code Review Summary (2026-02-15)

Scope reviewed:
- `src/main.ts`
- `src/symlink-manager.ts`
- `src/settings.ts`
- `src/modals.ts`
- `src/types.ts`
- `manifest.json`
- `package.json`

Build check:
- `npm run build` passes.

Findings (ordered by severity):

1. **High** — Rename rollback can leave settings and filesystem out of sync.
   - In `renameSymlinkEntry`, rollback attempts to recreate the original symlink but ignores recreate failure. This can leave an entry logically active while no symlink exists on disk.

2. **Medium** — Startup reconciliation saves settings without awaiting persistence.
   - `validateSymlinksOnLoad` triggers `saveSettings()` without awaiting it, reducing reliability if startup/unload timing is unfavorable.

3. **Medium** — Toggle-on path can fail when a symlink exists but path comparison does not match expected normalization.
   - Existing symlink can fail equality check and then fail validation because target already exists, resulting in user-visible "cannot activate" behavior.

4. **Low** — Removing an inactive entry may leave an on-disk symlink orphaned.
   - `removeSymlinkEntry` only unlinks when entry is marked active.

5. **Low** — Bulk toggle success notice can be misleading under partial failure.
   - Notification says "All symlinks activated/deactivated" even when some entries failed.

Related atomic notes were written to the project memory via `vault write`:
- `Atomic Note: Rename Rollback Integrity`
- `Atomic Note: Startup Save Await`
- `Atomic Note: Toggle Path Normalization Edge Case`
- `Atomic Note: Delete Inactive Orphan Risk`
- `Atomic Note: Bulk Toggle Notice Accuracy`
