import { getChatGPTUser } from "../../chatgpt-auth";
import { createClient } from "../../../lib/supabase/server";
import { toCharacter } from "./serialize";

function unavailable(error: unknown) {
  console.error("Character storage error", error);
  return Response.json({ error: "Não foi possível acessar suas fichas agora." }, { status: 503 });
}
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("characters").select("*").eq("user_id", user.userId).order("updated_at", { ascending: false });
    if (error) throw error;
    return Response.json({ characters: await Promise.all((data ?? []).map(row => toCharacter(supabase, row))) });
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
    return Response.json({ character: await toCharacter(supabase, created) }, { status: 201 });
  } catch (error) { return unavailable(error); }
}
