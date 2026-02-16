# Symlink Manager

An Obsidian plugin that lets you link external folders into your vault using symlinks. Linked folders are fully integrated — files show up in search, graph view, and the file explorer, and are fully editable just like any other vault file. Manage connections from settings, toggle them on/off, and seamlessly bring outside projects into your workflow.

**Desktop only** — requires filesystem access not available on mobile.

> **Note:** This plugin accesses folders outside your vault to create symlinks pointing into it. No data is collected or transmitted — all operations are local.

## Features

- **Link external folders** — Pick any folder on your computer and link it into your vault. Files are fully editable in Obsidian — read, write, rename, everything works
- **Choose vault location** — Place symlinks in any vault folder via a fuzzy search picker
- **Toggle on/off** — Activate or deactivate symlinks without removing them from your list
- **Bulk toggle** — Enable or disable all symlinks at once
- **Settings dashboard** — View, rename, toggle, and delete all managed symlinks
- **Startup validation** — Automatically detects and cleans up broken symlinks on load
- **Safety checks** — Loop prevention, overwrite protection, and duplicate detection

## Usage

### Adding a symlink

1. Click the **link icon** in the ribbon, or run **Link external folder** from the command palette (Cmd/Ctrl+P)
2. Select the external folder you want to link
3. Choose where in your vault to place the symlink
4. The folder appears in your vault immediately

### Managing symlinks

Open **Settings > Symlink Manager** to see all managed symlinks. From there you can:

- **Toggle** — flip the switch to activate/deactivate
- **Rename** — click the name field, type a new name, click away to save
- **Delete** — click the trash icon (with confirmation)

### Commands

| Command | Description |
|---------|-------------|
| Link external folder | Start the create flow |
| Toggle symlink... | Pick a symlink to toggle on/off |
| Enable all symlinks | Activate all managed symlinks |
| Disable all symlinks | Deactivate all managed symlinks |

## How it works

The plugin creates standard directory symlinks (or junctions on Windows) pointing from inside your vault to external folders. Obsidian treats symlinked folders like regular folders — files appear in the file explorer, search, and graph view, and any edits you make are written directly to the original files on disk.

When you disable a symlink, the filesystem link is removed but the entry stays in your settings so you can re-enable it later. Deleting an entry removes both the symlink and the settings entry.

On startup, the plugin validates all managed symlinks and silently repairs or removes entries where the source folder no longer exists.

## Installing

### From Obsidian Community Plugins

1. Open **Settings > Community plugins**
2. Search for **Symlink Manager**
3. Click **Install**, then **Enable**

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/glassvault-ai/obsidian-symlink-manager/releases/latest)
2. Create a folder at `<your-vault>/.obsidian/plugins/symlink-manager/`
3. Copy the downloaded files into that folder
4. Restart Obsidian and enable the plugin in Settings > Community plugins

## License

[MIT](LICENSE)
