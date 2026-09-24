import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { characters } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

function unavailable(error: unknown) {
  console.error("Character storage error", error);
  return Response.json({ error: "Não foi possível acessar suas fichas agora." }, { status: 503 });
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const rows = await getDb().select().from(characters).where(eq(characters.ownerId, user.userId)).orderBy(desc(characters.updatedAt), desc(characters.id));
    return Response.json({ characters: rows.map((row) => ({ ...row, data: JSON.parse(row.data) })) });
  } catch (error) { return unavailable(error); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const [created] = await getDb().insert(characters).values({
      ownerId: user.userId,
      name: String(payload.name || "Sem nome").slice(0, 120),
      concept: String(payload.concept || "").slice(0, 240),
      clan: String(payload.clan || "").slice(0, 80),
      sourcebook: String(payload.sourcebook || "core_v5_ptbr").slice(0, 80),
      data: JSON.stringify(payload.data || {}),
    }).returning();
    return Response.json({ character: { ...created, data: JSON.parse(created.data) } }, { status: 201 });
  } catch (error) { return unavailable(error); }
}
