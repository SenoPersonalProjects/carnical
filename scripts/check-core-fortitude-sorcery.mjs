import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const catalog=load("app/content/catalog.json").entries,{POWER_CATALOG}=load("app/game-rules.ts"),{powersForSources,powerEligibility}=load("app/content/power-eligibility.ts"),{sourcebookForLibraryId}=load("app/creation-sources.ts"),{bloodBenefits}=load("app/play/blood.ts");
const sources=new Set([sourcebookForLibraryId("core-v5")]),powers=powersForSources(POWER_CATALOG,sources);
const previous=JSON.parse(execFileSync("git",["show","bbda08b:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const old of previous)assert.deepEqual(catalog.find(e=>e.id===old.id),old,old.id);
const added=catalog.filter(e=>e.kind==="power"&&["Fortitude","Feitiçaria de Sangue"].includes(e.discipline)&&!previous.some(old=>old.id===e.id));assert.equal(added.length,16);
for(const discipline of ["Fortitude","Feitiçaria de Sangue"])assert.equal(added.filter(e=>e.discipline===discipline).length,8);
assert.ok(!catalog.some(e=>e.id==="fortify-inner-facade"));
for(const entry of added){
 const power=powers.find(p=>p.id===entry.id);assert.ok(power,entry.id);assert.equal(power.level,entry.level);
 for(const locale of ["pt-BR","en"]){const sections=entry.versions[0].descriptions[locale];for(const title of locale==="en"?["Description","Requirements","Cost","System","Duration"]:["Descrição","Requisitos","Custo","Sistema","Duração"])assert.ok(sections.some(s=>s.title===title),`${entry.id} ${title}`);}
 for(const p of entry.versions[0].pages)assert.equal(p.printedPage,p.pdfPage-2);
}
const text=id=>catalog.find(e=>e.id===id).versions[0].descriptions.en.map(s=>s.text).join("\n");
assert.match(text("toughness"),/before halving/);assert.match(text("toughness"),/below 1/);
assert.match(text("defy-bane"),/not per attack/);assert.match(text("defy-bane"),/cannot be mended/);
assert.match(text("flesh-marble"),/not sunlight/);assert.match(text("flesh-marble"),/critical win/);
assert.equal(bloodBenefits(3).surge+6,9);assert.match(text("prowess-pain"),/cap of 9/);
assert.match(text("cauldron-blood"),/one or more Stains/);assert.match(text("cauldron-blood"),/up to Hunger 5/);
assert.match(text("baals-caress"),/next time they sleep/);assert.match(text("scorpions-touch"),/unhalved Superficial/);
const beasts=powers.find(p=>p.id==="enduring-beasts");assert.equal(powerEligibility(beasts,{Fortitude:2,Animalismo:0},{},sources).allowed,false);assert.equal(powerEligibility(beasts,{Fortitude:2,Animalismo:1},{},sources).allowed,true);
console.log("16 Core powers: bilingual descriptions, source pagination, Fortitude Amalgam, corrected Surge example, poison restrictions, damage exceptions and 282 earlier entries preserved.");
