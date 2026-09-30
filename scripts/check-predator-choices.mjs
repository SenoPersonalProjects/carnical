import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
function load(file){
  const compiled=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const loaded={exports:{}};
  new Function("module","exports","require",compiled)(loaded,loaded.exports,name=>load(path.resolve(path.dirname(file),`${name}.ts`)));
  return loaded.exports;
}
const {PREDATOR_CHOICES,readPackageChoices,resolutionComplete}=load("app/predator-choices.ts");
const {syncPredatorBenefits,ownItemDots}=load("app/predator-benefits.ts");
const {PREDATOR_RULES,rulesUrl}=load("app/game-rules.ts");
const {sourcebookForLibraryId}=load("app/creation-sources.ts");
const roadside=PREDATOR_RULES.find(rule=>rule.id==="roadside-killer");
assert.equal(roadside.name,"Assassino de Estrada");
assert.deepEqual(roadside.disciplineChoices,["Fortitude","Proteanismo"]);
assert.deepEqual(roadside.specialtyChoices,["Sobrevivência","Investigação"]);
assert.equal(roadside.humanity,0);assert.equal(roadside.bloodPotency,0);
const library=JSON.parse(fs.readFileSync("app/rules/rules-data.json","utf8"));
assert.ok(library.books.find(book=>book.id===roadside.source.book)?.chapters.some(chapter=>chapter.id===roadside.source.chapter));
assert.equal(sourcebookForLibraryId(roadside.source.book),"let_the_streets_run_red_v5");assert.ok(rulesUrl(roadside.source).includes("let-the-streets-run-red-v5"));
const herd=syncPredatorBenefits([],roadside.id,"merit"),exclusion=syncPredatorBenefits([],roadside.id,"flaw");
assert.equal(herd[0].dots,2);assert.equal(exclusion[0].dots,1);
assert.equal(ownItemDots(herd),0,"Rebanho adicional não consome os pontos de criação");
assert.deepEqual(syncPredatorBenefits(herd,roadside.id,"merit"),herd);
const choices={"fame-herd":JSON.stringify({Fama:2,Rebanho:1}),"osiris-flaws":JSON.stringify([{name:"Tabu Folclórico",dots:1},{name:"Estigma",dots:1}])};
assert.equal(resolutionComplete("osiris","fame-herd","Fama 2 e Rebanho 1"),false,"Texto antigo precisa de confirmação guiada");
assert.equal(readPackageChoices(PREDATOR_CHOICES.osiris["fame-herd"],JSON.stringify({Fama:3,Rebanho:1})),null);
assert.equal(readPackageChoices(PREDATOR_CHOICES.osiris["osiris-flaws"],JSON.stringify([{name:"Estigma",dots:2}])),null,"Custo fixo");
assert.equal(readPackageChoices(PREDATOR_CHOICES.osiris["osiris-flaws"],JSON.stringify([{name:"Inimigo",dots:1},{name:"Inimigo",dots:1}])),null,"Sem duplicatas");
let merits=syncPredatorBenefits([{name:"Recursos",dots:4,source:"core_v5_ptbr",notes:"Meu negócio"}],"osiris","merit",choices);
assert.equal(ownItemDots(merits),7,"Osíris direciona pontos de criação");
assert.deepEqual(merits.filter(item=>item.source==="predator-required:osiris").map(item=>[item.name,item.dots]),[["Fama",2],["Rebanho",1]]);
assert.deepEqual(syncPredatorBenefits(merits,"osiris","merit",choices),merits,"Reaplicar não duplica");
merits=syncPredatorBenefits(merits,"osiris","merit",{"fame-herd":JSON.stringify({Fama:1,Rebanho:2})});
assert.equal(ownItemDots(merits),7);assert.equal(merits.find(item=>item.name==="Fama").dots,1);
const flaws=syncPredatorBenefits([],"osiris","flaw",choices);assert.equal(ownItemDots(flaws),2);
assert.deepEqual(syncPredatorBenefits(merits,"osiris","merit",{"fame-herd":""}),merits,"Preserva última distribuição confirmada durante edição incompleta");
for(const [predator,definitions] of Object.entries(PREDATOR_CHOICES))for(const [id,spec] of Object.entries(definitions)){
 const value=spec.type==="select"?spec.options[0].name:spec.type==="allocation"?JSON.stringify({[spec.options[0].name]:spec.points}):JSON.stringify([{name:"Inimigo",dots:2}]);
 assert.ok(resolutionComplete(predator,id,value),`${predator}/${id}`);
}
const {readAnchors}=load("app/anchors.ts");
assert.deepEqual(readAnchors("Ana\nBia","Proteger\n"),[{touchstone:"Ana",conviction:"Proteger"},{touchstone:"Bia",conviction:""}],"Linhas incompletas não deslocam pares");
console.log("Predadores: limites, custos fixos, sincronização sem duplicatas e vínculos antigos conferidos.");
