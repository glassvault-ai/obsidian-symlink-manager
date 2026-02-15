export interface SymlinkEntry {
	id: string;
	name: string;
	sourcePath: string;
	vaultPath: string;
	active: boolean;
}

export interface PluginSettings {
	symlinks: SymlinkEntry[];
}

export const DEFAULT_SETTINGS: PluginSettings = {
	symlinks: [],
};
