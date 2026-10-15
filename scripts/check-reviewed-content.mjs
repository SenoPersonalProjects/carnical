import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  const loaded={exports:{}};cache.set(file,loaded);
  if(file.endsWith(".json")){loaded.exports=JSON.parse(fs.readFileSync(file,"utf8"));return loaded.exports;}
  const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  new Function("module","exports","require",source)(loaded,loaded.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));
  return loaded.exports;
}
const {POWER_CATALOG}=load("app/game-rules.ts"),{creationMagicEligibility,powerForSources,powerEligibility}=load("app/content/power-eligibility.ts"),{sourcebookForLibraryId}=load("app/creation-sources.ts");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const catalog=read("app/content/catalog.json").entries,index=read("app/content/catalog-index.json").entries,pages=read("app/content/source-pages.json").books;
assert.equal(new Set(catalog.map(entry=>entry.id)).size,catalog.length,"Unique catalog identifiers");
assert.deepEqual(index.map(entry=>entry.id).sort(),catalog.map(entry=>entry.id).sort());
for(const entry of catalog){
  for(const version of entry.versions){
    assert.match(version.pdfSha256,/^[a-f0-9]{64}$/);
    for(const locale of ["pt-BR","en"]){
      assert.ok(entry.names[locale].trim());assert.ok(version.descriptions[locale].length);
      for(const section of version.descriptions[locale]){assert.ok(section.title.trim());assert.ok(section.text.trim());assert.doesNotMatch(section.text,/\uFFFD|Consultar regra|\bTODO\b|pending.review/i);}
    }
    for(const ref of version.pages){
      const mapped=pages.find(book=>book.id===version.book)?.pages.find(page=>page.pdfPage===ref.pdfPage);
      assert.ok(mapped,`${entry.id}: source page ${ref.pdfPage} is accessible`);
      assert.equal(mapped.printedPage,ref.printedPage);
      assert.ok(fs.existsSync(path.join("public",mapped.image)));
    }
  }
}
const coreRituals=POWER_CATALOG.filter(power=>power.kind==="ritual"&&power.source.book==="core-v5");
assert.ok(coreRituals.length>=4);
const active=new Set([sourcebookForLibraryId("core-v5")]);
for(const ritual of coreRituals){
  assert.ok(catalog.some(entry=>entry.id===ritual.id));
  assert.equal(creationMagicEligibility(ritual,{"Feitiçaria de Sangue":1},{},active,[]).allowed,true);
  assert.equal(creationMagicEligibility(ritual,{"Feitiçaria de Sangue":0},{},active,[]).allowed,false);
  assert.equal(creationMagicEligibility(ritual,{"Feitiçaria de Sangue":1},{},new Set(),[]).allowed,false);
  const other=coreRituals.find(power=>power.id!==ritual.id);
  assert.equal(creationMagicEligibility(ritual,{"Feitiçaria de Sangue":1},{},active,[other]).allowed,false);
}
const valeren=POWER_CATALOG.find(power=>power.id==="valeren"),original=JSON.stringify(valeren);
const companionOnly=new Set([sourcebookForLibraryId("companion-v5")]),guideOnly=new Set([sourcebookForLibraryId("players-guide-v5")]);
const companionValeren=powerForSources(valeren,companionOnly),guideValeren=powerForSources(valeren,guideOnly);
assert.equal(companionValeren.level,2);assert.equal(companionValeren.source.book,"companion-v5");
assert.equal(guideValeren.level,3);assert.equal(guideValeren.source.book,"players-guide-v5");
assert.equal(powerForSources(valeren,new Set([...companionOnly,...guideOnly])).level,3);
assert.equal(powerEligibility(companionValeren,{Fortitude:2,"Auspícios":1},{},companionOnly).allowed,true);
assert.equal(powerEligibility(guideValeren,{Fortitude:2,"Auspícios":1},{},guideOnly).allowed,false);
assert.equal(JSON.stringify(valeren),original);
const {auditCharacter}=load("app/character-audit.ts");
const auditData={activeSourcebooks:[...active],disciplines:{"Feitiçaria de Sangue":1},disciplinePowers:{"Feitiçaria de Sangue":[coreRituals[0].name]}};
assert.equal(auditCharacter({data:auditData}).some(issue=>issue.id===`magic-xp-${coreRituals[0].id}`),false);
const tooMany={...auditData,disciplinePowers:{"Feitiçaria de Sangue":coreRituals.slice(0,2).map(power=>power.name)}};
assert.equal(auditCharacter({data:tooMany}).some(issue=>issue.id===`magic-xp-${coreRituals[1].id}`),true);
const paid={...tooMany,xpPurchases:[{kind:"ritual",name:coreRituals[1].name,from:0,to:1,cost:3}]};
assert.equal(auditCharacter({data:paid}).some(issue=>issue.id.startsWith("magic-xp-")),false);
assert.equal(auditCharacter({data:{activeSourcebooks:[...companionOnly],disciplines:{Fortitude:2,"Auspícios":1},disciplinePowers:{Fortitude:["Valeren"]}}}).some(issue=>issue.id==="power-level-valeren"),false);
console.log(`${catalog.length} reviewed entries: bilingual text, source images, pagination, free rituals and source-specific Valeren levels verified.`);
