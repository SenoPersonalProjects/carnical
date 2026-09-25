import { SOURCEBOOKS } from "./sourcebooks";

export const DEFAULT_ACTIVE_SOURCEBOOKS = SOURCEBOOKS.map(source => source.value);

export function normalizeActiveSourcebooks(value: unknown): string[] {
  if (!Array.isArray(value)) return [...DEFAULT_ACTIVE_SOURCEBOOKS];
  const selected = new Set(value.filter((item): item is string => typeof item === "string"));
  selected.add("core_v5_ptbr");
  return SOURCEBOOKS.filter(source => selected.has(source.value)).map(source => source.value);
}

export function sourcebookForLibraryId(libraryId: string): string | undefined {
  return SOURCEBOOKS.find(source => source.libraryId === libraryId)?.value;
}
