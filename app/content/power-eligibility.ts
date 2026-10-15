import type {PowerRule} from "../game-rules";
import {sourcebookForLibraryId} from "../creation-sources";
import {CONTENT_INDEX} from "./resolve";
/** Prefer the original source when enabled; otherwise use an enabled reviewed version. */
export function powerForSources(power:PowerRule,activeSources:ReadonlySet<string>):PowerRule{
  const entry=CONTENT_INDEX.find(entry=>entry.id===power.id);
  const versions=entry?.versions?.filter(version=>activeSources.has(sourcebookForLibraryId(version.book)||""));
  const version=versions?.find(version=>version.book===power.source.book)||versions?.[0];
  if(!version)return power;
  const required=version.requirements?.disciplines;
  const amalgam=required?Object.entries(required).filter(([name])=>name!==power.discipline).map(([name,level])=>`${name} ${level}`).join(", "):power.amalgam;
  return {...power,level:version.level??required?.[power.discipline]??power.level,amalgam:amalgam||undefined,prerequisite:version.requirements?.prerequisites?.[0]??power.prerequisite,source:{...power.source,book:version.book as PowerRule["source"]["book"],label:version.sourceTitle,chapter:version.book===power.source.book?power.source.chapter:version.book==="companion-v5"?"companion-v5-parte-i-os-clas-e-suas-aptidoes":""}};
}
/** Constraints for guided choices; existing and custom sheet data stays editable. */
export function powerEligibility(power:PowerRule,disciplines:Record<string,number>,known:Record<string,string[]>,activeSources:ReadonlySet<string>){
  const reasons:string[]=[];
  if(!activeSources.has(sourcebookForLibraryId(power.source.book)||""))reasons.push("Fonte desativada");
  if((disciplines[power.discipline]||0)<power.level)reasons.push(`Exige ${power.discipline} ${power.level}`);
  if(power.amalgam){
    const parts=power.amalgam.split(/[,;]|\s+\+\s+/);
    for(const part of parts){const match=part.trim().match(/^(.+?)\s+(\d+)$/);if(match&&(disciplines[match[1]]||0)<Number(match[2]))reasons.push(`Amálgama: ${match[1]} ${match[2]}`)}
  }
  if(power.prerequisite&&!Object.values(known).some(names=>names.includes(power.prerequisite!)))reasons.push(`Exige o poder ${power.prerequisite}`);
  return {allowed:reasons.length===0,reasons};
}

/** Free magic choices granted during creation, independently of discipline powers. */
export function creationMagicEligibility(item:PowerRule,disciplines:Record<string,number>,known:Record<string,string[]>,activeSources:ReadonlySet<string>,freeChoices:ReadonlyArray<PowerRule>){
  const eligibility=powerEligibility(item,disciplines,known,activeSources);
  const level=disciplines[item.discipline]||0;
  if(item.kind==="ritual"||item.kind==="ceremony"){
    if(item.level!==1)eligibility.reasons.push("A escolha gratuita deve ser de nível 1");
    if(freeChoices.some(choice=>choice.kind===item.kind&&choice.id!==item.id))eligibility.reasons.push("A escolha gratuita já foi utilizada");
  }else if(item.kind==="formula"){
    if(freeChoices.filter(choice=>choice.kind==="formula"&&choice.id!==item.id).length>=level)eligibility.reasons.push("Todas as fórmulas gratuitas já foram escolhidas");
  }else eligibility.reasons.push("Este item não é uma escolha gratuita de magia");
  return {allowed:eligibility.reasons.length===0,reasons:eligibility.reasons};
}
