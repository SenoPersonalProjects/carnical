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
const {clanSource}=load("app/content/clan-source.ts");
const {xpCost}=load("app/experience.ts");
const {contentById,resolveContent}=load("app/content/resolve.ts");
for(const power of POWER_CATALOG.filter(power=>power.source.book==="players-guide-v5")){
 const entry=contentById(power.id)||resolveContent(power.name,{kind:power.kind||"power",discipline:power.discipline});
 assert.ok(entry?.versions.some(version=>version.book==="players-guide-v5"),`Guide option without reviewed description: ${power.name}`);
}
const guideCeremonies=catalog.filter(entry=>entry.kind==="ceremony"&&entry.versions.some(version=>version.book==="players-guide-v5"));
const guideRituals=catalog.filter(entry=>entry.kind==="ritual"&&entry.versions.some(version=>version.book==="players-guide-v5"));
const guideFormulae=catalog.filter(entry=>entry.kind==="formula"&&entry.versions.some(version=>version.book==="players-guide-v5"));
assert.equal(guideFormulae.length,10,"All ten Guide formulae must have bilingual descriptions");
for(const name of ["Flowering Amaranth","Moment of Clarity"]){
  const entry=guideFormulae.find(entry=>entry.names.en===name);
  assert.ok(entry,`${name} missing from reviewed catalog`);
  const power=POWER_CATALOG.find(power=>power.id===entry.id);
  assert.ok(power,`${name} missing from selectable catalog`);
  assert.equal(power.level,5);
  const formulaSources=new Set([sourcebookForLibraryId("players-guide-v5")]);
  assert.equal(powerEligibility(power,{"Alquimia do Sangue-Fraco":4},{},formulaSources,"Sangue-Ralo").allowed,false);
  assert.equal(powerEligibility(power,{"Alquimia do Sangue-Fraco":5},{},formulaSources,"Sangue-Ralo").allowed,true);
  assert.equal(xpCost("formula",5,"new_level"),15);
  assert.equal(xpCost("formula",5,"current_level"),15);
}
const mandagloire=guideFormulae.find(entry=>entry.names.en==="Mandagloire");
assert.match(mandagloire.versions[0].descriptions["pt-BR"].at(-1).text,/três turnos.*restante da cena/s);
const guideSourcesForPrereqs=new Set([sourcebookForLibraryId("players-guide-v5")]);
const messenger=POWER_CATALOG.find(power=>power.id==="messengers-command");
const messengerDisciplines={Animalismo:3,"Auspícios":1,"Dominação":2};
for(const option of ["Compelir","Compel","Mesmerismo","Mesmerize"]){
  const known={Animalismo:["Mensageiro Animal"],"Dominação":[option]};
  assert.equal(powerEligibility(messenger,messengerDisciplines,known,guideSourcesForPrereqs).allowed,true);
}
assert.equal(powerEligibility(messenger,messengerDisciplines,{Animalismo:["Animal Messenger"]},guideSourcesForPrereqs).allowed,false);
assert.equal(powerEligibility(messenger,messengerDisciplines,{"Dominação":["Compelir"]},guideSourcesForPrereqs).allowed,false);
for(const [id,required] of [["weaving","Reflexos Rápidos"],["players-guide-v5-power-celeridade-unseen-strike","Piscar"],["players-guide-v5-power-domina-o-ancestral-dominion","Mesmerismo"]]){
  const power=POWER_CATALOG.find(power=>power.id===id);
  const disciplines={Celeridade:5,"Ofuscação":4,"Dominação":4,"Feitiçaria de Sangue":2};
  assert.equal(powerEligibility(power,disciplines,{},guideSourcesForPrereqs).allowed,false);
  assert.equal(powerEligibility(power,disciplines,{Known:[required]},guideSourcesForPrereqs).allowed,true);
}
assert.equal(guideCeremonies.length,9);assert.equal(guideRituals.length,12);
for(const entry of guideCeremonies){
 const version=entry.versions.find(version=>version.book==="players-guide-v5"),required=version.requirements.prerequisites[0];
 const prerequisite=catalog.find(item=>item.kind==="power"&&item.names.en===required);assert.ok(prerequisite);
 const power=POWER_CATALOG.find(power=>power.id===entry.id);assert.ok(power);
 const known={"Oblívio":[prerequisite.names["pt-BR"]]},enabled=new Set(["players_guide_v5"]);
 assert.equal(powerEligibility(power,{"Oblívio":5},known,enabled).allowed,true);
 assert.equal(powerEligibility(power,{"Oblívio":5},known,enabled,"Sangue-Ralo").allowed,false);
 assert.equal(powerEligibility(power,{"Oblívio":5},{},enabled).allowed,false);
 assert.equal(powerEligibility(power,{"Oblívio":5},known,new Set()).allowed,false);
 assert.equal(creationMagicEligibility(power,{"Oblívio":5},known,enabled,[]).allowed,entry.level===1);
 assert.equal(xpCost("ceremony",entry.level,"new_level"),entry.level*3);
 assert.equal(xpCost("ceremony",entry.level,"current_level"),entry.level*3);
 for(const locale of ["pt-BR","en"]){assert.ok(version.descriptions[locale].some(section=>/Ingredients|Ingredientes/.test(section.title)));assert.ok(version.descriptions[locale].some(section=>/Process|Processo/.test(section.title)))}
}
for(const [name,title,health] of [["The Gift of False Life","Mindless Corpse",4],["Awaken the Homuncular Servant","Homuncular Servant",3],["Shambling Hordes","Aggressive Corpse",6]]){
 const entry=guideCeremonies.find(entry=>entry.names.en===name),profile=entry.versions[0].descriptions.en.find(section=>section.title===title);assert.ok(profile);assert.match(profile.text,new RegExp(`Health ${health}`));assert.match(profile.text,/immune to sunlight/);
}
const dominion=POWER_CATALOG.find(power=>power.name==="Dominion");assert.ok(dominion);assert.equal(dominion.level,5);
assert.equal(powerEligibility(dominion,{"Feitiçaria de Sangue":4},{},new Set(["players_guide_v5"])).allowed,false);
assert.equal(powerEligibility(dominion,{"Feitiçaria de Sangue":5},{},new Set(["players_guide_v5"])).allowed,true);
assert.equal(creationMagicEligibility(dominion,{"Feitiçaria de Sangue":5},{},new Set(["players_guide_v5"]),[]).allowed,false);
assert.equal(xpCost("ritual",dominion.level,"current_level"),15);
assert.equal(clanSource("Lasombra","chicago_by_night_v5",new Set(["players_guide_v5"])),"players_guide_v5");
assert.equal(clanSource("Lasombra","chicago_by_night_v5",new Set(["players_guide_v5","chicago_by_night_v5"]),"players_guide_v5"),"players_guide_v5");
assert.equal(clanSource("Lasombra","chicago_by_night_v5",new Set(["core_v5_ptbr"])),"chicago_by_night_v5");
const editionText=(id,book,locale)=>catalog.find(entry=>entry.id===id).versions.find(version=>version.book===book).descriptions[locale].map(section=>section.text).join("\n");
const guideOblivion=catalog.filter(entry=>entry.kind==="power"&&entry.discipline==="Oblívio"&&entry.versions.some(version=>version.book==="players-guide-v5"));
assert.equal(guideOblivion.length,18);
const veil=guideOblivion.find(entry=>entry.names.en==="Where the Veil Thins"),aura=guideOblivion.find(entry=>entry.names.en==="Aura of Decay"),feast=guideOblivion.find(entry=>entry.names.en==="Passion Feast");
for(const locale of ["pt-BR","en"]){
 const table=veil.versions[0].descriptions[locale].find(section=>section.text.includes("| --- |"));assert.equal(table.text.split("\n").length,7);
 assert.doesNotMatch(aura.versions[0].descriptions[locale].map(section=>section.text).join(" "),/Impenetrable|Impenetrável/);
}
assert.match(aura.versions[0].descriptions.en.find(section=>section.title==="System").text,/against the vampire’s activation roll/);
assert.equal(feast.versions[0].requirements.disciplines.Fortitude,2);
assert.match(editionText("arms-of-ahriman","chicago-by-night-v5","en"),/three health levels/);
assert.doesNotMatch(editionText("arms-of-ahriman","players-guide-v5","en"),/three health levels|Resolve \+ Composure/);
assert.match(editionText("arms-of-ahriman","players-guide-v5","en"),/Difficulty 3/);
assert.match(editionText("oblivions-sight","players-guide-v5","en"),/two-dice penalty to social/);
assert.doesNotMatch(editionText("oblivions-sight","chicago-by-night-v5","en"),/penalty to social/);
assert.match(editionText("shadow-cast","players-guide-v5","en"),/after halving/);
assert.match(editionText("shadow-cloak","chicago-by-night-v5","en"),/add one to the Difficulty/);
assert.match(editionText("shadow-cloak","players-guide-v5","en"),/one-die penalty/);
assert.doesNotMatch(editionText("clan-lasombra","chicago-by-night-v5","en").split("Chicago does not")[0],/or the scene ends/);
assert.match(editionText("clan-lasombra","players-guide-v5","en"),/or the scene ends/);
for(const power of POWER_CATALOG.filter(power=>power.source.book==="chicago-by-night-v5")){
 const selected=powerForSources(power,new Set(["players_guide_v5"]));assert.equal(selected.source.book,"players-guide-v5");
 assert.equal(powerEligibility(selected,{"Oblívio":5,"Potência":2},{},new Set(["players_guide_v5"])).allowed,true);
}
assert.equal(new Set(catalog.map(entry=>entry.id)).size,catalog.length,"Unique catalog identifiers");
assert.deepEqual(index.map(entry=>entry.id).sort(),catalog.map(entry=>entry.id).sort());
for(const entry of catalog){
  for(const version of entry.versions){
    assert.match(version.pdfSha256,/^[a-f0-9]{64}$/);
    for(const locale of ["pt-BR","en"]){
      assert.ok(entry.names[locale].trim());assert.ok(version.descriptions[locale].length);
      for(const section of version.descriptions[locale]){assert.ok(section.title.trim());assert.ok(section.text.trim());assert.doesNotMatch(section.text,/\uFFFD|Consultar regra|pending.review/i);assert.doesNotMatch(section.text,/\bTODO\b|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/);}
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
const {itemEligibility}=load("app/content/item-eligibility.ts");
const {sameContent,contentName}=load("app/content/resolve.ts");
const {powersForSources,knowsPower}=load("app/content/power-eligibility.ts");
const allSources=new Set([...active,...companionOnly,...guideOnly]);
const allPowers=powersForSources(POWER_CATALOG,allSources),soothing=allPowers.filter(power=>sameContent(power.name,"Panacea",{kind:"power"}));
assert.equal(soothing.length,1);assert.equal(contentName("Obeah","en",{book:"players-guide-v5"}),"Panacea");
assert.equal(knowsPower({"Auspícios":["Obeah"]},"Panacea"),true);
assert.equal(knowsPower({"Proteanismo":["Earth Meld"]},"Fusão com a Terra"),true);
const merit=catalog.find(entry=>entry.id==="coterie-merit-call-to-purpose"),meritVersion=merit.versions.find(version=>version.book==="companion-v5");
assert.equal(itemEligibility(meritVersion,{phase:"creation",clan:"Banu Haqim",activeSources:companionOnly}).allowed,true);
assert.equal(itemEligibility(meritVersion,{phase:"creation",clan:"Tremere",activeSources:companionOnly}).allowed,false);
assert.equal(itemEligibility(meritVersion,{phase:"xp",clan:"Banu Haqim",activeSources:companionOnly}).allowed,false);
assert.equal(itemEligibility(meritVersion,{phase:"creation",clan:"Banu Haqim",activeSources:new Set()}).allowed,false);
const ghoulVersion=catalog.find(entry=>entry.id==="companion-advantage-blood-empathy").versions[0];
assert.equal(itemEligibility(ghoulVersion,{phase:"creation",clan:"",activeSources:guideOnly}).allowed,false);
assert.equal(itemEligibility(ghoulVersion,{phase:"creation",clan:"",characterType:"ghoul",activeSources:guideOnly}).allowed,true);
const persistedMerit={name:merit.names["pt-BR"],dots:2,source:"companion_v5",catalogId:merit.id,versionId:meritVersion.id};
assert.equal(auditCharacter({clan:"Banu Haqim",data:{activeSourcebooks:[...companionOnly],merits:[persistedMerit]}}).some(issue=>issue.id===`catalog-requirement-${merit.id}`),false);
assert.equal(auditCharacter({clan:"Tremere",data:{activeSourcebooks:[...companionOnly],merits:[persistedMerit]}}).some(issue=>issue.id===`catalog-requirement-${merit.id}`),true);
const auditData={activeSourcebooks:[...active],disciplines:{"Feitiçaria de Sangue":1},disciplinePowers:{"Feitiçaria de Sangue":[coreRituals[0].name]}};
assert.equal(auditCharacter({data:auditData}).some(issue=>issue.id===`magic-xp-${coreRituals[0].id}`),false);
const tooMany={...auditData,disciplinePowers:{"Feitiçaria de Sangue":coreRituals.slice(0,2).map(power=>power.name)}};
assert.equal(auditCharacter({data:tooMany}).some(issue=>issue.id===`magic-xp-${coreRituals[1].id}`),true);
const paid={...tooMany,xpPurchases:[{kind:"ritual",name:coreRituals[1].name,from:0,to:1,cost:3}]};
assert.equal(auditCharacter({data:paid}).some(issue=>issue.id.startsWith("magic-xp-")),false);
assert.equal(auditCharacter({data:{activeSourcebooks:[...companionOnly],disciplines:{Fortitude:2,"Auspícios":1},disciplinePowers:{Fortitude:["Valeren"]}}}).some(issue=>issue.id==="power-level-valeren"),false);
console.log(`${catalog.length} reviewed entries: bilingual text, source images, pagination, free rituals and source-specific Valeren levels verified.`);
