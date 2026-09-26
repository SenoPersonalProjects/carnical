import { getChatGPTUser } from "../../../../chatgpt-auth";
import { createClient } from "../../../../../lib/supabase/server";
import { DEFAULT_CHRONICLE_RULES } from "../../../../game-rules";
import { toCharacter } from "../../serialize";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const characterId = Number(id);
  if (!Number.isSafeInteger(characterId)) return Response.json({ error: "Ficha inválida" }, { status: 400 });
  const payload = await request.json() as { code?: unknown; soloName?: unknown; ageCategory?: unknown; data?: unknown };
  const supabase = await createClient();
  const { data: existing } = await supabase.from("characters").select("*").eq("id", characterId).eq("user_id", user.userId).maybeSingle();
  if (!existing) return Response.json({ error: "Ficha não encontrada" }, { status: 404 });
  if (typeof payload.code === "string" && payload.code.trim()) {
    if (typeof payload.ageCategory !== "string" || !["Criança da Noite", "Neófito", "Ancilla", "Personalizada"].includes(payload.ageCategory)) return Response.json({ error: "Escolha a categoria de idade antes de associar a ficha." }, { status: 400 });
    const { data: chronicleId, error } = await supabase.rpc("join_chronicle_by_code", { p_code: payload.code.trim() });
    if (error || !chronicleId) return Response.json({ error: "Código de crônica inválido." }, { status: 400 });
    const currentData = payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data as Record<string, unknown> : existing.data && typeof existing.data === "object" && !Array.isArray(existing.data) ? existing.data as Record<string, unknown> : {};
    const { data: updated, error: updateError } = await supabase.from("characters").update({ chronicle_id: chronicleId, data: { ...currentData, ageCategory: payload.ageCategory } }).eq("id", characterId).eq("user_id", user.userId).select().maybeSingle();
    if (updateError || !updated) return Response.json({ error: "Não foi possível associar a ficha." }, { status: 503 });
    return Response.json({ character: await toCharacter(supabase, updated) });
  }
  const soloName = typeof payload.soloName === "string" ? payload.soloName.trim().slice(0, 120) : "";
  const data = existing.data && typeof existing.data === "object" && !Array.isArray(existing.data) ? existing.data as Record<string, unknown> : {};
  const { data: updated, error } = await supabase.from("characters").update({
    chronicle_id: null,
    data: { ...data, chronicle: soloName, chronicleRules: DEFAULT_CHRONICLE_RULES },
  }).eq("id", characterId).eq("user_id", user.userId).select().maybeSingle();
  if (error || !updated) return Response.json({ error: "Não foi possível desvincular a ficha." }, { status: 503 });
  return Response.json({ character: await toCharacter(supabase, updated) });
}
