"use client";
import { UiText, useUiText } from "../ui-text";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookMarked, ChevronRight, FileText, LoaderCircle, LogOut, Menu, Search, X } from "lucide-react";
import { usePreferredLocale } from "../preferences";
import ReferenceMarkdown from "../content/reference-markdown";

type ChapterMeta = { id:string; title:string; section:string };
type Chapter = ChapterMeta & { content:string };
type Book = { id:string; title:string; subtitle:string; language:string; chapters:ChapterMeta[] };
type SearchResult = { chapterId:string; count:number; snippet:string };

export default function RulesReader({books,initialBookId,initialChapterId,initialQuery,displayName,signOutPath}:{books:Book[];initialBookId:string;initialChapterId:string;initialQuery:string;displayName:string;signOutPath:string}) {
  const t=useUiText();

  const locale=usePreferredLocale();
  const [bookId,setBookId]=useState(initialBookId);
  const [chapterId,setChapterId]=useState(initialChapterId);
  const [chapter,setChapter]=useState<Chapter|null>(null);
  const [query,setQuery]=useState(initialQuery);
  const [queryFromSourceLink,setQueryFromSourceLink]=useState(Boolean(initialQuery));
  const [searchState,setSearchState]=useState<{key:string;results:SearchResult[]}|null>(null);
  const [navOpen,setNavOpen]=useState(false);
  const [loadedKey,setLoadedKey]=useState("");
  const [error,setError]=useState<{key:string;message:string}|null>(null);
  const [retryKey,setRetryKey]=useState(0);
  const [translating,setTranslating]=useState(false);
  const [localizedChapters,setLocalizedChapters]=useState<Record<string,ChapterMeta[]>>({});
  const book=books.find(item=>item.id===bookId)??books[0];
  const sourceLanguage=book.language==="Inglês"?"en":"pt",targetLanguage=locale==="en"?"en":"pt",needsTranslation=sourceLanguage!==targetLanguage;
  const localizedBook={...book,title:book.id==="core-v5"?(locale==="en"?"Vampire: The Masquerade V5 Core Rulebook":"Vampiro: A Máscara V5 — Livro Básico"):book.title,language:locale==="en"?"English":"Português",chapters:localizedChapters[`${book.id}:${locale}`]??book.chapters};
  const targetKey=`${bookId}:${chapterId}:${locale}`,activeError=error?.key===targetKey,loading=loadedKey!==targetKey&&!activeError;

  useEffect(()=>{
    const controller=new AbortController();
    fetch(`/api/rules?book=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(chapterId)}`,{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error();return await response.json() as {chapter:Chapter}})
      .then(async result=>{if(controller.signal.aborted)return null;if(needsTranslation){setTranslating(true);return await translateChapter(result.chapter,sourceLanguage,targetLanguage,`${bookId}:${chapterId}:${targetLanguage}`)}return result.chapter})
      .then(result=>{if(controller.signal.aborted||!result)return;setChapter(result);setLoadedKey(targetKey);setError(null);setTranslating(false)})
      .catch(reason=>{if(!controller.signal.aborted&&reason.name!=="AbortError"){setTranslating(false);setError({key:targetKey,message:needsTranslation?"Não foi possível traduzir este capítulo.":"Não foi possível carregar este capítulo."})}});
    return()=>controller.abort();
  },[bookId,chapterId,retryKey,targetKey,needsTranslation,sourceLanguage,targetLanguage]);

  useEffect(()=>{
    const key=`${book.id}:${locale}`;if(!needsTranslation||localizedChapters[key])return;
    const values=book.chapters.flatMap(item=>[item.title,item.section]);
    translateTextList(values,sourceLanguage,targetLanguage).then(translated=>setLocalizedChapters(current=>({...current,[key]:book.chapters.map((item,index)=>({...item,title:translated[index*2]||item.title,section:translated[index*2+1]||item.section}))}))).catch(()=>{});
  },[book,locale,localizedChapters,needsTranslation,sourceLanguage,targetLanguage]);

  useEffect(()=>{
    const normalized=query.trim();
    if(!normalized)return;
    const searchKey=`${bookId}:${normalized.toLocaleLowerCase("pt-BR")}`;
    const controller=new AbortController(),timer=setTimeout(()=>{
      Promise.resolve(needsTranslation&&!queryFromSourceLink?translateTextList([normalized],targetLanguage,sourceLanguage).then(items=>items[0]||normalized):normalized)
      .then(sourceQuery=>fetch(`/api/rules?book=${encodeURIComponent(bookId)}&q=${encodeURIComponent(sourceQuery)}`,{signal:controller.signal}))
        .then(async response=>{if(!response.ok)throw new Error();return await response.json() as {results:SearchResult[]}})
        .then(async result=>{if(!needsTranslation||result.results.length===0)return result.results;const snippets=await translateTextList(result.results.map(item=>item.snippet),sourceLanguage,targetLanguage);return result.results.map((item,index)=>({...item,snippet:snippets[index]||item.snippet}))})
        .then(results=>{if(!controller.signal.aborted)setSearchState({key:searchKey,results})})
        .catch(reason=>{if(!controller.signal.aborted&&reason.name!=="AbortError")setSearchState({key:searchKey,results:[]})});
    },250);
    return()=>{clearTimeout(timer);controller.abort()};
  },[bookId,query,queryFromSourceLink,needsTranslation,sourceLanguage,targetLanguage]);

  const visibleChapters=useMemo(()=>{
    if(!query.trim())return localizedBook.chapters.map(chapter=>({chapter,count:0,snippet:""}));
    const key=`${bookId}:${query.trim().toLocaleLowerCase("pt-BR")}`;
    if(searchState?.key!==key)return[];
    return searchState.results.map(result=>({chapter:localizedBook.chapters.find(item=>item.id===result.chapterId),count:result.count,snippet:result.snippet})).filter(item=>item.chapter) as Array<{chapter:ChapterMeta;count:number;snippet:string}>;
  },[localizedBook.chapters,bookId,query,searchState]);
  const activeSearchComplete=!query.trim()||searchState?.key===`${bookId}:${query.trim().toLocaleLowerCase("pt-BR")}`;
  const sections=[...new Set(visibleChapters.map(item=>item.chapter.section))];
  const changeBook=(nextId:string)=>{const next=books.find(item=>item.id===nextId)??books[0];setBookId(next.id);setChapterId(next.chapters[0].id);setQuery("");setQueryFromSourceLink(false)};
  const selectChapter=(id:string)=>{setChapterId(id);setNavOpen(false);window.scrollTo({top:0,behavior:"smooth"})};

  return <main className="library-shell">
    <header className="library-topbar">
      <div className="library-brand"><span className="library-sigil"><UiText text="C"/></span><div><strong><UiText text="CARNIÇAL"/></strong><small><UiText text="BIBLIOTECA DA NOITE"/></small></div></div>
      <Link className="back-to-sheet" href="/rules"><ArrowLeft size={16}/><UiText text="Voltar ao catálogo"/></Link>
      <div className="library-user"><Link href="/"><UiText text="Ficha"/></Link><span>{displayName}</span><a href={signOutPath} target="_top" title={t("Sair")}><LogOut size={17}/></a></div>
      <button className="library-menu" onClick={()=>setNavOpen(true)} aria-label={t("Abrir índice")}><Menu/></button>
    </header>
    <div className="library-layout">
      <aside className={`library-sidebar ${navOpen?"open":""}`}>
        <div className="library-side-head"><span><UiText text="ACERVO"/></span><button onClick={()=>setNavOpen(false)} aria-label={t("Fechar índice")}><X size={18}/></button></div>
        <label className="book-select-label"><span><UiText text="Livro"/></span><select className="book-select" value={bookId} onChange={event=>changeBook(event.target.value)}>{books.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="library-search"><Search size={16}/><input value={query} onChange={event=>{setQuery(event.target.value);setQueryFromSourceLink(false)}} placeholder={t("Buscar neste livro...")}/>{query&&<button type="button" onClick={()=>{setQuery("");setQueryFromSourceLink(false)}} aria-label={t("Limpar busca")}><X size={16}/></button>}</label>
        <div className="book-summary"><strong>{localizedBook.title}</strong><span>{localizedBook.chapters.length} {locale==="en"?<UiText text="chapters"/>:<UiText text="capítulos"/>} · {localizedBook.language}</span></div>
        <nav className={query?"chapter-nav search-results":"chapter-nav"} aria-label={t("Capítulos")}>
          {query&&!activeSearchComplete&&<p className="search-loading"><LoaderCircle size={16}/><UiText text="Buscando no livro…"/></p>}
          {query&&activeSearchComplete&&visibleChapters.length===0&&<p className="no-results"><UiText text="Nenhum capítulo contém “"/>{query}”.</p>}
          {sections.map(section=><div key={section}><h2>{section}</h2>{visibleChapters.filter(item=>item.chapter.section===section).map(({chapter:item,count,snippet})=><button key={item.id} className={item.id===chapterId?"active":""} onClick={()=>selectChapter(item.id)}><FileText size={15}/><span><strong>{item.title}</strong>{query&&<><small>{count} {count===1?<UiText text="ocorrência"/>:<UiText text="ocorrências"/>}</small><em><Highlight text={snippet} query={query}/></em></>}</span><ChevronRight size={14}/></button>)}</div>)}
        </nav>
      </aside>
      <article className="reader" aria-busy={loading}>
        {loading&&<div className="reader-loading"><LoaderCircle/>{translating?(locale==="en"?"Translating chapter…":"Traduzindo capítulo…"):(locale==="en"?"Loading chapter…":"Carregando capítulo…")}</div>}
        {!loading&&activeError&&<div className="reader-error"><p>{error?.message}</p><button onClick={()=>setRetryKey(value=>value+1)}><UiText text="Tentar novamente"/></button></div>}
        {!loading&&!activeError&&chapter&&<><div className="reader-meta"><span>{localizedBook.title}</span><span data-no-auto-translate>{chapter.section}</span></div><div className="reader-title"><div><BookMarked size={22}/></div><div><p>{locale==="en"?<UiText text="CHAPTER"/>:<UiText text="CAPÍTULO"/>}</p><h1 data-no-auto-translate>{chapter.title}</h1></div></div>{query&&chapter.content.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale))&&<div className="search-notice">{locale==="en"?`Matches for “${query}” are highlighted in this chapter.`:`Ocorrências de “${query}” estão destacadas neste capítulo.`}</div>}<div data-no-auto-translate><MarkdownArticle content={chapter.content} query={query}/></div><footer className="reader-footer"><span>{locale==="en"?<UiText text="Source"/>:<UiText text="Fonte"/>}: {localizedBook.title}</span><Link href="/">{locale==="en"?<UiText text="Back to character creation"/>:<UiText text="Voltar à criação de personagem"/>}</Link></footer></>}
      </article>
    </div>
    {navOpen&&<button className="library-backdrop" onClick={()=>setNavOpen(false)} aria-label={t("Fechar índice")}/>}
  </main>;
}

function MarkdownArticle({content,query}:{content:string;query:string}) {return <div className="markdown-article"><ReferenceMarkdown content={content} query={query}/></div>}
function Highlight({text,query}:{text:string;query:string}){if(!query.trim())return text;const escaped=query.replace(/[.*+?^$\{\}()|[\]\\]/g,"\\$&"),parts=text.split(new RegExp(`(${escaped})`,"gi"));return <>{parts.map((part,index)=>part.toLocaleLowerCase("pt-BR")===query.toLocaleLowerCase("pt-BR")?<mark key={index}>{part}</mark>:part)}</>}

async function translateTextList(texts:string[],source:string,target:string){
  const output:string[]=[];
  for(let index=0;index<texts.length;index+=20){const response=await fetch("/api/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({texts:texts.slice(index,index+20),source,target})});if(!response.ok)throw new Error("translation failed");const result=await response.json() as {translations:string[]};output.push(...result.translations)}
  return output;
}
function splitForTranslation(content:string,max=3800){const chunks:string[]=[];let current="";for(const block of content.split(/(\n{2,})/)){if((current+block).length>max&&current){chunks.push(current);current=""}if(block.length>max){for(let at=0;at<block.length;at+=max)chunks.push(block.slice(at,at+max))}else current+=block}if(current)chunks.push(current);return chunks}
async function translateChapter(chapter:Chapter,source:string,target:string,key:string):Promise<Chapter>{
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(chapter.content)),revision=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
  const cache=typeof caches!=="undefined"?await caches.open("noctis-rules-translations-v2"):null,request=new Request(`${location.origin}/__translation-cache/${encodeURIComponent(key+":"+revision)}`),cached=await cache?.match(request);if(cached)return await cached.json() as Chapter;
  const chunks=splitForTranslation(chapter.content),translated=await translateTextList([chapter.title,chapter.section,...chunks],source,target),result={...chapter,title:translated[0]||chapter.title,section:translated[1]||chapter.section,content:translated.slice(2).join("")};
  await cache?.put(request,new Response(JSON.stringify(result),{headers:{"content-type":"application/json"}}));return result;
}
