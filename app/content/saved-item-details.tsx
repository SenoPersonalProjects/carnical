"use client";
import {usePreferredLocale} from "../preferences";
import {SOURCEBOOKS} from "../sourcebooks";
import ContentDetails from "./content-details";
import {contentById,resolveContent} from "./resolve";

/** Source and identity are explicit for new items; ambiguous personal items stay personal. */
export default function SavedItemDetails({item,flaw=false}:{item:{name:string;source:string;catalogId?:string;versionId?:string};flaw?:boolean}){
 const locale=usePreferredLocale();
 if(["custom","personalizado","conteúdo personalizado","homebrew"].includes(item.source.toLocaleLowerCase("pt-BR")))return null;
 const book=SOURCEBOOKS.find(source=>source.value===item.source||source.libraryId===item.source)?.libraryId;
 const entry=item.catalogId?contentById(item.catalogId):resolveContent(item.name,{kinds:flaw?["flaw"]:["merit","background","loresheet"],book});
 if(!entry||!(flaw?entry.kind==="flaw":["merit","background","loresheet"].includes(entry.kind)))return null;
 const version=item.versionId?entry.versions?.find(version=>version.id===item.versionId&&(!book||version.book===book)):entry.versions?.find(version=>!book||version.book===book);
 if(!version)return null;
 return <ContentDetails key={`${entry.id}:${version.id}`} id={entry.id} name={version.names?.[locale]||entry.names[locale]} book={version.book} initialVersion={version.id}/>;
}
