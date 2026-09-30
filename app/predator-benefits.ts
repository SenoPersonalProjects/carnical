import { PREDATOR_CHOICES, readPackageChoices } from "./predator-choices";
export type PredatorItem={name:string;dots:number;source:string;notes:string;benefitId?:string};
type Benefit={kind:"merit"|"flaw";name:string;dots:number;notes?:string};

// Fixed benefits from the predator packages. Choices stay editable in the sheet.
const BENEFITS:Record<string,Benefit[]>={
  "roadside-killer":[{kind:"merit",name:"Rebanho migratório",dots:2,notes:"Viajantes em trânsito; conferir a disponibilidade com o Narrador (Let the Streets Run Red, pp. 75–76)."},{kind:"flaw",name:"Exclusão de Presa: moradores locais",dots:1}],
  consensualista:[{kind:"flaw",name:"Segredo Sombrio: risco à Máscara",dots:1},{kind:"flaw",name:"Exclusão de Presa: sem consentimento",dots:1}],
  fazendeiro:[{kind:"flaw",name:"Vegano (Fazendeiro)",dots:2}],
  osiris:[{kind:"merit",name:"Fama / Rebanho",dots:3,notes:"Distribua os 3 pontos entre Fama e Rebanho conforme a regra."},{kind:"flaw",name:"Inimigos / Defeitos Míticos",dots:2,notes:"Distribua os 2 pontos conforme a regra."}],
  sacoleiro:[{kind:"merit",name:"Esôfago de Ferro",dots:3},{kind:"flaw",name:"Inimigo",dots:2}],
  sandman:[{kind:"merit",name:"Recursos",dots:1}],
  sanguessuga:[{kind:"flaw",name:"Segredo Sombrio / segregação",dots:2,notes:"Escolha a opção do tipo de Predador."},{kind:"flaw",name:"Exclusão de Presa: mortais",dots:2}],
  "scene-queen":[{kind:"merit",name:"Fama",dots:1},{kind:"merit",name:"Contatos",dots:1},{kind:"flaw",name:"Rivalidade / Exclusão de Presa",dots:1,notes:"Escolha o Defeito ligado à cena."}],
  sereia:[{kind:"merit",name:"Belo",dots:2},{kind:"flaw",name:"Inimigo",dots:1}],
  trinchador:[{kind:"merit",name:"Rebanho",dots:2},{kind:"flaw",name:"Segredo Sombrio: Trinchador",dots:1}],
  "vira-lata":[{kind:"merit",name:"Contatos criminosos",dots:3}],
  extortionist:[{kind:"merit",name:"Contatos / Recursos",dots:3,notes:"Distribua os 3 pontos entre Contatos e Recursos."},{kind:"flaw",name:"Inimigo",dots:2}],
  graverobber:[{kind:"merit",name:"Esôfago de Ferro",dots:3},{kind:"merit",name:"Refúgio",dots:1},{kind:"flaw",name:"Rebanho: Predador Óbvio",dots:2}],
  "grim-reaper":[{kind:"merit",name:"Aliados / Influência",dots:1,notes:"Escolha um dos dois antecedentes na comunidade médica."},{kind:"flaw",name:"Exclusão de Presa: mortais saudáveis",dots:1}],
  montero:[{kind:"merit",name:"Lacaios",dots:2}],
  pursuer:[{kind:"merit",name:"Faro para Sangue",dots:1},{kind:"merit",name:"Contatos",dots:1}],
  trapdoor:[{kind:"merit",name:"Refúgio",dots:1},{kind:"merit",name:"Lacaios / Rebanho / Refúgio",dots:1,notes:"Escolha onde aplicar o segundo ponto."},{kind:"flaw",name:"Refúgio: Assustador / Assombrado",dots:1}],
};

export function predatorBenefits(id:string){return BENEFITS[id]||[]}
export function isPredatorItem(item:{source?:string}){return item.source?.startsWith("predator:")??false}
export function isPredatorPackageItem(item:{source?:string}){return isPredatorItem(item)||(item.source?.startsWith("predator-required:")??false)}
export function ownItemDots(items:Array<{dots?:number;source?:string}>){return items.reduce((total,item)=>total+(isPredatorItem(item)?0:item.dots||0),0)}
export function grantedItemDots(items:Array<{dots?:number;source?:string}>){return items.reduce((total,item)=>total+(isPredatorItem(item)?item.dots||0:0),0)}
export function syncPredatorBenefits<T extends PredatorItem>(items:T[],id:string,kind:"merit"|"flaw",resolutions:Record<string,string>={}):T[]{
  const source=id==="osiris"?`predator-required:${id}`:`predator:${id}`;
  let next=items.filter(item=>!isPredatorPackageItem(item)||item.source===source);
  for(const [index,benefit] of predatorBenefits(id).filter(item=>item.kind===kind).entries()){
    const benefitId=`${id}:${kind}:${index}`;
    const choice=Object.entries(PREDATOR_CHOICES[id]||{}).find(([,spec])=>spec.kind===kind&&spec.index===index);
    if(choice){
      const [resolutionId,spec]=choice,selected=readPackageChoices(spec,resolutions[resolutionId]);
      const prefix=`${benefitId}:choice:`;
      if(selected){
        const previous=next.filter(item=>item.source===source&&(item.benefitId===benefitId||item.benefitId?.startsWith(prefix)));
        next=next.filter(item=>!(item.source===source&&(item.benefitId===benefitId||item.benefitId?.startsWith(prefix)||(!item.benefitId&&item.name===benefit.name))));
        for(const option of selected){const old=previous.find(item=>item.name===option.name);next.push({...old,name:option.name,dots:option.dots,source,benefitId:`${prefix}${option.name}`,notes:old?.notes||benefit.notes||"Escolha do tipo de Predador"} as T)}
        continue;
      }
      // Keep the last confirmed allocation while the replacement is incomplete.
      if(next.some(item=>item.source===source&&item.benefitId?.startsWith(prefix)))continue;
    }
    if(next.some(item=>item.source===source&&item.benefitId===benefitId))continue;
    const legacy=next.findIndex(item=>item.source===source&&item.name===benefit.name&&!item.benefitId);
    if(legacy>=0){next=next.map((item,itemIndex)=>itemIndex===legacy?{...item,benefitId}:item);continue}
    const existing=next.findIndex(item=>!isPredatorPackageItem(item)&&item.name.toLocaleLowerCase("pt-BR")===benefit.name.toLocaleLowerCase("pt-BR")&&item.dots===benefit.dots);
    if(existing>=0)next=next.map((item,itemIndex)=>itemIndex===existing?{...item,source,benefitId,notes:item.notes||benefit.notes||"Concedido pelo tipo de Predador"}:item);
    else next=[...next,{name:benefit.name,dots:benefit.dots,source,benefitId,notes:benefit.notes||"Concedido pelo tipo de Predador"} as T];
  }
  return next;
}
