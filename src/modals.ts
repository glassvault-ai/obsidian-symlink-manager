import { App, FuzzySuggestModal, Modal, Setting, TFolder } from "obsidian";
import type { SymlinkEntry } from "./types";

/** Owns settlement and window-lifetime cleanup, preserving close-before-choose ordering. */
class Selection<T> {
	private settled = false;
	private timer: number | null = null;
	private readonly abort: () => void;
	constructor(private win: Window, private readonly resolve: (value: T | null) => void,
		private readonly close: () => void, private readonly signal?: AbortSignal) {
		this.abort = () => { this.finish(null); this.close(); };
		win.addEventListener("pagehide", this.abort, { once: true });
		signal?.addEventListener("abort", this.abort, { once: true });
	}
	attach(win: Window): void {
		if (this.settled || this.win === win) return;
		const deferred = this.timer !== null;
		if (this.timer !== null) this.win.clearTimeout(this.timer);
		this.win.removeEventListener("pagehide", this.abort);
		this.win = win; this.timer = null;
		this.win.addEventListener("pagehide", this.abort, { once: true });
		if (deferred) this.deferCancel();
	}
	finish(value: T | null): void {
		if (this.settled) return;
		this.settled = true;
		if (this.timer !== null) this.win.clearTimeout(this.timer);
		this.win.removeEventListener("pagehide", this.abort);
		this.signal?.removeEventListener("abort", this.abort);
		this.resolve(this.signal?.aborted ? null : value);
	}
	deferCancel(): void {
		if (this.settled || this.timer !== null) return;
		this.timer = this.win.setTimeout(() => this.finish(null), 0);
	}
}

// Modal.selection belongs to the host and is overwritten during open for focus restoration.
export class VaultFolderModal extends FuzzySuggestModal<TFolder> {
	private readonly symlinkSelection: Selection<TFolder>;
	private readonly folders: TFolder[];
	constructor(app: App, onSelect: (folder: TFolder | null) => void, signal?: AbortSignal) {
		super(app);
		this.symlinkSelection = new Selection(this.modalEl.win, onSelect, () => this.close(), signal);
		this.setPlaceholder("Choose vault folder for symlink...");
		this.folders = [app.vault.getRoot(), ...app.vault.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder && f !== app.vault.getRoot())];
	}
	open(): void { super.open(); this.symlinkSelection.attach(this.modalEl.win); }
	getItems(): TFolder[] { return this.folders; }
	getItemText(folder: TFolder): string { return folder.path || "/"; }
	onChooseItem(folder: TFolder): void { this.symlinkSelection.finish(folder); }
	onClose(): void { this.symlinkSelection.attach(this.modalEl.win); this.symlinkSelection.deferCancel(); }
}
export function pickVaultFolder(app: App, signal?: AbortSignal): Promise<TFolder | null> {
	if (signal?.aborted) return Promise.resolve(null);
	return new Promise(resolve => new VaultFolderModal(app, resolve, signal).open());
}
export class ToggleSymlinkModal extends FuzzySuggestModal<SymlinkEntry> {
	private readonly symlinkSelection: Selection<SymlinkEntry>;
	constructor(app: App, private readonly symlinks: SymlinkEntry[], onSelect: (entry: SymlinkEntry | null) => void, signal?: AbortSignal) {
		super(app);
		this.symlinkSelection = new Selection(this.modalEl.win, onSelect, () => this.close(), signal);
		this.setPlaceholder("Choose symlink to toggle...");
	}
	open(): void { super.open(); this.symlinkSelection.attach(this.modalEl.win); }
	getItems(): SymlinkEntry[] { return this.symlinks; }
	getItemText(entry: SymlinkEntry): string { return `${entry.name} ${entry.enabled ? "(on)" : "(off)"}`; }
	onChooseItem(entry: SymlinkEntry): void { this.symlinkSelection.finish(entry); }
	onClose(): void { this.symlinkSelection.attach(this.modalEl.win); this.symlinkSelection.deferCancel(); }
}
export function pickSymlinkToToggle(app: App, entries: SymlinkEntry[], signal?: AbortSignal): Promise<SymlinkEntry | null> {
	if (signal?.aborted) return Promise.resolve(null);
	return new Promise(resolve => new ToggleSymlinkModal(app, entries, resolve, signal).open());
}
class ConfirmDeleteModal extends Modal {
	private readonly symlinkSelection: Selection<boolean>;
	constructor(app: App, private readonly entryName: string, onConfirm: (confirmed: boolean) => void,
		private readonly forget: boolean, signal?: AbortSignal) {
		super(app);
		this.symlinkSelection = new Selection(this.modalEl.win, value => onConfirm(value === true), () => this.close(), signal);
	}
	open(): void { super.open(); this.symlinkSelection.attach(this.modalEl.win); }
	onOpen(): void {
		this.contentEl.createEl("h3", { text: this.forget ? "Forget mapping?" : "Remove symlink?" });
		this.contentEl.createEl("p", { text: this.forget
			? `Forget "${this.entryName}" from settings only? All existing links will remain untouched.`
			: `Remove the managed pointer for "${this.entryName}" and its settings entry? Source contents are preserved.` });
		new Setting(this.contentEl)
			.addButton(b => b.setButtonText("Cancel").onClick(() => this.close()))
			.addButton(b => b.setButtonText(this.forget ? "Forget" : "Remove").setWarning().onClick(() => {
				this.symlinkSelection.finish(true); this.close();
			}));
	}
	onClose(): void { this.symlinkSelection.finish(null); }
}
export function confirmDelete(app: App, name: string, forget = false, signal?: AbortSignal): Promise<boolean> {
	if (signal?.aborted) return Promise.resolve(false);
	return new Promise(resolve => new ConfirmDeleteModal(app, name, resolve, forget, signal).open());
}

/** Native dialogs may outlive plugin unload; detach their result without starting new work. */
export function cancellable<T>(pending: Promise<T>, signal: AbortSignal, cancelled: T): Promise<T> {
	return new Promise((resolve, reject) => {
		const abort = (): void => { signal.removeEventListener("abort", abort); resolve(cancelled); };
		signal.addEventListener("abort", abort, { once: true });
		if (signal.aborted) abort();
		void pending.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
	});
}
