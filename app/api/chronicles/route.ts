import { randomBytes } from "node:crypto";
import { getChatGPTUser } from "../../chatgpt-auth";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("chronicles").select("id,name,owner_id,invite_code,xp_cost_mode,rules,created_at").order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Não foi possível carregar as crônicas." }, { status: 503 });
  return Response.json({ chronicles: (data ?? []).map(item => ({ ...item, isNarrator: item.owner_id === user.userId, invite_code: item.owner_id === user.userId ? item.invite_code : undefined })) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const payload = await request.json() as { name?: unknown };
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name || name.length > 120) return Response.json({ error: "Informe um nome de até 120 caracteres." }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("chronicles").insert({
    owner_id: user.userId, name, invite_code: randomBytes(12).toString("hex").toUpperCase(),
  }).select("id,name,owner_id,invite_code,xp_cost_mode,rules,created_at").single();
  if (error) return Response.json({ error: "Não foi possível criar a crônica." }, { status: 503 });
  return Response.json({ chronicle: { ...data, isNarrator: true } }, { status: 201 });
}
