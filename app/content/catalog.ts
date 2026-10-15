import raw from "./catalog.json";
import type { ContentEntry } from "./types";
export const CONTENT_CATALOG=raw.entries as ContentEntry[];
export function catalogEntry(id:string){const matches=CONTENT_CATALOG.filter(entry=>entry.id===id||entry.legacyIds?.includes(id));return matches.length===1?matches[0]:undefined}
export {foldContent} from "./resolve";
