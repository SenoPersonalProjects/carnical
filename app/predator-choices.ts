export type PackageChoice={name:string;dots:number};
export type ChoiceSpec={type:"allocation"|"select"|"flaws";points:number;kind:"merit"|"flaw";index:number;options:Array<{name:string;dots?:number}>;creation?:boolean};
export const PREDATOR_CHOICES:Record<string,Record<string,ChoiceSpec>>={
  osiris:{
    "fame-herd":{type:"allocation",points:3,kind:"merit",index:0,creation:true,options:[{name:"Fama"},{name:"Rebanho"}]},
    "osiris-flaws":{type:"flaws",points:2,kind:"flaw",index:0,creation:true,options:[{name:"Inimigo"},{name:"Isca de Estaca",dots:2},{name:"Perdição Folclórica",dots:1},{name:"Tabu Folclórico",dots:1},{name:"Estigma",dots:1}]},
  },
  extortionist:{"contacts-resources":{type:"allocation",points:3,kind:"merit",index:0,options:[{name:"Contatos"},{name:"Recursos"}]}},
  "grim-reaper":{"medical-background":{type:"select",points:1,kind:"merit",index:0,options:[{name:"Aliados"},{name:"Influência"}]}},
  trapdoor:{
    "second-background":{type:"select",points:1,kind:"merit",index:1,options:[{name:"Lacaios"},{name:"Rebanho"},{name:"Refúgio"}]},
    "haven-flaw":{type:"select",points:1,kind:"flaw",index:0,options:[{name:"Refúgio: Assustador"},{name:"Refúgio: Assombrado"}]},
  },
  sanguessuga:{"dark-secret":{type:"select",points:2,kind:"flaw",index:0,options:[{name:"Segredo Sombrio: Diablerista"},{name:"Segregado"}]}},
  "scene-queen":{"scene-flaw":{type:"select",points:1,kind:"flaw",index:0,options:[{name:"Influência: Rivalidade"},{name:"Exclusão de Presa: outra subcultura"}]}},
};
export function readPackageChoices(spec:ChoiceSpec,value:string|undefined):PackageChoice[]|null {
  if(!value)return null;
  try{
    const raw=spec.type==="select"?[{name:value,dots:spec.points}]:spec.type==="allocation"?Object.entries(JSON.parse(value)).filter(([,dots])=>dots!==0).map(([name,dots])=>({name,dots})):JSON.parse(value);
    if(!Array.isArray(raw)||!raw.length)return null;
    const names=new Set<string>();let total=0;
    for(const item of raw){const option=spec.options.find(option=>option.name===item?.name);
      if(!option||names.has(item.name)||!Number.isInteger(item.dots)||item.dots<1||item.dots>spec.points||(option.dots!==undefined&&option.dots!==item.dots))return null;
      names.add(item.name);total+=item.dots;
    }
    return total===spec.points?raw:null;
  }catch{return null}
}
export function resolutionComplete(predatorId:string,resolutionId:string,value:string|undefined){
  const spec=PREDATOR_CHOICES[predatorId]?.[resolutionId];return spec?readPackageChoices(spec,value)!==null:!!value?.trim();
}
