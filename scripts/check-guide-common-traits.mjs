import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),ts=require('typescript'),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith('.json'))out.exports=JSON.parse(fs.readFileSync(file,'utf8'));else new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(out,out.exports,name=>name.startsWith('.')?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+'.ts')):require(name));return out.exports;}
const entries=load('app/content/catalog.json').entries,eligibility=load('app/content/item-eligibility.ts'),banes=load('app/content/clan-banes.ts'),{addCreationItem}=load('app/content/creation-item-effects.ts'),{catalogAdvantageQuote:quote}=load('app/content/catalog-item-xp.ts');
const old=JSON.parse(execFileSync('git',['show','16c00d9:app/content/catalog.json'],{encoding:'utf8',maxBuffer:30e6})).entries;
for(const entry of old)assert.deepEqual(entries.find(e=>e.id===entry.id),entry);
const added=entries.filter(e=>e.id.startsWith('guide-merit-')||e.id.startsWith('guide-flaw-')||e.id==='guide-background-city-secrets');assert.equal(added.length,20);
for(const entry of added)for(const version of entry.versions){for(const locale of ['pt-BR','en'])assert.ok(version.descriptions[locale].length>=2);for(const page of version.pages)assert.ok(fs.existsSync(`public/source-pages/${version.book}/${String(page.pdfPage).padStart(4,'0')}.webp`));}
const entry=id=>entries.find(e=>e.id===id),version=id=>entry(id).versions[0],item=(id,detail)=>({name:entry(id).names['pt-BR'],dots:version(id).level,source:'players_guide_v5',notes:'',catalogId:id,versionId:version(id).id,instanceId:crypto.randomUUID(),instanceName:detail});
const context={phase:'creation',clan:'Lasombra',activeSources:new Set(['core_v5_ptbr','players_guide_v5']),skills:{},disciplines:{},bloodPotency:1};
const city='guide-background-city-secrets',cityVersion=version(city);assert.equal(eligibility.catalogDetailValid(city,cityVersion,[],''),false);
let data={merits:[],flawItems:[],disciplines:{},disciplinePowers:{},xpPurchases:[]};
for(const name of ['Primeiro segredo','Segundo segredo','Terceiro segredo']){const result=addCreationItem(data,'merits',item(city,name),context);assert.equal(result.error,undefined);data=result.data;}
assert.equal(data.merits.length,3);assert.ok(addCreationItem(data,'merits',item(city,'Quarto segredo'),context).error);
assert.equal(eligibility.catalogDetailValid(city,cityVersion,[item(city,'Segredo Único')],' segredo unico '),false);
assert.equal(quote(city,cityVersion.id,data.merits,{...context,phase:'xp'},'new'),undefined);
for(const id of ['guide-merit-remarkable-feature','guide-flaw-knowledge-hungry','guide-flaw-prestation-debts'])assert.equal(eligibility.catalogDetailValid(id,version(id),[],''),false);
assert.equal(eligibility.itemEligibility(version('guide-merit-nuit-mode'),{...context,bloodPotency:2}).allowed,false);
assert.equal(eligibility.itemEligibility(version('guide-merit-nuit-mode'),context).allowed,true);
assert.equal(eligibility.itemEligibility(version('guide-merit-tempered-will'),{...context,disciplines:{Dominação:1}}).allowed,false);
assert.equal(eligibility.itemEligibility(version('guide-flaw-transparent'),{...context,skills:{Subterfúgio:1}}).allowed,false);
const twice=item('guide-flaw-twice-cursed');
assert.equal(banes.selectedClanBane('Lasombra',{},[twice]).id,'bane-lasombra');assert.equal(banes.variantRemorsePool(4,'Lasombra',1,{},[twice]),2);
assert.equal(banes.selectedClanBane('Lasombra',{},[{...twice,source:'custom'}]),undefined);
assert.equal(banes.selectedClanBane('Personalizado',{},[twice]),undefined);
assert.equal(banes.variantFrenzyPenalty('Gangrel',1,{},true,[twice]),2);
assert.equal(banes.decayCreationAdjustment('Hecata',1,{},true,[],[twice]).backgroundCost,4);
assert.equal(eligibility.itemEligibility(version('guide-flaw-twice-cursed'),{...context,configuredBaneId:'bane-lasombra'}).allowed,false);
assert.equal(eligibility.itemEligibility(version('guide-flaw-twice-cursed'),{...context,clanBaneId:'bane-lasombra'}).allowed,true);
const studio=fs.readFileSync('app/character-studio.tsx','utf8');assert.ok(studio.includes('name==="Subterfúgio"&&hasCreationTrait(current.data.flawItems,"guide-flaw-transparent")'));
console.log('20 bilingual Guide traits: old447 preserved; required details, distinct secrets/max3, XP limits, passive prerequisites and additional Banes passed.');
