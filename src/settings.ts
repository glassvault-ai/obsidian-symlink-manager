import { PluginSettingTab, Setting, App } from "obsidian";
import type SymlinkManagerPlugin from "./main";
import { validateEntry } from "./symlink-manager";

export class SymlinkManagerSettingTab extends PluginSettingTab {
	plugin: SymlinkManagerPlugin;

	constructor(app: App, plugin: SymlinkManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Symlink Manager" });

		// Add new symlink button
		new Setting(containerEl)
			.setName("Add symlink")
			.setDesc("Link an external folder into your vault")
			.addButton((btn) =>
				btn
					.setButtonText("Add")
					.setCta()
					.onClick(() => {
						this.plugin.createSymlinkFromPicker();
					}),
			);

		if (this.plugin.settings.symlinks.length === 0) {
			containerEl.createEl("p", {
				text: "No symlinks yet. Click \"Add\" to link an external folder.",
				cls: "setting-item-description",
			});
			return;
		}

		containerEl.createEl("h3", { text: "Managed Symlinks" });

		const basePath = this.plugin.getVaultBasePath();

		for (const entry of this.plugin.settings.symlinks) {
			const status = validateEntry(basePath, entry);
			const statusWarning = !status.sourceExists
				? " ⚠ source missing"
				: entry.active && !status.symlinkExists
					? " ⚠ symlink broken"
					: "";

			const setting = new Setting(containerEl)
				.setName(entry.name + statusWarning)
				.setDesc(`${entry.sourcePath} → ${entry.vaultPath}/`);

			// Toggle switch
			setting.addToggle((toggle) =>
				toggle.setValue(entry.active).onChange(async () => {
					await this.plugin.toggleSymlinkEntry(entry.id);
					this.display();
				}),
			);

			// Delete button
			setting.addExtraButton((btn) =>
				btn
					.setIcon("trash")
					.setTooltip("Remove symlink")
					.onClick(async () => {
						await this.plugin.removeSymlinkEntry(entry.id);
						this.display();
					}),
			);
		}
	}
}
