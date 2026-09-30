import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
function load(file,dependencies) {
  const compiled=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const loaded={exports:{}};
  new Function("module","exports","require",compiled)(loaded,loaded.exports,name=>dependencies[name]);
  return loaded.exports;
}
const supplement=load("../app/supplemental-powers.ts",{});
const rules=load("../app/game-rules.ts",{"./supplemental-powers":supplement});
assert.equal(rules.DEFAULT_CHRONICLE_RULES.exemptStainPenaltyOnFrenzy,false);
let user=null,writes=0,owner="narrator",stored;
const client={from:()=>{
 let updating=false;
 const query={select:()=>query,eq:()=>query,update:value=>{updating=true;stored=value;writes++;return query},
 maybeSingle:async()=>({data:updating?{id:"chronicle",owner_id:owner,...stored}:{id:"chronicle",owner_id:owner}})};
 return query;
}};
const {PATCH}=load("../app/api/chronicles/[id]/route.ts",{
 "../../../chatgpt-auth":{getChatGPTUser:async()=>user},
 "../../../../lib/supabase/server":{createClient:async()=>client},
 "../../../game-rules":rules,
});
const request=value=>new Request("http://localhost/api/chronicles/chronicle",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Crônica",rules:value})});
const context={params:Promise.resolve({id:"chronicle"})};
assert.equal((await PATCH(request({exemptStainPenaltyOnFrenzy:true}),context)).status,401);
user={userId:"player"};
assert.equal((await PATCH(request({exemptStainPenaltyOnFrenzy:true}),context)).status,403);
assert.equal(writes,0);
user={userId:owner};
assert.equal((await PATCH(request({exemptStainPenaltyOnFrenzy:true}),context)).status,200);
assert.equal(stored.rules.exemptStainPenaltyOnFrenzy,true);
await PATCH(request({}),context);
assert.equal(stored.rules.exemptStainPenaltyOnFrenzy,false,"Crônica antiga usa o padrão");
const {toCharacter}=load("../app/api/characters/serialize.ts",{"../../game-rules":rules});
const authorityClient={from:table=>{
 const result={data:table==="chronicles"?{name:"Crônica",owner_id:owner,rules:{exemptStainPenaltyOnFrenzy:false},xp_cost_mode:"new_level"}:[]};
 const query={select:()=>query,eq:()=>query,single:async()=>result,order:async()=>result};return query;
}};
const character=await toCharacter(authorityClient,{id:1,user_id:"player",chronicle_id:"chronicle",creation_xp:15,data:{chronicleRules:{exemptStainPenaltyOnFrenzy:true}}});
assert.equal(character.data.chronicleRules.exemptStainPenaltyOnFrenzy,false,"A ficha recebe a configuração do mestre, não a enviada pelo jogador");
console.log("Crônica: padrão, autorização do mestre e aplicação das regras na ficha conferidos.");
