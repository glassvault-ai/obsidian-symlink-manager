import { Notice, Plugin, FileSystemAdapter } from "obsidian";
import type { PluginSettings, SymlinkEntry } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import {
	validateCreate,
	createSymlink,
	removeSymlink,
	toggleSymlink,
	validateEntry,
} from "./symlink-manager";
import { SymlinkManagerSettingTab } from "./settings";
import { pickVaultFolder, pickSymlinkToToggle } from "./modals";

export default class SymlinkManagerPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new SymlinkManagerSettingTab(this.app, this));
		this.registerCommands();
		this.addRibbonIcon("link", "Link external folder", () => {
			this.createSymlinkFromPicker();
		});
		this.validateSymlinksOnLoad();
	}

	private registerCommands(): void {
		this.addCommand({
			id: "link-external-folder",
			name: "Link external folder",
			callback: () => this.createSymlinkFromPicker(),
		});

		this.addCommand({
			id: "toggle-symlink",
			name: "Toggle symlink...",
			callback: async () => {
				if (this.settings.symlinks.length === 0) {
					new Notice("Symlink Manager: No symlinks to toggle");
					return;
				}
				const entry = await pickSymlinkToToggle(this.app, this.settings.symlinks);
				if (entry) {
					await this.toggleSymlinkEntry(entry.id);
				}
			},
		});

		this.addCommand({
			id: "enable-all-symlinks",
			name: "Enable all symlinks",
			callback: () => this.toggleAll(true),
		});

		this.addCommand({
			id: "disable-all-symlinks",
			name: "Disable all symlinks",
			callback: () => this.toggleAll(false),
		});
	}

	async onunload(): Promise<void> {
		// Intentionally empty: symlinks persist when plugin is disabled.
		// The plugin manages symlinks — it doesn't own them.
	}

	// --- Settings persistence ---

	async loadSettings(): Promise<void> {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	// --- Vault path helper ---

	getVaultBasePath(): string {
		return (this.app.vault.adapter as FileSystemAdapter).getBasePath();
	}

	// --- Startup validation ---

	private validateSymlinksOnLoad(): void {
		const basePath = this.getVaultBasePath();
		let anyChanged = false;

		for (const entry of this.settings.symlinks) {
			if (!entry.active) continue;

			const status = validateEntry(basePath, entry);

			if (!status.sourceExists) {
				entry.active = false;
				anyChanged = true;
				new Notice(`Symlink Manager: Source missing for "${entry.name}" — deactivated`);
				continue;
			}

			if (!status.symlinkExists) {
				// Source exists but symlink is gone — recreate it silently
				const params = {
					sourcePath: entry.sourcePath,
					vaultBasePath: basePath,
					vaultPath: entry.vaultPath,
					name: entry.name,
				};
				const validation = validateCreate(params);
				if (validation.success) {
					const result = createSymlink(params);
					if (!result.success) {
						entry.active = false;
						anyChanged = true;
						new Notice(`Symlink Manager: Failed to restore "${entry.name}" — ${result.message}`);
					}
				} else {
					entry.active = false;
					anyChanged = true;
					new Notice(`Symlink Manager: Cannot restore "${entry.name}" — ${validation.message}`);
				}
			}
		}

		if (anyChanged) {
			this.saveSettings();
		}
	}

	// --- Create flow (folder picker → vault location → create) ---

	async createSymlinkFromPicker(): Promise<void> {
		// Step 1: Electron folder picker for source
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { remote } = require("electron");
		const result = await remote.dialog.showOpenDialog({
			title: "Select external folder to link",
			properties: ["openDirectory"],
		});

		if (result.canceled || result.filePaths.length === 0) return;

		const sourcePath = result.filePaths[0] as string;
		const sourceName = require("path").basename(sourcePath) as string;

		// Early duplicate check before opening vault picker
		const existing = this.settings.symlinks.find((e) => e.sourcePath === sourcePath);
		if (existing) {
			new Notice(`Symlink Manager: This folder is already linked as "${existing.name}"`);
			return;
		}

		// Step 2: Vault folder picker for destination
		const folder = await pickVaultFolder(this.app);
		if (folder === null) return;

		const entry: SymlinkEntry = {
			id: crypto.randomUUID(),
			name: sourceName,
			sourcePath,
			vaultPath: folder.path,
			active: false,
		};

		await this.addSymlink(entry);
	}

	// --- Public CRUD API (used by settings tab, commands, modals in later phases) ---

	async addSymlink(entry: SymlinkEntry): Promise<boolean> {
		// Duplicate detection: same source folder can't be linked twice
		const duplicate = this.settings.symlinks.find(
			(e) => e.sourcePath === entry.sourcePath,
		);
		if (duplicate) {
			new Notice(`Symlink Manager: This folder is already linked as "${duplicate.name}"`);
			return false;
		}

		const basePath = this.getVaultBasePath();
		const params = {
			sourcePath: entry.sourcePath,
			vaultBasePath: basePath,
			vaultPath: entry.vaultPath,
			name: entry.name,
		};

		const validation = validateCreate(params);
		if (!validation.success) {
			new Notice(`Symlink Manager: ${validation.message}`);
			return false;
		}

		const result = createSymlink(params);
		if (!result.success) {
			new Notice(`Symlink Manager: ${result.message}`);
			return false;
		}

		entry.active = true;
		this.settings.symlinks.push(entry);
		await this.saveSettings();
		new Notice(`Symlink Manager: Linked "${entry.name}"`);
		return true;
	}

	async removeSymlinkEntry(id: string): Promise<boolean> {
		const basePath = this.getVaultBasePath();
		const index = this.settings.symlinks.findIndex((e) => e.id === id);
		if (index === -1) return false;

		const entry = this.settings.symlinks[index];
		if (entry === undefined) return false;

		if (entry.active) {
			const result = removeSymlink(basePath, entry);
			if (!result.success) {
				new Notice(`Symlink Manager: ${result.message}`);
				return false;
			}
		}

		this.settings.symlinks.splice(index, 1);
		await this.saveSettings();
		new Notice(`Symlink Manager: Removed "${entry.name}"`);
		return true;
	}

	async toggleSymlinkEntry(id: string): Promise<boolean> {
		const basePath = this.getVaultBasePath();
		const entry = this.settings.symlinks.find((e) => e.id === id);
		if (!entry) return false;

		const { result, active } = toggleSymlink(basePath, entry);
		if (!result.success) {
			new Notice(`Symlink Manager: ${result.message}`);
			return false;
		}

		entry.active = active;
		await this.saveSettings();
		new Notice(`Symlink Manager: ${entry.name} ${active ? "activated" : "deactivated"}`);
		return true;
	}

	async renameSymlinkEntry(id: string, newName: string): Promise<boolean> {
		const trimmed = newName.trim();
		if (trimmed === "" || trimmed.includes("/") || trimmed.includes("\\")) {
			new Notice("Symlink Manager: Invalid name");
			return false;
		}

		const entry = this.settings.symlinks.find((e) => e.id === id);
		if (!entry) return false;
		if (entry.name === trimmed) return true;

		// Check for name conflict at the same vault location
		const conflict = this.settings.symlinks.find(
			(e) => e.id !== id && e.vaultPath === entry.vaultPath && e.name === trimmed,
		);
		if (conflict) {
			new Notice("Symlink Manager: A symlink with that name already exists at this location");
			return false;
		}

		const basePath = this.getVaultBasePath();
		const wasActive = entry.active;

		// Remove old symlink if active
		if (wasActive) {
			const result = removeSymlink(basePath, entry);
			if (!result.success) {
				new Notice(`Symlink Manager: ${result.message}`);
				return false;
			}
		}

		const oldName = entry.name;
		entry.name = trimmed;

		// Recreate at new path if was active
		if (wasActive) {
			const params = {
				sourcePath: entry.sourcePath,
				vaultBasePath: basePath,
				vaultPath: entry.vaultPath,
				name: trimmed,
			};
			const validation = validateCreate(params);
			if (validation.success) {
				const result = createSymlink(params);
				if (!result.success) {
					// Revert name, try to restore old symlink
					entry.name = oldName;
					const restoreParams = { ...params, name: oldName };
					createSymlink(restoreParams);
					new Notice(`Symlink Manager: Rename failed — ${result.message}`);
					return false;
				}
			} else {
				entry.name = oldName;
				const restoreParams = { ...params, name: oldName };
				createSymlink(restoreParams);
				new Notice(`Symlink Manager: Rename failed — ${validation.message}`);
				return false;
			}
		}

		await this.saveSettings();
		return true;
	}

	async toggleAll(active: boolean): Promise<void> {
		const basePath = this.getVaultBasePath();
		let anyChanged = false;

		for (const entry of this.settings.symlinks) {
			if (entry.active === active) continue;

			const { result, active: newState } = toggleSymlink(basePath, entry);
			if (result.success) {
				entry.active = newState;
				anyChanged = true;
			} else {
				new Notice(`Symlink Manager: ${entry.name} — ${result.message}`);
			}
		}

		if (anyChanged) {
			await this.saveSettings();
		}
		new Notice(`Symlink Manager: All symlinks ${active ? "activated" : "deactivated"}`);
	}
}
