"use client";

import { useState } from "react";
import { isPredatorItem } from "./predator-benefits";
import { xpBudget, xpCost, xpSpent, type XpCostMode, type XpKind, type XpPurchase } from "./experience";
import { POWER_CATALOG } from "./game-rules";
import { sourcebookForLibraryId } from "./creation-sources";

export type PurchaseIntent="attribute"|"skill"|"discipline"|"specialty"|"advantage"|"blood-potency"|"ritual"|"ceremony"|"formula";
type Props={
  ageCategory:string;total:string;spent:string;purchases:XpPurchase[];
  costMode:XpCostMode; linkedChronicle?:string; creationXp?:number; earnedXp?:number;
  awards?:Array<{id:string;amount:number;note:string;created_at:string}>;onRefresh?:()=>void;
  attributes:Record<string,number>;skills:Record<string,number>;disciplines:Record<string,number>;
  clanDisciplines:string[];clan:string;bloodPotency:number;
  merits:Array<{name:string;dots:number;source:string}>;specialties:Array<{skill:string;name:string}>;
  activeSources:ReadonlySet<string>;disciplinePowers:Record<string,string[]>;
  onTotal:(value:string)=>void;onPurchase:(kind:PurchaseIntent,name:string,skill?:string)=>void;onUndo:()=>void;
};

export default function XpPurchasePanel(props:Props){
  const [kind,setKind]=useState<PurchaseIntent>("skill"),[name,setName]=useState(""),[specialtyName,setSpecialtyName]=useState(""),[newAdvantage,setNewAdvantage]=useState("");
  const isMagic=kind==="ritual"||kind==="ceremony"||kind==="formula";
  const magicOptions=isMagic?POWER_CATALOG.filter(item=>item.kind===kind&&props.activeSources.has(sourcebookForLibraryId(item.source.book)??"")&&(props.disciplines[item.discipline]||0)>=item.level&&(!item.prerequisite||props.disciplinePowers[item.discipline]?.includes(item.prerequisite))&&!props.disciplinePowers[item.discipline]?.includes(item.name)):[];
  const options=kind==="attribute"?Object.keys(props.attributes):kind==="skill"?Object.keys(props.skills):kind==="discipline"?Object.keys(props.disciplines):kind==="specialty"?Object.keys(props.skills):kind==="advantage"?[...props.merits.filter(item=>!isPredatorItem(item)).map(item=>item.name),"__new__"]:isMagic?magicOptions.map(item=>item.name):[];
  const chosen=options.includes(name)?name:options[0]||"";
  const targetName=kind==="advantage"&&chosen==="__new__"?newAdvantage.trim():chosen;
  const magic=magicOptions.find(item=>item.name===chosen);
  const current=kind==="attribute"?props.attributes[chosen]||0:kind==="skill"?props.skills[chosen]||0:kind==="discipline"?props.disciplines[chosen]||0:kind==="blood-potency"?props.bloodPotency:kind==="advantage"?props.merits.find(item=>item.name===targetName&&!isPredatorItem(item))?.dots||0:0;
  const disciplineKind:XpKind=props.clan==="Caitiff"?"caitiff-discipline":props.clan==="Sangue-Ralo"&&chosen==="Alquimia do Sangue-Fraco"||props.clanDisciplines.includes(chosen)?"clan-discipline":"other-discipline";
  const cost=xpCost(kind==="discipline"?disciplineKind:kind,isMagic?magic?.level||0:current+1,props.costMode);
  const budget=xpBudget(props.total,props.ageCategory),used=xpSpent(props.spent,props.purchases),remaining=budget-used;
  const duplicateSpecialty=kind==="specialty"&&props.specialties.some(item=>item.skill===chosen&&item.name.trim().toLocaleLowerCase("pt-BR")===specialtyName.trim().toLocaleLowerCase("pt-BR"));
  const valid=cost>0&&remaining>=cost&&(isMagic||current<5)&&(kind==="blood-potency"||!!targetName)&&(kind!=="specialty"||!!specialtyName.trim()&&!duplicateSpecialty)&&(kind!=="advantage"||chosen!=="__new__"||!props.merits.some(item=>item.name.toLocaleLowerCase("pt-BR")===targetName.toLocaleLowerCase("pt-BR")&&!isPredatorItem(item)));
  return <div className="xp-panel">
    <p>A distribuição inicial permanece separada. Compras registradas aqui não alteram as metas da criação. {props.costMode==="current_level"?"Nesta crônica, aumentos usam o nível atual (mínimo 1) × fator.":"A regra padrão usa o novo nível × fator."}</p>
    <div className="xp-balance"><div><span>XP disponível</span><strong>{budget}</strong></div><div><span>XP gasto</span><strong>{used}</strong></div><div><span>Saldo</span><strong>{remaining}</strong></div></div>
    {props.linkedChronicle?<div className="xp-source"><strong>{props.linkedChronicle}</strong><span>{props.creationXp??0} XP da criação + {props.earnedXp??0} XP concedidos pelo mestre</span><button type="button" onClick={props.onRefresh}>Atualizar concessões</button></div>:<label className="field"><span>XP total da ficha, incluindo o inicial</span><input type="number" min={0} value={props.total===""?budget:props.total} onChange={event=>props.onTotal(event.target.value)}/></label>}
    <small className="xp-help">{props.ageCategory==="Neófito"?"Neófito: 15 XP iniciais.":props.ageCategory==="Ancilla"?"Ancilla: 35 XP iniciais.":"Esta categoria não recebe XP inicial pela regra-base."} {props.linkedChronicle?"O mestre controla as concessões de missão.":"Ajuste o total se a crônica livre conceder mais XP."}</small>
    {props.awards?.length? <div className="xp-history"><h3>XP recebido</h3>{props.awards.map(award=><p key={award.id}><span>{award.note||"Concessão do mestre"} · {new Date(award.created_at).toLocaleDateString("pt-BR")}</span><strong>+{award.amount} XP</strong></p>)}</div>:null}
    <div className="form-grid compact"><label className="field"><span>Comprar</span><select value={kind} onChange={event=>{setKind(event.target.value as PurchaseIntent);setName("")}}><option value="attribute">Atributo</option><option value="skill">Habilidade</option><option value="discipline">Disciplina</option><option value="specialty">Especialização</option><option value="advantage">Vantagem</option><option value="blood-potency">Potência de Sangue</option><option value="ritual">Ritual de Sangue</option><option value="ceremony">Cerimônia de Oblívio</option><option value="formula">Fórmula de Sangue-Ralo</option></select></label>{kind!=="blood-potency"&&<label className="field"><span>{kind==="specialty"?"Habilidade":isMagic?"Regra":"Característica"}</span><select value={chosen} onChange={event=>setName(event.target.value)}>{isMagic?magicOptions.map(option=><option key={option.id} value={option.name}>{option.name} · nível {option.level} · {option.source.label}</option>):options.map(option=><option key={option} value={option}>{option==="__new__"?"Nova vantagem":option}</option>)}</select></label>}{kind==="specialty"&&<label className="field"><span>Nome da especialização</span><input value={specialtyName} onChange={event=>setSpecialtyName(event.target.value)} placeholder="Ex.: Vigilância"/></label>}{kind==="advantage"&&chosen==="__new__"&&<label className="field"><span>Nome da nova vantagem</span><input value={newAdvantage} onChange={event=>setNewAdvantage(event.target.value)} placeholder="Ex.: Recursos"/></label>}</div>
    {kind==="discipline"&&!chosen&&<p className="xp-help">Adicione uma Disciplina na etapa Disciplinas antes de comprá-la.</p>}
    {kind==="advantage"&&chosen==="__new__"&&<p className="xp-help">A nova Vantagem entrará na lista com origem “Compra com XP”.</p>}
    {isMagic&&magicOptions.length===0&&<p className="xp-help">Nenhuma opção disponível para o nível das Disciplinas e as fontes ativas.</p>}
    <div className="xp-buy"><span>{kind==="specialty"?"Nova especialização":kind==="blood-potency"?`Potência ${current} → ${current+1}`:isMagic?`${chosen||"Escolha uma opção"} · nível ${magic?.level||"?"}`:`${targetName||"Escolha uma característica"} ${current} → ${current+1}`} · {cost} XP</span><button type="button" disabled={!valid} onClick={()=>{props.onPurchase(kind,targetName,kind==="specialty"?specialtyName.trim():undefined);if(kind==="specialty")setSpecialtyName("");if(kind==="advantage"&&chosen==="__new__")setNewAdvantage("")}}>Comprar com XP</button></div>
    {props.purchases.length>0&&<div className="xp-history"><h3>Compras registradas</h3>{props.purchases.map((purchase,index)=><p key={`${purchase.kind}-${purchase.name}-${index}`}><span>{purchase.name} · {purchase.from} → {purchase.to}</span><strong>{purchase.cost} XP</strong></p>)}<button type="button" onClick={props.onUndo}>Desfazer última compra</button></div>}
  </div>;
}
