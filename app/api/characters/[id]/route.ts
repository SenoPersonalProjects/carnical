import { getChatGPTUser } from "../../../chatgpt-auth";
import { createClient } from "../../../../lib/supabase/server";
import { toCharacter } from "../serialize";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return Response.json({ error: "Ficha inválida" }, { status: 400 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const supabase = await createClient();
    const { data: updated, error } = await supabase.from("characters").update({
      name: String(payload.name || "Sem nome").slice(0, 120), concept: String(payload.concept || "").slice(0, 240),
      clan: String(payload.clan || "").slice(0, 80), sourcebook: String(payload.sourcebook || "core_v5_ptbr").slice(0, 80),
      data: payload.data || {}, updated_at: new Date().toISOString(),
    }).eq("id", numericId).eq("user_id", user.userId).select().maybeSingle();
    if (error) throw error;
    if (!updated) return Response.json({ error: "Ficha não encontrada" }, { status: 404 });
    return Response.json({ character: await toCharacter(supabase, updated) });
  } catch (error) {
    console.error("Character update error", error);
    return Response.json({ error: "Não foi possível salvar a ficha." }, { status: 503 });
  }
}
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const supabase = await createClient();
  const { error } = await supabase.from("characters").delete().eq("id", Number(id)).eq("user_id", user.userId);
  if (error) return Response.json({ error: "Não foi possível excluir a ficha." }, { status: 503 });
  return new Response(null, { status: 204 });
}
