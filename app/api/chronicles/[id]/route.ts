import { getChatGPTUser } from "../../../chatgpt-auth";
import { createClient } from "../../../../lib/supabase/server";
import { DEFAULT_CHRONICLE_RULES } from "../../../game-rules";

type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, context: Context) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: chronicle, error } = await supabase.from("chronicles").select("id,name,owner_id,invite_code,xp_cost_mode,rules").eq("id", id).maybeSingle();
  if (error || !chronicle) return Response.json({ error: "Crônica não encontrada" }, { status: 404 });
  const isNarrator = chronicle.owner_id === user.userId;
  const { data: characters, error: charactersError } = await supabase.from("characters")
    .select("id,name,clan,user_id,creation_xp").eq("chronicle_id", id).order("name");
  if (charactersError) return Response.json({ error: "Não foi possível carregar as fichas." }, { status: 503 });
  const { data: awards, error: awardsError } = await supabase.from("character_xp_awards")
    .select("id,character_id,amount,note,created_at,batch_id").eq("chronicle_id", id).order("created_at", { ascending: false }).limit(100);
  if (awardsError) return Response.json({ error: "Não foi possível carregar o histórico de XP." }, { status: 503 });
  return Response.json({ chronicle: { ...chronicle, invite_code: isNarrator ? chronicle.invite_code : undefined, isNarrator }, characters: characters ?? [], awards: awards ?? [] });
}

export async function PATCH(request: Request, context: Context) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const payload = await request.json() as Record<string, unknown>;
  const supabase = await createClient();
  const { data: current } = await supabase.from("chronicles").select("id,owner_id,rules").eq("id", id).maybeSingle();
  if (!current || current.owner_id !== user.userId) return Response.json({ error: "Apenas o mestre altera as regras." }, { status: 403 });
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const xpCostMode = payload.xpCostMode === "current_level" ? "current_level" : "new_level";
  const incoming = payload.rules && typeof payload.rules === "object" && !Array.isArray(payload.rules) ? payload.rules as Record<string, unknown> : {};
  const rules = {
    ...DEFAULT_CHRONICLE_RULES,
    customTargets: incoming.customTargets === true,
    meritPoints: bounded(incoming.meritPoints, 7),
    flawPoints: bounded(incoming.flawPoints, 2),
    disciplinePoints: bounded(incoming.disciplinePoints, 3),
    generationOverride: incoming.generationOverride === true,
    notes: typeof incoming.notes === "string" ? incoming.notes.slice(0, 2000) : "",
    approvedIssueIds: [],
  };
  if (!name || name.length > 120) return Response.json({ error: "Informe um nome válido." }, { status: 400 });
  const { data, error } = await supabase.from("chronicles").update({ name, xp_cost_mode: xpCostMode, rules, updated_at: new Date().toISOString() }).eq("id", id).eq("owner_id", user.userId).select("id,name,owner_id,invite_code,xp_cost_mode,rules").maybeSingle();
  if (error || !data) return Response.json({ error: "Não foi possível salvar as regras." }, { status: 503 });
  return Response.json({ chronicle: { ...data, isNarrator: true } });
}

function bounded(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 30 ? parsed : fallback;
}
