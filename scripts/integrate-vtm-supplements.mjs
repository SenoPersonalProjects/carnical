import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Usage: node scripts/integrate-vtm-supplements.mjs <VTM_V5_Base_MD directory>");

const libraryPath = path.resolve("app/rules/rules-data.json");
const library = JSON.parse(readFileSync(libraryPath, "utf8"));
const manifest = JSON.parse(readFileSync(path.join(root, "manifest.json"), "utf8"));
const bookIds = {
  "01_Camarilla": "camarilla-v5",
  "02_Anarch": "anarch-v5",
  "03_Cultos_dos_Deuses_de_Sangue": "cultos-deuses-sangue-v5",
  "04_Companion": "companion-v5",
  "05_Sabbat_The_Black_Hand": "sabbat-black-hand-v5",
  "06_Players_Guide": "players-guide-v5",
  "07_Gehenna_War": "gehenna-war-v5",
  "08_Sigilos_de_Sangue": "sigilos-de-sangue-v5",
};
const slug = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const pageBody = (bookDir, number) => readFileSync(path.join(root, bookDir, "01_paginas", `pagina_${String(number).padStart(4, "0")}.md`), "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
const pageRange = (bookDir, start, end) => Array.from({ length: end - start + 1 }, (_, index) => pageBody(bookDir, start + index)).join("\n\n");

for (const item of manifest) {
  const bookId = bookIds[item.dir];
  if (!bookId) throw new Error(`Unexpected source: ${item.dir}`);
  const folder = path.join(root, item.dir, "02_categorias");
  const chapters = readdirSync(folder).filter(name => name.endsWith(".md")).sort().map(name => {
    const source = readFileSync(path.join(folder, name), "utf8");
    const title = source.match(/^title:\s*"([^"]+)"/m)?.[1];
    if (!title) throw new Error(`Missing title: ${name}`);
    return { id: slug(`${bookId}-${title}`), title, section: "Capítulos", content: source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim() };
  });
  if (chapters.length !== item.categories) throw new Error(`Chapter count mismatch: ${item.dir}`);

  // The extracted category boundaries put the end of Alchemy and most new
  // Predator types under the wrong headings. Split the original pages here.
  if (item.dir === "06_Players_Guide") {
    const page108 = pageBody(item.dir, 108);
    const page111 = pageBody(item.dir, 111);
    const predatorStart = page108.indexOf("Predator Types");
    const backgroundsStart = page111.indexOf("\nBackgrounds");
    if (predatorStart < 0 || backgroundsStart < 0) throw new Error("Player's Guide page boundary changed");
    chapters[4].content = `${chapters[4].content}\n\n${pageRange(item.dir, 106, 107)}\n\n${page108.slice(0, predatorStart).trim()}`;
    chapters[5].content = `# Predator Types\n\n${page108.slice(predatorStart).trim()}\n\n${pageRange(item.dir, 109, 110)}\n\n${page111.slice(0, backgroundsStart).trim()}`;
    chapters[6].content = `# Backgrounds\n\n${page111.slice(backgroundsStart).trim()}\n\n${pageRange(item.dir, 112, 117)}`;
  }

  const book = { id: bookId, title: item.book, subtitle: `Suplemento V5 · ${item.pages} páginas no pacote de origem`, language: item.lang.startsWith("en") ? "Inglês" : "Português", chapters };
  const existing = library.books.findIndex(value => value.id === bookId);
  if (existing >= 0) library.books[existing] = book;
  else library.books.push(book);
}

const ids = library.books.flatMap(book => book.chapters.map(chapter => `${book.id}:${chapter.id}`));
if (new Set(ids).size !== ids.length) throw new Error("Duplicate chapter IDs");
writeFileSync(libraryPath, JSON.stringify(library));
console.log(`${library.books.length} books, ${ids.length} chapters`);
