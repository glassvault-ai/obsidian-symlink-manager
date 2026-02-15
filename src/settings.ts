import { Notice, PluginSettingTab, Setting, App } from "obsidian";
import type SymlinkManagerPlugin from "./main";
import { validateEntry } from "./symlink-manager";
import { confirmDelete } from "./modals";

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
					.onClick(async () => {
						await this.plugin.createSymlinkFromPicker();
						this.display();
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
				.setDesc(`${entry.sourcePath} → ${entry.vaultPath || "/"}`);

			// Editable name field — validates on blur, not on every keystroke
			setting.addText((text) => {
				text.setValue(entry.name).setPlaceholder("Symlink name");
				text.inputEl.addEventListener("blur", async () => {
					const value = text.getValue();
					if (value === entry.name) return;
					if (value.trim() === "") {
						text.setValue(entry.name);
						new Notice("Symlink Manager: Name can't be empty");
						return;
					}
					const success = await this.plugin.renameSymlinkEntry(entry.id, value);
					if (!success) {
						text.setValue(entry.name);
					}
				});
			});

			if (statusWarning) {
				setting.nameEl.createSpan({ text: statusWarning, cls: "mod-warning" });
			}

			// Toggle switch
			setting.addToggle((toggle) =>
				toggle.setValue(entry.active).onChange(async () => {
					await this.plugin.toggleSymlinkEntry(entry.id);
					this.display();
				}),
			);

			// Delete button with confirmation
			setting.addExtraButton((btn) =>
				btn
					.setIcon("trash")
					.setTooltip("Remove symlink")
					.onClick(async () => {
						const confirmed = await confirmDelete(this.app, entry.name);
						if (!confirmed) return;
						await this.plugin.removeSymlinkEntry(entry.id);
						this.display();
					}),
			);
		}
	}
}
