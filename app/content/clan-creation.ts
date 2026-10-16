import type {CreationItem} from "./creation-item-effects";
import {indexedItem} from "./item-eligibility";

/** Runs only on an explicit clan choice; never silently migrates a saved sheet. */
export function clanCreationFlaws(items:CreationItem[],clan:string):CreationItem[]{
 const granted=items.find(item=>item.source==="clan:caitiff");
 const ordinary=items.filter(item=>item.source!=="clan:caitiff");
 if(clan!=="Caitiff")return ordinary;
 if(granted)return [...ordinary,granted];
 const existing=ordinary.find(item=>indexedItem(item).entry?.id==="core-background-suspect");
 const item:CreationItem={...existing,name:existing?.name||"Suspeito",dots:1,source:"clan:caitiff",notes:existing?.notes||"Concedido pelo clã. Defina a facção ofendida com o Narrador.",catalogId:"core-background-suspect",versionId:"core-background-suspect-core-v5-1",instanceId:existing?.instanceId||crypto.randomUUID(),instanceName:existing?.instanceName||"Comunidade vampírica local"};
 return [...ordinary.filter(other=>other!==existing),item];
}
