import { PluginSettingTab, Setting, App } from "obsidian";
import type SymlinkManagerPlugin from "./main";
import { confirmDelete } from "./modals";

export class SymlinkManagerSettingTab extends PluginSettingTab {
	private visible = false;
	constructor(app: App, readonly plugin: SymlinkManagerPlugin) { super(app, plugin); }
	hide(): void { this.visible = false; }
	refresh(): void { if (this.visible) this.display(); }
	display(): void {
		this.visible = true;
		const container = this.containerEl;
		container.empty();
		const manager = this.plugin.manager;
		const unavailable = this.plugin.busy || !manager || manager.readOnly;
		new Setting(container).setName("Add symlink").setDesc("Link an external directory into a real vault folder")
			.addButton(b => b.setButtonText("Add").setCta().setDisabled(unavailable || Boolean(manager?.pending))
				.onClick(() => { void this.plugin.createSymlinkFromPicker(); }));
		new Setting(container).setName("Refresh and retry").setDesc("Check sources and retry your saved enabled or disabled preferences")
			.addButton(b => b.setButtonText("Refresh").setDisabled(this.plugin.busy).onClick(() => { void this.plugin.refresh(); }));
		if (manager?.error) container.createEl("p", { text: manager.error, cls: "mod-warning" });
		if (manager?.quarantineCount) container.createEl("p", { text: `${manager.quarantineCount} invalid saved entries were preserved for review. See the recovery instructions in the README.`, cls: "mod-warning" });
		const pending = manager?.pending;
		const recovery = pending?.after ?? pending?.before;
		if (recovery) {
			new Setting(container).setName(`Pending operation: ${recovery.name}`)
				.setDesc("Refresh to recover, keep a safe disabled mapping, or forget metadata and leave all pointers untouched.")
				.addButton(b => b.setButtonText("Keep disabled").setDisabled(unavailable).onClick(() => { void this.plugin.setSymlinkEnabled(recovery.id, false); }))
				.addButton(b => b.setButtonText("Forget").setDisabled(unavailable).onClick(async () => {
					if (await confirmDelete(this.app, `${pending?.before?.name ?? ""} / ${pending?.after?.name ?? ""}`, true)) await this.plugin.forgetSymlinkEntry(recovery.id);
				}));
		}
		if (!this.plugin.entries.length) { container.createEl("p", { text: "No managed entries.", cls: "setting-item-description" }); return; }
		new Setting(container).setName("Managed symlinks").setHeading();
		for (const entry of this.plugin.entries) {
			const health = manager?.health.get(entry.id);
			const setting = new Setting(container).setName(health?.message ?? "Health not checked")
				.setDesc(`${entry.sourcePath} → ${entry.vaultPath || "/"} · ${entry.enabled ? "Enabled preference" : "Disabled preference"}`);
			setting.addText(text => {
				text.setValue(entry.name).setPlaceholder("Symlink name").setDisabled(unavailable || Boolean(pending));
				text.inputEl.addEventListener("blur", () => {
					if (this.plugin.busy || text.getValue() === entry.name) return;
					void this.plugin.renameSymlinkEntry(entry.id, text.getValue());
				});
			});
			setting.addToggle(toggle => toggle.setValue(entry.enabled).setDisabled(unavailable || Boolean(pending))
				.onChange(enabled => { void this.plugin.setSymlinkEnabled(entry.id, enabled); }));
			setting.addExtraButton(btn => btn.setIcon("trash").setTooltip("Remove managed link")
				.onClick(async () => {
					if (unavailable || pending) return;
					if (await confirmDelete(this.app, entry.name)) await this.plugin.removeSymlinkEntry(entry.id);
				}));
			if (health?.kind === "conflict" || health?.kind === "error") setting.addButton(b => b.setButtonText("Forget")
				.setDisabled(unavailable || Boolean(pending)).onClick(async () => {
					if (await confirmDelete(this.app, entry.name, true)) await this.plugin.forgetSymlinkEntry(entry.id);
				}));
		}
	}
}
