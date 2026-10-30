const test = require('node:test'); const assert=require('node:assert/strict');
const {LinkFiles,migrate,validName}=require(process.env.SYMLINK_TEST_BUNDLE);
const {fixture,fs,path}=require('./fixtures.cjs');
test('schema quarantines traversal and duplicate ids; top-level corruption is not defaults',()=>{
 assert.throws(()=>migrate({symlinks:null},'/vault'));
 const s=migrate({symlinks:[{id:'x',name:'..',vaultPath:'',sourcePath:'/source',active:true}]},'/vault'); assert.equal(s.quarantine.length,1);
 for(const name of ['.','..','CON','a/b','a\\b','a.','a ',''])assert.equal(validName(name),false,name);
});
test('canonical vault alias and overlapping roots are rejected',async t=>{
 const f=await fixture(t), engine=new LinkFiles(f.vault);const alias=path.join(f.root,'alias');await f.link(f.vault,alias);
 await assert.rejects(engine.admit(f.entry({sourcePath:alias}),[]),/disjoint/);
 const parent=await engine.admit(f.entry(),[]);await fs.mkdir(path.join(f.source,'child'));
 await assert.rejects(engine.admit(f.entry({name:'child',sourcePath:path.join(f.source,'child')}),[parent]),/overlaps/);
 const sa=path.join(f.root,'source-alias');await f.link(f.source,sa);
 await assert.rejects(engine.admit(f.entry({name:'two',sourcePath:sa}),[parent]),/overlaps/);
});
test('all pointer operations reject traversal and linked destination ancestors',async t=>{
 const f=await fixture(t), engine=new LinkFiles(f.vault); await f.link(f.outside,path.join(f.vault,'external'));
 for(const e of [f.entry({vaultPath:'..'}),f.entry({name:'..'}),f.entry({vaultPath:'external'})]){
  await assert.rejects(engine.enable(e,[])); await assert.rejects(engine.disable(e));
 }
 assert.equal((await fs.lstat(path.join(f.vault,'external'))).isSymbolicLink(),true);
});
test('foreign links and real folders survive; expected dangling links can be disabled',async t=>{
 const f=await fixture(t), engine=new LinkFiles(f.vault),e=f.entry();const target=path.join(f.vault,'link');
 await f.link(f.outside,target); await assert.rejects(engine.disable(e),/different/);await fs.unlink(target);
 await fs.mkdir(target);await assert.rejects(engine.disable(e),/real/);await fs.rmdir(target);
 await engine.enable(e,[]);await fs.rename(f.source,path.join(f.root,'offline'));
 assert.equal((await engine.inspect(e,[])).kind,'unavailable'); await engine.disable(e);await assert.rejects(fs.lstat(target),{code:'ENOENT'});
 assert.equal(await fs.readFile(path.join(f.root,'offline/sentinel'),'utf8'),'unchanged');
});
test('permission failures are errors, never absence or removal success',async t=>{
 const f=await fixture(t);const disk={...fs,lstat:async()=>{throw Object.assign(Error('denied'),{code:'EACCES'});}};
 const engine=new LinkFiles(f.vault,disk);await assert.rejects(engine.disable(f.entry()),/denied/);assert.equal((await engine.inspect(f.entry(),[])).kind,'error');
});
test('regular file sources and occupied dangling destination are rejected',async t=>{
 const f=await fixture(t),engine=new LinkFiles(f.vault);await assert.rejects(engine.enable(f.entry({sourcePath:path.join(f.source,'sentinel')}),[]),/not a directory/);
 await f.link(path.join(f.root,'missing'),path.join(f.vault,'link')); await assert.rejects(engine.enable(f.entry(),[]),/different/);
});
test('an aliased vault root may be used but cannot be repointed mid-session',async t=>{
 const f=await fixture(t),alias=path.join(f.root,'vault-alias');await f.link(f.vault,alias);const engine=new LinkFiles(alias);await engine.canonicalRoot();await fs.unlink(alias);await f.link(f.outside,alias);
 await assert.rejects(engine.enable(f.entry(),[]),/root changed/);await assert.rejects(fs.lstat(path.join(f.outside,'link')),{code:'ENOENT'});
});
test('inactive dot-dot rename scenario cannot remove its parent pointer',async t=>{
 const f=await fixture(t),engine=new LinkFiles(f.vault);await fs.mkdir(path.join(f.outside,'sub'));await f.link(f.outside,path.join(f.vault,'parent'));
 const e=f.entry({enabled:false,name:'..',vaultPath:'parent/sub'});await assert.rejects(engine.disable(e));assert.equal((await fs.lstat(path.join(f.vault,'parent'))).isSymbolicLink(),true);
});
test('relative expected links are recognized, including after source goes offline',async t=>{
 const f=await fixture(t),engine=new LinkFiles(f.vault),e=f.entry();
 if(process.platform==='win32'){t.skip('Windows junction relative-target behavior is covered by native junction validation');return;}
 await fs.symlink('../source',path.join(f.vault,'link'));assert.equal((await engine.link(e)).kind,'matching');await fs.rename(f.source,path.join(f.root,'offline'));await engine.disable(e);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
});
test('source file replacement is a conflict and never changes source content',async t=>{
 const f=await fixture(t),engine=new LinkFiles(f.vault),e=f.entry();await engine.enable(e,[]);await fs.rename(f.source,path.join(f.root,'offline'));await fs.writeFile(f.source,'replacement');assert.equal((await engine.inspect(e,[])).kind,'conflict');assert.equal(await fs.readFile(f.source,'utf8'),'replacement');await fs.unlink(f.source);await fs.rename(path.join(f.root,'offline'),f.source);
});
