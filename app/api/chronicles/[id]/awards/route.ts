import { randomUUID } from "node:crypto";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { createClient } from "../../../../../lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const payload = await request.json() as { scope?: unknown; characterId?: unknown; amount?: unknown; note?: unknown; batchId?: unknown };
  const amount = Number(payload.amount);
  if (!Number.isInteger(amount) || amount < 1 || amount > 1000) return Response.json({ error: "O XP deve ser um inteiro entre 1 e 1000." }, { status: 400 });
  const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 240) : "";
  const batchId = typeof payload.batchId === "string" && /^[a-f0-9-]{36}$/i.test(payload.batchId) ? payload.batchId : randomUUID();
  const supabase = await createClient();
  const { data: chronicle } = await supabase.from("chronicles").select("owner_id").eq("id", id).maybeSingle();
  if (!chronicle || chronicle.owner_id !== user.userId) return Response.json({ error: "Apenas o mestre concede XP." }, { status: 403 });
  let query = supabase.from("characters").select("id").eq("chronicle_id", id);
  if (payload.scope === "individual") {
    const characterId = Number(payload.characterId);
    if (!Number.isSafeInteger(characterId)) return Response.json({ error: "Escolha uma ficha." }, { status: 400 });
    query = query.eq("id", characterId);
  } else if (payload.scope !== "group") return Response.json({ error: "Escolha grupo ou ficha individual." }, { status: 400 });
  const { data: characters, error: listError } = await query;
  if (listError) return Response.json({ error: "Não foi possível localizar as fichas." }, { status: 503 });
  if (!characters?.length) return Response.json({ error: "Não há fichas associadas para receber XP." }, { status: 400 });
  const { data, error } = await supabase.from("character_xp_awards").insert(characters.map(character => ({
    batch_id: batchId, chronicle_id: id, character_id: character.id,
    awarded_by: user.userId, amount, note,
  }))).select("id,character_id,amount,note,created_at,batch_id");
  if (error?.code === "23505") return Response.json({ error: "Esta concessão já foi registrada." }, { status: 409 });
  if (error) return Response.json({ error: "Não foi possível conceder XP." }, { status: 503 });
  return Response.json({ awards: data ?? [] }, { status: 201 });
}
