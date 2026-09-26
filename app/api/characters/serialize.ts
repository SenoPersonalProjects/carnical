import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CHRONICLE_RULES } from "../../game-rules";

export async function toCharacter(supabase: SupabaseClient, row: Record<string, unknown>) {
  const data = row.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data as Record<string, unknown> : {};
  const base = {
    id: row.id, ownerId: row.user_id, name: row.name, concept: row.concept,
    clan: row.clan, sourcebook: row.sourcebook, data,
    chronicleId: row.chronicle_id ?? null,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
  if (!row.chronicle_id) return { ...base, chronicleInfo: null, xpAwards: [] };

  const [{ data: chronicle, error: chronicleError }, { data: awards, error: awardsError }] = await Promise.all([
    supabase.from("chronicles").select("id,name,owner_id,xp_cost_mode,rules").eq("id", String(row.chronicle_id)).single(),
    supabase.from("character_xp_awards").select("id,amount,note,created_at,batch_id").eq("character_id", Number(row.id)).order("created_at", { ascending: false }),
  ]);
  if (chronicleError) throw chronicleError;
  if (awardsError) throw awardsError;
  const creationXp = typeof row.creation_xp === "number" ? row.creation_xp : 0;
  const earnedXp = (awards ?? []).reduce((total, award) => total + award.amount, 0);
  return {
    ...base,
    data: {
      ...data,
      chronicle: chronicle.name,
      chronicleRules: { ...DEFAULT_CHRONICLE_RULES, ...(chronicle.rules as Record<string, unknown> ?? {}) },
      xpTotal: String(creationXp + earnedXp),
    },
    chronicleInfo: {
      id: chronicle.id, name: chronicle.name,
      xpCostMode: chronicle.xp_cost_mode,
      creationXp, earnedXp,
      isNarrator: chronicle.owner_id === row.user_id,
    },
    xpAwards: awards ?? [],
  };
}
