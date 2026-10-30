import { promises as fs, type Stats } from "fs";
import * as path from "path";
import { type Entry, type Health, SafetyError, errorCode, healthError, parseEntry } from "./model";

export interface Disk {
	lstat(p: string): Promise<Stats>;
	stat(p: string): Promise<Stats>;
	realpath(p: string): Promise<string>;
	readlink(p: string): Promise<string>;
	symlink(source: string, target: string, type: "dir" | "junction"): Promise<void>;
	unlink(p: string): Promise<void>;
}
export function contains(parent: string, child: string): boolean {
	const relative = path.relative(parent, child);
	return relative === "" || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`));
}
function sameFile(a: Stats, b: Stats): boolean { return a.ino !== 0 && a.dev === b.dev && a.ino === b.ino; }
export interface LinkObservation { kind: "matching" | "absent" | "conflict"; target: string; message: string }
export class LinkFiles {
	private boundRoot: { path: string; stat: Stats } | null = null;
	constructor(readonly root: string, readonly disk: Disk = fs) {}
	async canonicalRoot(): Promise<string> {
		const root = await this.disk.realpath(this.root);
		const stat = await this.disk.stat(root);
		if (!stat.isDirectory()) throw new SafetyError("conflict", "Vault root is not a directory");
		if (this.boundRoot && (path.relative(this.boundRoot.path, root) !== "" || (stat.ino !== 0 && this.boundRoot.stat.ino !== 0 && !sameFile(stat, this.boundRoot.stat)))) throw new SafetyError("conflict", "Vault root changed during this session; reload only after reviewing its location");
		this.boundRoot = { path: root, stat };
		return root;
	}
	async target(entry: Entry, missingAllowed = false): Promise<string> {
		if (!parseEntry(entry)) throw new SafetyError("conflict", "Unsafe entry name or path");
		const root = await this.canonicalRoot();
		let parent = root;
		for (const part of entry.vaultPath.split("/").filter(Boolean)) {
			parent = path.join(parent, part);
			try {
				const stat = await this.disk.lstat(parent);
				if (stat.isSymbolicLink() || !stat.isDirectory()) throw new SafetyError("conflict", "Destination must be inside real vault folders, not links or files");
			} catch (error) {
				if (missingAllowed && errorCode(error) === "ENOENT") return path.join(root, entry.vaultPath, entry.name);
				throw error;
			}
		}
		if (!contains(root, await this.disk.realpath(parent))) throw new SafetyError("conflict", "Destination escapes the vault");
		return path.join(parent, entry.name);
	}
	async source(entry: Entry): Promise<string> {
		let source: string;
		try {
			source = await this.disk.realpath(entry.sourcePath);
			if (!(await this.disk.stat(source)).isDirectory()) throw new SafetyError("conflict", "Source is not a directory");
		} catch (error) {
			if (errorCode(error) === "ENOENT") throw new SafetyError("unavailable", "Source folder is unavailable; the mapping is retained");
			throw error;
		}
		if (entry.expectedSource && path.relative(entry.expectedSource, source) !== "") throw new SafetyError("conflict", "Source location changed; forget and relink only after reviewing it");
		return source;
	}
	async link(entry: Entry): Promise<LinkObservation> {
		const target = await this.target(entry, true);
		let stat: Stats;
		try { stat = await this.disk.lstat(target); }
		catch (error) {
			if (errorCode(error) === "ENOENT") return { kind: "absent", target, message: "Link absent" };
			throw error;
		}
		if (!stat.isSymbolicLink()) return { kind: "conflict", target, message: "A real file or directory occupies this location" };
		const text = path.resolve(path.dirname(target), await this.disk.readlink(target));
		const expected = entry.expectedSource ?? path.resolve(entry.sourcePath);
		let matches = path.relative(expected, text) === "";
		if (!matches) {
			try { matches = path.relative(await this.disk.realpath(expected), await this.disk.realpath(target)) === ""; }
			catch (error) { if (errorCode(error) !== "ENOENT") throw error; }
		}
		return { kind: matches ? "matching" : "conflict", target, message: matches ? "Expected link present" : "A different symlink occupies this location" };
	}
	async admit(entry: Entry, entries: Entry[]): Promise<Entry> {
		await this.target(entry);
		const source = await this.source(entry);
		const root = await this.canonicalRoot();
		const sourceStat = await this.disk.stat(source);
		if (contains(root, source) || contains(source, root) || sameFile(sourceStat, await this.disk.stat(root))) throw new SafetyError("conflict", "Source and vault must be disjoint");
		for (const other of entries) {
			if (other.id === entry.id) continue;
			if (path.join(other.vaultPath, other.name).toLocaleLowerCase() === path.join(entry.vaultPath, entry.name).toLocaleLowerCase()) throw new SafetyError("conflict", "Another entry reserves this destination");
			let otherSource: string;
			try { otherSource = await this.source(other); }
			catch (error) {
				if (error instanceof SafetyError && error.kind === "unavailable" && other.expectedSource) otherSource = other.expectedSource;
				else throw new SafetyError("conflict", `Cannot verify overlap with ${other.name}: ${healthError(error).message}`);
			}
			let same = false;
			try { same = sameFile(sourceStat, await this.disk.stat(otherSource)); }
			catch (error) { if (errorCode(error) !== "ENOENT") throw error; }
			if (contains(source, otherSource) || contains(otherSource, source) || same) throw new SafetyError("conflict", `Source overlaps ${other.name}`);
		}
		return { ...entry, expectedSource: source };
	}
	async inspect(entry: Entry, entries: Entry[]): Promise<Health> {
		try {
			const link = await this.link(entry);
			if (link.kind === "conflict") return link;
			await this.admit(entry, entries);
			return link;
		} catch (error) { return healthError(error); }
	}
	async enable(entry: Entry, entries: Entry[]): Promise<Entry> {
		const admitted = await this.admit(entry, entries);
		const current = await this.link(admitted);
		if (current.kind === "conflict") throw new SafetyError("conflict", current.message);
		if (current.kind === "absent") {
			const target = await this.target(admitted);
			await this.disk.symlink(admitted.expectedSource as string, target, process.platform === "win32" ? "junction" : "dir");
		}
		return admitted;
	}
	async disable(entry: Entry): Promise<void> {
		const first = await this.link(entry);
		if (first.kind === "absent") return;
		if (first.kind !== "matching") throw new SafetyError("conflict", first.message);
		const identity = await this.disk.lstat(first.target);
		const again = await this.link(entry);
		if (again.kind !== "matching" || !sameFile(identity, await this.disk.lstat(again.target))) throw new SafetyError("conflict", "Link changed during removal");
		await this.disk.unlink(again.target);
	}
}
