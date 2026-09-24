import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [coreRoot, chicagoRoot] = process.argv.slice(2);
if (!coreRoot || !chicagoRoot) {
  throw new Error("Usage: node scripts/generate-rule-library.mjs <core-root> <chicago-root>");
}

const titleFrom = (content, fallback) => content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;
const slugFrom = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const readChapter = (file, section) => {
  const content = readFileSync(file, "utf8").trim();
  const title = titleFrom(content, path.basename(file, ".md").replace(/^\d+_/, "").replaceAll("_", " "));
  return { id: slugFrom(`${section}-${title}`), title, section, content };
};

const core = [];
for (const section of ["docs", "lore"]) {
  const folder = path.join(coreRoot, section);
  for (const name of readdirSync(folder).filter((name) => name.endsWith(".md")).sort()) {
    core.push(readChapter(path.join(folder, name), section === "docs" ? "Regras e criação" : "Lore"));
  }
}

const chicago = [];
const contentRoot = path.join(chicagoRoot, "content");
for (const folder of readdirSync(contentRoot).sort()) {
  const dir = path.join(contentRoot, folder);
  for (const name of readdirSync(dir).filter((name) => name.endsWith(".md")).sort()) {
    chicago.push(readChapter(path.join(dir, name), folder === "00_front_matter" ? "Material inicial" : "Capítulos"));
  }
}

const data = {
  books: [
    {
      id: "core-v5",
      title: "Livro Básico V5",
      subtitle: "Regras e lore fornecidos para o criador",
      language: "Português",
      chapters: core,
    },
    {
      id: "chicago-by-night-v5",
      title: "Chicago by Night V5",
      subtitle: "Suplemento completo organizado por capítulos",
      language: "Inglês",
      chapters: chicago,
    },
  ],
};

writeFileSync(path.resolve("app/rules/rules-data.json"), JSON.stringify(data));
