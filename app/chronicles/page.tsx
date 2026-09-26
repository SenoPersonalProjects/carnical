import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import ChronicleManager from "./chronicle-manager";

export const dynamic = "force-dynamic";

export default async function ChroniclesPage() {
  await requireChatGPTUser("/chronicles");
  return <main className="chronicles-page"><header className="chronicles-header"><div><span>CARNIÇAL</span><h1>Crônicas</h1><p>Regras do mestre e XP recebido depois das sessões.</p></div><Link href="/">Voltar às fichas</Link></header><ChronicleManager/></main>;
}
