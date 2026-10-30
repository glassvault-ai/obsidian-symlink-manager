import { build } from 'esbuild';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const output = await mkdtemp(path.join(tmpdir(), 'symlink-tests-build-'));
try {
 const bundle = path.join(output, 'api.cjs');
 await build({ entryPoints: ['tests/api.ts'], platform: 'node', bundle: true, format: 'cjs', outfile: bundle });
 await build({ entryPoints: ['src/main.ts'], platform: 'node', bundle: true, format: 'cjs', outfile: path.join(output, 'plugin.cjs'), external: ['obsidian', 'electron'] });
 const files = (await readdir('tests')).filter(f => f.endsWith('.test.cjs')).sort().map(f => path.join('tests', f));
 const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit', env: { ...process.env, SYMLINK_TEST_BUNDLE: bundle, SYMLINK_PLUGIN_BUNDLE: path.join(output, 'plugin.cjs') } });
 process.exitCode = result.status ?? 1;
} finally { await rm(output, { recursive: true, force: true }); }
