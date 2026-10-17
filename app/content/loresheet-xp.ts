import {xpCost,type XpCostMode,type XpKind} from "../experience";
import {indexedItem,type KnownItem} from "./item-eligibility";
/** Only explicit indexed choices affect new prices; saved purchase costs stay intact. */
export function catalogClanDisciplines(base:readonly string[],clan:string,items:ReadonlyArray<KnownItem>){
 const result=new Set(base);
 for(const item of items){const {entry,version}=indexedItem(item),discipline=version?.requirements?.clanDiscipline;
  if(discipline&&(!version?.requirements?.clans||version.requirements.clans.includes(clan))&&entry)result.add(discipline);
 }
 return [...result];
}
export function loresheetXpCost(kind:XpKind,newLevel:number,mode:XpCostMode,items:ReadonlyArray<KnownItem>,name?:string,clan?:string){
 const ordinary=xpCost(kind,newLevel,mode);
 if(kind==="skill"&&clan==="Toreador"&&items.some(item=>{const {entry,version}=indexedItem(item);return entry?.id==="loresheet-descendant-of-helena"&&version?.requirements?.independentChoice==="2"&&item.instanceName?.split(" / ")[0]===name}))return Math.floor(ordinary/2);
 return ordinary;
}
export function backgroundXpRate(items:ReadonlyArray<KnownItem>,id:string){
 return id==="core-background-resources"&&items.some(item=>{const {entry,version}=indexedItem(item);return entry?.id==="bloodline-bankers-of-dunsirn"&&version?.requirements?.independentChoice==="4"})?2:3;
}
