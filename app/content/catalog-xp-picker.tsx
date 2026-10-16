"use client";
import {useState} from "react";
import {usePreferredLocale} from "../preferences";
import {CONTENT_INDEX,foldContent} from "./resolve";
import {catalogAdvantageQuote} from "./catalog-item-xp";
import type {CreationItem} from "./creation-item-effects";
import type {ItemContext} from "./item-eligibility";
import ContentDetails from "./content-details";

export default function CatalogXpPicker({items,context,remaining,onPurchase}:{items:CreationItem[];context:ItemContext;remaining:number;onPurchase:(id:string,version:string)=>void}){
 const locale=usePreferredLocale(),en=locale==="en",[query,setQuery]=useState(""),[selected,setSelected]=useState("");
 const options=CONTENT_INDEX.flatMap(entry=>(entry.versions||[]).flatMap(version=>{const quote=catalogAdvantageQuote(entry.id,version.id,items,context);return quote?[quote]:[]})).filter(quote=>[...Object.values(quote.entry.names),...quote.entry.aliases,...Object.values(quote.version.names||{})].some(name=>foldContent(name).includes(foldContent(query))));
 const quote=options.find(option=>option.version.id===selected)||options[0];
 return <details className="catalog-item-picker"><summary>{en?"Buy an Advantage from the catalog":"Comprar Vantagem do catálogo"}</summary>
  <p>{en?"Read the full rules and agree narrative requirements with the Storyteller. Cost: 3 XP per acquired dot. Printed ratings and source requirements are preserved.":"Leia as regras completas e combine os requisitos narrativos com o Narrador. Custo: 3 XP por ponto adquirido. São respeitados os valores impressos e os requisitos da fonte."}</p>
  <label className="field"><span>{en?"Search Advantages":"Buscar Vantagens"}</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
  {quote?<><label className="field"><span>{en?"Advantage and rating":"Vantagem e nível"}</span><select aria-label={en?"Advantage and rating":"Vantagem e nível"} value={quote.version.id} onChange={event=>setSelected(event.target.value)}>{options.map(option=><option key={option.version.id} value={option.version.id}>{option.version.names?.[locale]||option.entry.names[locale]} · {option.to} · {option.version.sourceTitle}</option>)}</select></label>
   <ContentDetails key={quote.version.id} id={quote.entry.id} initialVersion={quote.version.id} book={quote.version.book} name={quote.version.names?.[locale]||quote.entry.names[locale]}/>
   <p>{quote.from} → {quote.to} · {quote.cost} XP · {en?"Balance":"Saldo"}: {remaining} XP</p><button type="button" disabled={remaining<quote.cost} onClick={()=>onPurchase(quote.entry.id,quote.version.id)}>{en?"Buy this Advantage":"Comprar esta Vantagem"}</button>
  </>:<p>{en?"No compatible purchases. Check enabled sources, prerequisites and existing ratings.":"Nenhuma compra compatível. Confira fontes habilitadas, requisitos e valores já registrados."}</p>}
 </details>;
}
