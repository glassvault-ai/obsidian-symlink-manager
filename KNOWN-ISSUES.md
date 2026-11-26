# Known issues

- Settings search (Obsidian 1.13): the settings tab does not implement `getSettingDefinitions()`, so its settings do not appear in settings search. Lint warning `obsidianmd/settings-tab/prefer-setting-definitions` in `src/settings.ts`; deferred because the API floor stays 1.2.3.
- `setWarning` → `setDestructive` (Obsidian 1.13): the confirmation modal's destructive button still uses `setWarning`. Lint warning `@typescript-eslint/no-deprecated` in `src/modals.ts`; deferred because the API floor stays 1.2.3.
- Community scorecard `no-unsafe-*` warnings: the 1.0.3 scan listed 266 typescript-eslint `no-unsafe-*` warnings on Node `fs`/`path`/`crypto` calls that a local lint with dependencies installed does not report. Pending a directory preview scan of 1.0.4.
- Pre-existing (review round 1, R1-06): an older tracked plan and archived gardener review notes under `memory/` contain a local path and private coordination details. Not changed on the 1.0.4 branch; pending maintainer review.
- convert-to-check (review round 1, R1-03): no check stops internal workflow text (local paths, agent or session coordination) from landing in tracked docs or `memory/` in this public repo.
