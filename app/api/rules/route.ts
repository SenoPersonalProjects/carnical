import { NextRequest, NextResponse } from "next/server";
import library from "../../rules/rules-data.json";

type Chapter = { id: string; title: string; section: string; content: string };
type Book = { id: string; title: string; subtitle: string; language: string; chapters: Chapter[] };

const books = library.books as Book[];
const fold = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
const searchable = books.map(book => ({
  book,
  chapters: book.chapters.map(chapter => ({
    chapter,
    text: `${chapter.title}\n${chapter.content}`,
    folded: fold(`${chapter.title}\n${chapter.content}`),
    foldedTitle: fold(chapter.title),
  })),
}));

function chapterMatch(text: string, folded: string, query: string) {
  let count = 0;
  let at = 0;
  while ((at = folded.indexOf(query, at)) >= 0) {
    count++;
    at += query.length;
  }
  if (!count) return null;
  const first = folded.indexOf(query);
  const start = Math.max(0, first - 90);
  const end = Math.min(text.length, first + query.length + 130);
  return {
    count,
    snippet: `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ")}${end < text.length ? "…" : ""}`,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() || "";
  const englishQuery = searchParams.get("q_en")?.trim() || "";
  const portugueseQuery = searchParams.get("q_pt")?.trim() || "";

  if (searchParams.get("scope") === "all") {
    if (query.length < 2 || query.length > 100 || englishQuery.length > 100 || portugueseQuery.length > 100) {
      return NextResponse.json({ error: "Use uma busca entre 2 e 100 caracteres." }, { status: 400 });
    }
    const original = fold(query);
    const english = fold(englishQuery);
    const portuguese = fold(portugueseQuery);
    const results = searchable.flatMap(({ book, chapters }) => chapters.flatMap(({ chapter, text, folded, foldedTitle }) => {
      const alternate = book.language === "Inglês" ? english : portuguese;
      const originalMatch = chapterMatch(text, folded, original);
      const alternateMatch = alternate && alternate !== original ? chapterMatch(text, folded, alternate) : null;
      const useAlternate = Boolean(alternateMatch && (!originalMatch || (foldedTitle.includes(alternate) && !foldedTitle.includes(original))));
      const match = useAlternate ? alternateMatch : originalMatch;
      if (!match) return [];
      const sourceQuery = useAlternate ? (book.language === "Inglês" ? englishQuery : portugueseQuery) : query;
      const term = useAlternate ? alternate : original;
      return [{
        bookId: book.id,
        bookTitle: book.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        section: chapter.section,
        language: book.language,
        sourceQuery,
        titleMatch: foldedTitle.includes(term),
        headingMatch: folded.split("\n").some(line => line.trimStart().startsWith(term) && line.trim().length < 120),
        density: match.count / Math.sqrt(folded.length),
        ...match,
      }];
    })).sort((a, b) => Number(b.titleMatch) - Number(a.titleMatch) || Number(b.headingMatch) - Number(a.headingMatch) || b.density - a.density || a.bookTitle.localeCompare(b.bookTitle, "pt-BR"));
    return NextResponse.json({ results: results.slice(0, 60), total: results.length });
  }

  const bookId = searchParams.get("book") || books[0]?.id;
  const chapterId = searchParams.get("chapter");
  const selected = searchable.find(item => item.book.id === bookId);
  if (!selected) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 });
  if (query) {
    const normalized = fold(query);
    const results = selected.chapters.flatMap(({ chapter, text, folded }) => {
      const match = chapterMatch(text, folded, normalized);
      return match ? [{ chapterId: chapter.id, ...match }] : [];
    });
    return NextResponse.json({ results });
  }
  const chapter = selected.book.chapters.find(item => item.id === chapterId) ?? selected.book.chapters[0];
  if (!chapter) return NextResponse.json({ error: "Capítulo não encontrado." }, { status: 404 });
  return NextResponse.json({ chapter });
}
