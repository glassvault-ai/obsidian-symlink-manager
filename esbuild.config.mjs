import esbuild from 'esbuild';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildOptions } from './scripts/build-options.mjs';
// Even watch mode gets a fresh directory; checkout-root main.js may be a live installation.
const output = await mkdtemp(path.join(tmpdir(), 'symlink-dev-'));
const production = process.argv[2] === 'production';
const context = await esbuild.context({ ...buildOptions(production), outfile: path.join(output, 'main.js') });
for (const name of ['manifest.json', 'styles.css']) await writeFile(path.join(output, name), await readFile(name), { flag: 'wx' });
console.log(`Candidate output: ${output}`);
if (production) { await context.rebuild(); await context.dispose(); }
else await context.watch();
