const test=require('node:test');const assert=require('node:assert/strict');const {fixture,fs,path}=require('./fixtures.cjs');const {host}=require('./host.cjs');
const {Coordinator,SnapshotStore,LinkFiles}=require(process.env.SYMLINK_TEST_BUNDLE);
async function loaded(t){const f=await fixture(t);await fs.mkdir(path.join(f.vault,'.obsidian/plugins/symlink-manager'),{recursive:true});const h=host(f.root);await h.plugin.onload();return {...f,...h};}
async function until(fn){for(let i=0;i<30&&!fn();i++)await new Promise(setImmediate);assert(fn(),'expected event did not occur');}
test('modal close-before-choose uses its owning window and still selects once',async t=>{
 const f=await loaded(t);f.electron.remote.dialog.showOpenDialog=async()=>({canceled:false,filePaths:[f.source]});const pending=f.plugin.createSymlinkFromPicker();await until(()=>f.modals.length);
 const modal=f.modals[0];modal.onClose();assert.equal(modal.modalEl.win.timerCalls,1);modal.onChooseItem(f.app.vault.getRoot());assert.equal(await pending,true);modal.onClose();modal.onChooseItem(f.app.vault.getRoot());assert.equal(f.plugin.entries.length,1);assert.equal(modal.modalEl.win.listeners.size,0);
});
for(const action of ['close','pagehide','unload'])test(`folder picker ${action} settles cancellation without mutation`,async t=>{
 const f=await loaded(t);f.electron.remote.dialog.showOpenDialog=async()=>({canceled:false,filePaths:[f.source]});const pending=f.plugin.createSymlinkFromPicker();await until(()=>f.modals.length);const modal=f.modals[0];
 if(action==='close')modal.close();else if(action==='pagehide')modal.modalEl.win.emit('pagehide');else f.plugin.onunload();
 assert.equal(await pending,false);modal.onChooseItem(f.app.vault.getRoot());assert.equal(f.plugin.entries.length,0);assert.equal(modal.modalEl.win.listeners.size,0);
});
test('unload detaches a pending native dialog and ignores its later result',async t=>{
 const f=await loaded(t);let respond;f.electron.remote.dialog.showOpenDialog=()=>new Promise(r=>respond=r);const pending=f.plugin.createSymlinkFromPicker();f.plugin.onunload();assert.equal(await pending,false);respond({canceled:false,filePaths:[f.source]});await new Promise(setImmediate);assert.equal(f.modals.length,0);assert.equal(f.plugin.entries.length,0);
});
test('confirmation cancellation on unload preserves existing pointer',async t=>{
 const f=await loaded(t),e=f.entry();await f.plugin.addSymlink(e);const pending=f.plugin.confirmRemoval(e.id,e.name);await until(()=>f.modals.length);f.plugin.onunload();assert.equal(await pending,false);assert.equal((await fs.lstat(path.join(f.vault,e.name))).isSymbolicLink(),true);
});
test('delayed filesystem probing yields and unload prevents new admission',async t=>{
 const f=await fixture(t),plugin=path.join(f.root,'plugin');await fs.mkdir(plugin);let wait=false,release,started;
 const began=new Promise(r=>started=r),gate=new Promise(r=>release=r);const disk={...fs,realpath:async p=>{if(wait&&p===f.source){started();await gate;}return fs.realpath(p);}};
 const m=new Coordinator(new LinkFiles(f.vault,disk),new SnapshotStore(plugin));await m.open(async()=>null);wait=true;const pending=m.add(f.entry());await began;
 let responsive=false;await new Promise(r=>setImmediate(()=>{responsive=true;r();}));assert(responsive);m.close();release();assert.equal((await pending).success,false);await assert.rejects(fs.lstat(path.join(f.vault,'link')),{code:'ENOENT'});
});
