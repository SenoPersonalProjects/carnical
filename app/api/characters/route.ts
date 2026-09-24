import { getChatGPTUser } from "../../chatgpt-auth";
import { createClient } from "../../../lib/supabase/server";

function unavailable(error: unknown) {
  console.error("Character storage error", error);
  return Response.json({ error: "Não foi possível acessar suas fichas agora." }, { status: 503 });
}
function toCharacter(row: Record<string, unknown>) {
  return { id: row.id, ownerId: row.user_id, name: row.name, concept: row.concept, clan: row.clan, sourcebook: row.sourcebook, data: row.data ?? {}, createdAt: row.created_at, updatedAt: row.updated_at };
}
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("characters").select("*").eq("user_id", user.userId).order("updated_at", { ascending: false });
    if (error) throw error;
    return Response.json({ characters: (data ?? []).map(toCharacter) });
  } catch (error) { return unavailable(error); }
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const supabase = await createClient();
    const { data: created, error } = await supabase.from("characters").insert({
      user_id: user.userId,
      name: String(payload.name || "Sem nome").slice(0, 120),
      concept: String(payload.concept || "").slice(0, 240),
      clan: String(payload.clan || "").slice(0, 80),
      sourcebook: String(payload.sourcebook || "core_v5_ptbr").slice(0, 80),
      data: payload.data || {},
    }).select().single();
    if (error) throw error;
    return Response.json({ character: toCharacter(created) }, { status: 201 });
  } catch (error) { return unavailable(error); }
}
