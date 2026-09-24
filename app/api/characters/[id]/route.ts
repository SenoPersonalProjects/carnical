import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { characters } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return Response.json({ error: "Ficha inválida" }, { status: 400 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const [updated] = await getDb().update(characters).set({
      name: String(payload.name || "Sem nome").slice(0, 120), concept: String(payload.concept || "").slice(0, 240),
      clan: String(payload.clan || "").slice(0, 80), sourcebook: String(payload.sourcebook || "core_v5_ptbr").slice(0, 80),
      data: JSON.stringify(payload.data || {}), updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(and(eq(characters.id, numericId), eq(characters.ownerId, user.userId))).returning();
    if (!updated) return Response.json({ error: "Ficha não encontrada" }, { status: 404 });
    return Response.json({ character: { ...updated, data: JSON.parse(updated.data) } });
  } catch (error) {
    console.error("Character update error", error);
    return Response.json({ error: "Não foi possível salvar a ficha." }, { status: 503 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await context.params;
  await getDb().delete(characters).where(and(eq(characters.id, Number(id)), eq(characters.ownerId, user.userId)));
  return new Response(null, { status: 204 });
}
