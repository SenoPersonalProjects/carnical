"use client";
import { UiText } from "../ui-text";

import { useRef, useState } from "react";
import { POWER_CATALOG, rulesUrl, type PowerRule } from "../game-rules";
import Link from "next/link";
import Image from "next/image";
import ContentDetails from "../content/content-details";
import {resolveContent,sameContent,contentName} from "../content/resolve";
import {powerForSources} from "../content/power-eligibility";
import {usePreferredLocale} from "../preferences";
import {normalizeActiveSourcebooks} from "../creation-sources";

type Reference={power:PowerRule;excerpt:string;pages:number[];initialPage:number;url:string};
export default function PowerDetails({name,discipline,activeSourcebooks}:{name:string;discipline:string;activeSourcebooks?:unknown}) {
  const locale=usePreferredLocale();
  const sources=new Set(normalizeActiveSourcebooks(activeSourcebooks));
  const matches=POWER_CATALOG.filter(item=>item.discipline===discipline&&sameContent(item.name,name,{discipline})).map(power=>powerForSources(power,sources));
  const [reference,setReference]=useState<Reference|null>(null),[error,setError]=useState(false),[loading,setLoading]=useState(false),[page,setPage]=useState(0);
  const requestId=useRef(0);
  const content=resolveContent(name,{discipline});
  if(content)return <ContentDetails id={content.id} name={contentName(name,locale,{discipline,book:matches.length===1?matches[0].source.book:undefined})} book={matches.length===1?matches[0].source.book:undefined}/>;
  const load=async(id:string)=>{const version=++requestId.current;setLoading(true);setError(false);setReference(null);setPage(0);try{const response=await fetch(`/api/powers?id=${encodeURIComponent(id)}`);if(!response.ok)throw new Error();const data:Reference=await response.json();if(version!==requestId.current)return;setReference(data);setPage(Math.max(0,data.pages.indexOf(data.initialPage)))}catch{if(version===requestId.current)setError(true)}finally{if(version===requestId.current)setLoading(false)}};
  return <details className="power-details" onToggle={event=>{if(event.currentTarget.open&&!reference&&!loading&&!error&&matches[0])void load(matches[0].id)}}>
    <summary>{name} <span><UiText text="Ver descrição e sistema"/></span></summary>
    {!matches.length?<p><UiText text="Poder personalizado ou sem referência cadastrada. "/><Link href={`/rules?q=${encodeURIComponent(name)}`}><UiText text="Pesquisar na biblioteca"/></Link></p>:<>
      {matches.length>1&&<label><UiText text="Versão do livro"/><select aria-label={`Fonte de ${name}`} onChange={event=>void load(event.target.value)}>{matches.map(power=><option key={power.id} value={power.id}>{power.source.label}</option>)}</select></label>}
      {loading&&<p role="status"><UiText text="Abrindo referência…"/></p>}
      {error&&<p role="alert"><UiText text="Não foi possível abrir. "/><button onClick={()=>void load(matches[0].id)}><UiText text="Tentar novamente"/></button></p>}
      {reference&&<><p>{reference.power.source.label} <UiText text=" · Nível "/>{reference.power.level}</p>{reference.power.pool&&<p><UiText text="Parada: "/>{reference.power.pool}</p>}{reference.power.cost!=="Consultar regra"&&<p><UiText text="Custo: "/>{reference.power.cost} <UiText text=" · Duração: "/>{reference.power.duration}</p>}
        {reference.pages.length>0?<><p><UiText text="Consulte a descrição, o sistema e as resistências nas páginas desta disciplina."/></p><label><UiText text="Página do livro"/><select aria-label={`Página de ${name}`} value={page} onChange={event=>setPage(Number(event.target.value))}>{reference.pages.map((number,index)=><option key={number} value={index}>{number}</option>)}</select></label><a href={`/core-disciplines/page-${reference.pages[page]}.webp`} target="_blank" rel="noreferrer"><UiText text="Abrir página em tamanho completo"/></a><Image unoptimized width={1000} height={1400} className="power-page" src={`/core-disciplines/page-${reference.pages[page]}.webp`} alt={`Livro Básico V5, página ${reference.pages[page]}, regras de ${discipline}`} loading="lazy"/></>:<div className="power-source-text" tabIndex={0} role="region" aria-label={`Texto de referência de ${name}`}>{reference.excerpt}</div>}
        <Link href={reference.url} target="_blank"><UiText text="Abrir capítulo completo na biblioteca"/></Link>
      </>}
      {!reference&&<Link href={rulesUrl(matches[0].source)} target="_blank"><UiText text="Abrir referência na biblioteca"/></Link>}
    </>}
  </details>;
}
