import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

const require=createRequire(import.meta.url),cache=new Map();
function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith(".json"))return JSON.parse(fs.readFileSync(file,"utf8"));
  const loaded={exports:{}};cache.set(file,loaded);
  const compiled=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function("module","exports","require",compiled)(loaded,loaded.exports,name=>{
    if(!name.startsWith("."))return require(name);
    const base=path.resolve(path.dirname(file),name);
    return load([base,base+".ts",base+".tsx"].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile()));
  });return loaded.exports;
}
const {characterSnapshot,pdfFilename}=load("app/export/character-snapshot.ts");
const {CharacterPdfDocument,createCharacterPdf}=load("app/export/character-pdf.tsx");
const catalog=JSON.parse(fs.readFileSync("app/content/catalog.json","utf8"));
const output=process.argv[2]||"D:/DEV/2026/carnical-content-work/pdf-checks";fs.mkdirSync(output,{recursive:true});
const base={name:"João da Noite",concept:"Investigador",clan:"Tremere",data:{attributes:{Força:2,Destreza:2,Vigor:3,Carisma:2,Manipulação:3,Autocontrole:3,Inteligência:4,Raciocínio:2,Determinação:3},skills:{Investigação:3,Erudição:4,Ocultismo:3,Tecnologia:2},disciplines:{Auspícios:2},disciplinePowers:{Auspícios:["Sentidos Aguçados","Premonição"]},specialties:[{skill:"Erudição",name:"História do Brasil",source:"Criação"}],merits:[{name:"Biblioteca pessoal",dots:2,source:"Personalizado",notes:"Livros antigos com anotações do senhor."}],flawItems:[{name:"Inimigo",dots:2,source:"Criação",notes:"Um rival mortal."}],convictions:"Nunca ferir inocentes.",touchstones:"Marília — irmã mortal",humanity:7,stains:4,hunger:3,healthSuperficial:2,healthAggravated:1,willpowerSuperficial:1,willpowerAggravated:2,bloodPotency:2,chronicle:"Ventos de Fortaleza",generation:"12ª",xpTotal:"15",xpSpent:"3",xpPurchases:[],bloodSession:{night:3,turn:8,lastMendTurn:8,lastAggravatedNight:2,aggravatedNights:[2],torpor:false},notes:"Alteração ainda não salva: ação amanhã às 22h.",rollHistory:[{label:"DO NOT EXPORT ROLL HISTORY"}]}};
assert.equal(pdfFilename("João / ?",new Date("2026-10-01T01:00:00Z")),"Carnical-Joao-2026-09-30.pdf");
const snapshot=characterSnapshot(base);base.data.notes="Changed after snapshot";assert.equal(snapshot.prose.notes,"Alteração ainda não salva: ação amanhã às 22h.");assert.ok(!("rollHistory" in snapshot));
for(const locale of ["pt-BR","en"]){
 for(const large of [false,true]){
  const value=structuredClone(snapshot);if(large){value.concept="Investigador dedicado aos mistérios de Fortaleza. ".repeat(200)+"FIM DO CONCEITO EXTENSO";value.prose.history=Array.from({length:120},(_,i)=>`Capítulo ${i+1}. A personagem percorreu as ruas de Fortaleza. Guardou suas convicções e voltou para casa depois do amanhecer. Nenhuma informação deve ser cortada ao passar de página.`).join("\n\n")}
  const rules=[...catalog.entries.map(entry=>({id:entry.id,name:entry.names[locale],source:entry.versions[0].sourceTitle,sections:entry.versions[0].descriptions[locale]})),{id:"custom",name:locale==="en"?"Custom documented rule":"Regra personalizada documentada",source:"Informação existente na ficha",sections:[{title:locale==="en"?"System":"Sistema",text:"Dados: Inteligência + Investigação. Resistência: Autocontrole. Custo: 1. A informação é selecionável."}]}];
  const buffer=await renderToBuffer(React.createElement(CharacterPdfDocument,{snapshot:value,locale,rules}));assert.equal(buffer.subarray(0,5).toString(),"%PDF-");
  fs.writeFileSync(path.join(output,`${locale}-${large?"large":"small"}.pdf`),buffer);
 }
}
const fetchOriginal=globalThis.fetch;
try{
 const value=structuredClone(base);value.data.disciplinePowers={Oblívio:["O Chamado do Viajante"]};value.data.disciplines={Oblívio:1};let requests=0;
 globalThis.fetch=async url=>{requests++;const params=new URL(url,"http://fixture.local").searchParams,entry=catalog.entries.find(entry=>entry.id===params.get("id"));assert.ok(entry);const locale=params.get("lang");return Response.json({id:entry.id,name:entry.names[locale],source:entry.versions[0].sourceTitle,sections:entry.versions[0].descriptions[locale]})};
 const blob=await createCharacterPdf(characterSnapshot(value),"en");assert.equal(Buffer.from(await blob.arrayBuffer()).subarray(0,5).toString(),"%PDF-");assert.equal(requests,1);
 const versioned=structuredClone(value);versioned.clan="Personalizado";versioned.data.customClan="Ravnos";versioned.data.disciplinePowers={};
 const item=catalog.entries.find(entry=>entry.id==="coterie-merit-call-to-purpose"),version=item.versions.find(version=>version.book==="companion-v5");
 versioned.data.merits=[{name:item.names["pt-BR"],dots:version.level,source:"companion_v5",notes:"Escolha preservada",catalogId:item.id,versionId:version.id}];
 const requested=[];
 globalThis.fetch=async url=>{const params=new URL(url,"http://fixture.local").searchParams;requested.push(Object.fromEntries(params));assert.equal(params.get("id"),item.id);assert.equal(params.get("version"),version.id);assert.equal(params.get("book"),version.book);return Response.json({id:item.id,name:item.names.en,source:version.sourceTitle,sections:version.descriptions.en})};
 await createCharacterPdf(characterSnapshot(versioned),"en");assert.equal(requested.length,1);assert.equal(versioned.data.merits[0].name,item.names["pt-BR"]);
 globalThis.fetch=async()=>new Response("Unavailable",{status:503});await assert.rejects(()=>createCharacterPdf(characterSnapshot(value),"en"),/Missing item rules/);
 globalThis.fetch=async()=>new Response("Not reviewed",{status:404});
 const legacy=structuredClone(value);legacy.data.disciplinePowers={"Auspícios":["Sentidos Aguçados"]};
 const legacyBlob=await createCharacterPdf(characterSnapshot(legacy),"pt-BR");
 fs.writeFileSync(path.join(output,"legacy-reference.pdf"),Buffer.from(await legacyBlob.arrayBuffer()));
}finally{globalThis.fetch=fetchOriginal}
fs.writeFileSync(path.join(output,"expectations.json"),JSON.stringify({name:snapshot.name,notes:snapshot.prose.notes,largeLast:"Capítulo 120.",excluded:"DO NOT EXPORT ROLL HISTORY"}));
console.log("4 PDFs created; snapshot, filename and history exclusion assertions passed.");
