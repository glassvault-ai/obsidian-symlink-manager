# Symlink Manager

Link an external directory into an Obsidian desktop vault and manage its pointer from settings. Edits to linked notes change the original files. Disabling or removing a managed link removes its pointer, not its source contents.

Version **1.0.3** fixes reliability and modal failures in 1.0.2. See [CHANGELOG.md](CHANGELOG.md) for changes and upgrade cautions. The last verified directory observation (2026-10-30) showed a disabled install control; publication alone does not establish current directory eligibility.

## Requirements and limits

- API minimum: Obsidian **1.2.3**, established from the APIs used, including the settings controls. Native UI behavior on that minimum version remains untested; bounded macOS native smoke passed on runtime 1.14.5. The imperative dashboard does not yet integrate with the settings search introduced in 1.13.
- Desktop only. The implementation uses directory symlinks on macOS/Linux and junctions on Windows. Native validation status is recorded in [VALIDATION.md](VALIDATION.md); an implemented Windows path is not proof that every Windows volume is tested.
- Sources must be accessible directories, disjoint from the vault and other configured sources. Canonical aliases and overlapping source roots are rejected. A destination must be a real folder beneath the vault's canonical root; placing links inside an existing linked folder is rejected.
- Portable names exclude dot/dot-dot, separators, reserved device names, trailing periods/spaces and control characters. Destination names are reserved case-insensitively for portability; source identity does not blindly lowercase paths.
- Arbitrary nested unmanaged symlinks inside source trees are not recursively scanned. Another program changing paths concurrently can invalidate filesystem observations; checks are not an atomic cross-process lock. Run only one manager for a given vault at a time.
- Symlinks are not a synchronization mechanism. Do not synchronize the manager's machine-local settings/recovery files between computers. A copied vault or changed path may require reviewing and recreating mappings.
- Obsidian has additional [symlink limitations](https://obsidian.md/help/symlinks), including cross-device moves and sync interactions. Do not assume that every file-manager move, link update or sync workflow works through a link. Keep backups of the original data.

## Use

Run **Link external folder**, or use the ribbon link icon, to choose a source and destination. In the destination picker, `/` means the top level of the current vault; it is not the operating-system root. A new vault without subfolders shows only that option. Settings provide:

- **Enabled preference:** the desired state, separate from the displayed filesystem health.
- **Refresh:** check sources and retry saved preferences. An unavailable source retains its entry and enabled preference; startup and Refresh retry when it returns. There is no background polling.
- **Rename:** enter a new name and leave the field. The same safety checks apply even to disabled entries. A failed rename attempts to restore its old link; failed recovery is shown explicitly.
- **Remove:** confirm removal of a verified managed pointer and its entry. A conflicting file, real directory or foreign link is preserved.
- **Forget:** explicitly remove metadata only when a conflict needs to be abandoned. All existing pointers remain untouched. This is also available for pending operations; review both names before forgetting an interrupted rename.
- **Keep disabled:** cancel recoverable pending intent and retain a disabled mapping when the observed paths are unambiguous.

Commands also enable/disable all entries, select an entry to toggle, and refresh health. The toggle picker applies the inverse of the enabled label shown when it opened. If another action already reached that state while the picker remained open, selecting it keeps that state. Bulk results report successes and failures. Disabling the plugin leaves existing links in place; pending work already durably admitted may finish or be recovered at the next load. Late picker responses cannot start new work after unload.

## Recovery and migration

On the first 1.0.3 load, valid legacy `data.json` entries are imported without changing that file. Invalid records are retained for review rather than acted upon. Thereafter the plugin uses two checksummed metadata generations in its own `symlink-manager-state` directory, with a separate `symlink-manager-state.initialized` marker beside it. Intent is committed before any link mutation. If final persistence fails, further mutations stop until Refresh can reconcile the pending operation.

A missing, unreadable, corrupt or unsupported recovery snapshot or initialization marker makes the manager read-only. When snapshots remain readable, their saved entries and observed health stay visible for recovery review; displaying them does not authorize replay or repair. It does **not** import old settings again or silently replay an older generation. Preserve the original legacy file, initialization marker, both snapshots and any temporary metadata evidence before attempting repair. Work from copies in a disposable vault and report the error without publishing private source paths. The marker prevents an entirely missing recovery directory from looking like first installation. Do not delete all recovery metadata while retaining stale legacy settings: loss of every initialization artifact is indistinguishable from a fresh install and can recreate a previously removed pointer from stale legacy data. Removing only the marker stays read-only; removing the remaining recovery directory afterward crosses this full-wipe limit. Do not reset a vault by deleting recovery files; use a new disposable vault for tests. File flushes and POSIX directory flushes are used, but real power-loss behavior on specific volumes has not been certified. Read-only recovery currently requires reviewed restoration of the metadata files; there is no automatic corruption-repair button.

An interrupted rename with one expected pointer can be reconciled. If neither pointer exists, use Keep disabled to preserve a safe mapping, or Forget and relink after reviewing the source. Ambiguous or foreign paths are left alone. Reverting to 1.0.2 can replay its stale `data.json`; do not downgrade with old active mappings without reviewing them first.

## Candidate development and verification

```sh
npm ci --ignore-scripts
npm run typecheck
npm run lint
npm test
npm run build
```

Builds allocate a fresh directory under the operating system's temporary directory and print its path. They never overwrite checkout-root `main.js` or `data.json`. Tests create disposable sources/vaults with sentinels; they do not load an installed plugin or real vault settings. `npm run dev` watches only its newly allocated temporary output directory.

Version 1.0.3 maps to Obsidian 1.2.3 in `versions.json`; historical mappings remain unchanged. Run `npm run release:check` before preparing a new tag. The manual candidate workflow requires the reviewed commit and SHA-256 values for all three assets; it rejects mismatches before any attestation/upload. Workflow execution, build attestations and directory eligibility are separate checks; local build equality alone supplies neither.

## Upgrade from 1.0.2

1. Back up this vault's existing plugin assets and `data.json` before enabling 1.0.3. Keep that backup outside the active plugin directory. Do not import another vault's settings or use old development mappings as installation data.
2. Replace only `main.js`, `manifest.json` and `styles.css` from the same approved release. Retain this vault's own settings. An empty legacy mapping list starts empty; valid existing mappings retain their enabled preference. Startup may create or remove verified pointers to match those saved preferences, so review the backup before upgrading a vault with mappings.
3. On first load, inspect the settings rows and recovery messages before making changes. Unavailable sources stay listed. Conflicts are preserved for review. Preserve the new initialization marker and both recovery snapshots alongside future backups; do not delete them as a reset or blindly downgrade with stale 1.0.2 settings.

The known full-metadata-wipe limitation above remains in 1.0.3. Native smoke passed on macOS with Obsidian runtime 1.14.5; it is not minimum-version, second-Mac, Windows or Linux Obsidian GUI acceptance. The three OS CI validation jobs and all three release-asset attestations passed; see the [release ledger](VALIDATION.md#published-release-and-installed-behavior).

## Installation

Use only an approved published release for normal installation. Where the directory enables installation, use Obsidian's community browser. A manual release installation uses `main.js`, `manifest.json` and `styles.css` from that exact release in its own plugin directory. Never copy another vault's `data.json` or recovery snapshots as an installation step. Candidate UI testing belongs in a disposable vault; it does not authorize replacing an existing installation.

## License

[MIT](LICENSE)
