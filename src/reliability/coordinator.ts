import { LinkFiles } from "./files";
import { type Entry, type Health, type Pending, type State, SafetyError, healthError, migrate, parseEntry } from "./model";
import { RecoveryError, type Storage } from "./store";

export interface ActionResult { success: boolean; message: string }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function replace(entries: Entry[], entry: Entry | null, id: string): Entry[] {
	const kept = entries.filter(e => e.id !== id);
	return entry ? [...kept, entry] : kept;
}
export class Coordinator {
	private data: State | null = null;
	private queue: Promise<unknown> = Promise.resolve();
	private stopped = false;
	readonly health = new Map<string, Health>();
	error: string | null = null;
	private persistenceFailed = false;
	constructor(readonly files: LinkFiles, readonly storage: Storage, private readonly changed: () => void = () => {}) {}
	get entries(): Entry[] { return clone(this.data?.entries ?? []); }
	get quarantineCount(): number { return this.data?.quarantine.length ?? 0; }
	get pending(): Pending | null { return clone(this.data?.pending ?? null); }
	get readOnly(): boolean { return !this.data || this.persistenceFailed; }
	close(): void { this.stopped = true; }
	private run<T>(work: () => Promise<T>): Promise<T> {
		const next = this.queue.then(async () => {
			if (this.stopped) throw new SafetyError("error", "Plugin is unloaded");
			try { return await work(); } finally { if (!this.stopped) this.changed(); }
		});
		this.queue = next.catch(() => undefined);
		return next;
	}
	private state(): State {
		if (!this.data || this.persistenceFailed) throw new SafetyError("error", this.error ?? "Recovery storage is read-only");
		return this.data;
	}
	private async save(next: State): Promise<void> {
		try { await this.storage.commit(next); this.data = next; }
		catch (error) {
			this.persistenceFailed = true;
			this.error = `Settings could not be committed. Refresh to inspect recovery: ${healthError(error).message}`;
			throw error;
		}
	}
	async open(legacy: () => Promise<unknown>): Promise<void> {
		return this.run(async () => {
			try {
				const root = await this.files.canonicalRoot();
				const loaded = await this.storage.load();
				if (loaded) this.data = loaded;
				else {
					this.data = migrate(await legacy(), root);
					await this.storage.initialize(this.data);
				}
				if (this.data.vaultRoot !== root) throw new RecoveryError("This recovery state belongs to a different vault location; no filesystem changes were made", this.data);
				await this.reconcile();
			} catch (error) {
				await this.showRecovery(error);
			}
		});
	}
	private async showRecovery(error: unknown): Promise<void> {
		if (error instanceof RecoveryError && error.lastGood) this.data = error.lastGood;
		this.persistenceFailed = true;
		this.error = healthError(error).message;
		// Observations explain the saved entries without reconciling pointers or writing state.
		await this.observe();
	}
	private async observe(): Promise<void> {
		this.health.clear();
		for (const e of this.entries) this.health.set(e.id, await this.files.inspect(e, this.entries));
	}
	async refresh(): Promise<void> {
		return this.run(async () => {
			try {
				const loaded = await this.storage.load();
				if (!loaded || loaded.vaultRoot !== await this.files.canonicalRoot()) throw new RecoveryError("Recovery state is missing or belongs to another vault", loaded);
				this.data = loaded; this.persistenceFailed = false; this.error = null;
				await this.reconcile();
			} catch (error) {
				await this.showRecovery(error);
			}
		});
	}
	private async reconcile(): Promise<void> {
		if (this.state().pending) {
			try { await this.recover(); }
			catch (error) { this.error = `Pending operation needs recovery: ${healthError(error).message}`; await this.observe(); return; }
		}
		for (const entry of this.entries) {
			if (this.stopped || this.persistenceFailed || this.pending) break;
			const observation = await this.files.inspect(entry, this.entries);
			if (observation.kind === "conflict" || observation.kind === "error") continue;
			await this.setInternal(entry.id, entry.enabled);
		}
		await this.observe();
	}
	private async finish(entry: Entry | null, id: string): Promise<void> {
		await this.save({ ...this.state(), entries: replace(this.state().entries, entry, id), pending: null });
		this.error = null;
	}
	private async recover(): Promise<void> {
		const pending = this.state().pending;
		if (!pending) return;
		const { before, after, kind } = pending;
		if (kind === "rename" && before && after) {
			const old = await this.files.link(before), next = await this.files.link(after);
			if (old.kind === "conflict" || next.kind === "conflict" || (old.kind === "matching" && next.kind === "matching")) throw new SafetyError("conflict", "Rename paths are ambiguous; review them or explicitly forget the mapping");
			if (next.kind === "matching" && old.kind === "absent") await this.finish(after, after.id);
			else if (old.kind === "matching" && next.kind === "absent") await this.finish(before, before.id);
			else if (!after.enabled) await this.finish(after, after.id);
			else throw new SafetyError("absent", "Neither rename path exists; mapping retained for explicit recovery or forget");
		} else if (kind === "remove" && before) {
			await this.files.disable(before); await this.finish(null, before.id);
		} else if (after) {
			if (after.enabled) {
				try { await this.files.enable(after, this.entries); }
				catch (error) {
					if (!(error instanceof SafetyError && error.kind === "unavailable")) throw error;
				}
			} else await this.files.disable(after);
			await this.finish(after, after.id);
		}
	}
	private idle(): State {
		const state = this.state();
		if (state.pending) throw new SafetyError("error", "Resolve the pending operation with refresh or explicitly forget its mapping first");
		return state;
	}
	private async action(work: () => Promise<void>): Promise<ActionResult> {
		try { await work(); await this.observe(); return { success: true, message: "Updated symlink state" }; }
		catch (error) {
			if (this.pending && !this.persistenceFailed) this.error = `Operation pending: ${healthError(error).message}`;
			await this.observe(); return { success: false, message: healthError(error).message };
		}
	}
	private async perform(pending: Pending): Promise<void> {
		if (this.stopped) throw new SafetyError("error", "Plugin unloaded before the operation was admitted");
		const id = (pending.after ?? pending.before)?.id;
		if (!id) throw new SafetyError("error", "Operation has no identity");
		const entries = replace(this.idle().entries, pending.after, id);
		await this.save({ ...this.state(), entries, pending });
		if (pending.kind === "rename" && pending.before && pending.after) {
			const before = pending.before, after = pending.after;
			let removed = false;
			try {
				await this.files.disable(before); removed = true;
				if (after.enabled) await this.files.enable(after, entries);
			} catch (error) {
				if (removed && before.enabled) {
					try { await this.files.enable(before, replace(entries, before, id)); }
					catch { throw new SafetyError("error", `Rename and rollback failed; mapping retained. ${healthError(error).message}`); }
					await this.finish(before, id);
				}
				throw error;
			}
		} else if (pending.after) {
			if (pending.after.enabled) await this.files.enable(pending.after, entries);
			else await this.files.disable(pending.after);
		} else if (pending.before) await this.files.disable(pending.before);
		await this.finish(pending.after, id);
	}
	private async setInternal(id: string, enabled: boolean): Promise<ActionResult> {
		return this.action(async () => {
			const before = this.idle().entries.find(e => e.id === id);
			if (!before) throw new SafetyError("error", "Entry no longer exists");
			let after = { ...before, enabled };
			try {
				if (enabled) after = await this.files.admit(after, this.entries);
				const link = await this.files.link(after);
				if (link.kind === "conflict") throw new SafetyError("conflict", link.message);
				if ((enabled && link.kind === "matching") || (!enabled && link.kind === "absent")) {
					if (JSON.stringify(before) !== JSON.stringify(after)) await this.save({ ...this.state(), entries: replace(this.entries, after, id) });
					return;
				}
			} catch (error) {
				// Retain requested state even when it cannot currently be realized; no mutation has started.
				if (!this.persistenceFailed && before.enabled !== enabled) await this.save({ ...this.state(), entries: replace(this.entries, { ...before, enabled }, id) });
				throw error;
			}
			await this.perform({ kind: "set", before, after });
		});
	}
	async setEnabled(id: string, enabled: boolean): Promise<ActionResult> {
		return this.run(() => !enabled && this.pending ? this.action(() => this.disablePendingInternal(id)) : this.setInternal(id, enabled));
	}
	private async disablePendingInternal(id: string): Promise<void> {
		const state = this.state(), pending = state.pending;
		if (!pending || (pending.after ?? pending.before)?.id !== id) throw new SafetyError("error", "Another operation is pending");
		const candidates = pending.kind === "rename" ? [pending.before, pending.after] : [pending.after ?? pending.before];
		const observed = await Promise.all(candidates.filter((e): e is Entry => e !== null).map(async e => ({ entry: e, link: await this.files.link(e) })));
		if (observed.some(o => o.link.kind === "conflict") || observed.filter(o => o.link.kind === "matching").length > 1) throw new SafetyError("conflict", "Pending paths are ambiguous; review them or forget metadata only");
		const chosen = observed.find(o => o.link.kind === "matching")?.entry ?? pending.before ?? pending.after;
		if (!chosen) throw new SafetyError("error", "Missing recovery entry");
		const after = { ...chosen, enabled: false };
		await this.save({ ...state, entries: replace(state.entries, after, id), pending: { kind: "set", before: chosen, after } });
		await this.files.disable(after);
		await this.finish(after, id);
	}
	async add(entry: Entry): Promise<ActionResult> {
		return this.run(() => this.action(async () => {
			if (!parseEntry(entry) || this.idle().entries.some(e => e.id === entry.id)) throw new SafetyError("conflict", "Invalid or duplicate entry identity");
			const after = await this.files.admit({ ...entry, enabled: true }, this.entries);
			if ((await this.files.link(after)).kind !== "absent") throw new SafetyError("conflict", "Destination is already occupied");
			await this.perform({ kind: "set", before: null, after });
		}));
	}
	async remove(id: string): Promise<ActionResult> {
		return this.run(() => this.action(async () => {
			const before = this.idle().entries.find(e => e.id === id);
			if (!before) throw new SafetyError("error", "Entry no longer exists");
			const link = await this.files.link(before);
			if (link.kind === "conflict") throw new SafetyError("conflict", `${link.message}; use forget to remove metadata only`);
			await this.perform({ kind: "remove", before, after: null });
		}));
	}
	async forget(id: string): Promise<ActionResult> {
		return this.run(() => this.action(async () => {
			const state = this.state(), pendingId = (state.pending?.after ?? state.pending?.before)?.id;
			if (state.pending && pendingId !== id) throw new SafetyError("error", "Another entry has a pending operation");
			await this.save({ ...state, entries: state.entries.filter(e => e.id !== id), pending: pendingId === id ? null : state.pending });
			this.error = null;
		}));
	}
	async rename(id: string, name: string): Promise<ActionResult> {
		return this.run(() => this.action(async () => {
			const before = this.idle().entries.find(e => e.id === id);
			if (!before) throw new SafetyError("error", "Entry no longer exists");
			let after = { ...before, name: name.trim() };
			await this.files.target(after);
			if (name.trim() === before.name) return;
			if (this.entries.some(e => e.id !== id && e.vaultPath.toLowerCase() === after.vaultPath.toLowerCase() && e.name.toLowerCase() === after.name.toLowerCase())) throw new SafetyError("conflict", "Destination is reserved by another entry");
			if ((await this.files.link(after)).kind !== "absent") throw new SafetyError("conflict", "Rename destination is occupied");
			if ((await this.files.link(before)).kind === "conflict") throw new SafetyError("conflict", "Old name is occupied by a different object");
			if (after.enabled) after = await this.files.admit(after, this.entries);
			await this.perform({ kind: "rename", before, after });
		}));
	}
	async setAll(enabled: boolean): Promise<{ succeeded: number; failed: number }> {
		return this.run(async () => {
			let succeeded = 0, failed = 0;
			for (const e of this.entries) {
				if (this.stopped) break;
				const result = await this.setInternal(e.id, enabled);
				if (result.success) succeeded++; else failed++;
			}
			return { succeeded, failed };
		});
	}
}
