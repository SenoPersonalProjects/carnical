import raw from "./catalog-index.json";
import type { ContentKind } from "./types";
export type ContentIndexEntry={id:string;kind:ContentKind;names:Record<"pt-BR"|"en",string>;aliases:string[];discipline?:string;level?:number;books:string[];versions?:Array<{id:string;book:string;sourceTitle:string;level?:number;requirements?:{disciplines?:Record<string,number>;prerequisites?:string[]}}>};
export const CONTENT_INDEX=raw.entries as ContentIndexEntry[];
export const foldContent=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("en").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
export function resolveContent(name:string,{kind,kinds,discipline,book}:{kind?:ContentKind;kinds?:ContentKind[];discipline?:string;book?:string}={}) {
  const folded=foldContent(name);
  const matches=CONTENT_INDEX.filter(entry=>(!kind||entry.kind===kind)&&(!kinds||kinds.includes(entry.kind))&&(!discipline||entry.discipline===discipline)&&(!book||entry.books.includes(book))&&[entry.names.en,entry.names["pt-BR"],...entry.aliases].some(alias=>foldContent(alias)===folded));
  return matches.length===1?matches[0]:undefined;
}
