import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
function load(file, dependencies = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const loaded = {exports:{}};
  new Function("module","exports","require",compiled)(loaded,loaded.exports,name=>dependencies[name]);
  return loaded.exports;
}
const dice = load("../app/play/dice.ts");
const {bloodBenefits,bloodSession,mendSuperficial,eligibleAggravated,recoverAggravated,advanceNight} = load("../app/play/blood.ts",{"./dice":dice});
const table=[[1,1],[2,1],[2,2],[3,2],[3,3],[4,3],[4,3],[5,3],[5,4],[6,4],[6,5]];
for(let potency=0;potency<=10;potency++) {
  assert.deepEqual(bloodBenefits(potency),{surge:table[potency][0],mend:table[potency][1]});
  const result=mendSuperficial(bloodSession(),5,2,potency,1);
  assert.equal(result.damage,5-table[potency][1]);
  assert.equal(result.hunger,3,"A falha aumenta a Fome, mas não impede a cura");
  assert.equal(mendSuperficial(result.session,1,3,potency,10),null,"Uma vez por turno");
  assert.ok(mendSuperficial({...result.session,turn:1},1,3,potency,10));
}
assert.equal(mendSuperficial(bloodSession(),0,0,1,10),null);
assert.equal(mendSuperficial(bloodSession(),2,5,1,10),null,"Fome 5 impede uso voluntário");
assert.equal(mendSuperficial(bloodSession({torpor:true}),2,1,1,10),null);
const damaged=bloodSession({aggravatedNights:[0,1],night:0});
assert.equal(eligibleAggravated(damaged),false,"Dano recebido nesta noite não cura");
const next=advanceNight(damaged,2,1);
assert.equal(next.hunger,3);
assert.equal(eligibleAggravated(next.session),true);
const healed=recoverAggravated(next.session,next.hunger,[10,10,10]);
assert.equal(healed.healed,true);
assert.deepEqual(healed.session.aggravatedNights,[1]);
assert.equal(healed.checks.length,3,"Cada dado é um teste independente");
assert.equal(recoverAggravated(healed.session,3,[10,10,10]),null,"Uma vez por noite");
assert.equal(eligibleAggravated({...healed.session,lastAggravatedNight:null}),false,"O dano mais recente continua aguardando a próxima noite");
const torpor=recoverAggravated(bloodSession({night:1,aggravatedNights:[0]}),4,[1,1,10]);
assert.equal(torpor.healed,false);
assert.equal(torpor.checks.length,2,"Interrompe quando cai em Torpor");
assert.equal(torpor.session.torpor,true);
assert.deepEqual(torpor.session.aggravatedNights,[0]);
assert.equal(advanceNight(bloodSession(),5,1).session.torpor,true);
assert.equal(advanceNight(bloodSession(),5,10).session.torpor,false);
assert.equal(advanceNight(bloodSession({torpor:true}),5,10),null);
const roundTrip=bloodSession(JSON.parse(JSON.stringify(healed.session)));
assert.equal(eligibleAggravated(roundTrip),false,"Limite persiste ao recarregar");
assert.equal(dice.resolveRouseCheck(5,1,"mandatory").torpor,true);
console.log("Sangue V5: 11 níveis de Potência, recuperação, limites por turno/noite e Torpor conferidos.");
