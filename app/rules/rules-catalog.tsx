"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronRight, LoaderCircle, LogOut, Search, X } from "lucide-react";
import { usePreferredLocale } from "../preferences";

type ChapterMeta = { id: string; title: string; section: string };
type Book = { id: string; title: string; subtitle: string; language: string; chapters: ChapterMeta[] };
type Result = {
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  section: string;
  language: string;
  sourceQuery: string;
  count: number;
  snippet: string;
};

const fold = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export default function RulesCatalog({ books, initialQuery, displayName, signOutPath }: { books: Book[]; initialQuery: string; displayName: string; signOutPath: string }) {
  const locale = usePreferredLocale();
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState<{ key: string; results: Result[]; total: number; error?: string } | null>(null);
  const normalized = query.trim();
  const key = `${locale}:${fold(normalized)}`;
  const searching = normalized.length >= 2 && search?.key !== key;
  const relatedBooks = useMemo(() => normalized ? books.filter(book => fold(book.title).includes(fold(normalized))) : [], [books, normalized]);
  const chapters = books.reduce((total, book) => total + book.chapters.length, 0);

  useEffect(() => {
    if (normalized.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const translation = fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texts: [normalized], source: locale === "en" ? "en" : "pt", target: locale === "en" ? "pt" : "en" }),
        signal: controller.signal,
      }).then(async response => response.ok ? ((await response.json()) as { translations: string[] }).translations[0] || "" : "").catch(() => "");
      const fetchResults = async (translated: string) => {
        const params = new URLSearchParams({ scope: "all", q: normalized });
        if (translated) params.set(locale === "en" ? "q_pt" : "q_en", translated);
        const response = await fetch(`/api/rules?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Não foi possível pesquisar o acervo.");
        const data = await response.json() as { results: Result[]; total: number };
        setSearch({ key, ...data });
      };
      try {
        await fetchResults("");
        const translated = await translation;
        if (translated && !controller.signal.aborted) await fetchResults(translated);
      } catch (error) {
        if (!controller.signal.aborted) setSearch({ key, results: [], total: 0, error: error instanceof Error ? error.message : "Erro na busca." });
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [key, locale, normalized]);

  return <main className="library-shell catalog-shell">
    <header className="library-topbar">
      <div className="library-brand"><span className="library-sigil">C</span><div><strong>CARNIÇAL</strong><small>BIBLIOTECA DA NOITE</small></div></div>
      <Link className="back-to-sheet" href="/"><ArrowLeft size={16}/>Voltar à ficha</Link>
      <div className="library-user"><span>{displayName}</span><a href={signOutPath} target="_top" title="Sair"><LogOut size={17}/></a></div>
    </header>
    <div className="catalog-content">
      <div className="catalog-intro"><span className="catalog-eyebrow">ACERVO V5 · ÍNDICE GERAL</span><h1>Encontre o que a noite esconde.</h1><p>Explore os livros ou pesquise uma regra, clã, poder ou tema em todos os capítulos.</p></div>
      <div className="catalog-search-wrap">
        <label className="catalog-search"><Search size={22}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você procura?" aria-label="Pesquisar em todos os livros" maxLength={100} autoComplete="off"/>{normalized && <button type="button" onClick={() => { setQuery(""); setSearch(null); }} aria-label="Limpar pesquisa"><X size={20}/></button>}</label>
        <p>{books.length} livros · {chapters} capítulos · busca em todo o acervo</p>
      </div>

      {normalized.length < 2 ? <section className="catalog-section" aria-labelledby="catalog-books-heading"><div className="catalog-section-head"><div><span>01 / ACERVO</span><h2 id="catalog-books-heading">Escolha um livro</h2></div><p>Abra um volume para ver seus capítulos e pesquisar dentro dele.</p></div><div className="catalog-grid">{books.map((book, index) => <BookCard key={book.id} book={book} index={index}/>)}</div></section> : <>
        {relatedBooks.length > 0 && <section className="catalog-section" aria-labelledby="catalog-related-heading"><div className="catalog-section-head"><div><span>LIVROS</span><h2 id="catalog-related-heading">Volumes encontrados</h2></div></div><div className="catalog-grid">{relatedBooks.map(book => <BookCard key={book.id} book={book} index={books.indexOf(book)}/>)}</div></section>}
        <section className="catalog-section catalog-results" aria-labelledby="catalog-results-heading"><div className="catalog-section-head"><div><span>BUSCA NO ACERVO</span><h2 id="catalog-results-heading">Capítulos encontrados</h2></div>{!searching && search?.key === key && !search.error && <p>{search.total} {search.total === 1 ? "capítulo" : "capítulos"}{search.total > search.results.length ? ` · mostrando ${search.results.length}` : ""}</p>}</div>
          {searching && <p className="catalog-feedback" role="status"><LoaderCircle className="catalog-spinner" size={18}/> Pesquisando nos livros…</p>}
          {!searching && search?.key === key && search.error && <p className="catalog-feedback" role="alert">{search.error}</p>}
          {!searching && search?.key === key && !search.error && search.results.length === 0 && <p className="catalog-feedback" role="status">Nenhum capítulo contém “{normalized}”. Experimente outro termo ou abra um livro pelo catálogo.</p>}
          {!searching && search?.key === key && search.results.length > 0 && <div className="catalog-result-list" aria-live="polite">{search.results.map(result => <Link className="catalog-result" key={`${result.bookId}:${result.chapterId}`} href={`/rules?book=${encodeURIComponent(result.bookId)}&chapter=${encodeURIComponent(result.chapterId)}&q=${encodeURIComponent(result.sourceQuery)}`}><span className="catalog-result-book">{result.bookTitle} · {result.language}</span><strong>{result.chapterTitle}</strong><span className="catalog-result-snippet">{result.snippet}</span><small>{result.count} {result.count === 1 ? "ocorrência" : "ocorrências"}<ArrowUpRight size={15}/></small></Link>)}</div>}
        </section>
        <button type="button" className="catalog-show-all" onClick={() => { setQuery(""); setSearch(null); }}>Ver todos os livros <ChevronRight size={16}/></button>
      </>}
    </div>
  </main>;
}

function BookCard({ book, index }: { book: Book; index: number }) {
  return <Link className="catalog-book" href={`/rules?book=${encodeURIComponent(book.id)}`}>
    <span className="catalog-book-number">{String(index + 1).padStart(2, "0")}</span>
    <span className="catalog-book-icon"><BookOpen size={28} strokeWidth={1.3}/></span>
    <span className="catalog-book-copy"><strong>{book.title}</strong><small>{book.chapters.length} capítulos · {book.language}</small></span>
    <ArrowUpRight className="catalog-book-arrow" size={20}/>
  </Link>;
}
