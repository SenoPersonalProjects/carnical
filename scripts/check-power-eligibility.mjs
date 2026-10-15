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
  new Function("module","exports","require",source)(loaded,loaded.exports,name=>name.startsWith(".")?load(path.resolve(path.dirname(file),name.endsWith(".json")?name:name+".ts")):require(name));
  return loaded.exports;
}
const {powerEligibility,creationMagicEligibility}=load("app/content/power-eligibility.ts");
const {sourcebookForLibraryId}=load("app/creation-sources.ts");
const book="players-guide-v5",sources=new Set([sourcebookForLibraryId(book)]);
const power={id:"fixture",name:"Fixture",discipline:"Auspícios",level:2,amalgam:"Fortitude 1",prerequisite:"Sentidos Aguçados",source:{book}};
const disciplines={Auspícios:2,Fortitude:1},known={Auspícios:["Sentidos Aguçados"]};
const snapshot=JSON.stringify({disciplines,known,power});
assert.equal(powerEligibility(power,disciplines,known,sources).allowed,true);
assert.equal(powerEligibility(power,disciplines,known,new Set()).allowed,false);
assert.equal(powerEligibility(power,{...disciplines,Auspícios:1},known,sources).allowed,false);
assert.equal(powerEligibility(power,{...disciplines,Fortitude:0},known,sources).allowed,false);
assert.equal(powerEligibility(power,disciplines,{},sources).allowed,false);
assert.equal(powerEligibility({...power,prerequisite:"Outro poder"},disciplines,{Presença:["Outro poder"]},sources).allowed,true);
assert.equal(JSON.stringify({disciplines,known,power}),snapshot);
const ritual={...power,id:"ritual",kind:"ritual",discipline:"Feitiçaria de Sangue",level:1,amalgam:undefined,prerequisite:undefined};
const magicDisciplines={...disciplines,"Feitiçaria de Sangue":1};
assert.equal(creationMagicEligibility(ritual,magicDisciplines,known,sources,[]).allowed,true);
assert.equal(creationMagicEligibility({...ritual,level:2},magicDisciplines,known,sources,[]).allowed,false);
assert.equal(creationMagicEligibility(ritual,magicDisciplines,known,sources,[{...ritual,id:"other"}]).allowed,false);
assert.equal(creationMagicEligibility(ritual,magicDisciplines,known,sources,[ritual]).allowed,true);
assert.equal(creationMagicEligibility(ritual,magicDisciplines,known,new Set(),[]).allowed,false);
assert.equal(creationMagicEligibility({...ritual,kind:"ceremony",prerequisite:"Missing"},magicDisciplines,known,sources,[]).allowed,false);
const formula={...ritual,kind:"formula"};
assert.equal(creationMagicEligibility(formula,magicDisciplines,known,sources,[]).allowed,true);
assert.equal(creationMagicEligibility(formula,magicDisciplines,known,sources,[{...formula,id:"other"}]).allowed,false);
console.log("Source, level, amalgam, prerequisite and data preservation checks passed.");
