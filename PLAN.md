# Obsidian Symlink Manager Plugin — Build Plan

**Date:** 2026-02-14

## Context

Alex uses Obsidian as the visual layer for his GlassVault multi-vault system. He just created a symlink from his global Obsidian vault to a project's `memory/` folder and watched the graph view expand like "adding a second half of its brain." He wants for us to build a plugin to manage these symlinks with CRUD operations from within Obsidian — no terminal needed.

This also serves as a prototype for the GlassVault mobile app's graph view with toggleable vault connections. (to learn more about GlassVault, ask Alex - the user.)

## What We're Building

An Obsidian community plugin that manages folder symlinks. Desktop only (symlinks require Node.js `fs` module).

### Core Features

| Operation | UX | Implementation |
|-----------|-----|----------------|
| **Create** | Command palette → native folder picker → choose location in vault | `fs.symlinkSync(source, target, 'dir')` |
| **Read** | Settings tab shows all managed symlinks with status | Read from `data.json`, check `fs.existsSync()` |
| **Update (Toggle)** | Toggle switch per symlink in settings | On: `fs.symlinkSync()` / Off: `fs.unlinkSync()` |
| **Delete** | Button per symlink in settings | `fs.unlinkSync()` + remove from `data.json` |

### Commands (Cmd+P)

1. `Symlink Manager: Link external folder` — opens folder picker modal, then vault location picker
2. `Symlink Manager: Toggle symlink...` — fuzzy search of symlink names, pick one, toggles it on/off
3. `Symlink Manager: Toggle all on` — activate all symlinks
4. `Symlink Manager: Toggle all off` — deactivate all (clean graph)

### Settings Tab

List of all managed symlinks, each showing:
- Name (editable)
- Source path (external folder)
- Vault location (where the symlink lives inside vault)
- Toggle switch (active/inactive)
- Delete button

## Tech Stack

- **Language:** TypeScript
- **Build:** esbuild (standard Obsidian toolchain)
- **Template:** Based on obsidian-sample-plugin
- **APIs:** Plugin, PluginSettingTab, Setting, Modal, FuzzySuggestModal, Notice
- **Node.js:** `fs` (symlinkSync, unlinkSync, existsSync, lstatSync), `path`
- **Desktop only:** `isDesktopOnly: true` in manifest.json

## Project Structure

```
~/code/obsidian-symlink-plugin/
├── src/
│   ├── main.ts           # Plugin class, commands, ribbon icon
│   ├── settings.ts        # Settings tab with symlink list
│   ├── modals.ts          # Folder picker modals
│   └── symlink-manager.ts # Core CRUD logic (fs operations)
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── styles.css
├── versions.json
└── README.md
```

## Data Model

Stored in `.obsidian/plugins/symlink-manager/data.json`:

```typescript
interface SymlinkEntry {
  id: string;           // unique id
  name: string;         // display name
  sourcePath: string;   // absolute path to external folder
  vaultPath: string;    // relative path inside vault where symlink lives
  active: boolean;      // toggle state
}

interface PluginSettings {
  symlinks: SymlinkEntry[];
}
```

## Build Method: Fractal Decomposition

This build uses the fractal decomposition method (see vault note). Notes carry the WHAT and WHY. Agents figure out the HOW. Three levels:

### Level 1: This document (PLAN.md)
The full picture. You're reading it. Covers vision, scope, features, tech stack, and build phases.

### Level 2: System notes (built by planning agent)
One atomic vault note per build area. Covers: dependency order between components, which Obsidian APIs to use and why, safety boundaries, platform considerations. General enough to orient any fresh agent, specific enough to scope the work. Wikilinked to each other.

### Level 3: Implementation notes (built by planning agent)
One atomic vault note per component. The WHAT and WHY for each piece: what it does, why it exists, what it connects to, what constraints apply. No code. No function signatures. The implementing agent reads these and knows exactly what to build without asking product questions. Engineering decisions (naming, patterns, structure) belong to the implementing agent.

### Workflow

1. **Planning agent** reads this PLAN.md, writes Level 2 + Level 3 notes. Pauses.
2. **Alex reviews** notes and checks context health.
3. **Build agent** (same or fresh) reads the notes and builds Phase 1. Pauses.
4. **Alex reviews** the build, gives go-ahead for Phase 2.
5. Repeat until done.

If context compacts or a fresh agent is needed at any point, the notes are self-contained. A new agent vault-queries the plan notes and picks up seamlessly.

---

## Build Phases

### Phase 1: Scaffold + Core Engine
Get the project compiling and the symlink CRUD logic working. No UI yet.

- Scaffold project from obsidian-sample-plugin template
- manifest.json, package.json, esbuild config, tsconfig
- Core symlink manager module: create, remove, toggle, validate
- Platform detection (macOS/Linux symlinks vs Windows junctions)
- Data model and settings load/save
- `npm install`, verify it compiles

**Depends on:** Nothing. This is the foundation.

### Phase 2: Settings Tab UI
The management dashboard where users see, toggle, and delete symlinks.

- Settings tab with list of all managed symlinks
- Each entry: name, source path, vault path, toggle switch, delete button
- "Add new symlink" button
- Toggle calls core engine's toggle function
- Delete calls core engine's remove function + removes from settings

**Depends on:** Phase 1 (needs core engine and data model)

### Phase 3: Modals + Commands
The power-user layer. Create symlinks via command palette, toggle by name.

- Native OS folder picker (Electron's `dialog.showOpenDialog()`) for source selection
- Vault folder picker (FuzzySuggestModal) for target location
- Register all 4 commands: Link, Toggle specific, Toggle all on, Toggle all off
- Ribbon icon for quick access

**Depends on:** Phase 1 (core engine) + Phase 2 (settings tab for the "Link" flow to save to)

### Phase 4: Safety + Polish + Dev Testing
Harden, test, polish.

- Safety checks: prevent loops, prevent overwrites, validate source exists, handle deleted sources gracefully
- On-load validation: verify all symlinks still intact when Obsidian starts
- Symlink plugin folder into `.obsidian/plugins/` for live dev testing
- Test all CRUD operations end-to-end
- Test edge cases: source deleted, vault path occupied, toggle rapid-fire

**Depends on:** Phases 1-3

## Safety Checks

- Never delete the source folder (only the symlink pointer)
- Prevent symlink loops (source can't be inside vault)
- Prevent overwriting existing folders (check before creating)
- Validate source path exists before creating symlink
- Handle Windows junctions vs macOS/Linux symlinks

## Development Workflow

```bash
# Terminal: watch mode
cd ~/code/obsidian-symlink-plugin && npm run dev

# Obsidian: install hot-reload plugin, symlink plugin folder into .obsidian/plugins/
# Changes auto-rebuild and auto-reload
```

## Future Enhancements (Not v1)

- GlassVault config integration (read `.vault/config.yaml` for known project vaults)
- Drag-and-drop folder onto Obsidian to create symlink
- Graph view coloring (different colors for symlinked folders)
- Status bar showing connected vault count
- Batch import from vault config
