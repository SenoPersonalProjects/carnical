"use client";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";
import { usePreferredLocale } from "../preferences";
import type { ContentResponse } from "./types";
import ReferenceMarkdown from "./reference-markdown";

export default function ContentDetails({id,name,book}:{id:string;name:string;book?:string}) {
  const locale=usePreferredLocale(),en=locale==="en",[open,setOpen]=useState(false),[version,setVersion]=useState(""),[state,setState]=useState<{key:string;data?:ContentResponse;error?:boolean}>(),[retry,setRetry]=useState(0),sequence=useRef(0);
  const key=`${id}:${version}:${book||""}:${locale}`;
  useEffect(()=>{
    if(!open)return;
    const controller=new AbortController(),request=++sequence.current;
    fetch(`/api/content?id=${encodeURIComponent(id)}&lang=${locale}&version=${encodeURIComponent(version)}${book?`&book=${encodeURIComponent(book)}`:""}`,{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error();return await response.json() as ContentResponse}).then(data=>{if(sequence.current===request&&!controller.signal.aborted)setState({key,data})}).catch(()=>{if(sequence.current===request&&!controller.signal.aborted)setState({key,error:true})});
    return()=>controller.abort();
  },[id,version,book,locale,key,open,retry]);
  const data=state?.key===key?state.data:undefined;
  return <details className="content-details" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary>{data?.name||name}<span>{en?"Description and rules":"Descrição e regras"}</span></summary>
    {open&&<div>{state?.key!==key?<p role="status">{en?"Loading rules…":"Carregando regras…"}</p>:state.error?<p role="alert">{en?"Could not load the rules.":"Não foi possível carregar as regras."} <button type="button" onClick={()=>setRetry(value=>value+1)}>{en?"Try again":"Tentar novamente"}</button></p>:data&&<>
      {data.versions.length>1&&<label>{en?"Source version":"Versão da fonte"}<select value={data.versionId} onChange={event=>setVersion(event.target.value)}>{data.versions.map(version=><option value={version.id} key={version.id}>{version.source}</option>)}</select></label>}
      <p className="content-source">{data.source}</p>{data.sections.map((section,index)=><section key={index}><h4>{section.title}</h4><ReferenceMarkdown content={section.text}/></section>)}
      <nav aria-label={en?"Original source pages":"Páginas da fonte original"}>{data.pages.map(page=><Link target="_blank" key={page.pdfPage} href={page.url}>{en?"View original page":"Ver página original"} {page.printedPage??`${en?"PDF":"PDF"} ${page.pdfPage}`}</Link>)}</nav>
    </>}</div>}
  </details>;
}
