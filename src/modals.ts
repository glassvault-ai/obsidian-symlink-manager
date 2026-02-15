import { App, FuzzySuggestModal, TFolder } from "obsidian";
import type { SymlinkEntry } from "./types";

/**
 * Modal for selecting a folder inside the vault.
 * Used in the create-symlink flow to pick where to place the symlink.
 * Wraps FuzzySuggestModal in a Promise via a resolve callback.
 */
export class VaultFolderModal extends FuzzySuggestModal<TFolder> {
	private folders: TFolder[];
	private onSelect: (folder: TFolder | null) => void;
	private picked = false;

	constructor(app: App, onSelect: (folder: TFolder | null) => void) {
		super(app);
		this.onSelect = onSelect;
		this.setPlaceholder("Choose vault folder for symlink...");

		this.folders = this.app.vault
			.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder);
	}

	getItems(): TFolder[] {
		return this.folders;
	}

	getItemText(folder: TFolder): string {
		return folder.path === "" ? "/" : folder.path;
	}

	onChooseItem(folder: TFolder): void {
		this.picked = true;
		this.onSelect(folder);
	}

	onClose(): void {
		// Defer: onClose can fire before onChooseItem in Obsidian's modal lifecycle.
		// setTimeout ensures onChooseItem sets picked=true before we check.
		setTimeout(() => {
			if (!this.picked) {
				this.onSelect(null);
			}
		}, 0);
	}
}

/**
 * Open the vault folder picker as a Promise.
 * Returns the selected TFolder, or null if cancelled.
 */
export function pickVaultFolder(app: App): Promise<TFolder | null> {
	return new Promise((resolve) => {
		new VaultFolderModal(app, resolve).open();
	});
}

/**
 * Modal for selecting a symlink to toggle on/off.
 * Used by the 'toggle-symlink' command.
 */
export class ToggleSymlinkModal extends FuzzySuggestModal<SymlinkEntry> {
	private symlinks: SymlinkEntry[];
	private onSelect: (entry: SymlinkEntry | null) => void;
	private picked = false;

	constructor(
		app: App,
		symlinks: SymlinkEntry[],
		onSelect: (entry: SymlinkEntry | null) => void,
	) {
		super(app);
		this.symlinks = symlinks;
		this.onSelect = onSelect;
		this.setPlaceholder("Choose symlink to toggle...");
	}

	getItems(): SymlinkEntry[] {
		return this.symlinks;
	}

	getItemText(entry: SymlinkEntry): string {
		const status = entry.active ? "(on)" : "(off)";
		return `${entry.name} ${status}`;
	}

	onChooseItem(entry: SymlinkEntry): void {
		this.picked = true;
		this.onSelect(entry);
	}

	onClose(): void {
		setTimeout(() => {
			if (!this.picked) {
				this.onSelect(null);
			}
		}, 0);
	}
}

/**
 * Open the toggle symlink picker as a Promise.
 * Returns the selected SymlinkEntry, or null if cancelled.
 */
export function pickSymlinkToToggle(
	app: App,
	symlinks: SymlinkEntry[],
): Promise<SymlinkEntry | null> {
	return new Promise((resolve) => {
		new ToggleSymlinkModal(app, symlinks, resolve).open();
	});
}
