"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookMarked, ChevronRight, FileText, LoaderCircle, LogOut, Menu, Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ChapterMeta = { id:string; title:string; section:string };
type Chapter = ChapterMeta & { content:string };
type Book = { id:string; title:string; subtitle:string; language:string; chapters:ChapterMeta[] };
type SearchResult = { chapterId:string; count:number; snippet:string };

export default function RulesReader({books,initialBookId,initialChapterId,initialQuery,displayName,signOutPath}:{books:Book[];initialBookId:string;initialChapterId:string;initialQuery:string;displayName:string;signOutPath:string}) {
  const [bookId,setBookId]=useState(initialBookId);
  const [chapterId,setChapterId]=useState(initialChapterId);
  const [chapter,setChapter]=useState<Chapter|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [searchState,setSearchState]=useState<{key:string;results:SearchResult[]}|null>(null);
  const [navOpen,setNavOpen]=useState(false);
  const [loadedKey,setLoadedKey]=useState("");
  const [error,setError]=useState<{key:string;message:string}|null>(null);
  const [retryKey,setRetryKey]=useState(0);
  const book=books.find(item=>item.id===bookId)??books[0];
  const targetKey=`${bookId}:${chapterId}`,activeError=error?.key===targetKey,loading=loadedKey!==targetKey&&!activeError;

  useEffect(()=>{
    const controller=new AbortController();
    fetch(`/api/rules?book=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(chapterId)}`,{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error();return await response.json() as {chapter:Chapter}})
      .then(result=>{setChapter(result.chapter);setLoadedKey(targetKey);setError(null)})
      .catch(reason=>{if(reason.name!=="AbortError")setError({key:targetKey,message:"Não foi possível carregar este capítulo."})});
    return()=>controller.abort();
  },[bookId,chapterId,retryKey,targetKey]);

  useEffect(()=>{
    const normalized=query.trim();
    if(!normalized)return;
    const searchKey=`${bookId}:${normalized.toLocaleLowerCase("pt-BR")}`;
    const controller=new AbortController(),timer=setTimeout(()=>{
      fetch(`/api/rules?book=${encodeURIComponent(bookId)}&q=${encodeURIComponent(normalized)}`,{signal:controller.signal})
        .then(async response=>{if(!response.ok)throw new Error();return await response.json() as {results:SearchResult[]}})
        .then(result=>setSearchState({key:searchKey,results:result.results}))
        .catch(reason=>{if(reason.name!=="AbortError")setSearchState({key:searchKey,results:[]})});
    },250);
    return()=>{clearTimeout(timer);controller.abort()};
  },[bookId,query]);

  const visibleChapters=useMemo(()=>{
    if(!query.trim())return book.chapters.map(chapter=>({chapter,count:0,snippet:""}));
    const key=`${bookId}:${query.trim().toLocaleLowerCase("pt-BR")}`;
    if(searchState?.key!==key)return[];
    return searchState.results.map(result=>({chapter:book.chapters.find(item=>item.id===result.chapterId),count:result.count,snippet:result.snippet})).filter(item=>item.chapter) as Array<{chapter:ChapterMeta;count:number;snippet:string}>;
  },[book,bookId,query,searchState]);
  const activeSearchComplete=!query.trim()||searchState?.key===`${bookId}:${query.trim().toLocaleLowerCase("pt-BR")}`;
  const sections=[...new Set(visibleChapters.map(item=>item.chapter.section))];
  const changeBook=(nextId:string)=>{const next=books.find(item=>item.id===nextId)??books[0];setBookId(next.id);setChapterId(next.chapters[0].id);setQuery("")};
  const selectChapter=(id:string)=>{setChapterId(id);setNavOpen(false);window.scrollTo({top:0,behavior:"smooth"})};

  return <main className="library-shell">
    <header className="library-topbar">
      <div className="library-brand"><span className="library-sigil">N</span><div><strong>NOCTIS</strong><small>BIBLIOTECA DA NOITE</small></div></div>
      <Link className="back-to-sheet" href="/"><ArrowLeft size={16}/>Voltar à ficha</Link>
      <div className="library-user"><span>{displayName}</span><a href={signOutPath} target="_top" title="Sair"><LogOut size={17}/></a></div>
      <button className="library-menu" onClick={()=>setNavOpen(true)} aria-label="Abrir índice"><Menu/></button>
    </header>
    <div className="library-layout">
      <aside className={`library-sidebar ${navOpen?"open":""}`}>
        <div className="library-side-head"><span>ACERVO</span><button onClick={()=>setNavOpen(false)} aria-label="Fechar índice"><X size={18}/></button></div>
        <Tabs value={bookId} onValueChange={changeBook}><TabsList className="book-tabs" variant="line">{books.map(item=><TabsTrigger key={item.id} value={item.id}>{item.id==="core-v5"?"Livro Básico":"Chicago"}</TabsTrigger>)}</TabsList></Tabs>
        <label className="library-search"><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar neste livro..."/>{query&&<button type="button" onClick={()=>setQuery("")} aria-label="Limpar busca"><X size={16}/></button>}</label>
        <div className="book-summary"><strong>{book.title}</strong><span>{book.chapters.length} capítulos · {book.language}</span></div>
        <nav className={query?"chapter-nav search-results":"chapter-nav"} aria-label="Capítulos">
          {query&&!activeSearchComplete&&<p className="search-loading"><LoaderCircle size={16}/>Buscando no livro…</p>}
          {query&&activeSearchComplete&&visibleChapters.length===0&&<p className="no-results">Nenhum capítulo contém “{query}”.</p>}
          {sections.map(section=><div key={section}><h2>{section}</h2>{visibleChapters.filter(item=>item.chapter.section===section).map(({chapter:item,count,snippet})=><button key={item.id} className={item.id===chapterId?"active":""} onClick={()=>selectChapter(item.id)}><FileText size={15}/><span><strong>{item.title}</strong>{query&&<><small>{count} {count===1?"ocorrência":"ocorrências"}</small><em><Highlight text={snippet} query={query}/></em></>}</span><ChevronRight size={14}/></button>)}</div>)}
        </nav>
      </aside>
      <article className="reader" aria-busy={loading}>
        {loading&&<div className="reader-loading"><LoaderCircle/>Carregando capítulo…</div>}
        {!loading&&activeError&&<div className="reader-error"><p>{error?.message}</p><button onClick={()=>setRetryKey(value=>value+1)}>Tentar novamente</button></div>}
        {!loading&&!activeError&&chapter&&<><div className="reader-meta"><span>{book.title}</span><span>{chapter.section}</span></div><div className="reader-title"><div><BookMarked size={22}/></div><div><p>CAPÍTULO</p><h1>{chapter.title}</h1></div></div>{query&&chapter.content.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))&&<div className="search-notice">Ocorrências de “{query}” estão destacadas neste capítulo.</div>}<MarkdownArticle content={chapter.content} query={query}/><footer className="reader-footer"><span>Fonte: {book.title}</span><Link href="/">Voltar à criação de personagem</Link></footer></>}
      </article>
    </div>
    {navOpen&&<button className="library-backdrop" onClick={()=>setNavOpen(false)} aria-label="Fechar índice"/>}
  </main>;
}

function MarkdownArticle({content,query}:{content:string;query:string}) {const blocks=useMemo(()=>parseMarkdown(content),[content]);return <div className="markdown-article">{blocks.map((block,index)=>{if(block.type==="h1")return index===0?null:<h2 key={index}><Highlight text={block.text||""} query={query}/></h2>;if(block.type==="h2")return <h2 key={index}><Highlight text={block.text||""} query={query}/></h2>;if(block.type==="h3")return <h3 key={index}><Highlight text={block.text||""} query={query}/></h3>;if(block.type==="quote")return <blockquote key={index}><Highlight text={block.text||""} query={query}/></blockquote>;if(block.type==="list")return <ul key={index}>{block.items?.map((item,i)=><li key={i}><Highlight text={item} query={query}/></li>)}</ul>;if(block.type==="rule")return <hr key={index}/>;return <p key={index}><Highlight text={block.text||""} query={query}/></p>})}</div>}
type Block={type:"h1"|"h2"|"h3"|"quote"|"list"|"rule"|"p";text?:string;items?:string[]};
function parseMarkdown(markdown:string):Block[]{const lines=markdown.replace(/\r/g,"").split("\n"),blocks:Block[]=[],paragraph:string[]=[];const flush=()=>{if(!paragraph.length)return;blocks.push({type:"p",text:joinWrapped(paragraph)});paragraph.length=0};for(let index=0;index<lines.length;index++){const line=lines[index].trim();if(!line){flush();continue}if(/^---+$/.test(line)){flush();blocks.push({type:"rule"});continue}const heading=line.match(/^(#{1,3})\s+(.+)$/);if(heading){flush();blocks.push({type:heading[1].length===1?"h1":heading[1].length===2?"h2":"h3",text:heading[2]});continue}if(line.startsWith(">")){flush();blocks.push({type:"quote",text:line.replace(/^>\s?/,"")});continue}if(/^[-*•]\s+/.test(line)){flush();const items:string[]=[];while(index<lines.length&&/^[-*•]\s+/.test(lines[index].trim())){items.push(lines[index].trim().replace(/^[-*•]\s+/,""));index++}index--;blocks.push({type:"list",items});continue}paragraph.push(line)}flush();return blocks}
function joinWrapped(lines:string[]){return lines.join(" ").replace(/([A-Za-zÀ-ÿ])-\s+([A-Za-zÀ-ÿ])/g,"$1$2").replace(/\s{2,}/g," ")}
function Highlight({text,query}:{text:string;query:string}){if(!query.trim())return text;const escaped=query.replace(/[.*+?^$\{\}()|[\]\\]/g,"\\$&"),parts=text.split(new RegExp(`(${escaped})`,"gi"));return <>{parts.map((part,index)=>part.toLocaleLowerCase("pt-BR")===query.toLocaleLowerCase("pt-BR")?<mark key={index}>{part}</mark>:part)}</>}
