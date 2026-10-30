import { build } from 'esbuild';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildOptions } from './build-options.mjs';
const first = await build({ ...buildOptions(), write: false, metafile: true });
const second = await build({ ...buildOptions(), write: false });
const javascript = first.outputFiles[0].contents;
if (!Buffer.from(javascript).equals(second.outputFiles[0].contents)) throw Error('Repeated builds differ');
const directory = await mkdtemp(path.join(tmpdir(), 'symlink-candidate-'));
const assets = { 'main.js': javascript, 'manifest.json': await readFile('manifest.json'), 'styles.css': await readFile('styles.css') };
const hashes = {};
for (const [name, bytes] of Object.entries(assets)) {
 await writeFile(path.join(directory, name), bytes, { flag: 'wx' });
 hashes[name] = createHash('sha256').update(bytes).digest('hex');
}
const evidence = {
 kind: 'unreleased-candidate',
 sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
 dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
 repeatedBuildMatches: true, hashes, externalImports: Object.values(first.metafile.outputs).flatMap(o => o.imports.map(i => i.path)),
};
await writeFile(path.join(directory, 'candidate.json'), JSON.stringify(evidence, null, 2) + '\n', { flag: 'wx' });
console.log(process.argv.includes('--github-output') ? `directory=${directory}` : JSON.stringify({ directory, ...evidence }, null, 2));
