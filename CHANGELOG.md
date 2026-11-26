# Changelog

## 1.0.4 — unreleased

Build tooling and documentation only. No runtime source changed; the production `main.js` bytes are identical to 1.0.3.

- `npm run build` no longer needs git. It type-checks and writes `main.js` to the checkout root, so it works on an extracted source copy such as the community directory's build verification.
- The release candidate build moved to `npm run candidate`. It still records the source commit and refuses to run without git, now before writing any output.
- Added `npm run check:clean-build`: builds a git-less archive of `HEAD` and checks that its root `main.js` matches the candidate bytes for the same commit.
- Updated `eslint-plugin-obsidianmd` to 0.6.0. Remaining warnings are listed in `KNOWN-ISSUES.md`.
- README: installation is from Obsidian's community plugin browser; the development section describes the new build behavior.

## 1.0.3 — 2026-10-30

- Keep unavailable-source mappings and their enabled preference; retry safely on startup or Refresh.
- Check canonical source identity, overlapping roots and real destination containment. Reject traversal, unsafe names and foreign-pointer removal.
- Persist operation intent before changing a pointer, serialize mutations, and expose conflicts or incomplete recovery read-only. Valid legacy settings import once without rewriting the old file.
- Reconcile stale enabled/disabled state during rename, removal and bulk requests. Settings controls apply the requested value.
- Fix native folder, toggle and confirmation modals by keeping plugin lifecycle state separate from Obsidian's selection-restoration field. Preserve close-before-selection and cancellation handling.
- Correct the minimum Obsidian API version to **1.2.3**. Older versions cannot install this update. Published version-history mappings are preserved.

### Upgrade cautions and validation

Back up the same vault's plugin assets and settings before updating; replace only the three release assets. Existing preferences can reconcile pointers on first load. Keep the new initialization marker and both metadata snapshots. Deleting all initialization evidence can reimport stale legacy settings and recreate a previously removed pointer. Downgrading to 1.0.2 can likewise replay stale settings. Neither operation is a supported reset.

The runtime code passed 95 automated tests (two native-platform skips) and bounded macOS native smoke on Obsidian **1.14.5**, including real pickers, settings/command toggles, rename/cancel/remove, reload, unavailable-source recovery and foreign-pointer preservation. Installer bundle 1.11.7 is a separate version. Minimum-version/second-Mac GUI behavior, Windows/Linux Obsidian GUI, UNC/removable volumes, broader popout cases and hardware power loss remain unverified. See [VALIDATION.md](VALIDATION.md) for the exact ledger.

The [release workflow](https://github.com/glassvault-ai/obsidian-symlink-manager/actions/runs/41148969856) passed validation on all three OS runners and attested the three release assets. Downloaded asset attestations and published hashes were verified against release commit `ca63b3812c9495fcb9374cd6858d10caaece008e`. Directory eligibility remains unresolved; publication and provenance do not establish in-app installability.
