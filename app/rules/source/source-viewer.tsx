"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePreferredLocale } from "../../preferences";
export type SourceBook={id:string;title:string;pages:Array<{pdfPage:number;printedPage:number|null;image:string;width:number;height:number}>};
export default function SourceViewer({book,initialPage}:{book:SourceBook;initialPage:number}){
  const locale=usePreferredLocale(),en=locale==="en",[number,setNumber]=useState(initialPage),page=book.pages.find(page=>page.pdfPage===number)||book.pages[0],index=book.pages.indexOf(page);
  return <main className="source-viewer"><header><Link href={`/rules?book=${book.id}`}>{en?"Back to book":"Voltar ao livro"}</Link><h1>{book.title}</h1><p>{en?"Original source page":"Página da fonte original"} {page.printedPage??"—"} · {en?"PDF page":"Página do arquivo"} {page.pdfPage}</p></header><nav aria-label={en?"Page navigation":"Navegação de páginas"}><button type="button" disabled={index===0} onClick={()=>setNumber(book.pages[index-1].pdfPage)}>{en?"Previous":"Anterior"}</button><label>{en?"Page":"Página"}<select value={page.pdfPage} onChange={event=>setNumber(Number(event.target.value))}>{book.pages.map(page=><option key={page.pdfPage} value={page.pdfPage}>{page.printedPage??`PDF ${page.pdfPage}`}</option>)}</select></label><button type="button" disabled={index===book.pages.length-1} onClick={()=>setNumber(book.pages[index+1].pdfPage)}>{en?"Next":"Próxima"}</button><a href={page.image} target="_blank" rel="noreferrer">{en?"Open full size":"Abrir em tamanho completo"}</a></nav><Image unoptimized src={page.image} alt={`${book.title}, ${en?"page":"página"} ${page.printedPage??page.pdfPage}`} width={page.width} height={page.height} priority/></main>;
}
