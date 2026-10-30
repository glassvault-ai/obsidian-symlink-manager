import * as path from "path";

export interface Entry {
	id: string;
	name: string;
	sourcePath: string;
	vaultPath: string;
	enabled: boolean;
	expectedSource?: string;
}
export interface Quarantined { raw: unknown; reason: string }
export interface Pending {
	kind: "set" | "remove" | "rename";
	before: Entry | null;
	after: Entry | null;
}
export interface State {
	schema: 2;
	vaultRoot: string;
	entries: Entry[];
	quarantine: Quarantined[];
	pending: Pending | null;
}
export type HealthKind = "matching" | "absent" | "unavailable" | "conflict" | "error";
export interface Health { kind: HealthKind; message: string }
export class SafetyError extends Error {
	constructor(public readonly kind: HealthKind, message: string) { super(message); }
}
export function record(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validName(value: unknown): value is string {
	return typeof value === "string" && value.length > 0 && value === value.trim()
		&& value !== "." && value !== ".." && !/[<>:"/\\|?*]/u.test(value) && !Array.from(value).some(c => c.charCodeAt(0) < 32)
		&& !/[. ]$/u.test(value) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(value);
}
export function validVaultPath(value: unknown): value is string {
	return typeof value === "string" && (value === "" || (!path.isAbsolute(value)
		&& !path.win32.isAbsolute(value) && value.split("/").every(validName)));
}
export function parseEntry(value: unknown, legacy = false): Entry | null {
	if (!record(value) || typeof value.id !== "string" || !value.id.trim()
		|| !validName(value.name) || !validVaultPath(value.vaultPath)
		|| typeof value.sourcePath !== "string" || !path.isAbsolute(value.sourcePath)
		|| value.sourcePath.includes("\0") || typeof value[legacy ? "active" : "enabled"] !== "boolean"
		|| (value.expectedSource !== undefined && (typeof value.expectedSource !== "string"
			|| !path.isAbsolute(value.expectedSource) || value.expectedSource.includes("\0")))) return null;
	return { id: value.id, name: value.name, sourcePath: value.sourcePath, vaultPath: value.vaultPath,
		enabled: value[legacy ? "active" : "enabled"] as boolean,
		...(typeof value.expectedSource === "string" ? { expectedSource: value.expectedSource } : {}) };
}
export function migrate(value: unknown, vaultRoot: string): State {
	const state: State = { schema: 2, vaultRoot, entries: [], quarantine: [], pending: null };
	if (value == null) return state;
	if (!record(value) || !Array.isArray(value.symlinks)) throw new SafetyError("error", "Settings are invalid; preserve the original data and repair it before migration");
	const ids = new Map<string, number>();
	for (const raw of value.symlinks as unknown[]) {
		if (record(raw) && typeof raw.id === "string") ids.set(raw.id, (ids.get(raw.id) ?? 0) + 1);
	}
	for (const raw of value.symlinks as unknown[]) {
		const e = parseEntry(raw, true);
		if (!e || ids.get(e.id) !== 1) state.quarantine.push({ raw, reason: "Invalid entry or duplicate identity" });
		else state.entries.push(e);
	}
	return state;
}
export function parseState(value: unknown): State {
	if (!record(value) || value.schema !== 2 || typeof value.vaultRoot !== "string" || !path.isAbsolute(value.vaultRoot)
		|| !Array.isArray(value.entries) || !Array.isArray(value.quarantine)) throw new SafetyError("error", "Unsupported or invalid recovery state");
	const entries = (value.entries as unknown[]).map(e => parseEntry(e));
	if (entries.some(e => e === null) || new Set(entries.map(e => e?.id)).size !== entries.length) throw new SafetyError("error", "Recovery entries are invalid or ambiguous");
	for (const q of value.quarantine as unknown[]) if (!record(q) || typeof q.reason !== "string" || !("raw" in q)) throw new SafetyError("error", "Invalid quarantine data");
	let pending: Pending | null = null;
	if (value.pending !== null) {
		const p = value.pending;
		if (!record(p) || !["set", "remove", "rename"].includes(String(p.kind))) throw new SafetyError("error", "Invalid pending operation");
		const before = p.before === null ? null : parseEntry(p.before);
		const after = p.after === null ? null : parseEntry(p.after);
		if ((p.before !== null && !before) || (p.after !== null && !after)
			|| (p.kind === "remove" ? !before || after !== null : !after)
			|| (p.kind === "rename" && (!before || before.id !== after?.id))
			|| (before && after && before.id !== after.id)) throw new SafetyError("error", "Invalid pending operation entries");
		pending = { kind: p.kind as Pending["kind"], before, after };
	}
	return { schema: 2, vaultRoot: value.vaultRoot, entries: entries as Entry[], quarantine: value.quarantine as Quarantined[], pending };
}
export function healthError(error: unknown): Health {
	return error instanceof SafetyError ? { kind: error.kind, message: error.message }
		: { kind: "error", message: error instanceof Error ? error.message : String(error) };
}
export function errorCode(error: unknown): string | undefined {
	return record(error) && typeof error.code === "string" ? error.code : undefined;
}
