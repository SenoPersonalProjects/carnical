import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import RulesReader from "./rules-reader";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const currentUser = await getChatGPTUser();
  if (!currentUser && process.env.NODE_ENV === "development") {
    return <RulesReader displayName="Prévia local" signOutPath="/" />;
  }
  const user = currentUser ?? await requireChatGPTUser("/rules");
  return <RulesReader displayName={user.fullName ?? user.email.split("@")[0]} signOutPath={chatGPTSignOutPath("/rules")} />;
}
