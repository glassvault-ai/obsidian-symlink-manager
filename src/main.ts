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

export default class SymlinkManagerPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.validateSymlinksOnLoad();
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

	// --- Public CRUD API (used by settings tab, commands, modals in later phases) ---

	async addSymlink(entry: SymlinkEntry): Promise<boolean> {
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
