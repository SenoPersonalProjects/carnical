import { healthCapacity } from "../derived-traits";
import { readAnchors, type Anchor } from "../anchors";
import { xpBudget, xpSpent, type XpPurchase } from "../experience";
import { bloodSession } from "../play/blood";

export type ExportCharacter = { name: string; concept: string; clan: string; sourcebook?: string; chronicleId?: string | null; data: object };
export type ExportRule = { id: string; name: string; source: string; sections: Array<{ title: string; text: string }> };
export type ExportSnapshot = ReturnType<typeof characterSnapshot>;
const string = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown, fallback = 0) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const values = (value: unknown): Record<string, number> => Object.fromEntries(Object.entries((value && typeof value === "object" ? value : {}) as object).filter(([, n]) => typeof n === "number" && Number.isFinite(n))) as Record<string, number>;
const items = (value: unknown): Array<{ name: string; dots: number; source: string; notes: string;catalogId?:string;versionId?:string }> => Array.isArray(value) ? value.map(item => ({ name: string(item.name), dots: number(item.dots), source: string(item.source), notes: string(item.notes),...(typeof item.catalogId==="string"?{catalogId:item.catalogId}:{}),...(typeof item.versionId==="string"?{versionId:item.versionId}:{}) })) : [];

/** Copy the current in-memory sheet once. Exporting never saves or mutates it. */
export function characterSnapshot(character: ExportCharacter) {
  const data = structuredClone(character.data) as Record<string, unknown>;
  const attributes = values(data.attributes), skills = values(data.skills), disciplines = values(data.disciplines);
  const healthMax = healthCapacity({ attributes, disciplines, disciplinePowers: data.disciplinePowers as Record<string, string[]> });
  const willpowerMax = (attributes.Autocontrole || 1) + (attributes.Determinação || 1);
  const anchors: Anchor[] = Array.isArray(data.convictionAnchors) ? data.convictionAnchors.map(a => ({ touchstone: string(a.touchstone), conviction: string(a.conviction) })) : readAnchors(string(data.touchstones), string(data.convictions));
  const purchases = (Array.isArray(data.xpPurchases) ? data.xpPurchases : []) as XpPurchase[];
  return {
    name: character.name, concept: character.concept, clan: character.clan === "Personalizado" ? string(data.customClan) : character.clan,
    sourcebook: character.sourcebook || "", linkedChronicle: !!character.chronicleId, customClan:character.clan==="Personalizado",
    identity: Object.fromEntries(["sire", "mortalName", "embraceYear", "trueAge", "apparentAge", "birthDate", "deathDate", "ageCategory", "generation", "chronicle", "resonance"].map(key => [key, string(data[key])])),
    attributes, skills, disciplines, powers: (data.disciplinePowers || {}) as Record<string, string[]>,
    specialties: Array.isArray(data.specialties) ? data.specialties.map(item => ({ skill: string(item.skill), name: string(item.name), source: string(item.source) })) : [],
    merits: items(data.merits), flaws: items(data.flawItems), anchors,
    predator: string(data.predator), predatorDiscipline: string(data.predatorDiscipline), predatorSpecialty: string(data.predatorSpecialtyName) || string(data.predatorSpecialty),
    predatorResolutions: (data.predatorResolutions || {}) as Record<string, string>, predatorNotes: (data.predatorResolutionNotes || {}) as Record<string, string>,
    ambition: string(data.ambition), desire: string(data.desire), bane: string(data.clanBane), compulsion: string(data.clanCompulsion),
    healthMax, willpowerMax, healthSuperficial: number(data.healthSuperficial), healthAggravated: number(data.healthAggravated),
    willpowerSuperficial: number(data.willpowerSuperficial), willpowerAggravated: number(data.willpowerAggravated),
    hunger: number(data.hunger), humanity: number(data.humanity, 7), stains: number(data.stains), impaired: data.stainImpaired === true,
    potency: number(data.bloodPotency, 1), session: bloodSession(data.bloodSession as Parameters<typeof bloodSession>[0]),
    xpTotal: xpBudget(string(data.xpTotal), string(data.ageCategory)), xpSpent: xpSpent(string(data.xpSpent), purchases), purchases,
    xpCostMode: string(data.xpCostMode) || "new_level", chronicleRules: (data.chronicleRules || {}) as Record<string, unknown>, tenets: string(data.chronicleTenets),
    sources: Array.isArray(data.activeSourcebooks) ? data.activeSourcebooks.filter((s): s is string => typeof s === "string") : [],
    prose: Object.fromEntries(["appearance", "distinguishingTraits", "history", "notes", "advantages", "flaws"].map(key => [key, string(data[key])])),
  };
}

export function pdfFilename(name: string, date = new Date()) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const safe = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/-+/g,"-").slice(0, 80).replace(/^-|-$/g, "") || "Personagem";
  return `Carnical-${safe}-${day}.pdf`;
}
