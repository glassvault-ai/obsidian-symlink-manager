const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
async function fixture(t) {
 const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'symlink-fixture-')));
 const vault = path.join(root, 'vault'); const source = path.join(root, 'source'); const outside = path.join(root, 'outside');
 for (const p of [vault, source, outside]) { await fs.mkdir(p); await fs.writeFile(path.join(p, 'sentinel'), 'unchanged'); }
 t.after(async () => { for (const p of [vault, source, outside]) { try { require('node:assert/strict').equal(await fs.readFile(path.join(p,'sentinel'),'utf8'),'unchanged'); } catch(e) { if(e.code !== 'ENOENT' || p !== source)throw e; require('node:assert/strict').equal(await fs.readFile(path.join(root,'offline/sentinel'),'utf8'),'unchanged'); } } await fs.rm(root, { recursive: true, force: true }); });
 const entry = (changes = {}) => ({ id: crypto.randomUUID(), name: 'link', sourcePath: source, vaultPath: '', enabled: true, ...changes });
 const link = (s,d) => fs.symlink(s,d,process.platform==='win32'?'junction':'dir');
 return {root,vault,source,outside,entry,link};
}
module.exports={fixture,fs,path};
