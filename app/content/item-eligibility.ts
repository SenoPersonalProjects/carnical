import {sourcebookForLibraryId} from "../creation-sources";
import {knowsPower} from "./power-eligibility";
import type {ContentIndexEntry} from "./resolve";
export type IndexedVersion=NonNullable<ContentIndexEntry["versions"]>[number];
export type ItemContext={phase:"creation"|"xp";clan:string;characterType?:"vampire"|"ghoul"|"mortal";activeSources:ReadonlySet<string>;disciplines?:Record<string,number>;powers?:Record<string,string[]>};
export function itemEligibility(version:IndexedVersion,context:ItemContext){
 const reasons:string[]=[],requirements=version.requirements;
 if(!context.activeSources.has(sourcebookForLibraryId(version.book)||""))reasons.push("Fonte desativada");
 if(requirements?.clans?.length&&!requirements.clans.includes(context.clan))reasons.push(`Exige o clã ${requirements.clans.join(" / ")}`);
 if(requirements?.creationOnly&&context.phase!=="creation")reasons.push("Disponível somente na criação");
 if(requirements?.characterTypes?.length&&!requirements.characterTypes.includes(context.characterType||"vampire"))reasons.push("Esta opção exige outro tipo de personagem");
 for(const [discipline,level] of Object.entries(requirements?.disciplines||{}))if((context.disciplines?.[discipline]||0)<level)reasons.push(`Exige ${discipline} ${level}`);
 for(const power of requirements?.prerequisites||[])if(!knowsPower(context.powers||{},power))reasons.push(`Exige o poder ${power}`);
 for(const alternatives of requirements?.prerequisiteAlternatives||[])if(!alternatives.some(power=>knowsPower(context.powers||{},power)))reasons.push(`Exige um dos poderes: ${alternatives.join(" / ")}`);
 return {allowed:reasons.length===0,reasons};
}
