import {indexedItem,itemEligibility,type ItemContext} from "./item-eligibility";
import {resolveContent} from "./resolve";
export function restrictedThinBloodXp(clan:string,intent:string,name:string){
 if(intent==="blood-potency"&&clan==="Sangue-Ralo")return true;
 return intent==="advantage"&&!!resolveContent(name,{kinds:["merit","flaw","background","loresheet"]});
}
export type CreationItem={name:string;dots:number;source:string;notes:string;catalogId?:string;versionId?:string;creationGrant?:{discipline:string;from:number;to:number}};
type CreationData={merits:CreationItem[];flawItems:CreationItem[];disciplines:Record<string,number>;disciplinePowers:Record<string,string[]>;xpPurchases:ReadonlyArray<{name:string;kind:string;catalogId?:string}>};
export function addCreationItem<T extends CreationData>(data:T,key:"merits"|"flawItems",item:CreationItem,context:ItemContext):{data:T;error?:string;errorEn?:string}{
 const {entry,version}=indexedItem(item);
 if(data[key].some(existing=>existing.catalogId===item.catalogId&&(!version?.requirements?.repeatableDifferentChoices||existing.versionId===item.versionId)))return {data};
 if(!entry||!version)return {data,error:"Não foi possível identificar a escolha e sua fonte.",errorEn:"Could not identify the choice and its source."};
 const check=itemEligibility(version,{...context,disciplines:data.disciplines,powers:data.disciplinePowers,items:[...data.merits,...data.flawItems]});
 if(!check.allowed)return {data,error:check.reasons.join(". "),errorEn:"The choice no longer meets its requirements. Review prerequisites, conflicting choices and the three-choice limit."};
 const value={...item,dots:version.level??item.dots},disciplines={...data.disciplines};
 if(version.grants){const {discipline,level}=version.grants,from=disciplines[discipline]||0;
  if(from!==0)return {data,error:`Revise os pontos e compras de ${discipline} antes de escolher esta Qualidade. Ela concede o primeiro ponto, sem duplicar uma compra existente.`,errorEn:"Review this Discipline’s dots and purchases before choosing the Merit. It grants the first dot without duplicating an existing purchase."};
  disciplines[discipline]=level;value.creationGrant={discipline,from,to:level};
 }
 return {data:{...data,disciplines,[key]:[...data[key],value]}};
}
export function removeCreationItem<T extends CreationData>(data:T,key:"merits"|"flawItems",index:number):{data:T;error?:string;errorEn?:string}{
 const item=data[key][index];if(!item)return {data};const expected=indexedItem(item).version?.grants,recorded=item.creationGrant;
 const grant=expected&&recorded?.discipline===expected.discipline&&recorded.to===expected.level&&recorded.from===0?recorded:undefined,disciplines={...data.disciplines};
 const id=indexedItem(item).entry?.id;
 if(id&&data.xpPurchases.some(purchase=>purchase.kind==="advantage"&&purchase.catalogId===id))return {data,error:"Desfaça as compras com XP deste item antes de removê-lo.",errorEn:"Undo this item’s XP purchases before removing it."};
 const remaining=[...data.merits.filter((_,i)=>key!=="merits"||i!==index),...data.flawItems.filter((_,i)=>key!=="flawItems"||i!==index)];
 const dependent=id?remaining.find(other=>indexedItem(other).version?.requirements?.items?.includes(id)):undefined;
 if(dependent)return {data,error:`Remova primeiro a escolha dependente: ${dependent.name}.`,errorEn:"Remove the dependent choice before removing its prerequisite."};
 if(grant){const upgraded=disciplines[grant.discipline]!==grant.to,known=(data.disciplinePowers[grant.discipline]||[]).length>0,paid=data.xpPurchases.some(purchase=>purchase.name===grant.discipline&&purchase.kind.includes("discipline"));
  if(upgraded||known||paid)return {data,error:`Retire os poderes e desfaça as compras de ${grant.discipline} antes de remover a Qualidade que concedeu seu primeiro ponto.`,errorEn:"Remove learned powers and undo purchases in this Discipline before removing the Merit that granted its first dot."};
  disciplines[grant.discipline]=grant.from;
 }
 return {data:{...data,disciplines,[key]:data[key].filter((_,i)=>i!==index)}};
}
