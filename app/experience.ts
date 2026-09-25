export type XpKind="attribute"|"skill"|"clan-discipline"|"other-discipline"|"caitiff-discipline"|"specialty"|"advantage"|"blood-potency"|"ritual"|"ceremony"|"formula";
export type XpPurchase={kind:XpKind;name:string;from:number;to:number;cost:number};

export function startingXp(ageCategory?:string){return ageCategory==="Neófito"?15:ageCategory==="Ancilla"?35:0}
export function xpCost(kind:XpKind,newLevel:number){
  if(kind==="specialty")return 3;
  if(kind==="advantage")return 3;
  const factor:Record<Exclude<XpKind,"specialty"|"advantage">,number>={attribute:5,skill:3,"clan-discipline":5,"other-discipline":7,"caitiff-discipline":6,"blood-potency":10,ritual:3,ceremony:3,formula:3};
  return newLevel*factor[kind];
}
export function purchasedLevels(values:Record<string,number>,purchases:XpPurchase[],kind:XpKind){
  const base={...values};
  for(const purchase of [...purchases].reverse())if(purchase.kind===kind&&base[purchase.name]===purchase.to)base[purchase.name]=purchase.from;
  return base;
}
export function xpBudget(total:string,ageCategory:string){
  const manual=Number(total);
  return total.trim()!==""&&Number.isFinite(manual)?Math.max(0,manual):startingXp(ageCategory);
}
export function xpSpent(spent:string,purchases:XpPurchase[]){
  const recorded=Number(spent);
  const sum=purchases.reduce((total,purchase)=>total+purchase.cost,0);
  return Math.max(Number.isFinite(recorded)?recorded:0,sum);
}
