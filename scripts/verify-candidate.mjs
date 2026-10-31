import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Values come from the reviewed release handoff, never from the build being checked.
const directory = process.argv[2];
const commit = process.env.EXPECTED_COMMIT;
if (!directory || !/^[a-f0-9]{40}$/.test(commit ?? '')) throw Error('Candidate directory and reviewed 40-character EXPECTED_COMMIT are required');
const expected = {
 'main.js': process.env.EXPECTED_MAIN_SHA256,
 'manifest.json': process.env.EXPECTED_MANIFEST_SHA256,
 'styles.css': process.env.EXPECTED_STYLES_SHA256,
};
const evidence = JSON.parse(await readFile(path.join(directory, 'candidate.json'), 'utf8'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (head !== commit || evidence.sourceCommit !== commit || evidence.dirty !== false || evidence.repeatedBuildMatches !== true) throw Error('Candidate does not match the reviewed clean source commit');
for (const [name, hash] of Object.entries(expected)) {
 if (!/^[a-f0-9]{64}$/.test(hash ?? '')) throw Error(`Reviewed SHA-256 required for ${name}`);
 const actual = createHash('sha256').update(await readFile(path.join(directory, name))).digest('hex');
 if (actual !== hash || evidence.hashes?.[name] !== actual) throw Error(`Reviewed asset mismatch: ${name}`);
}
console.log('Candidate matches the reviewed commit and all three reviewed asset hashes.');
