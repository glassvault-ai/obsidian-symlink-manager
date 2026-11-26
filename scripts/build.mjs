import { build } from 'esbuild';
import { buildOptions } from './build-options.mjs';
await build({ ...buildOptions(), outfile: 'main.js' });
console.log('Wrote main.js');
