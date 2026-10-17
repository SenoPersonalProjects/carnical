import {sourcebookForLibraryId} from "../creation-sources";
import {SOURCEBOOKS} from "../sourcebooks";
import {knowsPower} from "./power-eligibility";
import {contentById,foldContent,resolveContent,type ContentIndexEntry} from "./resolve";
export type IndexedVersion=NonNullable<ContentIndexEntry["versions"]>[number];
export type KnownItem={name:string;source?:string;dots?:number;catalogId?:string;versionId?:string;instanceId?:string;instanceName?:string};
/** Resolve a saved version only when source, recorded name or dots make it unique. */
export function indexedItem(item:KnownItem){
 if(["custom","personalizado","conteúdo personalizado","homebrew"].includes(item.source?.toLocaleLowerCase("pt-BR")||""))return {entry:undefined,version:undefined};
 const entry=item.catalogId?contentById(item.catalogId):resolveContent(item.name,{kinds:["merit","flaw","background","loresheet"]});
 const book=SOURCEBOOKS.find(source=>source.value===item.source||source.libraryId===item.source)?.libraryId;
 const versions=entry?.versions?.filter(version=>!book||version.book===book)||[];
 let version:IndexedVersion|undefined;
 if(item.versionId)version=versions.find(version=>version.id===item.versionId);
 else{
  const named=versions.filter(version=>Object.values(version.names||{}).some(name=>foldContent(name)===foldContent(item.name)));
  if(named.length===1)version=named[0];
  else if(versions.length===1)version=versions[0];
  else if(typeof item.dots==="number"){const rated=versions.filter(version=>version.level===item.dots);if(rated.length===1)version=rated[0]}
 }
 return {entry,version};
}
export function hasCreationTrait(items:ReadonlyArray<KnownItem>,id:string){return items.some(item=>{const resolved=indexedItem(item);return resolved.entry?.id===id&&!!resolved.version})}
export function thinBloodChoiceCounts(items:ReadonlyArray<KnownItem>){let merits=0,flaws=0;for(const item of items){const group=indexedItem(item).version?.requirements?.selectionGroup;if(group==="thin-blood-merit")merits++;if(group==="thin-blood-flaw")flaws++}return {merits,flaws,balanced:merits>=1&&merits<=3&&merits===flaws}}
export type ItemContext={configuredBaneId?:string;skills?:Record<string,number>;clanBaneId?:string;bloodPotency?:number;decayXpMode?:"per_purchase"|"per_dot";phase:"creation"|"xp";clan:string;ageCategory?:string;characterType?:"vampire"|"ghoul"|"mortal";activeSources:ReadonlySet<string>;disciplines?:Record<string,number>;powers?:Record<string,string[]>;items?:ReadonlyArray<KnownItem>};
export function itemEligibility(version:IndexedVersion,context:ItemContext){
 const reasons:string[]=[],requirements=version.requirements;
 if(!context.activeSources.has(sourcebookForLibraryId(version.book)||""))reasons.push("Fonte desativada");
 if(requirements?.clans?.length&&!requirements.clans.includes(context.clan))reasons.push(`Exige o clã ${requirements.clans.join(" / ")}`);
 if(requirements?.excludedClans?.includes(context.clan))reasons.push(`Não disponível para ${context.clan}`);
 if(context.clanBaneId==="bane-tzimisce"&&version.id==="core-trait-folkloric-block-core-v5-uninvited")reasons.push("Cortesia Amaldiçoada impede o Tabu Folclórico de entrada sem convite");
 if(requirements?.ancillaOrOlder&&!["Ancilla","Personalizada"].includes(context.ageCategory||""))reasons.push("Exige ancilla ou mais velho; confirme categorias personalizadas com o Narrador");
 if(requirements?.standardBaneOnly&&context.configuredBaneId)reasons.push("Exige a Perdição padrão; a combinação com uma variante da crônica precisa de revisão do Narrador");
 if(requirements?.maxBloodPotency!==undefined&&(context.bloodPotency??1)>requirements.maxBloodPotency)reasons.push(`Benefício exige Potência de Sangue ${requirements.maxBloodPotency} ou menor`);
 for(const name of requirements?.forbiddenDisciplines||[])if((context.disciplines?.[name]||0)>0)reasons.push(`Benefício exige não possuir pontos em ${name}`);
 for(const name of requirements?.zeroSkills||[])if((context.skills?.[name]||0)>0)reasons.push(`Exige ${name} 0`);
 if(context.phase==="creation"&&requirements?.creationExcludedClans?.includes(context.clan)&&!(version.id==="core-background-no-haven-core-v5-1"&&context.clanBaneId==="bane-ravnos"))reasons.push(`Não disponível para ${context.clan} na criação`);
 if(requirements?.creationOnly&&context.phase!=="creation")reasons.push("Disponível somente na criação");
 if(requirements?.characterTypes?.length&&!requirements.characterTypes.includes(context.characterType||"vampire"))reasons.push("Esta opção exige outro tipo de personagem");
 for(const [discipline,level] of Object.entries(requirements?.disciplines||{}))if((context.disciplines?.[discipline]||0)<level)reasons.push(`Exige ${discipline} ${level}`);
 for(const power of requirements?.prerequisites||[])if(!knowsPower(context.powers||{},power))reasons.push(`Exige o poder ${power}`);
 for(const alternatives of requirements?.prerequisiteAlternatives||[])if(!alternatives.some(power=>knowsPower(context.powers||{},power)))reasons.push(`Exige um dos poderes: ${alternatives.join(" / ")}`);
 const owned=new Set((context.items||[]).map(item=>indexedItem(item).entry?.id).filter(Boolean));
 for(const [id,level] of Object.entries(requirements?.itemRatings||{}))if(!(context.items||[]).some(item=>indexedItem(item).entry?.id===id&&(item.dots||0)>=level))reasons.push(`Exige ${contentById(id)?.names["pt-BR"]||id} ${level}`);
 for(const id of requirements?.items||[])if(!owned.has(id))reasons.push(`Exige ${contentById(id)?.names["pt-BR"]||id}`);
 for(const id of requirements?.incompatibleItems||[])if(owned.has(id))reasons.push(`Incompatível com ${contentById(id)?.names["pt-BR"]||id}`);
 if(requirements?.selectionGroup&&!context.items?.some(item=>item.versionId===version.id)){const counts=thinBloodChoiceCounts(context.items||[]),count=requirements.selectionGroup==="thin-blood-merit"?counts.merits:counts.flaws;if(count>=3)reasons.push("Limite de três escolhas especiais atingido")}
 return {allowed:reasons.length===0,reasons};
}

export function catalogInstanceCount(items:ReadonlyArray<KnownItem>,id:string){return items.filter(item=>{const found=indexedItem(item);return found.entry?.id===id&&!!found.version}).length}
export function catalogDetailValid(id:string,version:IndexedVersion,items:ReadonlyArray<KnownItem>,detail:string|undefined){
 const requirements=version.requirements,name=detail?.trim()||"";
 if((requirements?.requiresDetail||requirements?.repeatableInstances)&&!name)return false;
 if(requirements?.detailOptions&&!requirements.detailOptions.includes(name))return false;
 if(requirements?.maxInstances&&catalogInstanceCount(items,id)>=requirements.maxInstances)return false;
 if(requirements?.differentDetails&&items.some(item=>indexedItem(item).entry?.id===id&&!!indexedItem(item).version&&foldContent(item.instanceName||"")===foldContent(name)))return false;
 return true;
}
