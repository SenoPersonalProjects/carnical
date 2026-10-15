import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url), cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
  const output = { exports: {} }; cache.set(file, output);
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("module", "exports", "require", source)(output, output.exports, name => name.startsWith(".") ? load(path.resolve(path.dirname(file), /\.(ts|json)$/.test(name) ? name : `${name}.ts`)) : require(name));
  return output.exports;
}
const { healthCapacity } = load("app/derived-traits.ts");
const { characterSnapshot } = load("app/export/character-snapshot.ts");
assert.equal(healthCapacity({}), 4);
assert.equal(healthCapacity({ attributes: { Vigor: 3 }, disciplines: { Fortitude: 4 } }), 6);
for (const name of ["Resiliência", "Resilience", " RESILIENCIA "]) {
  const data = { attributes: { Vigor: 3 }, disciplines: { Fortitude: 4 }, disciplinePowers: { Fortitude: [name] }, healthAggravated: 2 };
  const before = structuredClone(data);
  assert.equal(healthCapacity(data), 10);
  const snapshot = characterSnapshot({ name: "Resilience", concept: "", clan: "Gangrel", data });
  assert.equal(snapshot.healthMax, 10);
  assert.equal(snapshot.healthAggravated, 2);
  assert.deepEqual(data, before);
  assert.equal(healthCapacity({ ...data, disciplines: { Fortitude: 0 } }), 6);
}
assert.equal(healthCapacity({ disciplines: { Fortitude: 4 }, disciplinePowers: { Potência: ["Resiliência"] } }), 4);
console.log("Health capacity: permanent Resilience bonus, both languages, missing power, changed Fortitude and damage preservation passed.");
