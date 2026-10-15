import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const catalog=load("app/content/catalog.json").entries;
const {POWER_CATALOG}=load("app/game-rules.ts"),{sourcebookForLibraryId}=load("app/creation-sources.ts");
const {powerEligibility,powersForSources,creationMagicEligibility}=load("app/content/power-eligibility.ts");
const {xpCost}=load("app/experience.ts"),{auditCharacter}=load("app/character-audit.ts");
const books=["sabbat-black-hand-v5","gehenna-war-v5","sigilos-de-sangue-v5"],sources=new Set(books.map(sourcebookForLibraryId));
const powers=powersForSources(POWER_CATALOG,sources),find=name=>{const value=powers.find(power=>power.name===name);assert.ok(value,name);return value};
for(const [book,counts] of [[books[0],{power:8,ritual:4,ceremony:3,formula:2}],[books[1],{power:10,ritual:5,ceremony:1,formula:3}],[books[2],{power:4,ritual:24,formula:20}]]){
 const entries=catalog.filter(entry=>entry.versions.some(version=>version.book===book));assert.equal(entries.length,Object.values(counts).reduce((a,b)=>a+b,0));
 for(const [kind,count] of Object.entries(counts))assert.equal(entries.filter(entry=>entry.kind===kind).length,count);
 for(const power of powers.filter(power=>power.source.book===book)){const entry=catalog.find(entry=>entry.id===power.id);assert.ok(entry,power.name);assert.equal(entry.kind,power.kind);for(const locale of ["pt-BR","en"])assert.ok(entry.versions[0].descriptions[locale].some(section=>/System|Sistema/.test(section.title)),power.name)}
}
for(const [name,level,cost] of [["Invasão",3,9],["Haruspex Viral",3,9],["Cavalgando nas Veias da Terra",4,12]]){assert.equal(find(name).level,level);assert.equal(xpCost("ritual",level,"new_level"),cost);assert.equal(xpCost("ritual",level,"current_level"),cost)}
for(const name of ["Whiff-Its","Juice Box","Beast Mode","Sigilo de Sangue","Horário de Check-out","Vitae MSG"])assert.ok(find(name));
const koldun=find("Feitiçaria Koldúnica: Água"),other=find("Feitiçaria Koldúnica: Fogo"),disciplines={"Feitiçaria de Sangue":5};
assert.equal(powerEligibility(koldun,disciplines,{},sources,"Tzimisce").allowed,true);
assert.equal(powerEligibility(koldun,disciplines,{},sources,"Tremere").allowed,false);
assert.equal(powerEligibility(koldun,disciplines,{"Feitiçaria de Sangue":["Um Gosto por Sangue"]},sources,"Tzimisce").allowed,false);
assert.equal(powerEligibility(other,disciplines,{"Feitiçaria de Sangue":["Koldunic Sorcery: Water","Um Gosto por Sangue"]},sources,"Tzimisce").allowed,true);
assert.equal(powerEligibility(other,disciplines,{"Feitiçaria de Sangue":["Um Gosto por Sangue","Koldunic Sorcery: Water"]},sources,"Tzimisce").allowed,false);
assert.equal(powerEligibility(koldun,disciplines,{},new Set(),"Tzimisce").allowed,false);
const ritual=find("Apreensão Elemental");assert.equal(powerEligibility(ritual,disciplines,{},sources,"Tzimisce").allowed,false);
assert.equal(powerEligibility(ritual,disciplines,{"Feitiçaria de Sangue":["Koldunic Sorcery: Water"]},sources,"Tzimisce").allowed,true);
const mask=find("Mask of Isolation");assert.equal(powerEligibility(mask,{"Ofuscação":3,"Dominação":1},{"Ofuscação":["Mask of a Thousand Faces"]},sources,"Tzimisce").allowed,true);
const harrow=find("Harrowhaunt");assert.equal(powerEligibility(harrow,{"Oblívio":3},{},sources).allowed,false);
assert.equal(powerEligibility(harrow,{"Oblívio":3},{"Oblívio":["Aura de Decadência"]},sources).allowed,true);
const shallow=find("The Shallow Slumber");for(const name of ["Banquete de Paixões","Toque de Oblívio"]){assert.equal(powerEligibility(shallow,{"Oblívio":3},{"Oblívio":[name]},sources).allowed,true)}
const sourceSnapshot=JSON.stringify({clan:"Tremere",data:{activeSourcebooks:[...sources],disciplines,disciplinePowers:{"Feitiçaria de Sangue":[koldun.name]},xpPurchases:[{kind:"ritual",name:"Invasão",cost:12}]}});
const oldCharacter=JSON.parse(sourceSnapshot);assert.ok(auditCharacter(oldCharacter).some(issue=>issue.id===`power-prerequisite-${koldun.id}`));assert.equal(JSON.stringify(oldCharacter),sourceSnapshot);
const formula=find("Beast Mode");assert.equal(creationMagicEligibility(formula,{"Alquimia do Sangue-Fraco":4},{},sources,[],"Sangue-Ralo").allowed,false);assert.equal(xpCost("formula",5,"current_level"),15);
const ambiguity=catalog.find(entry=>entry.id===find("Befoul Vessel").id).versions[0];assert.ok(ambiguity.descriptions.en.some(section=>section.title==="Source reference ambiguity"));assert.equal(powerEligibility(find("Befoul Vessel"),{"Oblívio":4},{"Oblívio":["Touch of Oblivion"]},sources).allowed,false);
console.log("84 reviewed options: full section counts, missing choices, corrected levels, Koldunic first power/clan, source filtering, OR prerequisites, XP and old sheet preservation passed.");
