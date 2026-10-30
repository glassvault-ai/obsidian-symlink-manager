const test=require('node:test'),assert=require('node:assert/strict');const {fixture,fs,path}=require('./fixtures.cjs');const {LinkFiles,Coordinator,SnapshotStore}=require(process.env.SYMLINK_TEST_BUNDLE);
test('native Windows junction creation and unlink preserve source', {skip:process.platform!=='win32'},async t=>{
 const f=await fixture(t),engine=new LinkFiles(f.vault),e=f.entry();await engine.enable(e,[]);assert.equal((await engine.link(e)).kind,'matching');await engine.disable(e);assert.equal(await fs.readFile(path.join(f.source,'sentinel'),'utf8'),'unchanged');
});
test('native Linux directory aliases obey disjointness', {skip:process.platform!=='linux'},async t=>{
 const f=await fixture(t),alias=path.join(f.root,'alias');await f.link(f.source,alias);const engine=new LinkFiles(f.vault);const original=await engine.admit(f.entry(),[]);await assert.rejects(engine.admit(f.entry({sourcePath:alias,name:'other'}),[original]),/overlaps/);
});
test('case-only rename either succeeds safely or preserves the occupied old path',async t=>{
 const f=await fixture(t),plugin=path.join(f.root,'plugin');await fs.mkdir(plugin);const m=new Coordinator(new LinkFiles(f.vault),new SnapshotStore(plugin));await m.open(async()=>null);const e=f.entry();await m.add(e);
 let aliases=false;try{await fs.lstat(path.join(f.vault,'LINK'));aliases=true;}catch(error){if(error.code!=='ENOENT')throw error;}
 const result=await m.rename(e.id,'LINK');assert.equal(result.success,!aliases);assert.equal((await fs.lstat(path.join(f.vault,aliases?'link':'LINK'))).isSymbolicLink(),true);t.diagnostic(`Case alias on this fixture volume: ${aliases}; native platform: ${process.platform}`);
});
test('long real destination paths remain contained without changing source data',async t=>{
 const f=await fixture(t),engine=new LinkFiles(f.vault);const vp=Array.from({length:6},(_,i)=>`${i}-${'x'.repeat(38)}`).join('/');
 try{await fs.mkdir(path.join(f.vault,vp),{recursive:true});}catch(error){if(['ENAMETOOLONG','ENOENT'].includes(error.code)){t.skip(`Filesystem path limit: ${error.code}`);return;}throw error;}
 const e=f.entry({vaultPath:vp});await engine.enable(e,[]);await engine.disable(e);assert.equal(await fs.readFile(path.join(f.source,'sentinel'),'utf8'),'unchanged');
});
