# Changelog

## 1.0.3 — 2026-10-30

- Keep unavailable-source mappings and their enabled preference; retry safely on startup or Refresh.
- Check canonical source identity, overlapping roots and real destination containment. Reject traversal, unsafe names and foreign-pointer removal.
- Persist operation intent before changing a pointer, serialize mutations, and expose conflicts or incomplete recovery read-only. Valid legacy settings import once without rewriting the old file.
- Reconcile stale enabled/disabled state during rename, removal and bulk requests. Settings controls apply the requested value.
- Fix native folder, toggle and confirmation modals by keeping plugin lifecycle state separate from Obsidian's selection-restoration field. Preserve close-before-selection and cancellation handling.
- Correct the minimum Obsidian API version to **1.2.3**. Older versions cannot install this update. Published version-history mappings are preserved.

### Upgrade cautions and validation

Back up the same vault's plugin assets and settings before updating; replace only the three release assets. Existing preferences can reconcile pointers on first load. Keep the new initialization marker and both metadata snapshots. Deleting all initialization evidence can reimport stale legacy settings and recreate a previously removed pointer. Downgrading to 1.0.2 can likewise replay stale settings. Neither operation is a supported reset.

The runtime code passed 95 automated tests (two native-platform skips) and bounded macOS native smoke on Obsidian **1.14.5**, including real pickers, settings/command toggles, rename/cancel/remove, reload, unavailable-source recovery and foreign-pointer preservation. Installer bundle 1.11.7 is a separate version. Minimum-version/second-Mac behavior, Windows/Linux/UNC/removable volumes, broader popout cases and hardware power loss remain unverified. See [VALIDATION.md](VALIDATION.md) for the exact ledger.

Reproducible release packaging and a manually gated provenance workflow are prepared. No new remote attestation or directory-installability result is claimed until those checks actually run.
