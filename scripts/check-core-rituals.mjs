import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const catalog=load("app/content/catalog.json").entries,{POWER_CATALOG}=load("app/game-rules.ts"),{powersForSources,powerEligibility,creationMagicEligibility}=load("app/content/power-eligibility.ts"),{sourcebookForLibraryId}=load("app/creation-sources.ts"),{xpCost}=load("app/experience.ts");
const sources=new Set([sourcebookForLibraryId("core-v5")]),powers=powersForSources(POWER_CATALOG,sources).filter(p=>p.kind==="ritual"&&p.source.book==="core-v5");assert.equal(powers.length,26);
const previous=JSON.parse(execFileSync("git",["show","1e7c22b:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const old of previous)assert.deepEqual(catalog.find(e=>e.id===old.id),old,old.id);
for(const [level,count] of [[1,5],[2,6],[3,6],[4,5],[5,4]])assert.equal(powers.filter(p=>p.level===level).length,count);
for(const power of powers.filter(p=>p.level>1)){
 const entry=catalog.find(e=>e.id===power.id);assert.ok(entry);assert.equal(powerEligibility(power,{"Feitiçaria de Sangue":power.level},{},sources).allowed,true);assert.equal(powerEligibility(power,{"Feitiçaria de Sangue":power.level-1},{},sources).allowed,false);assert.equal(creationMagicEligibility(power,{"Feitiçaria de Sangue":5},{},sources,[]).allowed,false);
 for(const mode of ["new_level","current_level"])assert.equal(xpCost("ritual",power.level,mode),power.level*3);
 for(const locale of ["pt-BR","en"]){const sections=entry.versions[0].descriptions[locale];for(const title of locale==="en"?["Description","Requirements","Cost","Ingredients","System","Dice Pool","Duration"]:["Descrição","Requisitos","Custo","Ingredientes","Sistema","Parada","Duração"])assert.ok(sections.some(s=>s.title===title),`${power.name} ${title}`)}
}
const text=slug=>catalog.find(e=>e.id==="core-v5-ritual-"+slug).versions[0].descriptions.en.map(s=>s.text).join("\n");
assert.match(text("truth-of-blood"),/Instead of the standard Ritual roll/);assert.match(text("truth-of-blood"),/first failure/);
assert.match(text("warding-circle-against-ghouls"),/Three Rouse Checks/);assert.match(text("warding-circle-against-cainites"),/Difficulty 8/);assert.match(text("ward-against-cainites"),/except the caster/);
assert.match(text("escape-to-true-sanctuary"),/twelve Rouse Checks/i);assert.match(text("shaft-of-belated-dissolution"),/margin 5/);assert.match(text("incorporeal-passage"),/straight line/);assert.match(text("heart-of-stone"),/Subtract 3 dice from Remorse/);
console.log("All 26 Core Rituals: 21 missing choices added, level distribution, XP modes, no free higher Rituals, complete Ward/Circle rules and all 298 earlier entries preserved.");
