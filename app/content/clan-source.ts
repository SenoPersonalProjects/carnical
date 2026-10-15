import {sourcebookForLibraryId} from "../creation-sources";
import {resolveContent} from "./resolve";

/** Select a compatible enabled edition without changing saved character data. */
export function clanSource(name:string,primary:string,activeSources:ReadonlySet<string>,preferred?:string){
 const books=resolveContent(name,{kind:"clan"})?.books||[];
 const sources=books.map(book=>sourcebookForLibraryId(book)).filter((source):source is string=>!!source);
 if(preferred&&sources.includes(preferred)&&activeSources.has(preferred))return preferred;
 if(activeSources.has(primary))return primary;
 return sources.find(source=>activeSources.has(source))||primary;
}
