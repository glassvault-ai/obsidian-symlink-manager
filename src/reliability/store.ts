import { promises as fs, constants } from "fs";
import * as path from "path";
import { createHash, randomBytes } from "crypto";
import { type State, SafetyError, errorCode, parseState, record } from "./model";

interface Snapshot { revision: number; state: State; checksum: string }
export interface Storage {
	load(): Promise<State | null>;
	initialize(state: State): Promise<void>;
	commit(state: State): Promise<void>;
}
export class RecoveryError extends Error {
	constructor(message: string, readonly lastGood: State | null = null) { super(message); }
}
export type StorageHook = (stage: string) => Promise<void>;
function digest(revision: number, state: State): string {
	return createHash("sha256").update(JSON.stringify({ revision, state: parseState(state) })).digest("hex");
}
/** Both slots are required after initialization; missing/corrupt slots never authorize stale replay. */
export class SnapshotStore implements Storage {
	private revision = 0;
	private token = "";
	private boundRoot: string | null = null;
	constructor(readonly pluginDirectory: string, private readonly hook: StorageHook = () => Promise.resolve()) {}
	private async directory(): Promise<string> {
		const root = await fs.realpath(this.pluginDirectory);
		if (this.boundRoot && root !== this.boundRoot) throw new RecoveryError("Plugin storage location changed");
		if (!(await fs.stat(root)).isDirectory()) throw new RecoveryError("Plugin storage is not a directory");
		this.boundRoot = root;
		return path.join(root, "symlink-manager-state");
	}
	private async syncDirectory(directory: string): Promise<void> {
		if (process.platform === "win32") return;
		const handle = await fs.open(directory, "r");
		try { await handle.sync(); } finally { await handle.close(); }
	}
	private async initialized(directory: string): Promise<boolean> {
		const marker = `${directory}.initialized`;
		let before;
		try { before = await fs.lstat(marker); }
		catch (error) { if (errorCode(error) === "ENOENT") return false; throw error; }
		if (!before.isFile() || before.isSymbolicLink()) throw new RecoveryError("Initialization marker is not a regular file");
		const handle = await fs.open(marker, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
		try {
			const current = await handle.stat();
			if (current.ino !== before.ino || current.dev !== before.dev || await handle.readFile("utf8") !== "symlink-manager-state-v2\n") throw new RecoveryError("Initialization marker is invalid");
		} finally { await handle.close(); }
		return true;
	}
	private async readSlot(file: string): Promise<Snapshot> {
		const before = await fs.lstat(file);
		if (!before.isFile() || before.isSymbolicLink()) throw new RecoveryError("Recovery snapshot is not a regular file");
		const handle = await fs.open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
		try {
			const current = await handle.stat();
			if (current.ino !== before.ino || current.dev !== before.dev) throw new RecoveryError("Recovery snapshot changed during reading");
			const raw: unknown = JSON.parse(await handle.readFile("utf8"));
			if (!record(raw) || !Number.isSafeInteger(raw.revision) || (raw.revision as number) < 1 || typeof raw.checksum !== "string") throw new RecoveryError("Invalid recovery snapshot");
			const state = parseState(raw.state);
			const revision = raw.revision as number;
			if (digest(revision, state) !== raw.checksum) throw new RecoveryError("Recovery checksum mismatch");
			return { revision, state, checksum: raw.checksum };
		} finally { await handle.close(); }
	}
	private async scan(): Promise<{ latest: Snapshot; token: string } | null> {
		const directory = await this.directory();
		const initialized = await this.initialized(directory);
		try {
			const stat = await fs.lstat(directory);
			if (!stat.isDirectory() || stat.isSymbolicLink()) throw new RecoveryError("Recovery directory is not a real directory");
		} catch (error) {
			if (errorCode(error) === "ENOENT") {
				if (initialized) throw new RecoveryError("Recovery directory is missing after initialization; legacy replay is blocked");
				return null;
			}
			throw error;
		}
		if (!initialized) throw new RecoveryError("Initialization marker is missing; preserve recovery files before repair");
		const outcomes = await Promise.allSettled(["a.json", "b.json"].map(n => this.readSlot(path.join(directory, n))));
		const good = outcomes.flatMap(r => r.status === "fulfilled" ? [r.value] : []).sort((a,b) => b.revision-a.revision);
		const latest = good[0];
		if (outcomes.some(r => r.status === "rejected")) throw new RecoveryError("Recovery files are incomplete or unreadable; preserve them and repair storage before continuing", latest?.state ?? null);
		const older = good[1];
		if (!latest || !older || latest.revision - older.revision > 1 || (latest.revision === older.revision && latest.checksum !== older.checksum)) throw new RecoveryError("Ambiguous recovery generations", latest?.state ?? null);
		return { latest, token: outcomes.map(r => r.status === "fulfilled" ? `${r.value.revision}:${r.value.checksum}` : "").join("|") };
	}
	async load(): Promise<State | null> {
		const current = await this.scan();
		this.revision = current?.latest.revision ?? 0;
		this.token = current?.token ?? "";
		return current?.latest.state ?? null;
	}
	private async writeSlot(name: string, revision: number, state: State): Promise<void> {
		const directory = await this.directory();
		const check = await fs.lstat(directory);
		if (!check.isDirectory() || check.isSymbolicLink()) throw new RecoveryError("Recovery directory changed");
		const target = path.join(directory, name);
		try {
			const existing = await fs.lstat(target);
			if (!existing.isFile() || existing.isSymbolicLink()) throw new RecoveryError("Recovery destination is not a regular file");
		} catch (error) { if (errorCode(error) !== "ENOENT") throw error; }
		const temporary = path.join(directory, `${name}.${randomBytes(12).toString("hex")}.tmp`);
		await this.hook("before-write");
		const handle = await fs.open(temporary, "wx", 0o600);
		try {
			await handle.writeFile(JSON.stringify({ revision, state, checksum: digest(revision, state) }));
			await this.hook("before-flush");
			await handle.sync();
		} finally { await handle.close(); }
		// Leave interrupted temporary evidence; it is never interpreted as a committed snapshot.
		await this.hook("before-replace");
		if ((await this.directory()) !== directory || (await fs.lstat(directory)).isSymbolicLink()) throw new RecoveryError("Recovery directory changed");
		await fs.rename(temporary, target);
		await this.hook("after-replace");
		// Directory fsync is unsupported on some Windows filesystems. File flush still applies there.
		await this.syncDirectory(directory);
		await this.hook("before-verify");
		const verified = await this.readSlot(target);
		if (verified.revision !== revision || verified.checksum !== digest(revision, state)) throw new RecoveryError("Recovery write verification failed");
	}
	async initialize(state: State): Promise<void> {
		parseState(state);
		if (await this.scan()) throw new RecoveryError("Recovery storage already exists");
		const directory = await this.directory();
		const marker = await fs.open(`${directory}.initialized`, "wx", 0o600);
		try { await marker.writeFile("symlink-manager-state-v2\n"); await marker.sync(); }
		finally { await marker.close(); }
		await this.syncDirectory(path.dirname(directory));
		await fs.mkdir(directory, { mode: 0o700 });
		await this.syncDirectory(path.dirname(directory));
		await this.writeSlot("a.json", 1, state);
		await this.writeSlot("b.json", 1, state);
		await this.load();
	}
	async commit(state: State): Promise<void> {
		parseState(state);
		const current = await this.scan();
		if (!current || current.token !== this.token || current.latest.revision !== this.revision) throw new SafetyError("error", "Recovery state changed outside this manager; refresh before continuing");
		const revision = this.revision + 1;
		await this.writeSlot(revision % 2 === 0 ? "a.json" : "b.json", revision, state);
		await this.load();
	}
}
