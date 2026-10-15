import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const {POWER_CATALOG}=load("app/game-rules.ts"),{powersForSources,powerEligibility}=load("app/content/power-eligibility.ts"),{sourcebookForLibraryId}=load("app/creation-sources.ts");
const catalog=load("app/content/catalog.json").entries,sources=new Set([sourcebookForLibraryId("core-v5")]),powers=powersForSources(POWER_CATALOG,sources);
const previous=JSON.parse(execFileSync("git",["show","baa6fdb:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const old of previous)assert.deepEqual(catalog.find(e=>e.id===old.id),old,old.id);
const added=catalog.filter(e=>e.kind==="power"&&["Ofuscação","Potência","Presença","Proteanismo"].includes(e.discipline)&&!previous.some(old=>old.id===e.id));assert.equal(added.length,33);
for(const [discipline,count] of [["Ofuscação",8],["Potência",9],["Presença",9],["Proteanismo",7]])assert.equal(added.filter(e=>e.discipline===discipline).length,count);
assert.ok(!catalog.some(e=>e.id==="conceal"),"Conceal translation is awaiting clarification");
for(const entry of added){
 const power=powers.find(p=>p.id===entry.id);assert.ok(power,entry.id);assert.equal(power.level,entry.level);
 for(const locale of ["pt-BR","en"]){const sections=entry.versions[0].descriptions[locale];for(const title of locale==="en"?["Description","Requirements","Cost","System","Duration"]:["Descrição","Requisitos","Custo","Sistema","Duração"])assert.ok(sections.some(s=>s.title===title),`${entry.id} ${title}`);}
 for(const p of entry.versions[0].pages)assert.equal(p.printedPage,p.pdfPage-2);
}
const find=id=>powers.find(p=>p.id===id),all={"Ofuscação":5,"Auspícios":5,"Potência":5,"Presença":5,"Dominação":5,"Proteanismo":5};
for(const [id,discipline,name,english] of [["vanish","Ofuscação","Manto de Sombras","Cloak of Shadows"],["impostors-guise","Ofuscação","Máscara de Mil Faces","Mask of a Thousand Faces"],["metamorphosis","Proteanismo","Mudança de Forma","Shapechange"]]){
 assert.equal(powerEligibility(find(id),all,{},sources).allowed,false,id);
 for(const required of [name,english])assert.equal(powerEligibility(find(id),all,{[discipline]:[required]},sources).allowed,true,`${id} ${required}`);
}
for(const [id,discipline] of [["spark-rage","Presença"],["irresistible-voice","Dominação"]])assert.equal(powerEligibility(find(id),{...all,[discipline]:0},{},sources).allowed,false);
assert.equal(powerEligibility(find("vanish"),all,{"Oblívio":["Manto de Sombras"]},sources).allowed,false,"Shadow Cloak is not Cloak of Shadows");
const text=id=>catalog.find(e=>e.id===id).versions[0].descriptions.en.map(s=>s.text).join("\n");
assert.match(text("feral-weapons"),/not halved/);assert.match(text("unfettered-heart"),/cannot attempt at Hunger 5/);assert.match(text("earthshock"),/Only usable once per scene/);assert.match(text("lingering-kiss"),/Unbondable Merit cannot acquire/);
console.log("33 Core descriptions: all earlier 249 entries preserved; prerequisite aliases, Amalgams, exact source pages and exceptional limits passed. Conceal remains unpublished pending clarification.");
