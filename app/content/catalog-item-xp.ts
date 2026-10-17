import {contentById,sameContent} from "./resolve";
import {indexedItem,itemEligibility,catalogInstanceCount,ownsCatalogChoice,type ItemContext} from "./item-eligibility";
import {sourcebookForLibraryId} from "../creation-sources";
import {isPredatorItem,isPredatorPackageItem} from "../predator-benefits";
import type {CreationItem} from "./creation-item-effects";
import type {XpPurchase} from "../experience";
import {baneSeverity,DECAY_BACKGROUNDS} from "./clan-banes";
import {backgroundXpRate} from "./loresheet-xp";

export function catalogPurchaseName(purchase:XpPurchase,locale:"pt-BR"|"en"){
 const entry=purchase.catalogId?contentById(purchase.catalogId):undefined;
 const version=entry?.versions?.find(version=>version.id===purchase.versionId);
 return (version?.names?.[locale]||entry?.names[locale]||purchase.name)+(purchase.instanceName?` — ${purchase.instanceName}`:"");
}

export function catalogItemKey(item:CreationItem,index:number){return item.instanceId||`legacy:${index}:${JSON.stringify([item.name,item.source,item.dots,item.versionId])}`}

/** Rated items are bought at their printed ratings, never at an invented first dot. */
export function catalogAdvantageQuote(id:string,versionId:string,items:ReadonlyArray<CreationItem>,context:ItemContext,target?:string){
 const entry=contentById(id),version=entry?.versions?.find(item=>item.id===versionId);
 if(!entry||!version||!["merit","background","loresheet"].includes(entry.kind)||!itemEligibility(version,{...context,phase:"xp"}).allowed||version.grants)return undefined;
 const to=version.level??entry.level??0;
 if(version.requirements?.independentChoice){if(target&&target!=="new"||ownsCatalogChoice(id,version,items)||!Number.isInteger(to)||to<1||to>5)return undefined;return {entry,version,existing:undefined,from:0,to,surcharge:0,cost:to*3}}
 const matches=items.filter(item=>indexedItem(item).entry?.id===id||sameContent(item.name,entry.names["pt-BR"],{kind:entry.kind}));
 if(!target&&matches.length>1)return undefined;
 const existing=target==="new"?undefined:target?items.find((item,index)=>catalogItemKey(item,index)===target):matches[0];
 if(target&&target!=="new"&&(!existing||!matches.includes(existing)))return undefined;
 if(target==="new"&&matches.length&&!version.requirements?.repeatableInstances)return undefined;
 if(!existing&&version.requirements?.maxInstances&&catalogInstanceCount(items,id)>=version.requirements.maxInstances)return undefined;
 const old=existing?indexedItem(existing):undefined;
 if(existing&&["custom","personalizado","conteúdo personalizado","homebrew"].includes(existing.source.toLocaleLowerCase("pt-BR")))return undefined;
 if(existing&&(!old?.version&&!target||old?.version&&old.version.book!==version.book))return undefined;
 const from=existing?.dots??0;
 if(!Number.isInteger(to)||to<=from||to>(entry.kind==="background"?6:5)||from<0)return undefined;
 const decay=context.clanBaneId==="bane-hecata"&&DECAY_BACKGROUNDS.includes(entry.id);
 if(decay&&!context.decayXpMode)return undefined;
 const surcharge=decay?baneSeverity(context.bloodPotency??1)*(context.decayXpMode==="per_dot"?to-from:1):0;
 const rate=context.clan==="Hecata"?backgroundXpRate(context.items||items,entry.id):3;
 return {entry,version,existing,from,to,surcharge,cost:(to-from)*rate+surcharge};
}
export function purchasedCatalogAdvantage(quote:NonNullable<ReturnType<typeof catalogAdvantageQuote>>,instanceName?:string){
 const {entry,version,existing,from,to,cost}=quote;
 const oldVersion=existing?indexedItem(existing).version:undefined;
 const savedName=existing?.instanceName||(existing&&entry.kind==="background"&&![...Object.values(entry.names),...Object.values(oldVersion?.names||{})].includes(existing.name)?existing.name:undefined)||instanceName?.trim();
 const item:CreationItem={...existing,name:version.names?.["pt-BR"]||entry.names["pt-BR"],dots:to,source:existing&&isPredatorPackageItem(existing)?existing.source:sourcebookForLibraryId(version.book)||version.book,notes:existing?.notes||"Comprada com XP",catalogId:entry.id,versionId:version.id,instanceId:existing?.instanceId||crypto.randomUUID(),...(savedName?{instanceName:savedName}:{}),...(existing&&isPredatorItem(existing)?{predatorBaseDots:existing.predatorBaseDots??from}:{})};
 const purchase:XpPurchase={...(quote.surcharge?{baneSurcharge:quote.surcharge}:{}),kind:"advantage",name:item.name,from,to,cost,catalogId:entry.id,versionId:version.id,itemInstanceId:item.instanceId,...(item.instanceName?{instanceName:item.instanceName}:{}),...(existing?{previousAdvantage:{...existing}}:{})};
 return {item,purchase};
}
