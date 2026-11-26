---
note_id: 20261126-1838-d8d68f0c
type: decision
status: active
tags:
- symlink
- release
- build
scope: project
created_at: 2026-11-26T18:38:39.618166Z
created_by: ai-agent
updated_at: 2026-11-26T18:38:57.81682Z
---

`npm run build` must work on a source copy with no `.git` directory, because Obsidian's community scorecard runs it on an extracted release source. It type-checks and writes production `main.js` to the checkout root through `scripts/build.mjs`, using the shared `buildOptions()`. It makes no git calls and has no temporary output.

Provenance lives only in `npm run candidate` (`scripts/candidate.mjs`). That script reads `git rev-parse HEAD` and `git status --porcelain` before it builds anything, so without git it exits non-zero before creating an output directory. It must never fall back to an unknown or empty commit. `.github/workflows/candidate.yml` calls the script directly, and `scripts/verify-candidate.mjs` checks its evidence against the reviewed commit and hashes.

The two paths must produce identical `main.js` bytes. They share `buildOptions()` with production settings, and esbuild's output is the same whether it writes to `outfile` or returns in-memory output. Changing options in only one path breaks the match.

The root output is a deliberate trade-off. `npm run build` overwrites any existing root `main.js`, so it must not run in a checkout whose root `main.js` is linked into a vault as a development install. The README's development section says so. The build is not guarded, because the scanner needs the standard root layout.

`npm run check:clean-build` needs a clean, committed tree. It archives `HEAD`, builds it with git disabled through `GIT_CEILING_DIRECTORIES`, and compares the root hash with the candidate hash. It also requires `candidate.mjs` to refuse to run in the copy. Mutations that restore the git-dependent build, change the root build options, or swallow git errors each fail it.

Enforced by: npm run check:clean-build

Related:
[[Reviewed release assets must be bound to their source commit]]
[[Obsidian's scorecard build verification runs npm run build without a git checkout, so Symlink Manager's git-dependent build fails]]
- {extends}[[Reviewed release assets must be bound to their source commit]]: the candidate path is where that binding is recorded; the scanner build is separate
