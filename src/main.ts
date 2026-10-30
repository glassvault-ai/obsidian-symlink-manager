import { Notice, Plugin, FileSystemAdapter } from "obsidian";
import { remote } from "electron";
import * as path from "path";
import { randomUUID } from "crypto";
import { Coordinator, type ActionResult } from "./reliability/coordinator";
import { LinkFiles } from "./reliability/files";
import { SnapshotStore } from "./reliability/store";
import { healthError, type Entry } from "./reliability/model";
import { SymlinkManagerSettingTab } from "./settings";
import { pickVaultFolder, pickSymlinkToToggle, confirmDelete, cancellable } from "./modals";

export default class SymlinkManagerPlugin extends Plugin {
	manager: Coordinator | null = null;
	private tab: SymlinkManagerSettingTab | null = null;
	private operations = 0;
	private unloaded = false;
	private readonly lifetime = new AbortController();
	get busy(): boolean { return this.operations > 0; }
	get entries(): Entry[] { return this.manager?.entries ?? []; }

	async onload(): Promise<void> {
		this.unloaded = false;
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) throw new Error("This plugin requires a desktop filesystem vault");
		const base = adapter.getBasePath();
		const pluginDirectory = path.join(base, this.manifest.dir ?? path.join(this.app.vault.configDir, "plugins", this.manifest.id));
		this.manager = new Coordinator(new LinkFiles(base), new SnapshotStore(pluginDirectory), () => this.tab?.refresh());
		await this.manager.open(() => this.loadData());
		if (this.unloaded) return;
		this.tab = new SymlinkManagerSettingTab(this.app, this);
		this.addSettingTab(this.tab);
		if (this.manager.error) new Notice(this.manager.error);
		this.addRibbonIcon("link", "Link external folder", () => { void this.createSymlinkFromPicker(); });
		this.addCommand({ id: "link-external-folder", name: "Link external folder", callback: () => this.createSymlinkFromPicker() });
		this.addCommand({ id: "toggle-symlink", name: "Toggle symlink...", callback: () => this.pickToggle() });
		this.addCommand({ id: "enable-all-symlinks", name: "Enable all symlinks", callback: () => this.toggleAll(true) });
		this.addCommand({ id: "disable-all-symlinks", name: "Disable all symlinks", callback: () => this.toggleAll(false) });
		this.addCommand({ id: "refresh-symlinks", name: "Refresh symlink health and retry", callback: () => this.refresh() });
	}
	onunload(): void {
		this.unloaded = true;
		this.lifetime.abort();
		this.manager?.close();
		// Existing links persist. Durable pending work is reconciled at the next load.
	}
	private engine(): Coordinator {
		if (this.unloaded || !this.manager) throw new Error("Plugin is unavailable");
		return this.manager;
	}
	private async execute(work: () => Promise<ActionResult>): Promise<boolean> {
		if (this.unloaded) return false;
		this.operations++;
		this.tab?.refresh();
		try {
			const result = await work();
			if (!this.unloaded && result.message) new Notice(result.message);
			return result.success;
		} catch (error) {
			if (!this.unloaded) new Notice(healthError(error).message);
			return false;
		} finally {
			this.operations--;
			if (!this.unloaded) this.tab?.refresh();
		}
	}
	async createSymlinkFromPicker(): Promise<boolean> {
		return this.execute(async () => {
			const selected = await cancellable(remote.dialog.showOpenDialog({ title: "Select external folder to link", properties: ["openDirectory"] }), this.lifetime.signal, { canceled: true, filePaths: [] });
			if (this.unloaded || selected.canceled || !selected.filePaths[0]) return { success: false, message: "" };
			const sourcePath = selected.filePaths[0];
			const folder = await pickVaultFolder(this.app, this.lifetime.signal);
			if (this.unloaded || folder === null) return { success: false, message: "" };
			return this.engine().add({ id: randomUUID(), name: path.basename(sourcePath), sourcePath,
				vaultPath: folder.path === "/" ? "" : folder.path, enabled: true });
		});
	}
	private async pickToggle(): Promise<boolean> {
		return this.execute(async () => {
			const entries = this.entries;
			if (!entries.length) return { success: false, message: "No symlinks to toggle" };
			const selected = await pickSymlinkToToggle(this.app, entries, this.lifetime.signal);
			if (this.unloaded || !selected) return { success: false, message: "" };
			return this.engine().setEnabled(selected.id, !selected.enabled);
		});
	}
	async confirmRemoval(id: string, name: string, forget = false): Promise<boolean> {
		return this.execute(async () => {
			if (!await confirmDelete(this.app, name, forget, this.lifetime.signal) || this.unloaded) return { success: false, message: "" };
			return forget ? this.engine().forget(id) : this.engine().remove(id);
		});
	}
	async addSymlink(entry: Entry): Promise<boolean> { return this.execute(() => this.engine().add(entry)); }
	async setSymlinkEnabled(id: string, enabled: boolean): Promise<boolean> { return this.execute(() => this.engine().setEnabled(id, enabled)); }
	async removeSymlinkEntry(id: string): Promise<boolean> { return this.execute(() => this.engine().remove(id)); }
	async forgetSymlinkEntry(id: string): Promise<boolean> { return this.execute(() => this.engine().forget(id)); }
	async renameSymlinkEntry(id: string, name: string): Promise<boolean> { return this.execute(() => this.engine().rename(id, name)); }
	async refresh(): Promise<boolean> {
		return this.execute(async () => {
			await this.engine().refresh();
			return { success: !this.engine().error, message: this.engine().error ?? "Symlink health refreshed" };
		});
	}
	async toggleAll(enabled: boolean): Promise<boolean> {
		return this.execute(async () => {
			const counts = await this.engine().setAll(enabled);
			return { success: counts.failed === 0, message: `${counts.succeeded} updated, ${counts.failed} failed` };
		});
	}
}
