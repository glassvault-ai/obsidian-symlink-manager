# Plan: 1.0.4 clean-environment build and documentation refresh

**Date:** 2026-11-26
**Project:** Symlink Manager (`obsidian-symlink-plugin`)
**Branch:** `fix/scanner-build-1.0.4` (from main `da3906a`, released 1.0.3 content)
**Mode:** autonomous.
**Review tier:** small. Build tooling, docs and a lint bump, with no runtime behaviour change intended. If the lint bump forces a runtime source change, the tier moves up to medium and the builder escalates before making it.
**Tags:** plan

The builder follows the builder skill's build rules.

---

## Purpose

Obsidian's community scorecard runs `npm run build` on a clean copy of the release source that has no `.git` directory. The 1.0.3 build script calls `git rev-parse HEAD` and crashes, so the scorecard reports "Build verification failed". The README also still says the directory install control is disabled, and it is now enabled. 1.0.4 fixes the build, refreshes those docs, and aligns the local linter with the scanner. No user-facing behaviour changes.

## What the maintainer will see

- `npm run build` succeeds on a plain extracted copy of the source (no git) after `npm ci`. It writes `main.js` at the project root, the standard Obsidian plugin layout.
- That root `main.js` is byte-identical to the `main.js` the reviewed candidate path (`scripts/candidate.mjs`) produces from the same source.
- The candidate/attestation path in `candidate.yml` works as before: it still records the source commit, and it still refuses to run when git is unavailable. Provenance stays strict where it matters.
- README and CHANGELOG describe 1.0.4 accurately. Version metadata reads 1.0.4 with minimum app 1.2.3, and the historical `versions.json` mappings are unchanged.
- Lint passes with `eslint-plugin-obsidianmd` 0.6.0: zero errors. Remaining warnings are each listed in `KNOWN-ISSUES.md`.

**Edge cases:**
- No `.git` (scanner environment) → `npm run build` exits 0 and writes root `main.js`.
- Inside a git checkout → `npm run build` behaves the same. It doesn't need git.
- `candidate.mjs` with no git → still fails loudly. It must not emit an evidence file with an empty or unknown commit.
- `npm run build` in a checkout whose root `main.js` is a live development install → it would overwrite that file. Document this in the README's development section. The build itself isn't guarded, because the root layout is what the scanner needs.

## How we'll know it works

Evidence goes in the evidence folder named in the builder's brief.

- **Tests:** the existing suite (`npm test`) passes unchanged, apart from new build checks. Add a script-level check that a git-less copy builds and that its root `main.js` hash equals the candidate hash for the same tree.
- **Running it:** a transcript of: `git archive HEAD` into a fresh temp directory → `npm ci --ignore-scripts` → `npm run build` (exit 0) → `shasum -a 256 main.js`, compared with `node scripts/candidate.mjs` run in the worktree at the same commit. Also `npm run typecheck`, `npm run lint` (0 errors, warning list), `npm test` and `npm run release:check`, with outputs.
- **Failure cases:** `node scripts/candidate.mjs` in the git-less copy exits non-zero with the git error, captured in the transcript.
- **Runtime unchanged:** if no `src/` file changed, the root `main.js` hash equals the published 1.0.3 asset hash (`92e0ab9e…f0d`, in VALIDATION.md). If `src/` did change, say so and explain why.

## Checks this build adds

| Risk | Check |
|---|---|
| Build regresses to needing git or a temp output | a scripted git-less build check (above), run as an npm script; adding it to CI is optional |
| Root `main.js` drifts from candidate bytes | hash equality in the same check |
| Local lint differs from the scanner's | pinned `eslint-plugin-obsidianmd` 0.6.0 in `package.json` and the lockfile |

**Judgment-only risks:** whether the scanner also needs anything beyond a successful root build, and whether its 266 `no-unsafe-*` warnings on Node `fs`/`path`/`crypto` calls clear. Only the directory's own preview scan can show that, and the maintainer runs it from the owner dashboard after this build. Don't claim either.

## Design

- **`npm run build`** = typecheck, then a production esbuild with the shared `buildOptions()` writing `main.js` to the project root. No git calls and no temp directory. `npm run dev` may keep its temp-directory watch output.
- **`scripts/candidate.mjs`** keeps its temp-directory output, the repeated-build equality check and the required git provenance. If `package.json` needs a script name for it, add `candidate`. Keep `candidate.yml` working; change it only if a script name it uses changes.
- **Lint bump:** `eslint-plugin-obsidianmd` 0.4.2 → 0.6.0, plus any peer bumps it requires, locked. Fix new errors only if the fix doesn't change runtime behaviour. New warnings that need Obsidian 1.13 APIs (`getSettingDefinitions`, `setDestructive`) stay unfixed: the floor stays 1.2.3. Log them in `KNOWN-ISSUES.md`.
- **Docs:** drop the README's stale "disabled install control" sentence and say the plugin installs from the community browser. Update the development section for the new build behaviour. Add a CHANGELOG 1.0.4 entry: build tooling and docs, no runtime change (if that holds). Update the `npm run build` row in VALIDATION.md. Bump `manifest.json`, `package.json` and `versions.json` (add `"1.0.4": "1.2.3"`).
- **`KNOWN-ISSUES.md`** (new, repo root): settings-search API (1.13), `setWarning` → `setDestructive` (1.13), and the scanner's `no-unsafe-*` warnings pending a preview scan. One line each.
- **Public repo:** commits, plan and notes contain architectural facts only. No personal paths, session ids or coordination details.

**Does not touch:** anything under `src/reliability/`, settings or modal behaviour, persistence, the API floor, the CI attestation logic, tags, releases, `main`, and any existing plugin installation. Never run `npm run build` in another checkout whose root `main.js` may be a live installation. Work only in this worktree.

**Read in full:** `Obsidian's scorecard build verification runs npm run build without a git checkout, so Symlink Manager's git-dependent build fails` · `Community review fixes — run lint baseline before editing code`

---

## Phases

### Phase 1: Clean-environment build, lint bump, docs

All of the above, committed and pushed to the feature branch. A second commit is fine if the lint bump is separate.

### Wrap-up

Follow the wrap-up skill up to the point of publishing. Do not tag, release, merge or touch `main`. Stop and wait for sign-off.
