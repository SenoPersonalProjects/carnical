import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const catalog=load("app/content/catalog.json").entries,{PREDATOR_RULES}=load("app/game-rules.ts"),{resolveContent,contentName}=load("app/content/resolve.ts");
const previous=JSON.parse(execFileSync("git",["show","c5e4bc6:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const old of previous)assert.deepEqual(catalog.find(entry=>entry.id===old.id),old,old.id);
const rules=PREDATOR_RULES.filter(rule=>rule.source.book==="core-v5");assert.equal(rules.length,10);
for(const rule of rules){
 const entry=resolveContent(rule.name,{kind:"predator",book:"core-v5"});assert.ok(entry,rule.name);assert.equal(entry.id,rule.id);
 assert.equal(resolveContent(entry.names.en,{kind:"predator",book:"core-v5"}).id,entry.id);
 assert.equal(contentName(rule.name,"en",{kind:"predator",book:"core-v5"}),entry.names.en);
 const version=catalog.find(item=>item.id===entry.id).versions.find(v=>v.book==="core-v5");
 for(const locale of ["pt-BR","en"]){const sections=version.descriptions[locale];assert.ok(sections.length>=3);assert.ok(sections[0].text.length>160);assert.match(sections[1].text,/\n- /);assert.ok(sections.at(-1).text.length>250);}
 for(const page of version.pages){assert.equal(page.printedPage,page.pdfPage-2);assert.ok(fs.existsSync(`public/source-pages/core-v5/${String(page.pdfPage).padStart(4,"0")}.webp`));}
}
const text=(id,locale="pt-BR")=>catalog.find(entry=>entry.id===id).versions[0].descriptions[locale].map(section=>section.text).join("\n");
assert.match(text("fazendeiro"),/Fazendeiro 2/);assert.match(text("fazendeiro"),/Potência de Sangue 3 ou superior/);
assert.match(text("sacoleiro"),/Esôfago de Ferro 3/);assert.match(text("sacoleiro"),/Inimigo 2/);
assert.match(text("sanguessuga"),/Segredo Sombrio 2.*ou Segregado 2/);assert.match(text("sanguessuga"),/Exclusão de Presa 2/);
assert.match(text("osiris"),/exatamente 3 pontos/);assert.match(text("osiris"),/exatamente 2 pontos/);
assert.match(text("sereia"),/Belo 2/);assert.match(text("vira-lata"),/Contatos criminosos 3/);
console.log("Ten Core Predators: both-language lookup, complete packages, precise original pages and all 326 previous entries preserved.");
