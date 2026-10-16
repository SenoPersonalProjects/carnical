"use client";
import {catalogPurchaseName} from "./content/catalog-item-xp";
import {bloodPotencyRange,canIncreaseBloodPotency} from "./blood-potency-limits";
import { UiText, useUiText } from "./ui-text";


import { useState } from "react";
import { isPredatorItem } from "./predator-benefits";
import { xpBudget, xpCost, xpSpent, type XpCostMode, type XpKind, type XpPurchase } from "./experience";
import { POWER_CATALOG } from "./game-rules";
import { powerEligibility,powersForSources } from "./content/power-eligibility";
import ContentDetails from "./content/content-details";
import {CONTENT_INDEX,contentName,sameContent} from "./content/resolve";
import {usePreferredLocale} from "./preferences";
import CatalogXpPicker from "./content/catalog-xp-picker";
import type {CreationItem} from "./content/creation-item-effects";
import {restrictedThinBloodXp} from "./content/creation-item-effects";

export type PurchaseIntent="attribute"|"skill"|"discipline"|"specialty"|"advantage"|"blood-potency"|"ritual"|"ceremony"|"formula";
type Props={
  ageCategory:string;total:string;spent:string;purchases:XpPurchase[];
  costMode:XpCostMode; linkedChronicle?:string; creationXp?:number; earnedXp?:number;
  awards?:Array<{id:string;amount:number;note:string;created_at:string}>;onRefresh?:()=>void;
  attributes:Record<string,number>;skills:Record<string,number>;disciplines:Record<string,number>;
  clanDisciplines:string[];clan:string;bloodPotency:number;generation:string;
  merits:CreationItem[];flawItems:CreationItem[];onCatalogPurchase:(id:string,version:string)=>void;specialties:Array<{skill:string;name:string}>;
  activeSources:ReadonlySet<string>;disciplinePowers:Record<string,string[]>;
  onTotal:(value:string)=>void;onPurchase:(kind:PurchaseIntent,name:string,skill?:string)=>void;onUndo:()=>void;
};

export default function XpPurchasePanel(props:Props){
  const t=useUiText(),locale=usePreferredLocale();

  const [kind,setKind]=useState<PurchaseIntent>("skill"),[name,setName]=useState(""),[specialtyName,setSpecialtyName]=useState(""),[newAdvantage,setNewAdvantage]=useState("");
  const isMagic=kind==="ritual"||kind==="ceremony"||kind==="formula";
  const magicOptions=isMagic?powersForSources(POWER_CATALOG,props.activeSources).filter(item=>item.kind===kind&&powerEligibility(item,props.disciplines,props.disciplinePowers,props.activeSources,props.clan).allowed&&!props.disciplinePowers[item.discipline]?.some(name=>sameContent(name,item.name,{discipline:item.discipline}))):[];
  const options=kind==="attribute"?Object.keys(props.attributes):kind==="skill"?Object.keys(props.skills):kind==="discipline"?Object.keys(props.disciplines):kind==="specialty"?Object.keys(props.skills):kind==="advantage"?[...props.merits.filter(item=>!isPredatorItem(item)&&!item.catalogId).map(item=>item.name),"__new__"]:isMagic?magicOptions.map(item=>item.name):[];
  const chosen=options.includes(name)?name:options[0]||"";
  const targetName=kind==="advantage"&&chosen==="__new__"?newAdvantage.trim():chosen;
  const magic=magicOptions.find(item=>item.name===chosen);
  const current=kind==="attribute"?props.attributes[chosen]||0:kind==="skill"?props.skills[chosen]||0:kind==="discipline"?props.disciplines[chosen]||0:kind==="blood-potency"?props.bloodPotency:kind==="advantage"?props.merits.find(item=>item.name===targetName&&!isPredatorItem(item))?.dots||0:0;
  const disciplineKind:XpKind=props.clan==="Caitiff"?"caitiff-discipline":props.clan==="Sangue-Ralo"&&chosen==="Alquimia do Sangue-Fraco"||props.clanDisciplines.includes(chosen)?"clan-discipline":"other-discipline";
  const cost=xpCost(kind==="discipline"?disciplineKind:kind,isMagic?magic?.level||0:current+1,props.costMode);
  const budget=xpBudget(props.total,props.ageCategory),used=xpSpent(props.spent,props.purchases),remaining=budget-used;
  const duplicateSpecialty=kind==="specialty"&&props.specialties.some(item=>item.skill===chosen&&item.name.trim().toLocaleLowerCase("pt-BR")===specialtyName.trim().toLocaleLowerCase("pt-BR"));
  const restricted=restrictedThinBloodXp(props.clan,kind,targetName);
  const valid=!restricted&&cost>0&&remaining>=cost&&(isMagic||(kind==="blood-potency"?canIncreaseBloodPotency(current,props.generation,props.clan):current<5))&&(kind==="blood-potency"||!!targetName)&&(kind!=="specialty"||!!specialtyName.trim()&&!duplicateSpecialty)&&(kind!=="advantage"||chosen!=="__new__"||!props.merits.some(item=>sameContent(item.name,targetName)&&!isPredatorItem(item)));
  return <div className="xp-panel">
    <p><UiText text="A distribuição inicial permanece separada. Compras registradas aqui não alteram as metas da criação. "/>{props.costMode==="current_level"?<UiText text="Nesta crônica, aumentos usam o nível atual (mínimo 1) × fator."/>:<UiText text="A regra padrão usa o novo nível × fator."/>}</p>
    <div className="xp-balance"><div><span><UiText text="XP disponível"/></span><strong>{budget}</strong></div><div><span><UiText text="XP gasto"/></span><strong>{used}</strong></div><div><span><UiText text="Saldo"/></span><strong>{remaining}</strong></div></div>
    {props.linkedChronicle?<div className="xp-source"><strong>{props.linkedChronicle}</strong><span>{props.creationXp??0} <UiText text=" XP da criação + "/>{props.earnedXp??0} <UiText text=" XP concedidos pelo mestre"/></span><button type="button" onClick={props.onRefresh}><UiText text="Atualizar concessões"/></button></div>:<label className="field"><span><UiText text="XP total da ficha, incluindo o inicial"/></span><input type="number" min={0} value={props.total===""?budget:props.total} onChange={event=>props.onTotal(event.target.value)}/></label>}
    <small className="xp-help">{props.ageCategory==="Neófito"?<UiText text="Neófito: 15 XP iniciais."/>:props.ageCategory==="Ancilla"?<UiText text="Ancilla: 35 XP iniciais."/>:<UiText text="Esta categoria não recebe XP inicial pela regra-base."/>} {props.linkedChronicle?<UiText text="O mestre controla as concessões de missão."/>:<UiText text="Ajuste o total se a crônica livre conceder mais XP."/>}</small>
    {props.awards?.length? <div className="xp-history"><h3><UiText text="XP recebido"/></h3>{props.awards.map(award=><p key={award.id}><span>{award.note||"Concessão do mestre"} · {new Date(award.created_at).toLocaleDateString("pt-BR")}</span><strong>+{award.amount} <UiText text=" XP"/></strong></p>)}</div>:null}
    <CatalogXpPicker items={props.merits} context={{phase:"xp",clan:props.clan,activeSources:props.activeSources,disciplines:props.disciplines,powers:props.disciplinePowers,items:[...props.merits,...props.flawItems]}} remaining={remaining} onPurchase={props.onCatalogPurchase}/>
    <div className="form-grid compact"><label className="field"><span><UiText text="Comprar"/></span><select value={kind} onChange={event=>{setKind(event.target.value as PurchaseIntent);setName("")}}><option value="attribute"><UiText text="Atributo"/></option><option value="skill"><UiText text="Habilidade"/></option><option value="discipline"><UiText text="Disciplina"/></option><option value="specialty"><UiText text="Especialização"/></option><option value="advantage"><UiText text="Vantagem"/></option><option value="blood-potency"><UiText text="Potência de Sangue"/></option><option value="ritual"><UiText text="Ritual de Sangue"/></option><option value="ceremony"><UiText text="Cerimônia de Oblívio"/></option><option value="formula"><UiText text="Fórmula de Sangue-Ralo"/></option></select></label>{kind!=="blood-potency"&&<label className="field"><span>{kind==="specialty"?<UiText text="Habilidade"/>:isMagic?<UiText text="Regra"/>:<UiText text="Característica"/>}</span><select value={chosen} onChange={event=>setName(event.target.value)}>{isMagic?magicOptions.map(option=><option key={option.id} value={option.name}>{contentName(option.name,locale,{discipline:option.discipline,book:option.source.book})} <UiText text=" · nível "/>{option.level} · {option.source.label}</option>):options.map(option=><option key={option} value={option}>{option==="__new__"?<UiText text="Nova vantagem"/>:option}</option>)}</select></label>}{kind==="specialty"&&<label className="field"><span><UiText text="Nome da especialização"/></span><input value={specialtyName} onChange={event=>setSpecialtyName(event.target.value)} placeholder={t("Ex.: Vigilância")}/></label>}{kind==="advantage"&&chosen==="__new__"&&<label className="field"><span><UiText text="Nome da nova vantagem"/></span><input value={newAdvantage} onChange={event=>setNewAdvantage(event.target.value)} placeholder={t("Ex.: Recursos")}/></label>}</div>
    {kind==="blood-potency"&&<p className="xp-help" role="status">{locale==="en"?"Generation limits":"Limites da Geração"}: {bloodPotencyRange(props.generation,props.clan)?`${bloodPotencyRange(props.generation,props.clan)!.min}–${bloodPotencyRange(props.generation,props.clan)!.max}`:locale==="en"?"Enter a generation from 4 to 16 before buying.":"Informe uma Geração de 4 a 16 antes de comprar."} · {locale==="en"?"Corebook, p. 214. Initial age limits remain separate.":"Livro Básico, p. 214. As faixas iniciais por idade são verificadas separadamente."}</p>}
    {restricted&&<p className="xp-help" role="status">{locale==="en"?(kind==="blood-potency"?"Thin-blood Blood Potency remains 0.":"Known catalog items use the guided catalog purchase. Unrated Thin-blood choices are creation-only."):(kind==="blood-potency"?"A Potência de Sangue dos Sangues-Ralos permanece em 0.":"Itens conhecidos usam a compra guiada do catálogo. Escolhas especiais de Sangue-Ralo são exclusivas da criação.")}</p>}
    {kind==="discipline"&&!chosen&&<p className="xp-help"><UiText text="Adicione uma Disciplina na etapa Disciplinas antes de comprá-la."/></p>}
    {magic&&CONTENT_INDEX.some(entry=>entry.id===magic.id)&&<ContentDetails id={magic.id} name={contentName(magic.name,locale,{discipline:magic.discipline,book:magic.source.book})} book={magic.source.book}/>}
    {kind==="advantage"&&chosen==="__new__"&&<p className="xp-help"><UiText text="A nova Vantagem entrará na lista com origem “Compra com XP”."/></p>}
    {isMagic&&magicOptions.length===0&&<p className="xp-help"><UiText text="Nenhuma opção disponível para o nível das Disciplinas e as fontes ativas."/></p>}
    <div className="xp-buy"><span>{kind==="specialty"?<UiText text="Nova especialização"/>:kind==="blood-potency"?`Potência ${current} → ${current+1}`:isMagic?`${chosen||"Escolha uma opção"} · nível ${magic?.level||"?"}`:`${targetName||"Escolha uma característica"} ${current} → ${current+1}`} · {cost} <UiText text=" XP"/></span><button type="button" disabled={!valid} onClick={()=>{props.onPurchase(kind,targetName,kind==="specialty"?specialtyName.trim():undefined);if(kind==="specialty")setSpecialtyName("");if(kind==="advantage"&&chosen==="__new__")setNewAdvantage("")}}><UiText text="Comprar com XP"/></button></div>
    {props.purchases.length>0&&<div className="xp-history"><h3><UiText text="Compras registradas"/></h3>{props.purchases.map((purchase,index)=><p key={`${purchase.kind}-${purchase.name}-${index}`}><span>{catalogPurchaseName(purchase,locale)} · {purchase.from} → {purchase.to}</span><strong>{purchase.cost} <UiText text=" XP"/></strong></p>)}<button type="button" onClick={props.onUndo}><UiText text="Desfazer última compra"/></button></div>}
  </div>;
}
