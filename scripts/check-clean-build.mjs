import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const candidate = JSON.parse(execFileSync(process.execPath, ['scripts/candidate.mjs'], { encoding: 'utf8' }));
const parent = await mkdtemp(path.join(tmpdir(), 'symlink-clean-build-'));
const copy = path.join(parent, 'source');
const env = { ...process.env, GIT_CEILING_DIRECTORIES: parent };
for (const name of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[name];
const run = (command, args) => spawnSync(command, args, { cwd: copy, env, encoding: 'utf8', shell: command === 'npm' && process.platform === 'win32' });
try {
 if (candidate.sourceCommit !== head || candidate.dirty !== false) throw Error('Commit all changes first: the clean-build check compares HEAD with a candidate built from the same clean tree');
 await mkdir(copy);
 execFileSync('tar', ['-x', '-C', copy], { input: execFileSync('git', ['archive', '--format=tar', head], { maxBuffer: 1 << 28 }) });
 if (run('git', ['rev-parse', '--git-dir']).status === 0) throw Error('Archived copy is inside a git repository');

 for (const [command, args] of [['npm', ['ci', '--ignore-scripts']], ['npm', ['run', 'build']]]) {
  const result = run(command, args);
  if (result.status !== 0) throw Error(`${command} ${args.join(' ')} failed without git:\n${result.stdout}${result.stderr}`);
 }
 const rootHash = sha256(await readFile(path.join(copy, 'main.js')));
 if (rootHash !== candidate.hashes['main.js']) throw Error(`Root main.js ${rootHash} differs from candidate ${candidate.hashes['main.js']}`);

 const refused = run(process.execPath, ['scripts/candidate.mjs']);
 if (refused.status === 0 || !/not a git repository/.test(refused.stderr)) throw Error(`candidate.mjs must refuse to run without git:\n${refused.stdout}${refused.stderr}`);
 if (refused.stdout.trim()) throw Error(`candidate.mjs emitted output without git:\n${refused.stdout}`);

 console.log(JSON.stringify({ sourceCommit: head, gitlessBuild: 'passed', rootMainSha256: rootHash, matchesCandidate: true, candidateWithoutGit: 'refused' }, null, 2));
} finally {
 await rm(parent, { recursive: true, force: true });
 await rm(candidate.directory, { recursive: true, force: true });
}
