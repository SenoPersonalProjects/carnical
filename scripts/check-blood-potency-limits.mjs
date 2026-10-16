import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const loaded={exports:{}};
new Function('module','exports',ts.transpileModule(fs.readFileSync('app/blood-potency-limits.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(loaded,loaded.exports);
const {bloodPotencyRange:range,canIncreaseBloodPotency:buy}=loaded.exports;
const rows=[[4,5,10],[5,4,9],[6,3,8],[7,3,7],[8,2,6],[9,2,5],[10,1,4],[11,1,4],[12,1,3],[13,1,3],[14,0,0],[15,0,0],[16,0,0]];
for(const [gen,min,max] of rows){
 for(const value of [String(gen),`${gen}ª`,`${gen}th`]){
  assert.deepEqual(range(value),{min,max});
  assert.equal(buy(max,value),false);
  assert.equal(buy(min-1,value),false);
  if(max>min)assert.equal(buy(max-1,value),true);
 }
}
assert.equal(buy(5,'4ª'),true);
assert.equal(buy(3,'13ª'),false);
assert.equal(buy(0,'13ª','Sangue-Ralo'),false);
for(const value of ['',undefined,'3ª','17ª','13 ou 14','13abc','13.5'])assert.equal(range(value),undefined);
assert.equal(buy(2.5,'13ª'),false);
assert.equal(buy(NaN,'13ª'),false);
console.log('Generation limits: all 13 generations, ordinal labels, ceiling, minimum, unknown generation, Thin-blood and invalid ratings passed.');
