"use client";
import {useState} from "react";
import {usePreferredLocale} from "../preferences";
import {CONTENT_INDEX,foldContent} from "./resolve";
import {catalogAdvantageQuote,catalogItemKey} from "./catalog-item-xp";
import type {CreationItem} from "./creation-item-effects";
import {catalogDetailValid,type ItemContext} from "./item-eligibility";
import ContentDetails from "./content-details";

export default function CatalogXpPicker({items,context,remaining,onPurchase}:{items:CreationItem[];context:ItemContext;remaining:number;onPurchase:(id:string,version:string,target?:string,instanceName?:string)=>void}){
 const locale=usePreferredLocale(),en=locale==="en",[query,setQuery]=useState(""),[selected,setSelected]=useState(""),[target,setTarget]=useState(""),[instanceName,setInstanceName]=useState("");
 const options=CONTENT_INDEX.flatMap(entry=>(entry.versions||[]).flatMap(version=>{const quote=catalogAdvantageQuote(entry.id,version.id,items,context,target||undefined);return quote?[quote]:[]})).filter(quote=>[...Object.values(quote.entry.names),...quote.entry.aliases,...Object.values(quote.version.names||{})].some(name=>foldContent(name).includes(foldContent(query))));
 const quote=options.find(option=>option.version.id===selected)||options[0];
 return <details className="catalog-item-picker"><summary>{en?"Buy an Advantage from the catalog":"Comprar Vantagem do catálogo"}</summary>
  <p>{en?"Read the full rules and agree narrative requirements with the Storyteller. Cost: 3 XP per acquired dot. Printed ratings and source requirements are preserved.":"Leia as regras completas e combine os requisitos narrativos com o Narrador. Custo: 3 XP por ponto adquirido. São respeitados os valores impressos e os requisitos da fonte."}</p>
  {context.clanBaneId==="bane-hecata"&&!context.decayXpMode&&<p role="status">{en?"Decay: Haven, Resources and Retainer purchases require the Storyteller’s XP interpretation in chronicle settings. Other purchases remain available.":"Decadência: compras de Refúgio, Recursos e Lacaios exigem a interpretação de XP do mestre nas configurações da crônica. Outras compras continuam disponíveis."}</p>}
  <label className="field"><span>{en?"Purchase target":"Destino da compra"}</span><select aria-label={en?"Purchase target":"Destino da compra"} value={target} onChange={event=>{setTarget(event.target.value);setSelected("")}}><option value="">{en?"Automatic matching":"Identificar pela escolha"}</option><option value="new">{en?"New connection or item":"Novo vínculo ou item"}</option>{items.map((item,index)=><option key={catalogItemKey(item,index)} value={catalogItemKey(item,index)}>{item.name}{item.instanceName?` — ${item.instanceName}`:""} ({item.dots})</option>)}</select></label>
  <label className="field"><span>{en?"Search Advantages":"Buscar Vantagens"}</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
  {quote?<><label className="field"><span>{en?"Advantage and rating":"Vantagem e nível"}</span><select aria-label={en?"Advantage and rating":"Vantagem e nível"} value={quote.version.id} onChange={event=>setSelected(event.target.value)}>{options.map(option=><option key={option.version.id} value={option.version.id}>{option.version.names?.[locale]||option.entry.names[locale]} · {option.to} · {option.version.sourceTitle}</option>)}</select></label>
   {(quote.version.requirements?.repeatableInstances||quote.version.requirements?.requiresDetail)&&!quote.existing&&<label className="field"><span>{quote.version.requirements?.detailLabel?.[locale]||(en?"Person, group or location":"Pessoa, grupo ou local")}</span><input value={instanceName} onChange={event=>setInstanceName(event.target.value)}/></label>}
   <ContentDetails key={quote.version.id} id={quote.entry.id} initialVersion={quote.version.id} book={quote.version.book} name={quote.version.names?.[locale]||quote.entry.names[locale]}/>
   <p>{quote.from} → {quote.to} · {quote.cost} XP{quote.surcharge?` (${en?"includes Decay":"inclui Decadência"}: +${quote.surcharge})`:""} · {en?"Balance":"Saldo"}: {remaining} XP</p><button type="button" disabled={remaining<quote.cost||!quote.existing&&!catalogDetailValid(quote.entry.id,quote.version,items,instanceName)} onClick={()=>onPurchase(quote.entry.id,quote.version.id,target||undefined,instanceName)}>{en?"Buy this Advantage":"Comprar esta Vantagem"}</button>
  </>:<p>{en?"No compatible purchases. Check enabled sources, prerequisites and existing ratings.":"Nenhuma compra compatível. Confira fontes habilitadas, requisitos e valores já registrados."}</p>}
 </details>;
}
