import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function loadTypescript(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  new Function("module", "exports", compiled)(loaded, loaded.exports);
  return loaded.exports;
}

const { SUPPLEMENTAL_POWERS } = loadTypescript("app/supplemental-powers.ts");
const { syncPredatorBenefits, ownItemDots, grantedItemDots } = loadTypescript("app/predator-benefits.ts");
const { startingXp, xpCost, purchasedLevels } = loadTypescript("app/experience.ts");
const library = JSON.parse(fs.readFileSync(path.join(root, "app/rules/rules-data.json"), "utf8"));

const ids = new Set();
for (const power of SUPPLEMENTAL_POWERS) {
  assert(!ids.has(power.id), `ID repetido: ${power.id}`);
  ids.add(power.id);
  assert(power.level >= 1 && power.level <= 5, `Nível inválido: ${power.name}`);
  const book = library.books.find(item => item.id === power.source.book);
  assert(book, `Livro ausente: ${power.source.book}`);
  assert(book.chapters.some(item => item.id === power.source.chapter), `Capítulo ausente: ${power.name}`);
}
for (const book of ["companion-v5", "players-guide-v5", "cultos-deuses-sangue-v5", "gehenna-war-v5", "sigilos-de-sangue-v5", "sabbat-black-hand-v5"]) {
  assert(SUPPLEMENTAL_POWERS.some(item => item.source.book === book), `Sem opções: ${book}`);
}
assert(SUPPLEMENTAL_POWERS.some(item => item.kind === "formula" && item.source.book === "sigilos-de-sangue-v5"));

let merits = syncPredatorBenefits([], "vira-lata", "merit");
assert.equal(merits[0].dots, 3);
assert.equal(ownItemDots(merits), 0);
assert.equal(grantedItemDots(merits), 3);
merits[0].name = "Contato criminal da cidade";
assert.equal(syncPredatorBenefits(merits, "vira-lata", "merit").length, 1, "Renomear benefício não deve duplicá-lo");
assert.equal(syncPredatorBenefits(merits, "sereia", "merit").length, 1, "Trocar Predador deve substituir o pacote");
const osiris = syncPredatorBenefits([], "osiris", "merit");
assert.equal(ownItemDots(osiris), 3, "Osíris exige gastar pontos da distribuição inicial");

assert.equal(startingXp("Neófito"), 15);
assert.equal(xpCost("skill", 3), 9);
assert.equal(xpCost("clan-discipline", 2), 10);
assert.equal(xpCost("formula", 2), 6);
assert.equal(xpCost("attribute", 1, "current_level"), 5);
assert.equal(xpCost("attribute", 4, "current_level"), 15);
assert.equal(xpCost("skill", 3, "current_level"), 6);
assert.equal(xpCost("ritual", 4, "current_level"), 12);
assert.equal(xpCost("formula", 4, "current_level"), 12);
assert.equal(xpCost("specialty", 1, "current_level"), 3);
assert.equal(purchasedLevels({ Investigação: 4 }, [{ kind: "skill", name: "Investigação", from: 3, to: 4, cost: 12 }], "skill").Investigação, 3);
console.log(`Integração conferida: ${SUPPLEMENTAL_POWERS.length} opções, fontes e cálculos principais.`);
