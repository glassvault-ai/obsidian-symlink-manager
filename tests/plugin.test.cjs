const test=require('node:test');const assert=require('node:assert/strict');
const {fixture,fs,path}=require('./fixtures.cjs');const {host}=require('./host.cjs');
async function loaded(t,legacy){const f=await fixture(t);await fs.mkdir(path.join(f.vault,'.obsidian/plugins/symlink-manager'),{recursive:true});const h=host(f.root,legacy);await h.plugin.onload();assert.equal(h.plugin.manager.error,null);return {...f,...h};}
test('candidate plugin routes create, commands, rename and settings through recovery',async t=>{
 const f=await loaded(t);f.plugin.settingTab.display();const e=f.entry();assert.equal(await f.plugin.addSymlink(e),true);
 assert.equal(f.plugin.settingTab.containerEl.controls.find(c=>c.kind==='toggle').value,true);
 await f.plugin.commands.find(c=>c.id==='disable-all-symlinks').callback();assert.equal(f.plugin.settingTab.containerEl.controls.find(c=>c.kind==='toggle').value,false);
 await f.plugin.renameSymlinkEntry(e.id,'renamed');await f.plugin.setSymlinkEnabled(e.id,true);assert.equal((await fs.lstat(path.join(f.vault,'renamed'))).isSymbolicLink(),true);
 await f.plugin.removeSymlinkEntry(e.id);assert.equal(f.plugin.entries.length,0);
 await assert.rejects(fs.lstat(path.join(f.vault,'.obsidian/plugins/symlink-manager/data.json')),{code:'ENOENT'});
});
test('a stale settings toggle applies its requested value rather than inverting newer state',async t=>{
 const f=await loaded(t),e=f.entry();await f.plugin.addSymlink(e);f.plugin.settingTab.display();const old=f.plugin.settingTab.containerEl.controls.find(c=>c.kind==='toggle');
 await f.plugin.setSymlinkEnabled(e.id,false);old.change(false);await f.plugin.manager.setAll(false);assert.equal(f.plugin.entries[0].enabled,false);
});
test('startup traversal records cannot write outside vault and root slash migrates',async t=>{
 const f=await fixture(t);await fs.mkdir(path.join(f.vault,'.obsidian/plugins/symlink-manager'),{recursive:true});
 const h=host(f.root,{symlinks:[{...f.entry({id:'bad',vaultPath:'..'}),active:true},{...f.entry({id:'good',vaultPath:'/'}),active:false}]});await h.plugin.onload();
 assert.equal(h.plugin.manager.quarantineCount,1);assert.equal(h.plugin.entries[0].vaultPath,'');await assert.rejects(fs.lstat(path.join(f.root,'link')),{code:'ENOENT'});
});
test('native folder picker cancellation performs no mutations',async t=>{const f=await loaded(t);assert.equal(await f.plugin.createSymlinkFromPicker(),false);assert.equal(f.plugin.entries.length,0);});
