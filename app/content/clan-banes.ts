import {CONTENT_INDEX,contentById} from "./resolve";
import {indexedItem,type KnownItem} from "./item-eligibility";

export const CLAN_BANES=CONTENT_INDEX.filter(entry=>entry.kind==="clan-variant"&&entry.id.startsWith("bane-"));
/** Reject unknown IDs and mismatched clans; never apply a default alternative. */
export function normalizeClanBanes(value:unknown):Record<string,string>{
 if(!value||typeof value!=="object"||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value).filter(([clan,id])=>typeof id==="string"&&CLAN_BANES.some(entry=>entry.id===id&&entry.versions?.some(version=>version.requirements?.clans?.includes(clan)))));
}
export function selectedClanBane(clan:string,rules:{clanBanes?:unknown}|undefined,items:ReadonlyArray<KnownItem>=[]){
 const id=normalizeClanBanes(rules?.clanBanes)[clan];if(id)return contentById(id);
 const twice=items.some(item=>{if(typeof item.name!=="string")return false;const found=indexedItem(item);return found.entry?.id==="guide-flaw-twice-cursed"&&!!found.version});
 return twice?CLAN_BANES.find(entry=>entry.versions?.some(version=>version.requirements?.clans?.includes(clan))):undefined;
}
// Official corrected BloodPotencyTable.pdf: PS0 through PS10.
export function baneSeverity(potency:number){return [0,2,2,3,3,4,4,5,5,6,6][Math.max(0,Math.min(10,Math.trunc(potency)||0))]}
export function variantRemorsePool(base:number,clan:string,potency:number,rules:{clanBanes?:unknown},items:ReadonlyArray<KnownItem>=[]){return Math.max(1,base-(selectedClanBane(clan,rules,items)?.id==="bane-lasombra"?baneSeverity(potency):0))}
export function variantFrenzyPenalty(clan:string,potency:number,rules:{clanBanes?:unknown},fear:boolean,items:ReadonlyArray<KnownItem>=[]){return fear&&selectedClanBane(clan,rules,items)?.id==="bane-gangrel"?baneSeverity(potency):0}
export type DecayXpMode="per_purchase"|"per_dot";
export function decayXpMode(value:unknown):DecayXpMode|undefined{return value==="per_purchase"||value==="per_dot"?value:undefined}
export const DECAY_BACKGROUNDS=["core-background-haven","core-background-resources","core-background-retainers"];
export const DECAY_FLAWS=["core-background-no-haven","core-background-compromised","core-background-creepy","core-background-haunted","core-background-destitute","core-background-stalkers"];
export function decayCreationAdjustment(clan:string,potency:number,rules:{clanBanes?:unknown},buyoff:boolean,purchases:ReadonlyArray<{kind:string;from:number;to:number}>=[],items:ReadonlyArray<KnownItem>=[]){
 let initial=potency;for(const purchase of [...purchases].reverse())if(purchase.kind==="blood-potency"&&initial===purchase.to)initial=purchase.from;
 const amount=selectedClanBane(clan,rules,items)?.id==="bane-hecata"?baneSeverity(initial):0;return {severity:amount,extraFlaws:buyoff?0:amount,backgroundCost:buyoff?amount*2:0};
}
export function decayFlawDots(items:ReadonlyArray<KnownItem>){return items.filter(item=>typeof item.name==="string"&&!item.source?.startsWith("predator:")&&!item.source?.startsWith("predator-required:")&&DECAY_FLAWS.includes(indexedItem(item).entry?.id||"")).reduce((total,item)=>total+(item.dots||0),0)}
