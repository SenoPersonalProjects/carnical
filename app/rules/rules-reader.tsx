"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookMarked, ChevronRight, FileText, LogOut, Menu, Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import library from "./rules-data.json";

type Chapter = { id:string; title:string; section:string; content:string };
type Book = { id:string; title:string; subtitle:string; language:string; chapters:Chapter[] };

export default function RulesReader({displayName,signOutPath}:{displayName:string;signOutPath:string}) {
  const books=library.books as Book[];
  const [bookId,setBookId]=useState(books[0].id);
  const [chapterId,setChapterId]=useState(books[0].chapters[0].id);
  const [query,setQuery]=useState("");
  const [navOpen,setNavOpen]=useState(false);
  const book=books.find(item=>item.id===bookId)??books[0];
  const chapter=book.chapters.find(item=>item.id===chapterId)??book.chapters[0];
  const visibleChapters=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase("pt-BR");
    if(!normalized)return book.chapters;
    return book.chapters.filter(item=>item.title.toLocaleLowerCase("pt-BR").includes(normalized)||item.content.toLocaleLowerCase("pt-BR").includes(normalized));
  },[book,query]);
  const sections=[...new Set(visibleChapters.map(item=>item.section))];
  const changeBook=(nextId:string)=>{
    const next=books.find(item=>item.id===nextId)??books[0];
    setBookId(next.id);setChapterId(next.chapters[0].id);setQuery("");
  };
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
        <div className="library-side-head"><span>ACERVO</span><button onClick={()=>setNavOpen(false)} aria-label="Fechar índice"><X size={17}/></button></div>
        <Tabs value={bookId} onValueChange={changeBook}>
          <TabsList className="book-tabs" variant="line">
            {books.map(item=><TabsTrigger key={item.id} value={item.id}>{item.id==="core-v5"?"Livro Básico":"Chicago"}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <label className="library-search"><Search size={15}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar neste livro..."/>{query&&<button onClick={()=>setQuery("")} aria-label="Limpar busca"><X size={14}/></button>}</label>
        <div className="book-summary"><strong>{book.title}</strong><span>{book.chapters.length} capítulos · {book.language}</span></div>
        <nav className="chapter-nav" aria-label="Capítulos">
          {visibleChapters.length===0&&<p className="no-results">Nenhum capítulo contém “{query}”.</p>}
          {sections.map(section=><div key={section}><h2>{section}</h2>{visibleChapters.filter(item=>item.section===section).map(item=><button key={item.id} className={item.id===chapter.id?"active":""} onClick={()=>selectChapter(item.id)}><FileText size={14}/><span>{item.title}</span><ChevronRight size={13}/></button>)}</div>)}
        </nav>
      </aside>
      <article className="reader">
        <div className="reader-meta"><span>{book.title}</span><span>{chapter.section}</span></div>
        <div className="reader-title"><div><BookMarked size={22}/></div><div><p>CAPÍTULO</p><h1>{chapter.title}</h1></div></div>
        {query&&chapter.content.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))&&<div className="search-notice">Este capítulo contém “{query}”. Use a busca do navegador para localizar cada ocorrência no texto.</div>}
        <MarkdownArticle content={chapter.content}/>
        <footer className="reader-footer"><span>Fonte: {book.title}</span><Link href="/">Voltar à criação de personagem</Link></footer>
      </article>
    </div>
    {navOpen&&<button className="library-backdrop" onClick={()=>setNavOpen(false)} aria-label="Fechar índice"/>}
  </main>;
}

function MarkdownArticle({content}:{content:string}) {
  const blocks=useMemo(()=>parseMarkdown(content),[content]);
  return <div className="markdown-article">{blocks.map((block,index)=>{
    if(block.type==="h1")return index===0?null:<h2 key={index}>{block.text}</h2>;
    if(block.type==="h2")return <h2 key={index}>{block.text}</h2>;
    if(block.type==="h3")return <h3 key={index}>{block.text}</h3>;
    if(block.type==="quote")return <blockquote key={index}>{block.text}</blockquote>;
    if(block.type==="list")return <ul key={index}>{block.items?.map((item,i)=><li key={i}>{item}</li>)}</ul>;
    if(block.type==="rule")return <hr key={index}/>;
    return <p key={index}>{block.text}</p>;
  })}</div>;
}

type Block={type:"h1"|"h2"|"h3"|"quote"|"list"|"rule"|"p";text?:string;items?:string[]};
function parseMarkdown(markdown:string):Block[]{
  const lines=markdown.replace(/\r/g,"").split("\n"),blocks:Block[]=[],paragraph:string[]=[];
  const flush=()=>{if(!paragraph.length)return;blocks.push({type:"p",text:joinWrapped(paragraph)});paragraph.length=0};
  for(let index=0;index<lines.length;index++){
    const line=lines[index].trim();
    if(!line){flush();continue}
    if(/^---+$/.test(line)){flush();blocks.push({type:"rule"});continue}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){flush();blocks.push({type:heading[1].length===1?"h1":heading[1].length===2?"h2":"h3",text:heading[2]});continue}
    if(line.startsWith(">")){flush();blocks.push({type:"quote",text:line.replace(/^>\s?/,"")});continue}
    if(/^[-*•]\s+/.test(line)){
      flush();const items:string[]=[];
      while(index<lines.length&&/^[-*•]\s+/.test(lines[index].trim())){items.push(lines[index].trim().replace(/^[-*•]\s+/,""));index++}
      index--;blocks.push({type:"list",items});continue;
    }
    paragraph.push(line);
  }
  flush();return blocks;
}
function joinWrapped(lines:string[]){return lines.join(" ").replace(/([A-Za-zÀ-ÿ])-\s+([A-Za-zÀ-ÿ])/g,"$1$2").replace(/\s{2,}/g," ")}
