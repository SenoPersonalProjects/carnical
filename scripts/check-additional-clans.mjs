import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),ts=require('typescript'),cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const loaded={exports:{}};cache.set(file,loaded);if(file.endsWith('.json'))loaded.exports=JSON.parse(fs.readFileSync(file,'utf8'));else new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(loaded,loaded.exports,name=>name.startsWith('.')?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+'.ts')):require(name));return loaded.exports}
const entries=load('app/content/catalog.json').entries,{clanSource}=load('app/content/clan-source.ts');
const previous=JSON.parse(execFileSync('git',['show','b579a9e:app/content/catalog.json'],{encoding:'utf8',maxBuffer:20e6})).entries;for(const entry of previous){const current=entries.find(item=>item.id===entry.id);assert.deepEqual({...current,versions:current.versions.filter(version=>entry.versions.some(old=>old.id===version.id))},entry);}
for(const [id,name,source] of [['banu-haqim','Banu Haqim','camarilla_v5'],['hecata','Hecata','cultos_deuses_sangue_v5'],['ministry','Ministério','anarch_v5']]){
 const entry=entries.find(entry=>entry.id==='clan-'+id);assert.equal(entry.versions.length,2);
 assert.equal(clanSource(name,source,new Set([source])),source);assert.equal(clanSource(name,source,new Set(['players_guide_v5'])),'players_guide_v5');assert.equal(clanSource(name,source,new Set([source,'players_guide_v5']),source),source);
 for(const version of entry.versions)for(const locale of ['pt-BR','en'])for(const title of locale==='en'?['Clan Disciplines','Bane','Clan Compulsion']:['Disciplinas de Clã','Perdição (Fraqueza)','Compulsão do Clã'])assert.ok(version.descriptions[locale].some(section=>section.title===title&&section.text.length>25));
}
const hecata=entries.find(entry=>entry.id==='clan-hecata');const text=(book,locale)=>hecata.versions.find(version=>version.book===book).descriptions[locale].find(section=>/Compuls/.test(section.title)).text;
assert.match(text('cultos-deuses-sangue-v5','pt-BR'),/−3/);assert.match(text('cultos-deuses-sangue-v5','en'),/predicting a death without supernatural/);assert.match(text('players-guide-v5','pt-BR'),/−2/);assert.match(text('players-guide-v5','en'),/ending or resurrecting/);
const pages=load('app/content/source-pages.json').books;
for(const entry of entries.filter(entry=>['clan-banu-haqim','clan-hecata','clan-ministry'].includes(entry.id)))for(const version of entry.versions)for(const ref of version.pages){assert.equal(pages.find(book=>book.id===version.book).pages.find(page=>page.pdfPage===ref.pdfPage).printedPage,ref.printedPage);if(version.book==='players-guide-v5')assert.equal(ref.printedPage,ref.pdfPage-2)}
for(const name of ['Ravnos','Salubri','Tzimisce']){
 const entry=entries.find(entry=>entry.names.en===name&&entry.kind==='clan');assert.equal(entry.versions.length,2);
 assert.equal(clanSource(name,'companion_v5',new Set(['players_guide_v5'])),'players_guide_v5');
 assert.equal(clanSource(name,'companion_v5',new Set(['players_guide_v5','companion_v5']),'companion_v5'),'companion_v5');
 const version=entry.versions.find(version=>version.book==='players-guide-v5');for(const locale of ['pt-BR','en'])assert.ok(version.descriptions[locale].length>=4);
 for(const ref of version.pages){assert.equal(ref.printedPage,ref.pdfPage-2);assert.ok(fs.existsSync(`public/source-pages/${version.book}/${String(ref.pdfPage).padStart(4,'0')}.webp`));}
}
const ravnos=entries.find(entry=>entry.id==='clan-ravnos').versions.find(version=>version.book==='players-guide-v5');assert.match(JSON.stringify(ravnos.descriptions.en),/in torpor/);
const salubri=entries.find(entry=>entry.id==='clan-salubri');assert.match(JSON.stringify(salubri.versions.find(version=>version.book==='players-guide-v5').descriptions.en),/hide the entire Salubri/);assert.doesNotMatch(JSON.stringify(salubri.versions.find(version=>version.book==='companion-v5').descriptions.en),/hide the entire Salubri/);
console.log('Six additional clans: primary/Guide source selection, prior versions preserved, full bilingual mechanics, distinct Hecata/Salubri versions, Ravnos torpor and original page mapping passed.');
