# Obsidian Community Plugin Release Guide

Step-by-step guide for releasing Symlink Manager as a public open source Obsidian community plugin.

## Prerequisites

- [ ] README.md in repo root
- [ ] LICENSE file in repo root (MIT)
- [ ] manifest.json with correct fields (id, name, version, minAppVersion, description, author, isDesktopOnly)
- [ ] versions.json mapping version to minAppVersion
- [ ] Clean build (`npm run build` passes)

---

## Step 1: Move Repo to GlassVault

The Obsidian plugin registry points to a GitHub repo URL permanently. The repo should live under the GlassVault org.

### Completed

Repo created at `glassvault-ai/obsidian-symlink-manager` with full commit history. Old repo deleted. Local remote updated:
```bash
git remote set-url origin https://github.com/glassvault-ai/obsidian-symlink-manager.git
```

README release link and `authorUrl` in manifest.json both point to `glassvault-ai`.

---

## Step 2: Production Build + GitHub Release

Obsidian installs plugins by downloading files from a GitHub Release. Each release needs three files attached: `main.js`, `manifest.json`, `styles.css`.

### Build

```bash
npm run build
```

This runs TypeScript type checking then bundles with esbuild, outputting `main.js` in the project root.

### Create the release

```bash
gh release create 1.0.0 main.js manifest.json styles.css \
  --title "1.0.0" \
  --notes "Initial release — manage folder symlinks from within Obsidian."
```

This creates a git tag `1.0.0` and uploads the three files as release assets.

### Verify

- Go to the GitHub releases page and confirm all three files are attached
- Download them and verify `main.js` is the bundled output (not source)

---

## Step 3: Submit to Obsidian Community Plugins

The official plugin registry lives at [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases).

### Submit a PR

1. Fork `obsidianmd/obsidian-releases`
2. Edit `community-plugins.json` — add an entry (alphabetical by id):
   ```json
   {
     "id": "symlink-manager",
     "name": "Symlink Manager",
     "author": "GlassVault",
     "description": "Manage folder symlinks — link external folders into your vault, toggle them on/off.",
     "repo": "glassvault/obsidian-symlink-manager"
   }
   ```
3. Open a PR with a clear title like "Add Symlink Manager plugin"

### Review process

The Obsidian team checks for:
- Plugin installs and runs correctly
- No malicious or unsafe code
- Proper manifest.json with required fields
- README.md exists
- LICENSE file exists
- No bundled node_modules in the release assets
- `isDesktopOnly: true` if using Node.js APIs (we do)

Typical review time: a few days to a couple weeks.

Once merged, the plugin appears in **Settings > Community Plugins > Browse** for all Obsidian users.

---

## Step 4: Future Version Updates

When you make changes and want to release a new version:

1. Bump the version in three places:
   - `manifest.json` → `"version": "1.1.0"`
   - `package.json` → `"version": "1.1.0"`
   - `versions.json` → add `"1.1.0": "0.15.0"` (or update minAppVersion if needed)
2. Build:
   ```bash
   npm run build
   ```
3. Commit, tag, and release:
   ```bash
   gh release create 1.1.0 main.js manifest.json styles.css \
     --title "1.1.0" \
     --notes "Description of changes."
   ```
4. Obsidian auto-detects the new version and offers updates to users — no PR needed

---

## Open Source Basics

Since this is a first open source project, here's what to expect.

### What MIT license means

- Anyone can see, fork, use, modify, and distribute the code
- They must include the license text
- You retain copyright and full control of the repo
- You're not liable for anything

### What you'll see on GitHub

- **Issues** — Users report bugs or request features. Triage at your own pace. Label freely: `bug`, `enhancement`, `won't fix`, `help wanted`
- **Pull requests** — Contributors submit code. You review and merge or decline
- **Stars/forks** — Vanity metrics, fun to watch

### What you don't need to worry about

- No obligation to respond to every issue or merge every PR
- Going weeks without touching the repo is normal and fine
- You set the tone and pace

### Optional extras

- `CONTRIBUTING.md` — Set expectations for contributors (not required)
- `CHANGELOG.md` — Track changes per version (can also use GitHub release notes)
- GitHub issue templates — Pre-fill bug report / feature request forms
- GitHub Actions — Auto-build on push, auto-create releases on tag (nice later, not needed now)
