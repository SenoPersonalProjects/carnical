import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const catalog=load("app/content/catalog.json").entries,{POWER_CATALOG}=load("app/game-rules.ts"),{powersForSources,powerEligibility,creationMagicEligibility}=load("app/content/power-eligibility.ts"),{sourcebookForLibraryId}=load("app/creation-sources.ts"),{xpCost}=load("app/experience.ts");
const sources=new Set([sourcebookForLibraryId("core-v5")]),powers=powersForSources(POWER_CATALOG,sources).filter(p=>p.kind==="formula"&&p.source.book==="core-v5");assert.equal(powers.length,7);
const previous=JSON.parse(execFileSync("git",["show","5c4c33a:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;for(const old of previous)assert.deepEqual(catalog.find(e=>e.id===old.id),old,old.id);
for(const power of powers){
 const entry=catalog.find(e=>e.id===power.id);assert.ok(entry);
 assert.equal(powerEligibility(power,{[power.discipline]:power.level},{},sources,"Sangue-Ralo").allowed,true);
 assert.equal(powerEligibility(power,{[power.discipline]:power.level},{},sources,"Tremere").allowed,false);
 assert.equal(powerEligibility(power,{[power.discipline]:power.level-1},{},sources,"Sangue-Ralo").allowed,false);
 assert.equal(powerEligibility(power,{[power.discipline]:5},{},new Set(),"Sangue-Ralo").allowed,false);
 for(const mode of ["new_level","current_level"])assert.equal(xpCost("formula",power.level,mode),power.level*3);
 for(const locale of ["pt-BR","en"]){const sections=entry.versions[0].descriptions[locale];for(const title of ["Athanor Corporis","Calcinatio","Fixatio"])assert.ok(sections.some(s=>s.title===title));const table=sections.find(s=>s.title===(locale==="en"?"Mixture quality":"Qualidade da mistura"));assert.match(table.text,/\| 2 \|/);assert.match(table.text,/\| 4 \|/);assert.match(table.text,/\| 6 \|/);}
}
const far=powers.find(p=>p.name==="Longo Alcance"),haze=powers.find(p=>p.name==="Neblina");assert.equal(creationMagicEligibility(far,{[far.discipline]:1},{},sources,[],"Sangue-Ralo").allowed,true);assert.equal(creationMagicEligibility(haze,{[haze.discipline]:1},{},sources,[far],"Sangue-Ralo").allowed,false);
const text=slug=>catalog.find(e=>e.id==="core-v5-formula-"+slug).versions[0].descriptions.en.map(s=>s.text).join("\n");
assert.match(text("far-reach"),/under 100 kg/);assert.match(text("far-reach"),/Difficulty 3, each turn/);assert.match(text("defractionate"),/3 Aggravated Health/);assert.match(text("awaken-sleeper"),/5 Aggravated Health/);assert.match(text("profane-hieros-gamos"),/does not remove the Nosferatu Bane/);
console.log("Seven Core formulae: method rules and quality tables, source/clan/level gating, free quota, XP modes, extraction damage and all 319 earlier entries preserved.");
