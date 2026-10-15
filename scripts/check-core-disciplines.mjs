import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const {POWER_CATALOG}=load("app/game-rules.ts"),{powersForSources,powerEligibility}=load("app/content/power-eligibility.ts");
const {sourcebookForLibraryId}=load("app/creation-sources.ts"),{resolveContent}=load("app/content/resolve.ts");
const catalog=load("app/content/catalog.json").entries,sources=new Set([sourcebookForLibraryId("core-v5")]);
const powers=powersForSources(POWER_CATALOG,sources);
const groups=["Animalismo","Auspícios","Celeridade","Dominação"];
for(const discipline of groups){
 const selected=powers.filter(p=>p.source.book==="core-v5"&&p.discipline===discipline);
 assert.equal(selected.length,9,discipline);
 for(const power of selected){
  const entry=catalog.find(e=>e.id===power.id),version=entry?.versions.find(v=>v.book==="core-v5");assert.ok(version,power.id);
  assert.equal(entry.level,power.level);
  assert.equal(resolveContent(entry.names.en,{kind:"power",discipline})?.id,entry.id);
  for(const locale of ["pt-BR","en"]){const sections=version.descriptions[locale];for(const title of locale==="en"?["Description","Requirements","Cost","System","Duration"]:["Descrição","Requisitos","Custo","Sistema","Duração"])assert.ok(sections.some(s=>s.title===title),`${power.id} ${title}`);assert.ok(!sections.some(s=>/##|lurid Pei|sibur/i.test(s.text)),`${power.id}: OCR artifacts`);}
  for(const p of version.pages)assert.equal(p.printedPage,p.pdfPage-2);
 }
}
const hive=powers.find(p=>p.id==="unliving-hive");assert.equal(hive.level,3);
assert.equal(powerEligibility(hive,{Animalismo:2,"Ofuscação":2},{},sources).allowed,false);
assert.equal(powerEligibility(hive,{Animalismo:3,"Ofuscação":1},{},sources).allowed,false);
assert.equal(powerEligibility(hive,{Animalismo:3,"Ofuscação":2},{},sources).allowed,true);
assert.equal(powerEligibility(hive,{Animalismo:3,"Ofuscação":2},{},new Set()).allowed,false);
const possession=powers.find(p=>p.id==="possession");assert.equal(powerEligibility(possession,{"Auspícios":5,"Dominação":2},{},sources).allowed,false);assert.equal(powerEligibility(possession,{"Auspícios":5,"Dominação":3},{},sources).allowed,true);
const system=(id,locale)=>catalog.find(e=>e.id===id).versions[0].descriptions[locale].map(s=>s.text).join("\n");
assert.match(system("drawing-out-beast","pt-BR"),/Não transfere Frenesi de Fome/);
assert.match(system("subsume-spirit","en"),/1 Aggravated Willpower/);
assert.match(system("possession","en"),/3 Aggravated Willpower/);
assert.match(system("telepathy","en"),/1 Willpower/);
assert.match(system("traversal","pt-BR"),/60 metros/);
for(const id of ["unerring-aim","lightning-strike"])assert.match(system(id,"en"),/Celerity 5/);
// This batch adds descriptions; it must not remove any published identity/version.
const previous=JSON.parse(execFileSync("git",["show","e5071b13:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const old of previous){const current=catalog.find(e=>e.id===old.id);assert.ok(current,old.id);assert.deepEqual(current,old,`Previously reviewed content changed: ${old.id}`);}
console.log("36 Core powers: bilingual sections, exact pagination, corrected Hive level, Amalgams, English aliases and all 213 earlier entries preserved.");
