const test=require('node:test');const assert=require('node:assert/strict');
const {Coordinator,SnapshotStore,LinkFiles,migrate}=require(process.env.SYMLINK_TEST_BUNDLE);
const {fixture,fs,path}=require('./fixtures.cjs');
async function setup(t,disk=fs,hook=async()=>{}) {
 const f=await fixture(t);const plugin=path.join(f.root,'plugin');await fs.mkdir(plugin);
 const store=new SnapshotStore(plugin,hook);const manager=new Coordinator(new LinkFiles(f.vault,disk),store);
 await manager.open(async()=>null);assert.equal(manager.error,null);
 return {...f,plugin,store,manager,reopen:async()=>{const m=new Coordinator(new LinkFiles(f.vault),new SnapshotStore(plugin));await m.open(async()=>{throw Error('legacy must never be reloaded');});return m;}};
}
test('offline startup preserves mapping, desired state and source; Refresh reconnects',async t=>{
 const f=await setup(t);const e=f.entry();assert.equal((await f.manager.add(e)).success,true);
 await fs.rename(f.source,path.join(f.root,'offline'));const m=await f.reopen();assert.equal(m.entries.length,1);assert.equal(m.entries[0].enabled,true);assert.equal(m.health.get(e.id).kind,'unavailable');
 await fs.rename(path.join(f.root,'offline'),f.source);await m.refresh();assert.equal(m.health.get(e.id).kind,'matching');
});
for(const stage of ['before-write','before-flush','before-replace','after-replace','before-verify'])for(const boundary of [1,2]){
 test(`remove recovery: ${stage}, commit ${boundary}`,async t=>{
  let armed=false,count=0;const f=await setup(t,fs,async s=>{if(armed&&s===stage&&++count===boundary)throw Error('injected storage failure');});
  const e=f.entry();assert.equal((await f.manager.add(e)).success,true);armed=true;
  assert.equal((await f.manager.remove(e.id)).success,false);assert.equal(f.manager.readOnly,true);
  if(boundary===1)assert.equal((await fs.lstat(path.join(f.vault,'link'))).isSymbolicLink(),true);
  else await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
  const m=await f.reopen();assert.equal(m.readOnly,false);
  // If admission never committed, old intent is retained; otherwise durable removal wins.
  const admitted=boundary===2 || ['after-replace','before-verify'].includes(stage);
  assert.equal(m.entries.length,admitted?0:1);if(admitted)await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
 });
}
test('unlink error after actual unlink never resurrects on restart',async t=>{
 let fail=false;const f=await setup(t,{...fs,unlink:async p=>{await fs.unlink(p);if(fail)throw Error('late I/O failure');}});
 const e=f.entry();await f.manager.add(e);fail=true;assert.equal((await f.manager.remove(e.id)).success,false);assert(f.manager.pending);
 const m=await f.reopen();assert.equal(m.entries.length,0);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
});
test('inactive rename reconciles ghost link instead of abandoning old name',async t=>{
 const f=await setup(t);const e=f.entry();await f.manager.add(e);await f.manager.setEnabled(e.id,false);
 await f.link(f.source,path.join(f.vault,'link'));assert.equal((await f.manager.rename(e.id,'new')).success,true);
 await f.manager.remove(e.id);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});await assert.rejects(fs.lstat(path.join(f.vault,'new')),{code:'ENOENT'});
});
test('foreign pointer and real directory conflicts permit explicit Forget only',async t=>{
 const f=await setup(t),e=f.entry();await f.manager.add(e);await fs.unlink(path.join(f.vault,'link'));await f.link(f.outside,path.join(f.vault,'link'));
 assert.equal((await f.manager.remove(e.id)).success,false);assert.equal((await f.manager.forget(e.id)).success,true);assert.equal((await fs.lstat(path.join(f.vault,'link'))).isSymbolicLink(),true);
});
test('rename double failure is honest and explicit disable cancels old intent',async t=>{
 let fail=false;const f=await setup(t,{...fs,symlink:async(...a)=>{if(fail)throw Error('creation failed');return fs.symlink(...a);}});
 const e=f.entry();await f.manager.add(e);fail=true;assert.equal((await f.manager.rename(e.id,'new')).success,false);
 assert(f.manager.pending);assert.notEqual(f.manager.health.get(e.id).kind,'matching');
 assert.equal((await f.manager.setEnabled(e.id,false)).success,true);assert.equal(f.manager.entries[0].name,'link');assert.equal(f.manager.entries[0].enabled,false);
 const m=await f.reopen();assert.equal(m.entries[0].enabled,false);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
});
test('serialized requests use requested values; bulk repairs metadata drift',async t=>{
 const f=await setup(t),e=f.entry();await f.manager.add(e);
 await Promise.all([f.manager.setEnabled(e.id,false),f.manager.setEnabled(e.id,true),f.manager.setEnabled(e.id,false)]);
 assert.equal(f.manager.entries[0].enabled,false);await f.link(f.source,path.join(f.vault,'link'));await f.manager.setAll(false);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
 await f.manager.setAll(true);await fs.unlink(path.join(f.vault,'link'));await f.manager.setAll(true);assert.equal((await fs.lstat(path.join(f.vault,'link'))).isSymbolicLink(),true);
});
test('corrupt or deleted snapshots never fall back to legacy or mutate links',async t=>{
 const f=await setup(t),e=f.entry();await f.manager.add(e);await fs.writeFile(path.join(f.plugin,'symlink-manager-state/a.json'),'corrupt');
 const m=await f.reopen();assert.equal(m.readOnly,true);assert.equal((await fs.lstat(path.join(f.vault,'link'))).isSymbolicLink(),true);
 assert.equal((await m.forget(e.id)).success,false);
});
test('legacy invalid records are quarantined and raw legacy data stays intact',async t=>{
 const f=await fixture(t),plugin=path.join(f.root,'plugin');await fs.mkdir(plugin);
 const raw={symlinks:[{...f.entry(),active:true,vaultPath:'..'},{...f.entry({id:'good'}),active:false}]};const rawText=JSON.stringify(raw);await fs.writeFile(path.join(plugin,'data.json'),rawText);
 const m=new Coordinator(new LinkFiles(f.vault),new SnapshotStore(plugin));await m.open(async()=>JSON.parse(await fs.readFile(path.join(plugin,'data.json'),'utf8')));
 assert.equal(m.entries.length,1);assert.equal(m.quarantineCount,1);assert.equal(await fs.readFile(path.join(plugin,'data.json'),'utf8'),rawText);
 await assert.rejects(fs.lstat(path.join(f.root,'link')),{code:'ENOENT'});
});
test('snapshot changes from another manager are detected before mutation',async t=>{
 const f=await setup(t);const other=new SnapshotStore(f.plugin);const state=await other.load();await other.commit(state);
 assert.equal((await f.manager.add(f.entry())).success,false);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
});
test('storage initialization interruption is read-only, not a fresh import',async t=>{
 const f=await fixture(t),plugin=path.join(f.root,'plugin');await fs.mkdir(plugin);let count=0;
 const store=new SnapshotStore(plugin,async s=>{if(s==='before-write'&&++count===2)throw Error('interrupt');});await assert.rejects(store.initialize(migrate(null,f.vault)));
 const m=new Coordinator(new LinkFiles(f.vault),new SnapshotStore(plugin));await m.open(async()=>{throw Error('must not fallback');});assert.equal(m.readOnly,true);
});
