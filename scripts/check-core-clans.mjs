import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript"),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const out={exports:{}};cache.set(file,out);if(file.endsWith(".json")){out.exports=JSON.parse(fs.readFileSync(file,"utf8"));return out.exports}const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function("module","exports","require",source)(out,out.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),/\.(json|ts)$/.test(name)?name:name+".ts")):require(name));return out.exports}
const catalog=load("app/content/catalog.json").entries,{resolveContent}=load("app/content/resolve.ts"),{clanSource}=load("app/content/clan-source.ts");
const previous=JSON.parse(execFileSync("git",["show","f51ad8d:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const old of previous)assert.deepEqual(catalog.find(entry=>entry.id===old.id),old,old.id);
const clans=catalog.filter(entry=>entry.kind==="clan"&&entry.versions.some(v=>v.book==="core-v5"));assert.equal(clans.length,7);
for(const clan of clans){const version=clan.versions.find(v=>v.book==="core-v5");for(const locale of ["pt-BR","en"]){assert.equal(resolveContent(clan.names[locale],{kind:"clan",book:"core-v5"}).id,clan.id);const sections=version.descriptions[locale];assert.equal(sections.length,4);assert.ok(sections[1].text.length>180);assert.ok(sections[2].text.length>180)}for(const page of version.pages){assert.equal(page.printedPage,page.pdfPage-2);assert.ok(fs.existsSync(`public/source-pages/core-v5/${String(page.pdfPage).padStart(4,"0")}.webp`))}assert.equal(clanSource(clan.names["pt-BR"],"core_v5_ptbr",new Set(["core_v5_ptbr"])),"core_v5_ptbr")}
const text=id=>catalog.find(e=>e.id==="clan-"+id).versions[0].descriptions["pt-BR"].map(s=>s.text).join("\n");
assert.match(text("brujah"),/menos de 1 dado/);assert.match(text("gangrel"),/mais uma noite/);assert.match(text("gangrel"),/Curt ir|Curtir a Onda/);assert.match(text("malkavian"),/se soma/);assert.match(text("nosferatu"),/Repulsivo \(−2\)/);assert.match(text("toreador"),/acionar Disciplinas/);assert.match(text("tremere"),/segunda repetição/);assert.match(text("tremere"),/adicional de ingestões/);assert.match(text("ventrue"),/Dificuldade 4/);assert.match(text("ventrue"),/não seja obtida por meios sobrenaturais/);
console.log("Seven Core clans: PT/EN identity, full Bane/Compulsion conditions, source selection and all 336 previous entries preserved.");
