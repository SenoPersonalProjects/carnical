import type {PowerRule} from "../game-rules";
import {sourcebookForLibraryId} from "../creation-sources";
import {contentById,resolveContent,sameContent} from "./resolve";
export function knowsPower(known:Record<string,string[]>,required:string){
  return Object.values(known).some(names=>names.some(name=>sameContent(name,required,{kind:"power"})));
}
export function powerRequirementReasons(power:PowerRule,known:Record<string,string[]>,clan?:string){
  const reasons:string[]=[];
  const entry=contentById(power.id)||resolveContent(power.name,{kind:power.kind||"power",discipline:power.discipline});
  const requirements=entry?.versions?.find(version=>version.book===power.source.book)?.requirements;
  const coveredByAlternatives=requirements?.prerequisiteAlternatives?.some(group=>group.includes(power.prerequisite||""));
  if(power.prerequisite&&!coveredByAlternatives&&!knowsPower(known,power.prerequisite))reasons.push(`Exige o poder ${power.prerequisite}`);
  if(clan&&requirements?.clans?.length&&!requirements.clans.includes(clan))reasons.push(`Exige o clã ${requirements.clans.join(" / ")}`);
  for(const required of requirements?.prerequisites||[])if(required!==power.prerequisite&&!knowsPower(known,required))reasons.push(`Exige o poder ${required}`);
  for(const alternatives of requirements?.prerequisiteAlternatives||[])if(!alternatives.some(required=>knowsPower(known,required)))reasons.push(`Exige um dos poderes: ${alternatives.join(" / ")}`);
  const firstGroup=requirements?.firstDisciplinePowerGroup;
  if(firstGroup?.length){
    const first=(known[power.discipline]||[]).find(name=>{const kind=resolveContent(name,{discipline:power.discipline})?.kind;return !kind||kind==="power"});
    if(first&&!firstGroup.some(name=>sameContent(first,name,{kind:"power",discipline:power.discipline})))reasons.push(`Deve ser o primeiro poder aprendido de ${power.discipline}`);
  }
  return reasons;
}
/** Prefer the original source when enabled; otherwise use an enabled reviewed version. */
export function powerForSources(power:PowerRule,activeSources:ReadonlySet<string>):PowerRule{
  const entry=contentById(power.id)||resolveContent(power.name,{kind:power.kind||"power",discipline:power.discipline});
  const versions=entry?.versions?.filter(version=>activeSources.has(sourcebookForLibraryId(version.book)||""));
  const version=versions?.find(version=>version.book===power.source.book)||versions?.[0];
  if(!version)return entry?{...power,id:entry.id}:power;
  const required=version.requirements?.disciplines;
  const amalgam=required?Object.entries(required).filter(([name])=>name!==power.discipline).map(([name,level])=>`${name} ${level}`).join(", "):power.amalgam;
  return {...power,id:entry?.id||power.id,level:version.level??required?.[power.discipline]??power.level,amalgam:amalgam||undefined,prerequisite:version.requirements?.prerequisites?.[0]??power.prerequisite,source:{...power.source,book:version.book as PowerRule["source"]["book"],label:version.sourceTitle,chapter:version.book===power.source.book?power.source.chapter:version.book==="companion-v5"?"companion-v5-parte-i-os-clas-e-suas-aptidoes":""}};
}
/** Equivalent renamed powers occupy one choice, while all saved aliases remain valid. */
export function powersForSources(powers:ReadonlyArray<PowerRule>,activeSources:ReadonlySet<string>){
  const result=new Map<string,PowerRule>();for(const power of powers){const version=powerForSources(power,activeSources);if(!result.has(version.id))result.set(version.id,version)}return [...result.values()];
}
/** Constraints for guided choices; existing and custom sheet data stays editable. */
export function powerEligibility(power:PowerRule,disciplines:Record<string,number>,known:Record<string,string[]>,activeSources:ReadonlySet<string>,clan?:string){
  const reasons:string[]=[];
  if(power.kind==="ceremony"&&clan==="Sangue-Ralo")reasons.push("Sangues-ralos não aprendem Cerimônias de Oblívio");
  if(!activeSources.has(sourcebookForLibraryId(power.source.book)||""))reasons.push("Fonte desativada");
  if((disciplines[power.discipline]||0)<power.level)reasons.push(`Exige ${power.discipline} ${power.level}`);
  if(power.amalgam){
    const parts=power.amalgam.split(/[,;]|\s+\+\s+/);
    for(const part of parts){const match=part.trim().match(/^(.+?)\s+(\d+)$/);if(match&&(disciplines[match[1]]||0)<Number(match[2]))reasons.push(`Amálgama: ${match[1]} ${match[2]}`)}
  }
  reasons.push(...powerRequirementReasons(power,known,clan));
  return {allowed:reasons.length===0,reasons};
}

/** Free magic choices granted during creation, independently of discipline powers. */
export function creationMagicEligibility(item:PowerRule,disciplines:Record<string,number>,known:Record<string,string[]>,activeSources:ReadonlySet<string>,freeChoices:ReadonlyArray<PowerRule>,clan?:string){
  const eligibility=powerEligibility(item,disciplines,known,activeSources,clan);
  const level=disciplines[item.discipline]||0;
  if(item.kind==="ritual"||item.kind==="ceremony"){
    if(item.level!==1)eligibility.reasons.push("A escolha gratuita deve ser de nível 1");
    if(freeChoices.some(choice=>choice.kind===item.kind&&choice.id!==item.id))eligibility.reasons.push("A escolha gratuita já foi utilizada");
  }else if(item.kind==="formula"){
    if(freeChoices.filter(choice=>choice.kind==="formula"&&choice.id!==item.id).length>=level)eligibility.reasons.push("Todas as fórmulas gratuitas já foram escolhidas");
  }else eligibility.reasons.push("Este item não é uma escolha gratuita de magia");
  return {allowed:eligibility.reasons.length===0,reasons:eligibility.reasons};
}
