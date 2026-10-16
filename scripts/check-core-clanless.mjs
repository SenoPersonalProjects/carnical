import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const catalog=JSON.parse(fs.readFileSync("app/content/catalog.json","utf8")).entries;
const old=JSON.parse(execFileSync("git",["show","e2e9dbe:app/content/catalog.json"],{encoding:"utf8",maxBuffer:20e6})).entries;
for(const entry of old){const current=catalog.find(item=>item.id===entry.id);assert.deepEqual({...current,versions:current.versions.filter(version=>entry.versions.some(previous=>previous.id===version.id))},entry,entry.id);}
for(const id of ["clan-caitiff","clan-thin-blood"]){const entry=catalog.find(item=>item.id===id);assert.ok(entry);assert.equal(entry.kind,"clan");const version=entry.versions[0];for(const locale of ["pt-BR","en"])assert.ok(version.descriptions[locale].length>=4);for(const page of version.pages){assert.equal(page.printedPage,page.pdfPage-2);assert.ok(fs.existsSync(`public/source-pages/core-v5/${String(page.pdfPage).padStart(4,"0")}.webp`))}}
const text=id=>catalog.find(e=>e.id===id).versions[0].descriptions["pt-BR"].map(s=>s.text).join("\n");
assert.match(text("clan-caitiff"),/três Disciplinas/);assert.match(text("clan-caitiff"),/nível × 6 XP/);assert.match(text("clan-caitiff"),/Suspeito 1/);assert.match(text("clan-caitiff"),/não pode adquirir Status/);
assert.match(text("clan-thin-blood"),/sempre 0/);assert.match(text("clan-thin-blood"),/não entra em Frenesi naturalmente/);assert.match(text("clan-thin-blood"),/Fome chegar a 5 ou até a próxima alimentação/);assert.match(text("clan-thin-blood"),/1 dano Superficial por turno/);assert.match(text("clan-thin-blood"),/armas cortantes e perfurantes/i);
console.log("Caitiff/Thin-blood general rule references, source pages and all 343 prior entries preserved; guided creation automation remains separate.");
