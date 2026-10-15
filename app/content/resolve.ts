import raw from "./catalog-index.json";
import type { ContentKind,ContentVersion } from "./types";
export type ContentIndexEntry={id:string;legacyIds?:string[];kind:ContentKind;names:Record<"pt-BR"|"en",string>;aliases:string[];discipline?:string;level?:number;books:string[];versions?:Array<Pick<ContentVersion,"id"|"book"|"sourceTitle"|"level"|"requirements"|"names">>};
export const CONTENT_INDEX=raw.entries as ContentIndexEntry[];
export function contentById(id:string){const matches=CONTENT_INDEX.filter(entry=>entry.id===id||entry.legacyIds?.includes(id));return matches.length===1?matches[0]:undefined}
export const foldContent=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("en").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
export function resolveContent(name:string,{kind,kinds,discipline,book}:{kind?:ContentKind;kinds?:ContentKind[];discipline?:string;book?:string}={}) {
  const folded=foldContent(name);
  const matches=CONTENT_INDEX.filter(entry=>(!kind||entry.kind===kind)&&(!kinds||kinds.includes(entry.kind))&&(!discipline||entry.discipline===discipline)&&(!book||entry.books.includes(book))&&[entry.names.en,entry.names["pt-BR"],...entry.aliases].some(alias=>foldContent(alias)===folded));
  return matches.length===1?matches[0]:undefined;
}
export function contentName(name:string,locale:"pt-BR"|"en",filters:Parameters<typeof resolveContent>[1]={}){
  const entry=resolveContent(name,filters),version=filters.book?entry?.versions?.find(version=>version.book===filters.book):undefined;
  return version?.names?.[locale]||entry?.names[locale]||name;
}
/** Compare unambiguous catalog identities without rewriting saved names. */
export function sameContent(left:string,right:string,filters:Parameters<typeof resolveContent>[1]={}){
  if(foldContent(left)===foldContent(right))return true;
  const a=resolveContent(left,filters),b=resolveContent(right,filters);
  return !!a&&!!b&&a.id===b.id;
}
