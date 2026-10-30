const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
function host(root,legacy=null){
 const notices=[],modals=[];
 class Element {constructor(){this.controls=[];this.text=[];this.listeners={};this.win={setTimeout,clearTimeout};}empty(){this.controls=[];this.text=[];}createEl(_,options={}){this.text.push(options.text);return new Element();}createSpan(options){this.text.push(options.text);return new Element();}addEventListener(event,fn){this.listeners[event]=fn;}}
 class Component{constructor(kind){this.kind=kind;this.inputEl=new Element();}setValue(v){this.value=v;return this;}getValue(){return this.value;}setPlaceholder(v){this.placeholder=v;return this;}setDisabled(v){this.disabled=v;return this;}setButtonText(v){this.label=v;return this;}setCta(){return this;}setWarning(){return this;}setIcon(){return this;}setTooltip(v){this.tooltip=v;return this;}onClick(fn){this.click=fn;return this;}onChange(fn){this.change=fn;return this;}}
 class Setting{constructor(container){this.container=container;this.nameEl=new Element();}setName(name){this.name=name;return this;}setDesc(desc){this.desc=desc;return this;}setHeading(){return this;}add(kind,fn){const c=new Component(kind);c.setting=this;this.container.controls.push(c);fn(c);return this;}addButton(fn){return this.add('button',fn);}addExtraButton(fn){return this.add('extra',fn);}addToggle(fn){return this.add('toggle',fn);}addText(fn){return this.add('text',fn);}}
 class Plugin{constructor(app,manifest){this.app=app;this.manifest=manifest;this.commands=[];}async loadData(){return legacy;}async saveData(){throw Error('legacy write forbidden');}addSettingTab(tab){this.settingTab=tab;}addCommand(command){this.commands.push(command);}addRibbonIcon(){}register(){} }
 class PluginSettingTab{constructor(app,plugin){this.app=app;this.plugin=plugin;this.containerEl=new Element();}}
 class FileSystemAdapter{getBasePath(){return path.join(root,'vault');}}
 class TFolder{constructor(p){this.path=p;}}
 class Modal{constructor(app){this.app=app;this.contentEl=new Element();this.modalEl=new Element();modals.push(this);}open(){this.onOpen?.();return this;}close(){this.onClose?.();}setPlaceholder(){}}
 class FuzzySuggestModal extends Modal{}
 const vaultRoot=new TFolder('/');const app={vault:{adapter:new FileSystemAdapter(),configDir:'.obsidian',getRoot:()=>vaultRoot,getAllLoadedFiles:()=>[vaultRoot]}};
 const electron={remote:{dialog:{showOpenDialog:async()=>({canceled:true,filePaths:[]})}}};
 const obsidian={Plugin,PluginSettingTab,Setting,Notice:class{constructor(s){notices.push(s);}},FileSystemAdapter,Modal,FuzzySuggestModal,TFolder,App:class{}};
 const module={exports:{}};const context={module,exports:module.exports,require:n=>n==='obsidian'?obsidian:n==='electron'?electron:require(n),console,process:{platform:process.platform},setTimeout,clearTimeout,AbortController,activeWindow:{setTimeout,clearTimeout}};
 vm.runInNewContext(fs.readFileSync(process.env.SYMLINK_PLUGIN_BUNDLE,'utf8'),context);
 return {plugin:new module.exports.default(app,{id:'symlink-manager',dir:'.obsidian/plugins/symlink-manager'}),app,notices,modals,electron,Element,Component};
}
module.exports={host};
