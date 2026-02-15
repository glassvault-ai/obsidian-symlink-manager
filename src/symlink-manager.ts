import * as fs from "fs";
import * as path from "path";
import type { SymlinkEntry } from "./types";

export interface CreateSymlinkParams {
	sourcePath: string;
	vaultPath: string;
	name: string;
	vaultBasePath: string;
}

export interface SymlinkResult {
	success: boolean;
	message: string;
}

/**
 * Get the correct symlink type for the current platform.
 * Windows uses 'junction' (no admin required), macOS/Linux use 'dir'.
 */
function getSymlinkType(): "dir" | "junction" {
	return process.platform === "win32" ? "junction" : "dir";
}

/** Resolve the absolute filesystem path for a symlink inside the vault. */
function resolveVaultTarget(vaultBasePath: string, vaultPath: string, name: string): string {
	return path.join(vaultBasePath, vaultPath, name);
}

/** Check if a path is a subdirectory of another. */
function isSubdirectory(parent: string, child: string): boolean {
	const resolvedParent = path.resolve(parent) + path.sep;
	const resolvedChild = path.resolve(child) + path.sep;
	return resolvedChild.startsWith(resolvedParent);
}

/**
 * Validate that a symlink can be safely created.
 * Checks: source exists, no loop, no overwrite.
 */
export function validateCreate(params: CreateSymlinkParams): SymlinkResult {
	const { sourcePath, vaultBasePath, vaultPath, name } = params;
	const resolvedSource = path.resolve(sourcePath);
	const resolvedVault = path.resolve(vaultBasePath);
	const targetPath = resolveVaultTarget(vaultBasePath, vaultPath, name);

	// Source must exist
	if (!fs.existsSync(resolvedSource)) {
		return { success: false, message: `Source folder not found: ${sourcePath}` };
	}

	// Loop prevention: source can't be inside vault
	if (isSubdirectory(resolvedVault, resolvedSource)) {
		return { success: false, message: "Source folder is inside the vault — this would create a loop" };
	}

	// Loop prevention: vault can't be inside source
	if (isSubdirectory(resolvedSource, resolvedVault)) {
		return { success: false, message: "Vault is inside the source folder — this would create a loop" };
	}

	// Overwrite protection
	if (fs.existsSync(targetPath)) {
		try {
			const stat = fs.lstatSync(targetPath);
			if (stat.isSymbolicLink()) {
				return { success: false, message: `A symlink already exists at: ${targetPath}` };
			}
		} catch {
			// lstat failed — path might be broken, but something is there
		}
		return { success: false, message: `A file or folder already exists at: ${targetPath}` };
	}

	return { success: true, message: "Validation passed" };
}

/** Create a symlink on disk. Assumes validation has already passed. */
export function createSymlink(params: CreateSymlinkParams): SymlinkResult {
	const { sourcePath, vaultBasePath, vaultPath, name } = params;
	const targetPath = resolveVaultTarget(vaultBasePath, vaultPath, name);

	try {
		fs.symlinkSync(path.resolve(sourcePath), targetPath, getSymlinkType());
		return { success: true, message: `Symlink created: ${name}` };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return { success: false, message: `Failed to create symlink: ${msg}` };
	}
}

/** Remove a symlink from disk. Only uses unlinkSync — never rm/rmdir. */
export function removeSymlink(vaultBasePath: string, entry: SymlinkEntry): SymlinkResult {
	const targetPath = resolveVaultTarget(vaultBasePath, entry.vaultPath, entry.name);

	// Use lstatSync, NOT existsSync — existsSync follows symlinks and returns
	// false for broken symlinks, which would skip cleanup of dead pointers.
	let isSymlink = false;
	try {
		const stat = fs.lstatSync(targetPath);
		if (!stat.isSymbolicLink()) {
			return { success: false, message: `Path is not a symlink — refusing to remove: ${targetPath}` };
		}
		isSymlink = true;
	} catch {
		// lstat failed — nothing exists at this path
		return { success: true, message: "Symlink already removed" };
	}

	if (!isSymlink) {
		return { success: true, message: "Symlink already removed" };
	}

	try {
		fs.unlinkSync(targetPath);
		return { success: true, message: `Symlink removed: ${entry.name}` };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return { success: false, message: `Failed to remove symlink: ${msg}` };
	}
}

/** Toggle a symlink on or off. Returns the new active state. */
export function toggleSymlink(
	vaultBasePath: string,
	entry: SymlinkEntry,
): { result: SymlinkResult; active: boolean } {
	if (entry.active) {
		// Turn off: remove the symlink from disk
		const result = removeSymlink(vaultBasePath, entry);
		return { result, active: result.success ? false : true };
	} else {
		// Turn on: check if symlink already exists and is correct
		const targetPath = path.join(vaultBasePath, entry.vaultPath, entry.name);
		try {
			const stat = fs.lstatSync(targetPath);
			if (stat.isSymbolicLink()) {
				const linkTarget = fs.readlinkSync(targetPath);
				if (path.resolve(linkTarget) === path.resolve(entry.sourcePath)) {
					return { result: { success: true, message: "Symlink already exists" }, active: true };
				}
			}
		} catch {
			// Doesn't exist — proceed with creation
		}

		// Validate and create the symlink
		const params: CreateSymlinkParams = {
			sourcePath: entry.sourcePath,
			vaultBasePath,
			vaultPath: entry.vaultPath,
			name: entry.name,
		};
		const validation = validateCreate(params);
		if (!validation.success) {
			return { result: validation, active: false };
		}
		const result = createSymlink(params);
		return { result, active: result.success };
	}
}

/** Validate a single symlink entry's health. Returns status info. */
export function validateEntry(
	vaultBasePath: string,
	entry: SymlinkEntry,
): { symlinkExists: boolean; sourceExists: boolean } {
	const targetPath = resolveVaultTarget(vaultBasePath, entry.vaultPath, entry.name);
	const resolvedSource = path.resolve(entry.sourcePath);

	let symlinkExists = false;
	try {
		const stat = fs.lstatSync(targetPath);
		symlinkExists = stat.isSymbolicLink();
	} catch {
		// doesn't exist
	}

	const sourceExists = fs.existsSync(resolvedSource);

	return { symlinkExists, sourceExists };
}
