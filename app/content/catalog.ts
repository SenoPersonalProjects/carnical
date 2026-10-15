import raw from "./catalog.json";
import type { ContentEntry } from "./types";
export const CONTENT_CATALOG=raw.entries as ContentEntry[];
export {foldContent} from "./resolve";
