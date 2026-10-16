import {contentById,sameContent} from "./resolve";
import {indexedItem,itemEligibility,type ItemContext} from "./item-eligibility";
import {sourcebookForLibraryId} from "../creation-sources";
import {isPredatorItem} from "../predator-benefits";
import type {CreationItem} from "./creation-item-effects";
import type {XpPurchase} from "../experience";

export function catalogPurchaseName(purchase:XpPurchase,locale:"pt-BR"|"en"){
 const entry=purchase.catalogId?contentById(purchase.catalogId):undefined;
 const version=entry?.versions?.find(version=>version.id===purchase.versionId);
 return version?.names?.[locale]||entry?.names[locale]||purchase.name;
}

/** Rated items are bought at their printed ratings, never at an invented first dot. */
export function catalogAdvantageQuote(id:string,versionId:string,items:ReadonlyArray<CreationItem>,context:ItemContext){
 const entry=contentById(id),version=entry?.versions?.find(item=>item.id===versionId);
 if(!entry||!version||!["merit","background","loresheet"].includes(entry.kind)||!itemEligibility(version,{...context,phase:"xp"}).allowed||version.grants)return undefined;
 const to=version.level??entry.level??0;
 const matches=items.filter(item=>indexedItem(item).entry?.id===id||sameContent(item.name,entry.names["pt-BR"],{kind:entry.kind}));
 if(matches.length>1)return undefined;
 const existing=matches[0],old=existing?indexedItem(existing):undefined;
 if(existing&&(isPredatorItem(existing)||!old?.version||old.version.book!==version.book))return undefined;
 const from=existing?.dots??0;
 if(!Number.isInteger(to)||to<=from||to>5||from<0)return undefined;
 return {entry,version,existing,from,to,cost:(to-from)*3};
}
export function purchasedCatalogAdvantage(quote:NonNullable<ReturnType<typeof catalogAdvantageQuote>>){
 const {entry,version,existing,from,to,cost}=quote;
 const item:CreationItem={...existing,name:version.names?.["pt-BR"]||entry.names["pt-BR"],dots:to,source:sourcebookForLibraryId(version.book)||version.book,notes:existing?.notes||"Comprada com XP",catalogId:entry.id,versionId:version.id};
 const purchase:XpPurchase={kind:"advantage",name:item.name,from,to,cost,catalogId:entry.id,versionId:version.id,...(existing?{previousAdvantage:{...existing}}:{})};
 return {item,purchase};
}
