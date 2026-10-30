import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const versions = JSON.parse(await readFile('versions.json', 'utf8'));
if (manifest.version !== pkg.version || versions[manifest.version] !== manifest.minAppVersion) {
 throw Error('Release metadata is not ready: choose the approved next version and its minimum-app mapping. No files changed.');
}
let exists = false;
try { execFileSync('git', ['rev-parse', '--verify', `refs/tags/${manifest.version}`], { stdio: 'ignore' }); exists = true; } catch { /* New release tag is required. */ }
if (exists) throw Error('This version already has a local tag; never replace a published release with candidate bytes.');
console.log('Version metadata is consistent. Publication still requires review and authorization.');
