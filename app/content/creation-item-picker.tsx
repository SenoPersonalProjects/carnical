"use client";
import {useState} from "react";
import {usePreferredLocale} from "../preferences";
import {sourcebookForLibraryId} from "../creation-sources";
import {CONTENT_INDEX,foldContent,sameContent} from "./resolve";
import {itemEligibility,type ItemContext} from "./item-eligibility";
import ContentDetails from "./content-details";
export type CatalogItem={name:string;dots:number;source:string;notes:string;catalogId:string;versionId:string};
export default function CreationItemPicker({kind,context,existing,remaining,onAdd}:{kind:"advantage"|"flaw";context:ItemContext;existing:ReadonlyArray<{name:string;catalogId?:string}>;remaining:number;onAdd:(item:CatalogItem)=>void}){
 const locale=usePreferredLocale(),en=locale==="en",[query,setQuery]=useState(""),[selectedId,setSelectedId]=useState(""),[versionId,setVersionId]=useState("");
 const available=CONTENT_INDEX.filter(entry=>(kind==="flaw"?entry.kind==="flaw":["merit","background","loresheet"].includes(entry.kind))&&!existing.some(item=>item.catalogId===entry.id||sameContent(item.name,entry.names["pt-BR"],{kind:entry.kind}))&&(entry.versions||[]).some(version=>itemEligibility(version,context).allowed));
 if(!available.length)return null;
 const matches=available.filter(entry=>[...Object.values(entry.names),...entry.aliases,...(entry.versions||[]).flatMap(version=>Object.values(version.names||{}))].some(name=>foldContent(name).includes(foldContent(query))));
 const selected=matches.find(entry=>entry.id===selectedId)||matches[0],versions=selected?.versions?.filter(version=>itemEligibility(version,context).allowed)||[],version=versions.find(version=>version.id===versionId)||versions[0],cost=version?.level??selected?.level??0,special=!!version?.requirements?.selectionGroup;
 const points=(value:number,unrated:boolean)=>unrated?(en?"special choice":"escolha especial"):`${value} ${en?"dot(s)":"ponto(s)"}`;
 return <details className="catalog-item-picker">
  <summary>{en?"Choose from the catalog":"Escolher no catálogo"}</summary>
  <p>{en?"Only entries compatible with your clan and enabled sources appear. Read the rules before adding.":"Aparecem apenas opções compatíveis com seu clã e fontes habilitadas. Leia as regras antes de adicionar."}</p>
  <label className="field"><span>{en?"Search in either language":"Buscar nos dois idiomas"}</span><input value={query} onChange={event=>setQuery(event.target.value)} type="search"/></label>
  {selected&&version?<>
   <label className="field"><span>Item</span><select aria-label="Item" value={selected.id} onChange={event=>{setSelectedId(event.target.value);setVersionId("")}}>{matches.map(entry=>{const choice=entry.id===selected.id?version:entry.versions?.find(version=>itemEligibility(version,context).allowed);return <option key={entry.id} value={entry.id}>{entry.names[locale]} · {points(choice?.level??entry.level??0,!!choice?.requirements?.selectionGroup)}</option>})}</select></label>
   {versions.length>1&&<label className="field"><span>{special?(en?"Choose the benefit":"Escolha o benefício"):(en?"Source and level":"Fonte e nível")}</span><select aria-label={special?(en?"Choose the benefit":"Escolha o benefício"):(en?"Source and level":"Fonte e nível")} value={version.id} onChange={event=>setVersionId(event.target.value)}>{versions.map(item=><option key={item.id} value={item.id}>{item.names?.[locale]||item.sourceTitle}</option>)}</select></label>}
   <ContentDetails key={`${selected.id}:${version.id}`} id={selected.id} name={version.names?.[locale]||selected.names[locale]} book={version.book} initialVersion={version.id}/>
   {special?<p>{en?"Unrated Thin-blood choice: no ordinary dots or XP. Choose 1–3 Merits and an equal number of Flaws.":"Escolha especial de Sangue-Ralo: sem pontos comuns ou XP. Escolha 1–3 Qualidades e a mesma quantidade de Defeitos."}</p>:<p>{cost} {en?"creation dot(s)":"ponto(s) da criação"} · {Math.max(0,remaining)} {kind==="flaw"?(en?"minimum dots still needed":"ponto(s) mínimos ainda necessários"):(en?"available":"disponíveis")}</p>}
   <button type="button" disabled={!special&&(cost<1||kind==="advantage"&&cost>remaining)} onClick={()=>onAdd({name:version.names?.["pt-BR"]||selected.names["pt-BR"],dots:cost,source:sourcebookForLibraryId(version.book)||version.book,notes:"",catalogId:selected.id,versionId:version.id})}>{en?"Add this item":"Adicionar este item"}</button>
   {!special&&kind==="advantage"&&cost>remaining&&<p>{en?"Not enough creation dots. Review your other choices.":"Não há pontos livres suficientes. Reveja as outras escolhas."}</p>}
  </>:<p>{en?"No matching entries.":"Nenhuma opção encontrada."}</p>}
 </details>;
}
